
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskDescription = document.getElementById("taskDescription");
const taskPriority = document.getElementById("taskPriority");
const taskDueDate = document.getElementById("taskDueDate");
const taskList = document.getElementById("taskList");

let tasks = JSON.parse(localStorage.getItem("payalTasks")) || [];
let editId = null;

// Show today's date
document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

// Set today's date as the earliest due date
function today() {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${date.getFullYear()}-${month}-${day}`;
}

taskDueDate.min = today();

// Save tasks in the browser
function saveTasks() {
    localStorage.setItem("payalTasks", JSON.stringify(tasks));
}

// Add or edit a task
taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (title === "") {
        showMessage("Please enter a task name.");
        return;
    }

    if (taskDueDate.value && taskDueDate.value < today()) {
        showMessage("Please select today or a future date.");
        return;
    }

    if (editId !== null) {
        const task = tasks.find(task => task.id === editId);

        if (task) {
            task.title = title;
            task.description = taskDescription.value.trim();
            task.priority = taskPriority.value;
            task.dueDate = taskDueDate.value;
        }

        showMessage("Task updated!");
    } else {
        tasks.unshift({
            id: Date.now(),
            title: title,
            description: taskDescription.value.trim(),
            priority: taskPriority.value,
            dueDate: taskDueDate.value,
            completed: false
        });

        showMessage("Task added successfully!");
    }

    saveTasks();
    resetForm();
    displayTasks();
});

// Reset the form
function resetForm() {
    taskForm.reset();
    editId = null;

    document.getElementById("formHeading").textContent = "Create a task";
    document.getElementById("submitButton").innerHTML =
        '<i class="bi bi-plus-lg"></i> Add Task';

    document.getElementById("cancelEditButton").classList.add("d-none");
}

document.getElementById("cancelEditButton").addEventListener("click", resetForm);

// Edit a task
function editTask(id) {
    const task = tasks.find(task => task.id === id);

    if (!task) return;

    editId = id;

    taskInput.value = task.title;
    taskDescription.value = task.description;
    taskPriority.value = task.priority;
    taskDueDate.value = task.dueDate;

    document.getElementById("formHeading").textContent = "Edit your task";
    document.getElementById("submitButton").textContent = "Save Changes";
    document.getElementById("cancelEditButton").classList.remove("d-none");

    taskInput.focus();
}

// Mark a task as completed
function completeTask(id) {
    const task = tasks.find(task => task.id === id);

    if (task) {
        task.completed = !task.completed;
        saveTasks();
        displayTasks();
    }
}

// Delete a task
function deleteTask(id) {
    if (!confirm("Do you want to delete this task?")) return;

    tasks = tasks.filter(task => task.id !== id);

    if (editId === id) {
        resetForm();
    }

    saveTasks();
    displayTasks();
    showMessage("Task deleted.");
}

// Clear completed tasks
document.getElementById("clearCompletedButton").addEventListener("click", function () {
    const completed = tasks.filter(task => task.completed);

    if (completed.length === 0) {
        showMessage("No completed tasks to clear.");
        return;
    }

    if (!confirm("Delete all completed tasks?")) return;

    if (completed.some(task => task.id === editId)) {
        resetForm();
    }

    tasks = tasks.filter(task => !task.completed);

    saveTasks();
    displayTasks();
    showMessage("Completed tasks cleared.");
});

// Search and filters
document.getElementById("searchInput").addEventListener("input", displayTasks);
document.getElementById("taskFilter").addEventListener("change", displayTasks);
document.getElementById("priorityFilter").addEventListener("change", displayTasks);

// Display tasks
function displayTasks() {
    taskList.innerHTML = "";

    const search = document.getElementById("searchInput").value.toLowerCase();
    const status = document.getElementById("taskFilter").value;
    const priority = document.getElementById("priorityFilter").value;

    const filteredTasks = tasks.filter(task => {
        const matchesSearch =
            (task.title + " " + task.description).toLowerCase().includes(search);

        const matchesStatus =
            status === "All" ||
            (status === "Pending" && !task.completed) ||
            (status === "Completed" && task.completed);

        const matchesPriority =
            priority === "All" || task.priority === priority;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    document.getElementById("visibleCount").textContent =
        filteredTasks.length + (filteredTasks.length === 1 ? " task" : " tasks");

    document.getElementById("emptyMessage").classList.toggle(
        "d-none",
        filteredTasks.length > 0
    );

    filteredTasks.forEach(task => {
        const card = document.createElement("div");
        card.className = "task-item";

        if (task.completed) {
            card.classList.add("is-completed");
        }

        const top = document.createElement("div");
        top.className = "task-top";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-check";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task as completed");
        checkbox.addEventListener("change", () => completeTask(task.id));

        const details = document.createElement("div");
        details.className = "task-main";

        const title = document.createElement("h5");
        title.className = "task-title";
        title.textContent = task.title;
        details.appendChild(title);

        if (task.description) {
            const description = document.createElement("p");
            description.className = "task-description";
            description.textContent = task.description;
            details.appendChild(description);
        }

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.className = "action-btn";
        editButton.type = "button";
        editButton.innerHTML = '<i class="bi bi-pencil"></i>';
        editButton.title = "Edit task";
        editButton.addEventListener("click", () => editTask(task.id));

        const deleteButton = document.createElement("button");
        deleteButton.className = "action-btn delete-btn";
        deleteButton.type = "button";
        deleteButton.innerHTML = '<i class="bi bi-trash3"></i>';
        deleteButton.title = "Delete task";
        deleteButton.addEventListener("click", () => deleteTask(task.id));

        actions.append(editButton, deleteButton);
        top.append(checkbox, details, actions);
        card.appendChild(top);

        const meta = document.createElement("div");
        meta.className = "task-meta";

        const priorityBadge = document.createElement("span");
        priorityBadge.className =
            "priority-badge priority-" + task.priority.toLowerCase();
        priorityBadge.textContent = task.priority + " Priority";
        meta.appendChild(priorityBadge);

        if (task.dueDate) {
            const dueBadge = document.createElement("span");
            dueBadge.className = "due-badge";

            if (!task.completed && task.dueDate < today()) {
                dueBadge.classList.add("overdue");
                dueBadge.textContent = "Overdue: ";
            } else {
                dueBadge.textContent = "Due: ";
            }

            const date = new Date(task.dueDate + "T00:00:00");
            dueBadge.textContent += date.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });

            meta.appendChild(dueBadge);
        }

        if (task.completed) {
            const badge = document.createElement("span");
            badge.className = "status-badge";
            badge.textContent = "Completed";
            meta.appendChild(badge);
        }

        card.appendChild(meta);
        taskList.appendChild(card);
    });

    updateProgress();
}

// Update dashboard numbers
function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;

    const percent = total === 0 ? 0 : Math.round(completed / total * 100);

    document.getElementById("totalCount").textContent = total;
    document.getElementById("pendingCount").textContent = pending;
    document.getElementById("completedCount").textContent = completed;
    document.getElementById("progressPercent").textContent = percent + "%";
    document.getElementById("progressLabel").textContent = percent + "% complete";
    document.getElementById("progressBar").style.width = percent + "%";
    document.getElementById("progressBar").setAttribute("aria-valuenow", percent);
}

// Show a small message
function showMessage(message) {
    const toast = document.getElementById("toastMessage");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.messageTimer);

    window.messageTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 2500);
}

/* Dark and light mode */

const themeButton = document.getElementById("themeButton");
const themeIcon = document.getElementById("themeIcon");

function setTheme(dark) {
    if (dark) {
        document.body.classList.add("dark");
        themeIcon.className = "bi bi-sun-fill";
    } else {
        document.body.classList.remove("dark");
        themeIcon.className = "bi bi-moon-stars-fill";
    }
}

let savedTheme = localStorage.getItem("payalTheme");

setTheme(savedTheme === "dark");

themeButton.addEventListener("click", function () {
    const dark = !document.body.classList.contains("dark");

    setTheme(dark);
    localStorage.setItem("payalTheme", dark ? "dark" : "light");
});


// Load saved tasks when the page opens
displayTasks();
    
