const FIREBASE_URL = 'https://todo-app-lab7-default-rtdb.firebaseio.com/';

const list = document.getElementById('todo-list');
const itemCountSpan = document.getElementById('item-count');
const uncheckedCountSpan = document.getElementById('unchecked-count');

let todos = [];

function showLoading() {
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'block';
}

function hideLoading() {
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'none';
}

function showError(message) {
  const errorText = document.getElementById('error-text');
  const errorMessage = document.getElementById('error-message');
  if (errorText && errorMessage) {
    errorText.textContent = message;
    errorMessage.style.display = 'block';
  }
}

function hideError() {
  const errorMessage = document.getElementById('error-message');
  if (errorMessage) errorMessage.style.display = 'none';
}

async function addTodo(todo) {
  try {
    const response = await fetch(FIREBASE_URL, {
      method: 'POST',
      body: JSON.stringify({
        title: todo.title,
        completed: todo.completed
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Помилка при додаванні справи');
    }
    
    const result = await response.json();
    
    return {
      id: result.name, 
      title: todo.title,
      completed: todo.completed
    };
  } catch (error) {
    console.error('Помилка:', error);
    throw error;
  }
}

async function getTodos() {
  try {
    const response = await fetch(FIREBASE_URL);
    
    if (!response.ok) {
      throw new Error('Помилка при отриманні даних');
    }
    
    const data = await response.json();
    
    if (!data) {
      return [];
    }
    
    const todosArray = Object.keys(data).map(key => ({
      id: key,
      title: data[key].title,
      completed: data[key].completed
    }));
    
    return todosArray;
  } catch (error) {
    console.error('Помилка при отриманні даних:', error);
    throw error;
  }
}

async function updateTodoInFirebase(id, updates) {
  try {
    const url = FIREBASE_URL.replace('todos.json', `todos/${id}.json`);
    const response = await fetch(url, {
      method: 'PATCH',
      body: JSON.stringify(updates),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Помилка при оновленні справи');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Помилка:', error);
    throw error;
  }
}

async function deleteTodoFromFirebase(id) {
  try {
    const url = FIREBASE_URL.replace('todos.json', `todos/${id}.json`);
    const response = await fetch(url, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Помилка при видаленні справи');
    }
    
    return true;
  } catch (error) {
    console.error('Помилка:', error);
    throw error;
  }
}

async function newTodo() {
  const title = prompt('Введіть назву нового завдання:');
  if (title && title.trim()) {
    showLoading();
    hideError();
    
    try {
      const newTodoItem = {
        title: title.trim(),
        completed: false
      };
      
      const addedTodo = await addTodo(newTodoItem);
      todos.push(addedTodo);
      render();
      updateCounter();
      
      console.log('Справа успішно додана:', addedTodo);
    } catch (error) {
      showError('Не вдалося додати справу: ' + error.message);
    } finally {
      hideLoading();
    }
  }
}

function renderTodo(todo) {
  return `
    <li class="list-group-item">
      <input type="checkbox" class="form-check-input me-2" id="${todo.id}" ${todo.completed ? 'checked' : ''} onChange="checkTodo('${todo.id}')" />
      <label for="${todo.id}">
        <span class="${todo.completed ? 'text-success text-decoration-line-through' : ''}">${todo.title}</span>
      </label>
      <button class="btn btn-danger btn-sm float-end" onClick="deleteTodo('${todo.id}')">delete</button>
    </li>
  `;
}

function render() {
  list.innerHTML = todos.map(renderTodo).join('');
}

function updateCounter() {
  itemCountSpan.textContent = todos.length;
  uncheckedCountSpan.textContent = todos.filter(todo => !todo.completed).length;
}

async function deleteTodo(id) {
  showLoading();
  hideError();
  
  try {
    await deleteTodoFromFirebase(id);
    todos = todos.filter(todo => todo.id !== id);
    render();
    updateCounter();
    console.log('Справа успішно видалена');
  } catch (error) {
    showError('Не вдалося видалити справу: ' + error.message);
  } finally {
    hideLoading();
  }
}

async function checkTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    const originalCompleted = todo.completed;
    todo.completed = !todo.completed;
    render();
    updateCounter();
    
    try {
      await updateTodoInFirebase(id, { completed: todo.completed });
      console.log('Статус справи оновлено');
    } catch (error) {
      todo.completed = originalCompleted;
      render();
      updateCounter();
      showError('Не вдалося оновити статус справи: ' + error.message);
    }
  }
}

async function loadTodos() {
  showLoading();
  hideError();
  
  try {
    console.log('Завантаження справ з Firebase...');
    todos = await getTodos();
    render();
    updateCounter();
    console.log('Справи успішно завантажені:', todos);
  } catch (error) {
    console.error('Помилка завантаження:', error);
    showError('Не вдалося завантажити справи з сервера. Показано локальні дані.');
    todos = JSON.parse(localStorage.getItem('todos')) || [];
    render();
    updateCounter();
  } finally {
    hideLoading();
  }
}

loadTodos();