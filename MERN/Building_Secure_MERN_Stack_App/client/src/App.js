import React, { useState } from 'react';
import './App.css';

const TEST_ACCOUNT = { email: "test@email.com", password: "password123" };

function TaskManager({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  const addTask = () => {
    if (newTask.trim() !== '') {
      setTasks([...tasks, { id: Date.now(), text: newTask, status: 'Not Started' }]);
      setNewTask('');
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const startEditing = (task) => {
    setEditingTask({ ...task });
  };

  const saveEdit = () => {
    setTasks(tasks.map(task => task.id === editingTask.id ? editingTask : task));
    setEditingTask(null);
  };

  const updateStatus = (id, newStatus) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, status: newStatus } : task));
  };

  return (
    <div className="auth-container task-manager">
      <h1>Task Manager</h1>
      <div className="task-input">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter a new task"
        />
        <button onClick={addTask}>Add Task</button>
      </div>
      <ul className="task-list">
        {tasks.map(task => (
          <li key={task.id}>
            {editingTask && editingTask.id === task.id ? (
              <>
                <input
                  type="text"
                  value={editingTask.text}
                  onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                />
                <button onClick={saveEdit}>Save</button>
              </>
            ) : (
              <>
                <span>{task.text}</span>
                <select
                  value={task.status}
                  onChange={(e) => updateStatus(task.id, e.target.value)}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Complete">Complete</option>
                </select>
                <button onClick={() => startEditing(task)}>Edit</button>
                <button onClick={() => deleteTask(task.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <button onClick={onLogout} className="logout-btn">Logout</button>
    </div>
  );
}

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    if (email === TEST_ACCOUNT.email) {
      setMessage('Test account always exists. Please log in.');
    } else {
      setMessage('Registration successful! (Demo only: Registration is simulated, and no data is stored. Please use the test account to log in.)');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === TEST_ACCOUNT.email && password === TEST_ACCOUNT.password) {
      setIsLoggedIn(true);
      setMessage('Login successful');
    } else {
      setMessage('Invalid credentials. Try the test account or any other email/password combination.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setMessage('');
    setEmail('');
    setPassword('');
  };

  if (isLoggedIn) {
    return <TaskManager onLogout={handleLogout} />;
  }

  return (
    <div className="auth-container">
      <h1>MERN Auth Example</h1>
      <form className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="button-group">
          <button onClick={handleRegister}>Register</button>
          <button onClick={handleLogin}>Login</button>
        </div>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default App;
