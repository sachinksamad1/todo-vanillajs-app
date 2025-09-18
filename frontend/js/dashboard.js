// js/dashboard.js
class TodoManager {
    constructor() {
        this.todos = [];
        this.currentEditId = null;
        this.checkAuthStatus();
        this.initializeEventListeners();
        this.loadUserInfo();
        this.loadTodos();
    }
    
    checkAuthStatus() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }
    }
    
    initializeEventListeners() {
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        
        // Add todo form
        document.getElementById('todoForm').addEventListener('submit', (e) => this.handleAddTodo(e));
        
        // Edit todo form
        document.getElementById('editTodoForm').addEventListener('submit', (e) => this.handleEditTodo(e));
        document.getElementById('cancelEdit').addEventListener('click', () => this.closeEditModal());
        
        // Filters
        document.getElementById('statusFilter').addEventListener('change', () => this.filterTodos());
        document.getElementById('priorityFilter').addEventListener('change', () => this.filterTodos());
        
        // Close modal when clicking outside
        document.getElementById('editModal').addEventListener('click', (e) => {
            if (e.target.id === 'editModal') {
                this.closeEditModal();
            }
        });
    }
    
    async loadUserInfo() {
        try {
            const user = await api.getMe();
            document.getElementById('userInfo').textContent = `Welcome, ${user.username}!`;
        } catch (error) {
            console.error('Error loading user info:', error);
            this.logout();
        }
    }
    
    async loadTodos() {
        try {
            this.todos = await api.getTodos();
            this.renderTodos();
        } catch (error) {
            this.showMessage('Error loading todos: ' + error.message, 'error');
        }
    }
    
    async handleAddTodo(e) {
        e.preventDefault();
        
        const title = document.getElementById('todoTitle').value;
        const description = document.getElementById('todoDescription').value;
        const priority = document.getElementById('todoPriority').value;
        const dueDate = document.getElementById('todoDueDate').value;
        
        const todoData = {
            title,
            description,
            priority,
            ...(dueDate && { dueDate })
        };
        
        try {
            const newTodo = await api.createTodo(todoData);
            this.todos.unshift(newTodo);
            this.renderTodos();
            document.getElementById('todoForm').reset();
            this.showMessage('Todo added successfully!', 'success');
        } catch (error) {
            this.showMessage('Error adding todo: ' + error.message, 'error');
        }
    }
    
    async handleEditTodo(e) {
        e.preventDefault();
        
        const title = document.getElementById('editTodoTitle').value;
        const description = document.getElementById('editTodoDescription').value;
        const priority = document.getElementById('editTodoPriority').value;
        const dueDate = document.getElementById('editTodoDueDate').value;
        
        const todoData = {
            title,
            description,
            priority,
            ...(dueDate && { dueDate })
        };
        
        try {
            const updatedTodo = await api.updateTodo(this.currentEditId, todoData);
            const todoIndex = this.todos.findIndex(todo => todo._id === this.currentEditId);
            this.todos[todoIndex] = updatedTodo;
            this.renderTodos();
            this.closeEditModal();
            this.showMessage('Todo updated successfully!', 'success');
        } catch (error) {
            this.showMessage('Error updating todo: ' + error.message, 'error');
        }
    }
    
    async toggleTodoStatus(id) {
        const todo = this.todos.find(t => t._id === id);
        if (!todo) return;
        
        try {
            const updatedTodo = await api.updateTodo(id, { completed: !todo.completed });
            const todoIndex = this.todos.findIndex(t => t._id === id);
            this.todos[todoIndex] = updatedTodo;
            this.renderTodos();
        } catch (error) {
            this.showMessage('Error updating todo: ' + error.message, 'error');
        }
    }
    
    async deleteTodo(id) {
        if (!confirm('Are you sure you want to delete this todo?')) return;
        
        try {
            await api.deleteTodo(id);
            this.todos = this.todos.filter(todo => todo._id !== id);
            this.renderTodos();
            this.showMessage('Todo deleted successfully!', 'success');
        } catch (error) {
            this.showMessage('Error deleting todo: ' + error.message, 'error');
        }
    }
    
    openEditModal(id) {
        const todo = this.todos.find(t => t._id === id);
        if (!todo) return;
        
        this.currentEditId = id;
        document.getElementById('editTodoTitle').value = todo.title;
        document.getElementById('editTodoDescription').value = todo.description || '';
        document.getElementById('editTodoPriority').value = todo.priority;
        document.getElementById('editTodoDueDate').value = todo.dueDate ? 
            new Date(todo.dueDate).toISOString().split('T')[0] : '';
        
        document.getElementById('editModal').classList.remove('hidden');
        document.getElementById('editModal').classList.add('flex');
    }
    
    closeEditModal() {
        this.currentEditId = null;
        document.getElementById('editModal').classList.add('hidden');
        document.getElementById('editModal').classList.remove('flex');
    }
    
    filterTodos() {
        const statusFilter = document.getElementById('statusFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;
        
        let filteredTodos = [...this.todos];
        
        if (statusFilter !== 'all') {
            filteredTodos = filteredTodos.filter(todo => {
                if (statusFilter === 'completed') return todo.completed;
                if (statusFilter === 'pending') return !todo.completed;
                return true;
            });
        }
        
        if (priorityFilter !== 'all') {
            filteredTodos = filteredTodos.filter(todo => todo.priority === priorityFilter);
        }
        
        this.renderTodos(filteredTodos);
    }
    
    renderTodos(todosToRender = this.todos) {
        const todoList = document.getElementById('todoList');
        const emptyState = document.getElementById('emptyState');
        
        if (todosToRender.length === 0) {
            todoList.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        todoList.innerHTML = todosToRender.map(todo => this.createTodoHTML(todo)).join('');
        
        // Add event listeners to todo items
        todosToRender.forEach(todo => {
            document.getElementById(`toggle-${todo._id}`).addEventListener('change', () => {
                this.toggleTodoStatus(todo._id);
            });
            
            document.getElementById(`edit-${todo._id}`).addEventListener('click', () => {
                this.openEditModal(todo._id);
            });
            
            document.getElementById(`delete-${todo._id}`).addEventListener('click', () => {
                this.deleteTodo(todo._id);
            });
        });
    }
    
    createTodoHTML(todo) {
        const dueDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : '';
        const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;
        
        const priorityColors = {
            high: 'bg-red-100 text-red-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-green-100 text-green-800'
        };
        
        return `
            <div class="bg-white rounded-lg shadow p-6 ${todo.completed ? 'opacity-75' : ''} ${isOverdue ? 'border-l-4 border-red-500' : ''}">
                <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3 flex-1">
                        <input type="checkbox" id="toggle-${todo._id}" 
                               ${todo.completed ? 'checked' : ''} 
                               class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                        <div class="flex-1">
                            <h3 class="text-lg font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}">
                                ${todo.title}
                            </h3>
                            ${todo.description ? `<p class="text-gray-600 mt-1 ${todo.completed ? 'line-through' : ''}">${todo.description}</p>` : ''}
                            <div class="flex items-center space-x-4 mt-3">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[todo.priority]}">
                                    ${todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                                </span>
                                ${dueDate ? `<span class="text-sm text-gray-500 ${isOverdue ? 'text-red-600 font-medium' : ''}">Due: ${dueDate}</span>` : ''}
                                ${isOverdue ? '<span class="text-xs text-red-600 font-medium">OVERDUE</span>' : ''}
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2 ml-4">
                        <button id="edit-${todo._id}" 
                                class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Edit
                        </button>
                        <button id="delete-${todo._id}" 
                                class="text-red-600 hover:text-red-800 text-sm font-medium">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    showMessage(message, type) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = message;
        messageEl.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-green-100', 'text-green-700');
        
        if (type === 'error') {
            messageEl.classList.add('bg-red-100', 'text-red-700');
        } else {
            messageEl.classList.add('bg-green-100', 'text-green-700');
        }
        
        setTimeout(() => {
            messageEl.classList.add('hidden');
        }, 5000);
    }
    
    logout() {
        api.logout();
        window.location.href = 'index.html';
    }
}

// Initialize todo manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoManager();
});