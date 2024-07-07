// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Save tasks and nextId to localStorage
function saveToLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));
}

// Create a task card
function createTaskCard(task) {
  const taskCard = $(`
    <div class="task-card card mb-3 ${task.isOverdue ? 'bg-danger' : task.isNearingDeadline ? 'bg-warning' : ''}" data-id="${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small class="text-muted">Due: ${task.deadline}</small></p>
        <button class="btn btn-danger btn-sm delete-task">Delete</button>
      </div>
    </div>
  `);
  taskCard.draggable({
    revert: "invalid",
    stack: ".task-card",
    cursor: "move"
  });
  return taskCard;
}

// Render the task list
function renderTaskList() {
  ["todo-cards", "in-progress-cards", "done-cards"].forEach(id => $(`#${id}`).empty());

  taskList.forEach(task => {
    const taskCard = createTaskCard(task);
    if (task.status === "to-do") {
      $("#todo-cards").append(taskCard);
    } else if (task.status === "in-progress") {
      $("#in-progress-cards").append(taskCard);
    } else if (task.status === "done") {
      $("#done-cards").append(taskCard);
    }
  });
}

// Handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const title = $("#task-title").val();
  const description = $("#task-description").val();
  const deadline = $("#task-deadline").val();

  const newTask = {
    id: generateTaskId(),
    title,
    description,
    deadline,
    status: "to-do",
    isOverdue: dayjs().isAfter(dayjs(deadline)),
    isNearingDeadline: dayjs().add(3, 'day').isAfter(dayjs(deadline))
  };

  taskList.push(newTask);
  saveToLocalStorage();
  renderTaskList();
  $("#formModal").modal('hide');
}

// Handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).closest(".task-card").data("id");
  taskList = taskList.filter(task => task.id !== taskId);
  saveToLocalStorage();
  renderTaskList();
}

// Handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.data("id");
  const newStatus = $(event.target).closest(".lane").attr("id").replace("-cards", "");

  const task = taskList.find(task => task.id === taskId);
  task.status = newStatus;

  saveToLocalStorage();
  renderTaskList();
}

// When the page loads
$(document).ready(function () {
  // Render the task list when the page loads
  renderTaskList();

  // Make lanes droppable
  $(".lane").droppable({
    accept: ".task-card",
    drop: handleDrop
  });

  // Handle form submission for adding new tasks
  $("#add-task-form").on("submit", handleAddTask);

  // Handle task deletion
  $(document).on("click", ".delete-task", handleDeleteTask);

  // Initialize datepicker for the task deadline field
  $("#task-deadline").datepicker({
    dateFormat: "yy-mm-dd"
  });
});
