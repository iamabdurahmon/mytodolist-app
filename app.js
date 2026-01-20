document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.querySelector(".task-add input");
  const addBtn = document.querySelector(".add-btn");
  const taskContainer = document.querySelector(".task-list-container");
  const taskCountSpan = document.querySelector(".task-count");

  let todos = JSON.parse(localStorage.getItem("todo-list")) || [];
  let editId = null;

  function renderTasks() {
    let taskHtml = "";
    todos.forEach((todo, index) => {
      let isDone = todo.status === "completed";
      taskHtml += `
        <div class="task-card">
          <div class="card">
            <input type="checkbox" ${isDone ? "checked" : ""} onchange="toggleTask(${index})">
            <h1 style="${isDone ? "text-decoration: line-through; opacity: 0.6;" : ""}">${todo.name}</h1>
          </div>
          <div class="task-edit">
            <button onclick="editTask(${index})">✏️</button>
            <button onclick="deleteTask(${index})">❌</button>
          </div>
        </div>`;
    });

    taskContainer.innerHTML = taskHtml || "<p>No tasks yet</p>";
    updateStats();
  }

  addBtn.onclick = () => {
    let val = taskInput.value.trim();
    if (!val) return;

    if (editId === null) {
      todos.push({ name: val, status: "pending" });
    } else {
      todos[editId].name = val;
      editId = null;
      addBtn.textContent = "+";
    }

    taskInput.value = "";
    saveAndRefresh();
  };

  window.deleteTask = (id) => {
    todos.splice(id, 1);
    saveAndRefresh();
  };

  window.toggleTask = (id) => {
    todos[id].status =
      todos[id].status === "completed" ? "pending" : "completed";
    saveAndRefresh();
  };

  window.editTask = (id) => {
    editId = id;
    taskInput.value = todos[id].name;
    taskInput.focus();
    addBtn.textContent = "✓";
  };

  function saveAndRefresh() {
    localStorage.setItem("todo-list", JSON.stringify(todos));
    renderTasks();
  }

  function updateStats() {
    let pending = todos.filter((t) => t.status === "pending").length;
    if (taskCountSpan) taskCountSpan.textContent = pending;
  }

  taskInput.onkeyup = (e) => {
    if (e.key === "Enter") addBtn.click();
  };

  renderTasks();
});
