const TodoItem = ({ todo, onToggle, onDelete }) => {
    return (
        <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <label className="checkbox-container">
                <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => onToggle(todo.id)}
                />
                <span className="checkmark"></span>
            </label>
            <span className="todo-text">{todo.text}</span>
            <button onClick={() => onDelete(todo.id)} className="delete-btn" aria-label="Delete todo">
                ×
            </button>
        </div>
    );
};

export default TodoItem;
