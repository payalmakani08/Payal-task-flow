
// Payal Task Flow - JavaScript

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


    // Check whether HTML elements exist

    if (
        !taskForm ||
        !taskTitle ||
        !taskDate ||
        !taskPriority ||
        !taskList ||
        !taskFilter
    ) {
        console.error("Task Flow: Some HTML elements are missing.");
        return;
    }


    // Load saved tasks safely

    let tasks = [];

    try {
        tasks = JSON.parse(
            localStorage.getItem("payalTasks") || "[]"
        );

        if (!Array.isArray(tasks)) {
            tasks = [];
        }

    } catch (error) {
        console.error("Unable to load saved tasks:", error);
        tasks = [];
    }


    // Save tasks

    function saveTasks() {
        try {
            localStorage.setItem(
                "payalTasks",
                JSON.stringify(tasks)
            );

            return true;

        } catch (error) {

            alert(
                "Unable to save tasks. Please check your browser storage."
            );

            console.error(error);

            return false;
        }
    }


    // Update dashboard

    function updateDashboard() {

        const completed = tasks.filter(
            task => task.completed
        ).length;

        const pending = tasks.length - completed;

        if (totalTasks) {
            totalTasks.textContent = tasks.length;
        }

        if (pendingTasks) {
            pendingTasks.textContent = pending;
        }

        if (completedTasks) {
            completedTasks.textContent = completed;
        }
    }


    // Display tasks

    function renderTasks() {

        taskList.innerHTML = "";

        const filterValue = taskFilter.value;

        let filteredTasks = tasks.filter(function (task) {

            if (filterValue === "pending") {
                return !task.completed;
            }

            if (filterValue === "completed") {
                return task.completed;
            }

            return true;

        });


        // Sort by due date

        filteredTasks.sort(function (a, b) {
            return a.date.localeCompare(b.date);
        });


        // Show empty message

        if (emptyMessage) {

            emptyMessage.style.display =
                filteredTasks.length === 0 ? "block" : "none";

        }


        // Create task cards

        filteredTasks.forEach(function (task) {

            const column = document.createElement("div");

            column.className = "col-md-6";


            const card = document.createElement("div");

            card.className = "task-card";


            if (task.completed) {
                card.classList.add("completed");
            }


            // Task title

            const heading = document.createElement("h5");

            heading.textContent = task.title;


            // Priority

            const priorityBadge = document.createElement("span");

            priorityBadge.className =
                "priority " + task.priority;

            priorityBadge.textContent =
                task.priority + " Priority";


            // Due date

            const dateText = document.createElement("p");

            dateText.className = "task-date";

            dateText.textContent =
                "Due date: " + task.date;


            // Button container

            const buttonArea = document.createElement("div");

            buttonArea.className = "task-buttons";


            // Complete button

            const completeButton =
                document.createElement("button");

            completeButton.type = "button";

            completeButton.className = task.completed
                ? "btn btn-sm btn-secondary"
                : "btn btn-sm btn-success";

            completeButton.textContent = task.completed
                ? "Undo"
                : "Complete";


            completeButton.addEventListener(
                "click",
                function () {

                    task.completed = !task.completed;

                    saveTasks();

                    renderTasks();

                }
            );


            // Delete button

            const deleteButton =
                document.createElement("button");

            deleteButton.type = "button";

            deleteButton.className =
                "btn btn-sm btn-outline-danger";

            deleteButton.textContent = "Delete";


            deleteButton.addEventListener(
                "click",
                function () {

                    if (
                        !confirm("Are you sure you want to delete this task?")
                    ) {
                        return;
                    }

                    tasks = tasks.filter(function (item) {
                        return item.id !== task.id;
                    });

                    saveTasks();

                    renderTasks();

                }
            );


            // Add buttons

            buttonArea.appendChild(completeButton);

            buttonArea.appendChild(deleteButton);


            // Add elements to card

            card.appendChild(heading);

            card.appendChild(priorityBadge);

            card.appendChild(dateText);

            card.appendChild(buttonArea);


            // Add card to page

            column.appendChild(card);

            taskList.appendChild(column);

        });


        // Update dashboard

        updateDashboard();

    }


    // Add task

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


        // Validate due date

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


        // Save and update display

        saveTasks();

        taskForm.reset();

        renderTasks();


        // Show confirmation

        alert("Task added successfully!");

    });


    // Filter tasks

    taskFilter.addEventListener(
        "change",
        renderTasks
    );


    // Set minimum date to today

    const today = new Date();

    const todayString =
        today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");

    taskDate.min = todayString;


    // Show saved tasks when page loads

    renderTasks();

});
