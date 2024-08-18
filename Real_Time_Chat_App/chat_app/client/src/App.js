import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:4000');

const USERS = ['Heather','Sabri','Allen'];

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(USERS[0]);

  useEffect(() => {
    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('chat message');
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage) {
      socket.emit('chat message', { user: currentUser, text: inputMessage });
      setInputMessage('');
    }
  };

  return (
    <div className="chat-container">
      <h1>Simple Chat App</h1>
      <div className="user-select">
        <label htmlFor="user-select">Chat as: </label>
        <select
          id="user-select"
          value={currentUser}
          onChange={(e) => setCurrentUser(e.target.value)}
        >
          {USERS.map(user => (
            <option key={user} value={user}>{user}</option>
          ))}
        </select>
      </div>
      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.user === currentUser ? 'message-right' : 'message-left'}`}
          >
            <strong>{msg.user}: </strong> {msg.text}
          </div>
        ))}
      </div>
      <form className="input-container" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
          autoFocus
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default App;