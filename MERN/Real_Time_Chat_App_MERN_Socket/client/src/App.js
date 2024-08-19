import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:5000');

const users = [
  { name: 'Alex', avatar: '/images/Alex.png' },
  { name: 'Taylor', avatar: '/images/Taylor.png' },
  { name: 'Jordan', avatar: '/images/Jordan.png' },
  { name: 'Sam', avatar: '/images/Sam.png' }
];

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(users[0]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    socket.on('message', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    return () => {
      socket.off('message');
    };
  }, []);

  useEffect(scrollToBottom, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const newMessage = {
        content: inputMessage,
        user: currentUser
      };
      socket.emit('sendMessage', newMessage);
      setInputMessage('');
    }
  };

  return (
    <div className="chat-app">
      <header className="chat-header">
        <h1>Real-Time Chat App</h1>
        <div className="user-switcher">
          {users.map(user => (
            <button
              key={user.name}
              onClick={() => setCurrentUser(user)}
              className={currentUser.name === user.name ? 'active' : ''}
            >
              <img src={user.avatar} alt={user.name} />
            </button>
          ))}
        </div>
      </header>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.user.name === currentUser.name ? 'sent' : 'received'}`}
          >
            <img src={message.user.avatar} alt={message.user.name} className="avatar" />
            <div className="message-content">
              <p>{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="chat-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;