const list = document.getElementById('todo-list')
const itemCountSpan = document.getElementById('item-count')
const uncheckedCountSpan = document.getElementById('unchecked-count')

function newTodo() {
  alert('New TODO button clicked!')
}

let todos = JSON.parse(localStorage.getItem('todos')) || []
let nextId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1

function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos))
}

function newTodo() {
  const title = prompt('Введіть назву нового завдання:')
  if (title && title.trim()) {
    todos.push({
      id: nextId++,
      title: title.trim(),
      completed: false
    })
    saveTodos()
    render()
    updateCounter()
  }
}

function renderTodo(todo) {
  return `
    <li class="list-group-item">
      <input type="checkbox" class="form-check-input me-2" id="${todo.id}" ${todo.completed ? 'checked' : ''} onChange="checkTodo(${todo.id})" />
      <label for="${todo.id}">
        <span class="${todo.completed ? 'text-success text-decoration-line-through' : ''}">${todo.title}</span>
      </label>
      <button class="btn btn-danger btn-sm float-end" onClick="deleteTodo(${todo.id})">delete</button>
    </li>
  `
}

function render() {
  list.innerHTML = todos.map(renderTodo).join('')
}

function updateCounter() {
  itemCountSpan.textContent = todos.length
  uncheckedCountSpan.textContent = todos.filter(todo => !todo.completed).length
}

function deleteTodo(id) {
  todos = todos.filter(todo => todo.id !== id)
  saveTodos()
  render()
  updateCounter()
}

function checkTodo(id) {
  const todo = todos.find(t => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
    saveTodos()
    render()
    updateCounter()
  }
}

render()
updateCounter()
