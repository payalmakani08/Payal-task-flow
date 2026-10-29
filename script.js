
document.addEventListener("DOMContentLoaded", function () {

    // Get elements from HTML
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

    // Stop if required HTML elements are missing
    if (
        !taskForm ||
        !taskTitle ||
        !taskDate ||
        !taskPriority ||
        !taskList ||
        !taskFilter
    ) {
        console.error("Task form elements not found. Check your HTML IDs.");
        return;
    }

    // Load saved tasks safely
    let tasks = [];

    try {
        const savedTasks = localStorage.getItem("payalTasks");
        tasks = savedTasks ? JSON.parse(savedTasks) : [];

        if (!Array.isArray(tasks)) {
            tasks = [];
        }
    } catch (error) {
        tasks = [];
        console.error("Could not load saved tasks:", error);
    }

    // Set minimum due date to today
    const today = new Date();
    const todayString =
        today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");

    taskDate.min = todayString;

    // Save tasks to browser
    function saveTasks() {
        try {
            localStorage.setItem("payalTasks", JSON.stringify(tasks));
        } catch (error) {
            alert("Unable to save tasks in this browser.");
            console.error(error);
        }
    }

    // Update dashboard numbers
    function updateDashboard() {
        if (totalTasks) {
            totalTasks.textContent = tasks.length;
        }

        if (pendingTasks) {
            pendingTasks.textContent =
                tasks.filter(task => !task.completed).length;
        }

        if (completedTasks) {
            completedTasks.textContent =
                tasks.filter(task => task.completed).length;
        }
    }

    // Display tasks
    function displayTasks() {
        taskList.innerHTML = "";

        const filter = taskFilter.value;

        let visibleTasks = tasks;

        if (filter === "pending") {
            visibleTasks = tasks.filter(task => !task.completed);
        }

        if (filter === "completed") {
            visibleTasks = tasks.filter(task => task.completed);
        }

        if (emptyMessage) {
            emptyMessage.style.display =
                visibleTasks.length === 0 ? "block" : "none";
        }

        visibleTasks.forEach(function (task) {

            const column = document.createElement("div");
            column.className = "col-md-6 col-lg-4";

            const card = document.createElement("div");
            card.className = "task-card";

            if (task.completed) {
                card.classList.add("completed");
            }

            // Task title
            const title = document.createElement("h5");
            title.textContent = task.title;

            // Due date
            const date = document.createElement("p");
            date.className = "task-date";
            date.textContent = "Due Date: " + task.date;

            // Priority
            const priority = document.createElement("span");
            priority.className = "priority " + task.priority;
            priority.textContent = task.priority + " Priority";

            // Status
            const status = document.createElement("p");
            status.textContent = task.completed
                ? "Status: Completed"
                : "Status: Pending";

            // Buttons container
            const buttons = document.createElement("div");
            buttons.className = "task-buttons";

            // Complete button
            const completeButton = document.createElement("button");
            completeButton.type = "button";
            completeButton.className = "btn btn-success btn-sm";
            completeButton.textContent =
                task.completed ? "Undo" : "Complete";

            completeButton.addEventListener("click", function () {
                task.completed = !task.completed;
                saveTasks();
                displayTasks();
            });

            // Delete button
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "btn btn-danger btn-sm";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", function () {
                tasks = tasks.filter(item => item.id !== task.id);
                saveTasks();
                displayTasks();
            });

            // Build task card
            buttons.appendChild(completeButton);
            buttons.appendChild(deleteButton);

            card.appendChild(title);
            card.appendChild(date);
            card.appendChild(priority);
            card.appendChild(status);
            card.appendChild(buttons);

            column.appendChild(card);
            taskList.appendChild(column);
        });

        updateDashboard();
    }

    // Add new task
    taskForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const title = taskTitle.value.trim();
        const date = taskDate.value;
        const priority = taskPriority.value;

        // Validate task name
        if (title === "") {
            alert("Please enter a task name.");
            taskTitle.focus();
            return;
        }

        // Validate date
        if (date === "") {
            alert("Please select a due date.");
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

        // Save and update screen
        saveTasks();

        taskForm.reset();

        taskDate.min = todayString;

        // Show all tasks after adding
        taskFilter.value = "all";

        displayTasks();

        // Confirmation
        console.log("Task added successfully:", newTask);
    });

    // Filter tasks
    taskFilter.addEventListener("change", function () {
        displayTasks();
    });

    // Initial page load
    displayTasks();

});
