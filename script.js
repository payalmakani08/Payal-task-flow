let tasks=JSON.parse(localStorage.getItem("taskFlowTasks"))||[];
let editModal=new bootstrap.Modal(document.getElementById("editModal"));

function saveTasks(){
localStorage.setItem("taskFlowTasks",JSON.stringify(tasks));
}

function showToast(msg){
document.getElementById("toastMessage").textContent=msg;
new bootstrap.Toast(document.getElementById("toast")).show();
}

function addTask(){
let title=document.getElementById("taskInput").value.trim();

if(!title){
showToast("Please enter a task!");
return;
}

let task={
id:Date.now(),
title:title,
priority:document.getElementById("priority").value,
category:document.getElementById("category").value.trim()||"General",
date:document.getElementById("dueDate").value,
completed:false,
created:Date.now()
};

tasks.push(task);
saveTasks();

document.getElementById("taskInput").value="";
document.getElementById("category").value="";
document.getElementById("dueDate").value="";

renderTasks();
showToast("Task added successfully!");
}

function renderTasks(){
let list=tasks.slice();
let search=document.getElementById("searchInput").value.toLowerCase();
let filter=document.getElementById("filterSelect").value;
let sort=document.getElementById("sortSelect").value;

list=list.filter(function(t){
return t.title.toLowerCase().includes(search)||t.category.toLowerCase().includes(search);
});

if(filter==="active"){
list=list.filter(function(t){
return !t.completed;
});
}

if(filter==="completed"){
list=list.filter(function(t){
return t.completed;
});
}

if(sort==="newest"){
list.sort(function(a,b){
return b.created-a.created;
});
}

if(sort==="oldest"){
list.sort(function(a,b){
return a.created-b.created;
});
}

if(sort==="priority"){
let p={high:1,medium:2,low:3};

list.sort(function(a,b){
return p[a.priority]-p[b.priority];
});
}

if(sort==="date"){
list.sort(function(a,b){
return (a.date||"9999").localeCompare(b.date||"9999");
});
}

let container=document.getElementById("taskList");
container.innerHTML="";

if(list.length===0){
let empty=document.createElement("div");
empty.className="glass card-box text-center";

let icon=document.createElement("i");
icon.className="bi bi-clipboard-x fs-1 gradient";

let heading=document.createElement("h4");
heading.className="mt-3";
heading.textContent="No tasks found";

let message=document.createElement("p");
message.className="text-secondary";
message.textContent="Add a task or change your filters.";

empty.appendChild(icon);
empty.appendChild(heading);
empty.appendChild(message);
container.appendChild(empty);

updateStats();
return;
}

list.forEach(function(t){

let card=document.createElement("div");
card.className="glass task-card";

if(t.completed){
card.classList.add("completed");
}

let row=document.createElement("div");
row.className="d-flex align-items-start gap-3";

let checkBox=document.createElement("div");
checkBox.className="form-check mt-1";

let check=document.createElement("input");
check.className="form-check-input";
check.type="checkbox";
check.checked=t.completed;

check.onchange=function(){
toggleTask(t.id);
};

checkBox.appendChild(check);

let content=document.createElement("div");
content.className="flex-grow-1";

let titleRow=document.createElement("div");
titleRow.className="d-flex justify-content-between gap-2 flex-wrap";

let title=document.createElement("div");
title.className="task-title";
title.textContent=t.title;

let badge=document.createElement("span");
badge.className="badge-priority "+t.priority;
badge.textContent=t.priority.toUpperCase();

titleRow.appendChild(title);
titleRow.appendChild(badge);

let meta=document.createElement("div");
meta.className="meta";
meta.textContent="Folder: "+t.category+(t.date?" • Due: "+t.date:"");

content.appendChild(titleRow);
content.appendChild(meta);

let buttons=document.createElement("div");
buttons.className="d-flex gap-2";

let editButton=document.createElement("button");
editButton.className="btn btn-sm btn-outline-info";
editButton.innerHTML='<i class="bi bi-pencil"></i>';

editButton.onclick=function(){
editTask(t.id);
};

let deleteButton=document.createElement("button");
deleteButton.className="btn btn-sm btn-outline-danger";
deleteButton.innerHTML='<i class="bi bi-trash"></i>';

deleteButton.onclick=function(){
deleteTask(t.id);
};

buttons.appendChild(editButton);
buttons.appendChild(deleteButton);

row.appendChild(checkBox);
row.appendChild(content);
row.appendChild(buttons);

card.appendChild(row);
container.appendChild(card);
});

updateStats();
}

function toggleTask(id){
let t=tasks.find(function(x){
return x.id===id;
});

if(t){
t.completed=!t.completed;
}

saveTasks();
renderTasks();

if(t){
showToast(t.completed?"Task completed!":"Task marked active.");
}
}

function deleteTask(id){
tasks=tasks.filter(function(t){
return t.id!==id;
});

saveTasks();
renderTasks();
showToast("Task deleted!");
}

function editTask(id){
let t=tasks.find(function(x){
return x.id===id;
});

if(!t){
return;
}

document.getElementById("editInput").value=t.title;
document.getElementById("editId").value=id;
editModal.show();
}

function saveEdit(){
let id=Number(document.getElementById("editId").value);

let t=tasks.find(function(x){
return x.id===id;
});

let value=document.getElementById("editInput").value.trim();

if(t&&value){
t.title=value;
saveTasks();
renderTasks();
editModal.hide();
showToast("Task updated!");
}
}

function clearCompleted(){
tasks=tasks.filter(function(t){
return !t.completed;
});

saveTasks();
renderTasks();
showToast("Completed tasks cleared!");
}

function deleteAllTasks(){
if(tasks.length&&confirm("Delete all tasks?")){
tasks=[];
saveTasks();
renderTasks();
showToast("All tasks deleted!");
}
}

function updateStats(){
let total=tasks.length;

let completed=tasks.filter(function(t){
return t.completed;
}).length;

let active=total-completed;
let rate=total?Math.round(completed/total*100):0;

document.getElementById("totalTasks").textContent=total;
document.getElementById("activeTasks").textContent=active;
document.getElementById("completedTasks").textContent=completed;
document.getElementById("completionRate").textContent=rate+"%";
document.getElementById("progressText").textContent=rate+"%";
document.getElementById("progressBar").style.width=rate+"%";
}

function toggleTheme(){
document.body.classList.toggle("light");

localStorage.setItem(
"taskFlowTheme",
document.body.classList.contains("light")?"light":"dark"
);
}

if(localStorage.getItem("taskFlowTheme")==="light"){
document.body.classList.add("light");
}

document.getElementById("taskInput").addEventListener("keydown",function(e){
if(e.key==="Enter"){
addTask();
}
});

renderTasks();
