document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('add-todo-btn');
    const inputContainer = document.querySelector('.todo-input');
    const submitBtn = document.getElementById('submit-todo');
    const inputField = document.getElementById('new-todo');
    const todoList = document.getElementById('todo-list');

    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    function renderTodos() {
        todoList.innerHTML = '';
        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.classList.add('todo-entry');

            const p = document.createElement('p');
            p.textContent = todo;

            const del = document.createElement('span');
            del.textContent = '🗑️';
            del.classList.add('delete-todo');
            del.addEventListener('click', () => {
                todos.splice(index, 1);
                localStorage.setItem('todos', JSON.stringify(todos));
                renderTodos();
            });

            li.appendChild(p);
            li.appendChild(del);
            todoList.appendChild(li);
        });
    }

    addBtn.addEventListener('click', () => {
        inputContainer.style.display = inputContainer.style.display === 'none' ? 'flex' : 'none';
    });

    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const text = inputField.value.trim();
        if (text !== '') {
            todos.push(text);
            localStorage.setItem('todos', JSON.stringify(todos));
            renderTodos();
            inputField.value = '';
        }
    });

    const switchMode = document.getElementById('switch-mode');
    if (switchMode) {
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark');
            switchMode.checked = true;
        }

        switchMode.addEventListener('change', function () {
            if (this.checked) {
                document.body.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    renderTodos();
});
