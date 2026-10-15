
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskFilter = document.getElementById("taskFilter");
const emptyMessage = document.getElementById("emptyMessage");
const message = document.getElementById("message");

let tasks = [];

try {
    const savedTasks = JSON.parse(localStorage.getItem("taskFlowTasks"));
    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(task =>
            task &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean" &&
            typeof task.id === "number"
        );
    }
} catch (error) {
    tasks = [];
}

// Save tasks in the browser
function saveTasks() {
    localStorage.setItem("taskFlowTasks", JSON.stringify(tasks));
}

// Add a new task
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (text === "") {
        message.textContent = "Please enter a task first.";
        return;
    }

    tasks.push({
        id: Date.now(),
        text: text,
        completed: false
    });

    saveTasks();
    taskInput.value = "";
    message.textContent = "Task added successfully! ✨";

    renderTasks();
    taskInput.focus();
});

// Display tasks
function renderTasks() {
    taskList.innerHTML = "";

    const filter = taskFilter.value;

    const visibleTasks = tasks.filter(function(task) {
        if (filter === "pending") return !task.completed;
        if (filter === "completed") return task.completed;
        return true;
    });

    visibleTasks.forEach(function(task) {
        const item = document.createElement("div");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-check";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task completed");

        checkbox.addEventListener("change", function() {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.textContent = task.text;

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", "Delete " + task.text);

        deleteButton.addEventListener("click", function() {
            tasks = tasks.filter(function(savedTask) {
                return savedTask.id !== task.id;
            });

            saveTasks();
            message.textContent = "Task deleted.";
            renderTasks();
        });

        item.appendChild(checkbox);
        item.appendChild(taskText);
        item.appendChild(deleteButton);

        taskList.appendChild(item);
    });

    // Update task counts
    document.getElementById("totalCount").textContent = tasks.length;

    document.getElementById("pendingCount").textContent =
        tasks.filter(task => !task.completed).length;

    document.getElementById("completedCount").textContent =
        tasks.filter(task => task.completed).length;

    // Show empty message when no matching tasks exist
    emptyMessage.style.display = visibleTasks.length === 0 ? "block" : "none";

    if (visibleTasks.length === 0 && tasks.length > 0) {
        emptyMessage.textContent = "No tasks in this category.";
    } else {
        emptyMessage.textContent = "🌸 No tasks yet. Add your first task above!";
    }
}

// Filter tasks
taskFilter.addEventListener("change", renderTasks);

// Initial display
renderTasks();
