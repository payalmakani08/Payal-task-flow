
document.addEventListener("DOMContentLoaded", function () {

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

    const year = document.getElementById("year");

    // Set footer year
    if (year) {
        year.textContent = new Date().getFullYear();
    }

    // Load saved tasks
    let tasks = [];

    try {
        tasks = JSON.parse(localStorage.getItem("payalTasks")) || [];
    } catch (error) {
        tasks = [];
    }

    // Set today's date as minimum date
    if (taskDate) {
        const today = new Date().toISOString().split("T")[0];
        taskDate.min = today;
    }

    // Save tasks
    function saveTasks() {
        localStorage.setItem("payalTasks", JSON.stringify(tasks));
    }

    // Update dashboard
    function updateDashboard() {
        totalTasks.textContent = tasks.length;

        pendingTasks.textContent =
            tasks.filter(task => !task.completed).length;

        completedTasks.textContent =
            tasks.filter(task => task.completed).length;
    }

    // Display tasks
    function displayTasks() {

        taskList.innerHTML = "";

        const filterValue = taskFilter.value;

        let filteredTasks = tasks;

        if (filterValue === "pending") {
            filteredTasks = tasks.filter(task => !task.completed);
        }

        if (filterValue === "completed") {
            filteredTasks = tasks.filter(task => task.completed);
        }

        emptyMessage.style.display =
            filteredTasks.length === 0 ? "block" : "none";

        filteredTasks.forEach(function (task) {

            const taskCard = document.createElement("div");

            taskCard.className = "col-md-6 col-lg-4";

            const card = document.createElement("div");
            card.className = "task-card h-100";

            const title = document.createElement("h5");
            title.textContent = task.title;

            if (task.completed) {
                title.classList.add("text-decoration-line-through");
            }

            const date = document.createElement("p");
            date.textContent = "Due: " + task.date;

            const priority = document.createElement("p");
            priority.textContent = "Priority: " + task.priority;

            const status = document.createElement("p");
            status.textContent = task.completed ? "Completed" : "Pending";

            const completeButton = document.createElement("button");
            completeButton.className = "btn btn-success btn-sm me-2";
            completeButton.textContent =
                task.completed ? "Undo" : "Complete";

            completeButton.addEventListener("click", function () {
                task.completed = !task.completed;
                saveTasks();
                displayTasks();
            });

            const deleteButton = document.createElement("button");
            deleteButton.className = "btn btn-danger btn-sm";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", function () {
                tasks = tasks.filter(item => item.id !== task.id);
                saveTasks();
                displayTasks();
            });

            card.appendChild(title);
            card.appendChild(date);
            card.appendChild(priority);
            card.appendChild(status);
            card.appendChild(completeButton);
            card.appendChild(deleteButton);

            taskCard.appendChild(card);
            taskList.appendChild(taskCard);

        });

        updateDashboard();
    }

    // Add task
    taskForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const title = taskTitle.value.trim();
        const date = taskDate.value;
        const priority = taskPriority.value;

        if (title === "") {
            alert("Please enter a task name.");
            return;
        }

        if (date === "") {
            alert("Please select a due date.");
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

        // Reset date minimum after form reset
        taskDate.min = new Date().toISOString().split("T")[0];

        displayTasks();

    });

    // Filter tasks
    taskFilter.addEventListener("change", displayTasks);

    // Initial display
    displayTasks();

});
