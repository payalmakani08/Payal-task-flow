document.addEventListener("DOMContentLoaded", function () {

    const taskForm = document.getElementById("taskForm");
    const taskInput = document.getElementById("taskInput");
    const taskList = document.getElementById("taskList");

    // Load saved tasks
    let tasks = JSON.parse(localStorage.getItem("payalTasks")) || [];

    // Display tasks
    function displayTasks() {

        taskList.innerHTML = "";

        tasks.forEach(function (task, index) {

            const taskCard = document.createElement("div");
            taskCard.className = "card mb-3 p-3";

            taskCard.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <span class="${task.completed ? 'text-decoration-line-through' : ''}">
                        ${task.title}
                    </span>

                    <div>
                        <button class="btn btn-success btn-sm"
                            onclick="completeTask(${index})">
                            ${task.completed ? 'Undo' : 'Complete'}
                        </button>

                        <button class="btn btn-danger btn-sm"
                            onclick="deleteTask(${index})">
                            Delete
                        </button>
                    </div>
                </div>
            `;

            taskList.appendChild(taskCard);

        });

        localStorage.setItem("payalTasks", JSON.stringify(tasks));

    }

    // Add task
    taskForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const taskName = taskInput.value.trim();

        if (taskName === "") {
            alert("Please enter a task!");
            return;
        }

        const newTask = {
            title: taskName,
            completed: false
        };

        tasks.push(newTask);

        localStorage.setItem("payalTasks", JSON.stringify(tasks));

        taskInput.value = "";

        displayTasks();

    });

    // Complete task
    window.completeTask = function (index) {

        tasks[index].completed = !tasks[index].completed;

        displayTasks();

    };

    // Delete task
    window.deleteTask = function (index) {

        tasks.splice(index, 1);

        displayTasks();

    };

    // Initial display
    displayTasks();

});
