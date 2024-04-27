'use strict'

const TASK_STATUS = Object.freeze({
    INCOMPLETE: 'incomplete',
    PROGRESS: 'progress',
    COMPLETED: 'completed'
})
const storage = Object.freeze({
    store: window.localStorage || localStorage,
    STORAGE_KEY: 'todo',
    getItem() {
        return JSON.parse(this.store.getItem(this.STORAGE_KEY));
    },
    setItem(items) {
        this.store.setItem(this.STORAGE_KEY, JSON.stringify(items))
    }
})
window.addEventListener('DOMContentLoaded', () => {
    let tasks = storage.getItem() || []
    let DOM = {
        containerIncomplete: document.querySelector('#task__incomplete'),
        containerProgress: document.querySelector('#task__progress'),
        containerCompleted: document.querySelector('#task__completed'),
        taskItemELement: document.querySelectorAll('.task__item'),
        inputBox: document.querySelector('.input_box')
    }

    DOM.inputBox.addEventListener('keyup', event => {
        if (event.key == 'Enter') {
            let obj = {
                id: genID(),
                title: event.target.value,
                status: TASK_STATUS.INCOMPLETE
            }
            tasks.push(obj)
            storage.setItem(tasks)
            DOM.containerIncomplete.innerHTML = ''
            event.target.value = ''
            renderTask(filterTasksByState(tasks, TASK_STATUS.INCOMPLETE), DOM.containerIncomplete)
        }
    })




    function renderWholeTask() {
        DOM.containerProgress.innerHTML = ''
        DOM.containerIncomplete.innerHTML = ''
        DOM.containerCompleted.innerHTML = ''

        renderTask(filterTasksByState(tasks, TASK_STATUS.INCOMPLETE), DOM.containerIncomplete)
        renderTask(filterTasksByState(tasks, TASK_STATUS.PROGRESS), DOM.containerProgress)
        renderTask(filterTasksByState(tasks, TASK_STATUS.COMPLETED), DOM.containerCompleted)
    }

    function taskItemTemplate(item) {
        const { id, title } = item
        let ele = document.createElement('li')
        ele.setAttribute('class', 'task__item')
        ele.draggable = true
        ele.innerText = title;
        ele.dataset.id = id;
        ele.ondragstart = handleElementDragStart
        ele.ondragend= handleElementDragEnd 
        return ele;
    }

    function renderTask(taskList, where) {
        if (!where) {
            return;
        }
        if(!taskList || taskList?.length == 0) {
            where.innerHTML = '<span class="empty_task_message">No Task is present</span>'
            return;
        }
        taskList?.forEach(item => {
            where.appendChild(taskItemTemplate(item))
        })
    }
    let draggedContainer, dragedElement;

    function handleElementDragStart(event) {
        dragedElement = event.target;
        dragedElement.classList.add('task__item-dragged')
        draggedContainer = event.target.closest('.task__list')
    }

    function handleElementDragEnd() {
        dragedElement.classList.remove('task__item-dragged')
    }

    let prevItem;
    [DOM.containerIncomplete, DOM.containerProgress, DOM.containerCompleted]
        .forEach(function (container) {
            container.addEventListener('dragover', event => {
                event.preventDefault()
                if (event.target.classList.contains('task__item') && container != draggedContainer && event.target != prevItem) {
                    event.target.classList.add('create__space')
                    prevItem = event.target;
                    return;
                }
                if (prevItem == event.target) {
                    prevItem?.classList?.remove('create__space')
                }
            }, false)

            container.addEventListener('dragleave', eve => {
                dragedElement?.classList?.remove('create__space')
            })

            container.addEventListener('drop', event => {
                event.preventDefault()
                if (container != draggedContainer) {
                    let containerId = container.getAttribute('id');
                    let status = containerId == 'task__progress'
                        ? TASK_STATUS.PROGRESS : containerId == 'task__completed'
                            ? TASK_STATUS.COMPLETED : TASK_STATUS.INCOMPLETE
                    let darggedId = dragedElement?.dataset?.id;
                    console.log(darggedId)
                    let updatedTask = tasks.map(task => {
                        if (task?.id?.toString() === darggedId) {
                            task.status = status;
                        }
                        return task;
                    })
                    tasks = updatedTask;
                    storage.setItem(tasks)
                    renderWholeTask()
                }
            })
        })

    renderWholeTask();
})



function genID() {
    return Math.floor(Math.random() * Date.now())
}

function filterTasksByState(list, status) {
    if (!list || list?.length == 0) {
        return []
    }
    return list?.filter(item => item.status == status) || []
}




