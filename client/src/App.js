import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('user_joined', (data) => {
      setMessages(prev => [...prev, data]);
    });

    socket.on('user_left', (data) => {
      setMessages(prev => [...prev, data]);
    });

    socket.on('current_data', (data) => {
      setMessages(data.messages);
    });

    return () => {
      socket.off('connect');
      socket.off('receive_message');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('current_data');
    };
  }, []);

  const joinChat = () => {
    if (username.trim()) {
      socket.emit('user_join', { username });
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('send_message', { content: message });
      setMessage('');
    }
  };

  if (!isConnected) {
    return <div className="app">Connecting to server...</div>;
  }

  if (!username) {
    return (
      <div className="app">
        <div className="login">
          <h1>Join Chat</h1>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && joinChat()}
          />
          <button onClick={joinChat}>Join</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="chat-container">
        <div className="chat-header">
          <h2>Global Chat</h2>
          <div className="status">🟢 Connected as {username}</div>
        </div>

        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index} className="message">
              {msg.message ? (
                <div className="system-message">{msg.message}</div>
              ) : (
                <div className="user-message">
                  <strong>{msg.username}:</strong> {msg.content}
                  <span className="timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="message-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;