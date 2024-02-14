import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';

function ChatInterface() {
  const [messages, setMessages] = useState([]);   // all messages
  const [inputText, setInputText] = useState(''); // user's input
  
  const handleSendMessage = async (event) => {
    // prevent refresh
    event.preventDefault();
    // prevent empty input
    if (!inputText.trim()) return;
    // GOAL: call LLM API to get streaming output

    // get user input and assign to userMessage 
    const userMessage = { text: inputText, isBot: false };
    // append the above message as history and send tgt with question
    const body = {
      content: inputText,
      chatHistory: [...messages, userMessage],
      question: inputText,
    };

    // Add a new empty bot message to the UI (initial)
    const botMessage = { text: '', isBot: true };
    setMessages([...messages, userMessage, botMessage]);
    setInputText('');

    // send to LLM
    // Replace the url below

    const response = await fetch('http://223.18.110.39:8000/stream', {
      // mode: 'no-cors',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    // console.log(messages);
    
    // setup stream
    let decoder = new TextDecoderStream();
    const reader = response.body.pipeThrough(decoder).getReader()    
    let accumulatedAnswer = ""

    while (true) {
      var { value, done } = await reader.read();
      if (done) break;
      accumulatedAnswer += value;
      setMessages(currentHistory => {
        const updatedHistory = [...currentHistory]
        const lastChatIndex = updatedHistory.length - 1
        updatedHistory[lastChatIndex] = {
          ...updatedHistory[lastChatIndex],
          text: accumulatedAnswer
        }
        return updatedHistory
      })
    }

  };

  return (
    <div className="chat-container">
      <header className="chat-header">Before answer</header>
      {/* If no messages yet */}
      {
        messages.length === 0 
          && 
        <div className="chat-message bot-message">
          <p className="initial-message">Hi there! I'm a bot trained to answer questions about the URL you entered. Try asking me a question below!</p>
        </div>
      }

      <div className="chat-messages">
        {/* Display all messages */}
        {
        messages.length !== 0
          &&
        messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
      </div>

      <form className="chat-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type a question and press enter ..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

      </form>
    </div>
  );
};

export default ChatInterface;