document.addEventListener("DOMContentLoaded", function () {

    // ==============================
    // GET HTML ELEMENTS
    // ==============================

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

    const formMessage = document.getElementById("formMessage");

    // Check if required HTML elements exist
    if (
        !taskForm ||
        !taskTitle ||
        !taskDate ||
        !taskPriority ||
        !taskList
    ) {
        console.error("Some HTML elements are missing.");
        return;
    }

    // ==============================
    // DATE SETUP
    // ==============================

    function getTodayDate() {
        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    const todayString = getTodayDate();

    // Set minimum due date to today
    taskDate.min = todayString;

    // Automatically fill today's date
    taskDate.value = todayString;

    // ==============================
    // LOAD TASKS
    // ==============================

    let tasks = [];

    try {
        const savedTasks = localStorage.getItem("payalTasks");

        if (savedTasks) {
            const parsedTasks = JSON.parse(savedTasks);

            if (Array.isArray(parsedTasks)) {
                tasks = parsedTasks;
            }
        }
    } catch (error) {
        console.error("Unable to load tasks:", error);
        tasks = [];
    }

    // ==============================
    // SAVE TASKS
    // ==============================

    function saveTasks() {
        try {
            localStorage.setItem("payalTasks", JSON.stringify(tasks));
        } catch (error) {
            console.error("Unable to save tasks:", error);

            showMessage(
                "Unable to save tasks. Please check your browser storage.",
                true
            );
        }
    }

    // ==============================
    // DISPLAY MESSAGE
    // ==============================

    function showMessage(message, isError = false) {
        if (!formMessage) {
            return;
        }

        formMessage.textContent = message;

        formMessage.style.color = isError
            ? "#dc2626"
            : "#6b21a8";
    }

    // ==============================
    // UPDATE DASHBOARD
    // ==============================

    function updateDashboard() {
        const total = tasks.length;

        const completed = tasks.filter(function (task) {
            return task.completed === true;
        }).length;

        const pending = total - completed;

        totalTasks.textContent = total;
        pendingTasks.textContent = pending;
        completedTasks.textContent = completed;
    }

    // ==============================
    // DISPLAY TASKS
    // ==============================

    function displayTasks() {
        taskList.innerHTML = "";

        let filteredTasks = tasks;

        const filterValue = taskFilter
            ? taskFilter.value
            : "all";

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

        // Empty message
        if (filteredTasks.length === 0) {
            emptyMessage.style.display = "block";

            if (filterValue === "completed") {
                emptyMessage.textContent =
                    "No completed tasks yet.";
            } else if (filterValue === "pending") {
                emptyMessage.textContent =
                    "No pending tasks.";
            } else {
                emptyMessage.textContent =
                    "No tasks yet. Add your first task above!";
            }
        } else {
            emptyMessage.style.display = "none";
        }

        // Create task cards
        filteredTasks.forEach(function (task) {

            const taskCard = document.createElement("div");

            taskCard.className = "task-card";

            if (task.completed) {
                taskCard.classList.add("completed");
            }

            // Task title
            const title = document.createElement("h3");

            title.className = "task-title";
            title.textContent = task.title;

            // Due date
            const date = document.createElement("p");

            date.className = "task-date";
            date.textContent = "Due: " + task.date;

            // Priority
            const priority = document.createElement("span");

            priority.className = "task-priority";

            const priorityValue = task.priority || "Medium";

            priority.textContent =
                "Priority: " + priorityValue;

            if (priorityValue === "High") {
                priority.classList.add("priority-high");
            } else if (priorityValue === "Low") {
                priority.classList.add("priority-low");
            } else {
                priority.classList.add("priority-medium");
            }

            // Buttons container
            const actions = document.createElement("div");

            actions.className = "task-actions";

            // Complete button
            const completeButton = document.createElement("button");

            completeButton.type = "button";

            completeButton.className = task.completed
                ? "btn btn-warning btn-sm"
                : "btn btn-success btn-sm";

            completeButton.textContent = task.completed
                ? "Undo"
                : "Complete";

            completeButton.addEventListener("click", function () {
                toggleTask(task.id);
            });

            // Delete button
            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.className = "btn btn-danger btn-sm";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", function () {
                deleteTask(task.id);
            });

            actions.appendChild(completeButton);
            actions.appendChild(deleteButton);

            taskCard.appendChild(title);
            taskCard.appendChild(date);
            taskCard.appendChild(priority);
            taskCard.appendChild(actions);

            taskList.appendChild(taskCard);
        });

        updateDashboard();
    }

    // ==============================
    // ADD TASK
    // ==============================

    taskForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const title = taskTitle.value.trim();
        const date = taskDate.value;
        const priority = taskPriority.value;

        // Validate task title
        if (title === "") {
            showMessage("Please enter a task title.", true);
            taskTitle.focus();
            return;
        }

        // Validate due date
        if (date === "") {
            showMessage("Please select a due date.", true);
            taskDate.focus();
            return;
        }

        // Prevent past dates
        if (date < todayString) {
            showMessage("Please select today or a future date.", true);
            taskDate.focus();
            return;
        }

        // Create task
        const newTask = {
            id: Date.now(),
            title: title,
            date: date,
            priority: priority,
            completed: false
        };

        // Add task to array
        tasks.push(newTask);

        // Save tasks
        saveTasks();

        // Reset form
        taskForm.reset();

        // Set default date and priority
        taskDate.min = todayString;
        taskDate.value = todayString;
        taskPriority.value = "Medium";

        // Show all tasks
        if (taskFilter) {
            taskFilter.value = "all";
        }

        // Refresh task list
        displayTasks();

        // Success message
        showMessage("Task added successfully! 🎉");

        console.log("Task added:", newTask);
    });

    // ==============================
    // COMPLETE / UNDO TASK
    // ==============================

    function toggleTask(taskId) {

        tasks = tasks.map(function (task) {

            if (task.id === taskId) {
                return {
                    ...task,
                    completed: !task.completed
                };
            }

            return task;
        });

        saveTasks();
        displayTasks();
    }

    // ==============================
    // DELETE TASK
    // ==============================

    function deleteTask(taskId) {

        const confirmed = confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) {
            return;
        }

        tasks = tasks.filter(function (task) {
            return task.id !== taskId;
        });

        saveTasks();
        displayTasks();

        showMessage("Task deleted successfully.");
    }

    // ==============================
    // TASK FILTER
    // ==============================

    if (taskFilter) {
        taskFilter.addEventListener("change", function () {
            displayTasks();
        });
    }

    // ==============================
    // INITIAL DISPLAY
    // ==============================

    displayTasks();

});
