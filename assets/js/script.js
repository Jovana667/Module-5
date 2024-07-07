// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateUniqueId() {
    const id = nextId;
    nextId++;
    localStorage.setItem("nextId", JSON.stringify(nextId));
    return id;
}

// Function to create a task card
function createTaskCard(task) {
    const taskCard = document.createElement('div');
    taskCard.classList.add('task-card');
    taskCard.dataset.id = task.id;

    // Calculate days until due date
    const dueDate = new Date(task.dueDate);
    console.log (dayjs(dueDate).format ('MM-DD-YYYY'))
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    let titlebottomcolor = '';
    // Set background color based on due date
    if (task.status === 'done') {
        taskCard.style.backgroundColor = '#ffffff'; // White for done tasks
        taskCard.style.color = '#000000'; // Black text for done tasks
        titlebottomcolor = '#ccc' //grey heading underline
    } else if (daysUntilDue <= 1) {
        taskCard.style.backgroundColor = '#dc3545'; // Red
        taskCard.style.color = '#ffffff'; // White text for red background
        titlebottomcolor = '#c9303e' // Darker red heading underline
    } else if (daysUntilDue <= 4) {
        taskCard.style.backgroundColor = '#ffc107'; // Yellow
        taskCard.style.color = '#ffffff'; // White text for red background
        titlebottomcolor = '#f5ba07' // Darker yellow heading underline
    } else {
        taskCard.style.backgroundColor = '#ffffff'; // White
        titlebottomcolor = '#ccc' //grey heading underline
    }

    let dueDateText = '';
    if (daysUntilDue < 0) {
        dueDateText = 'past due';
    } else if (daysUntilDue === 0) {
        dueDateText = 'due today';
    } else if (daysUntilDue === 1) {
        dueDateText = 'due tomorrow';
    } else {
        dueDateText = `due in ${daysUntilDue} days`;
    }

    taskCard.innerHTML = `
        <h3 style="border-bottom: 1px solid ${titlebottomcolor}">${task.title}</h3>
        <p class="description">${task.description}</p>
        <p class="due-date">${dayjs(dueDate).format ('MM-DD-YYYY')}</p>
        <button class="delete-btn">Delete</button>
    `;

    const deleteBtn = taskCard.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', handleDeleteTask);

    return taskCard;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
    const todoCards = document.getElementById('todo-cards');
    const inProgressCards = document.getElementById('in-progress-cards');
    const doneCards = document.getElementById('done-cards');
    
    todoCards.innerHTML = '';
    inProgressCards.innerHTML = '';
    doneCards.innerHTML = '';
    
    if (taskList && taskList.length > 0) {
        taskList.forEach(task => {
            const taskCard = createTaskCard(task);
            switch(task.status) {
                case 'to-do':
                    todoCards.appendChild(taskCard);
                    break;
                case 'in-progress':
                    inProgressCards.appendChild(taskCard);
                    break;
                case 'done':
                    doneCards.appendChild(taskCard);
                    break;
            }
        });

        $(".task-card").draggable({
            containment: ".swim-lanes",
            cursor: "move",
            revert: "invalid"
        });
    }
}

// Function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();
    
    const title = $('#task-title').val();
    const description = $('#task-description').val();
    const dueDate = $('#task-due-date').val();
    const priority = $('#task-priority').val();

    const newTask = {
        id: generateUniqueId(),
        title,
        description,
        dueDate,
        priority,
        status: 'to-do' // Set a default status
    };

    taskList.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(taskList));
    renderTaskList();
    $('#formModal').modal('hide'); // Hide the modal after submission
    $('#add-task-form')[0].reset(); // Reset the form
}

// Function to handle deleting a task
function handleDeleteTask(event) {
    const taskCard = event.target.closest('.task-card');
    if (!taskCard) return;
    const taskId = parseInt(taskCard.dataset.id);
    taskList = taskList.filter(task => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(taskList));
    renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = parseInt(ui.draggable[0].dataset.id);
    const newStatus = event.target.id;
    
    const taskIndex = taskList.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        taskList[taskIndex].status = newStatus;
        localStorage.setItem('tasks', JSON.stringify(taskList));
        renderTaskList();
    }
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();

    $('#add-task-form').on('submit', handleAddTask);

    $('#to-do, #in-progress, #done').droppable({
        accept: ".task-card",
        drop: handleDrop
    });

    $('#task-due-date').datepicker({
        dateFormat: 'yy-mm-dd' // This format matches the date input's format
    });
});