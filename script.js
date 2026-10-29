
// Get HTML elements

const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDate = document.getElementById("taskDate");
const taskPriority = document.getElementById("taskPriority");
const taskList = document.getElementById("taskList");
const taskFilter = document.getElementById("taskFilter");
const emptyMessage = document.getElementById("emptyMessage");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");


// Load tasks from browser storage

let tasks = JSON.parse(localStorage.getItem("payalTasks")) || [];


// Save tasks

function saveTasks() {
    localStorage.setItem("payalTasks", JSON.stringify(tasks));
}


// Add a new task

taskForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const title = taskTitle.value.trim();
    const date = taskDate.value;
    const priority = taskPriority.value;

    if (title === "" || date === "") {
        alert("Please enter the task name and due date.");
        return;
    }

    const newTask = {
        id: Date.now(),
        title: title,
        date: date,
        priority: priority,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();

    taskForm.reset();

    renderTasks();

});


// Create task cards

function renderTasks() {

    taskList.innerHTML = "";

    const filterValue = taskFilter.value;

    let filteredTasks = tasks;

    if (filterValue === "pending") {
        filteredTasks = tasks.filter(function (task) {
            return !task.completed;
        });
    }

    if (filterValue === "completed") {
        filteredTasks = tasks.filter(function (task) {
            return task.completed;
        });
    }

    // Sort tasks by due date

    filteredTasks.sort(function (a, b) {
        return a.date.localeCompare(b.date);
    });

    // Update dashboard numbers

    totalTasks.textContent = tasks.length;

    pendingTasks.textContent = tasks.filter(function (task) {
        return !task.completed;
    }).length;

    completedTasks.textContent = tasks.filter(function (task) {
        return task.completed;
    }).length;

    // Show message if there are no tasks

    emptyMessage.style.display =
        filteredTasks.length === 0 ? "block" : "none";


    // Display each task

    filteredTasks.forEach(function (task) {

        const column = document.createElement("div");

        column.className = "col-md-6";

        const card = document.createElement("div");

        card.className = "task-card";

        if (task.completed) {
            card.classList.add("completed");
        }

        // Task name

        const heading = document.createElement("h5");

        heading.textContent = task.title;

        // Priority

        const priorityBadge = document.createElement("span");

        priorityBadge.className = "priority " + task.priority;

        priorityBadge.textContent = task.priority + " Priority";

        // Date

        const dateText = document.createElement("p");

        dateText.className = "task-date";

        dateText.textContent = "Due date: " + task.date;

        // Buttons

        const buttonArea = document.createElement("div");

        buttonArea.className = "task-buttons";

        const completeButton = document.createElement("button");

        completeButton.className = task.completed
            ? "btn btn-sm btn-secondary"
            : "btn btn-sm btn-success";

        completeButton.textContent = task.completed
            ? "Undo"
            : "Complete";

        completeButton.addEventListener("click", function () {

            task.completed = !task.completed;

            saveTasks();

            renderTasks();

        });

        const deleteButton = document.createElement("button");

        deleteButton.className = "btn btn-sm btn-outline-danger";

        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {

            const confirmDelete = confirm(
                "Do you want to delete this task?"
            );

            if (confirmDelete) {

                tasks = tasks.filter(function (item) {
                    return item.id !== task.id;
                });

                saveTasks();

                renderTasks();

            }

        });

        buttonArea.appendChild(completeButton);

        buttonArea.appendChild(deleteButton);

        // Add everything to the task card

        card.appendChild(heading);

        card.appendChild(priorityBadge);

        card.appendChild(dateText);

        card.appendChild(buttonArea);

        column.appendChild(card);

        taskList.appendChild(column);

    });

}


// Filter tasks

taskFilter.addEventListener("change", renderTasks);


// Set minimum due date to today

const today = new Date();

const todayString =
    today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0") + "-" +
    String(today.getDate()).padStart(2, "0");

taskDate.min = todayString;


// Display tasks when page loads

renderTasks();
