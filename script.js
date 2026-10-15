
/* =========================================
   PAYAL TASK FLOW
   Complete JavaScript
========================================= */

// Get HTML elements
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskDescription = document.getElementById("taskDescription");
const taskPriority = document.getElementById("taskPriority");
const taskDueDate = document.getElementById("taskDueDate");
const taskList = document.getElementById("taskList");

const searchInput = document.getElementById("searchInput");
const taskFilter = document.getElementById("taskFilter");
const priorityFilter = document.getElementById("priorityFilter");

const emptyMessage = document.getElementById("emptyMessage");
const visibleCount = document.getElementById("visibleCount");

let tasks = [];

try {
    const savedTasks = JSON.parse(localStorage.getItem("payalTasks"));
    tasks = Array.isArray(savedTasks) ? savedTasks : [];
} catch (error) {
    tasks = [];
}

let editId = null;

// Check whether a task is completed
function isCompleted(task) {
    return task.completed === true || task.completed === "true";
}

// Convert priority into a consistent format
function normalizePriority(priority) {
    const value = String(priority || "Medium").trim().toLowerCase();

    if (value === "high") return "high";
    if (value === "low") return "low";

    return "medium";
}

// Show today's date
document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

// Get today's date in YYYY-MM-DD format
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

    if (!title) {
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

document.getElementById("cancelEditButton")
    .addEventListener("click", resetForm);

// Edit a task
function editTask(id) {
    const task = tasks.find(task => task.id === id);

    if (!task) return;

    editId = id;

    taskInput.value = task.title || "";
    taskDescription.value = task.description || "";
    taskPriority.value =
        normalizePriority(task.priority).charAt(0).toUpperCase() +
        normalizePriority(task.priority).slice(1);
    taskDueDate.value = task.dueDate || "";

    document.getElementById("formHeading").textContent = "Edit your task";
    document.getElementById("submitButton").textContent = "Save Changes";
    document.getElementById("cancelEditButton").classList.remove("d-none");

    taskInput.focus();
}

// Mark a task as completed or pending
function completeTask(id) {
    const task = tasks.find(task => task.id === id);

    if (task) {
        task.completed = !isCompleted(task);

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
document.getElementById("clearCompletedButton")
    .addEventListener("click", function () {
        const completedTasks = tasks.filter(isCompleted);

        if (completedTasks.length === 0) {
            showMessage("No completed tasks to clear.");
            return;
        }

        if (!confirm("Delete all completed tasks?")) return;

        if (completedTasks.some(task => task.id === editId)) {
            resetForm();
        }

        tasks = tasks.filter(task => !isCompleted(task));

        saveTasks();
        displayTasks();
        showMessage("Completed tasks cleared.");
    });

/* =========================================
   SEARCH AND FILTER EVENTS
========================================= */

searchInput.addEventListener("input", displayTasks);
taskFilter.addEventListener("change", displayTasks);
priorityFilter.addEventListener("change", displayTasks);

/* =========================================
   DISPLAY AND FILTER TASKS
========================================= */

function displayTasks() {
    // Clear the previous task cards
    taskList.innerHTML = "";

    // Read current search and filter selections
    const search = searchInput.value.trim().toLowerCase();
    const status = taskFilter.value.trim().toLowerCase();
    const priority = priorityFilter.value.trim().toLowerCase();

    // Filter tasks using ALL selected conditions
    const filteredTasks = tasks.filter(function (task) {
        const title = String(task.title || "").toLowerCase();
        const description = String(task.description || "").toLowerCase();

        // Search condition
        const matchesSearch =
            (title + " " + description).includes(search);

        // Status condition
        const completed = isCompleted(task);

        let matchesStatus = false;

        if (status === "all") {
            matchesStatus = true;
        } else if (status === "pending") {
            matchesStatus = !completed;
        } else if (status === "completed") {
            matchesStatus = completed;
        }

        // Priority condition
        const taskPriorityValue = normalizePriority(task.priority);

        let matchesPriority = false;

        if (priority === "all") {
            matchesPriority = true;
        } else {
            matchesPriority = taskPriorityValue === priority;
        }

        // A task must match search, status AND priority
        return matchesSearch && matchesStatus && matchesPriority;
    });

    // Show number of matching tasks
    visibleCount.textContent =
        filteredTasks.length +
        (filteredTasks.length === 1 ? " task" : " tasks");

    // Show empty message when no tasks match
    emptyMessage.classList.toggle(
        "d-none",
        filteredTasks.length > 0
    );

    // Display matching tasks
    filteredTasks.forEach(function (task) {
        const completed = isCompleted(task);
        const priorityValue = normalizePriority(task.priority);

        // Main task card
        const card = document.createElement("div");
        card.className = "task-item";

        if (completed) {
            card.classList.add("is-completed");
        }

        // Top section
        const top = document.createElement("div");
        top.className = "task-top";

        // Completion checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-check";
        checkbox.checked = completed;
        checkbox.setAttribute(
            "aria-label",
            "Mark task as completed"
        );

        checkbox.addEventListener("change", function () {
            completeTask(task.id);
        });

        // Task title and description
        const details = document.createElement("div");
        details.className = "task-main";

        const title = document.createElement("h5");
        title.className = "task-title";
        title.textContent = task.title || "Untitled task";

        details.appendChild(title);

        if (task.description) {
            const description = document.createElement("p");
            description.className = "task-description";
            description.textContent = task.description;

            details.appendChild(description);
        }

        // Action buttons
        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.className = "action-btn";
        editButton.type = "button";
        editButton.innerHTML = '<i class="bi bi-pencil"></i>';
        editButton.title = "Edit task";

        editButton.addEventListener("click", function () {
            editTask(task.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "action-btn delete-btn";
        deleteButton.type = "button";
        deleteButton.innerHTML = '<i class="bi bi-trash3"></i>';
        deleteButton.title = "Delete task";

        deleteButton.addEventListener("click", function () {
            deleteTask(task.id);
        });

        actions.append(editButton, deleteButton);
        top.append(checkbox, details, actions);
        card.appendChild(top);

        // Task information badges
        const meta = document.createElement("div");
        meta.className = "task-meta";

        // Priority badge
        const priorityBadge = document.createElement("span");
        priorityBadge.className =
            "priority-badge priority-" + priorityValue;

        priorityBadge.textContent =
            priorityValue.charAt(0).toUpperCase() +
            priorityValue.slice(1) +
            " Priority";

        meta.appendChild(priorityBadge);

        // Due date badge
        if (task.dueDate) {
            const dueBadge = document.createElement("span");
            dueBadge.className = "due-badge";

            if (!completed && task.dueDate < today()) {
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

        // Completed badge
        if (completed) {
            const statusBadge = document.createElement("span");
            statusBadge.className = "status-badge";
            statusBadge.textContent = "Completed";

            meta.appendChild(statusBadge);
        }

        card.appendChild(meta);
        taskList.appendChild(card);
    });

    updateProgress();
}

/* =========================================
   UPDATE DASHBOARD STATISTICS
========================================= */

function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(isCompleted).length;
    const pending = total - completed;

    const percent = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("totalCount").textContent = total;
    document.getElementById("pendingCount").textContent = pending;
    document.getElementById("completedCount").textContent = completed;
    document.getElementById("progressPercent").textContent = percent + "%";
    document.getElementById("progressLabel").textContent = percent + "% complete";

    const progressBar = document.getElementById("progressBar");
    progressBar.style.width = percent + "%";
    progressBar.setAttribute("aria-valuenow", percent);
}

/* =========================================
   TOAST MESSAGE
========================================= */

function showMessage(message) {
    const toast = document.getElementById("toastMessage");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.messageTimer);

    window.messageTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 2500);
}

/* =========================================
   DARK AND LIGHT MODE
========================================= */

const themeButton = document.getElementById("themeButton");
const themeIcon = document.getElementById("themeIcon");

function setTheme(dark) {
    document.body.classList.toggle("dark", dark);

    themeIcon.className = dark
        ? "bi bi-sun-fill"
        : "bi bi-moon-stars-fill";
}

const savedTheme = localStorage.getItem("payalTheme");

setTheme(savedTheme === "dark");

themeButton.addEventListener("click", function () {
    const dark = !document.body.classList.contains("dark");

    setTheme(dark);

    localStorage.setItem(
        "payalTheme",
        dark ? "dark" : "light"
    );
});

/* =========================================
   LOAD TASKS ON PAGE OPEN
========================================= */

displayTasks();
                             
