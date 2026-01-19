const taskInput = document.querySelector(".task-add input");
const addBtn = document.querySelector(".add-btn");
const noTaskImg = document.querySelector(".no-task");
const taskCountSpan = document.querySelector(".task-count");
const dataContainer = document.querySelector(".data") || document.querySelector("section");

let todos = JSON.parse(localStorage.getItem("todo-list")) || [];
let editId;
let isEditTask = false;

function showTasks() {
  document.querySelectorAll(".task-card").forEach((card) => card.remove());

  if (todos.length === 0) {
    noTaskImg.style.display = "block";
  } else {
    noTaskImg.style.display = "none";
    todos.forEach((todo, id) => {
      let isCompleted = todo.status === "completed" ? "checked" : "";
      let textStyle = todo.status === "completed" ? "text-decoration: line-through; opacity: 0.6;" : "";

      let taskHtml = `
                <div class="task-card" id="task-${id}">
                    <div class="card">
                        <input type="checkbox" ${isCompleted} onclick="updateStatus(this, ${id})">
                        <h1 class="task-text" style="${textStyle}">${todo.name}</h1>
                    </div>
                    <div class="task-edit">
                        <span onclick="editTask(${id}, '${todo.name.replace(/'/g, "\\'")}')"><i class="ri-pencil-ai-2-line"></i></span>
                        <span onclick="deleteTask(${id})"><i class="ri-close-circle-line"></i></span>
                    </div>
                </div>`;
      noTaskImg.insertAdjacentHTML("beforebegin", taskHtml);
    });
  }
  updateCount();
}

addBtn.addEventListener("click", () => {
  let userTask = taskInput.value.trim();
  if (userTask) {
    if (!isEditTask) {
      todos.push({ name: userTask, status: "pending" });
    } else {
      todos[editId].name = userTask;
      isEditTask = false;
      addBtn.innerHTML = '<i class="ri-add-large-line"></i>';
    }
    taskInput.value = "";
    saveData();
  }
});

function saveData() {
  localStorage.setItem("todo-list", JSON.stringify(todos));
  showTasks();
}

function updateStatus(checkbox, id) {
  todos[id].status = checkbox.checked ? "completed" : "pending";
  saveData();
}

function deleteTask(id) {
  todos.splice(id, 1);
  saveData();
}

function editTask(id, text) {
  editId = id;
  isEditTask = true;
  taskInput.value = text;
  taskInput.focus();
  addBtn.innerHTML = '<i class="ri-check-line"></i>';
}

function updateCount() {
  let pendingTasks = todos.filter((t) => t.status === "pending").length;
  if (taskCountSpan) taskCountSpan.textContent = pendingTasks;
}

taskInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") addBtn.click();
});

showTasks();
