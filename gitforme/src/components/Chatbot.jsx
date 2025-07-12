import React, { useState } from 'react';

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hi! Ask me about a repo (e.g., "Summarize FastAPI").' }]);
  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'user', text: input }]);
    setTimeout(() => {
      const botResponse = input.includes('repo') 
        ? 'Based on the repo, the architecture uses MVC pattern with key files in src/.' 
        : 'Sorry, I didn\'t understand. Try asking about a repo!';
      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 1000);
    setInput('');
  };

  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-[#FEF9F2] border-l-2 border-black shadow-[-8px_0_0_rgba(0,0,0,1)] transition-transform duration-300 ease-in-out">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b-2 border-black flex justify-between items-center">
          <h3 className="font-bold text-lg">Chat with Repo Bot</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-black" aria-label="Close chatbot">Close</button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto text-gray-800">
          {messages.map((msg, index) => (
            <div key={index} className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-amber-200' : 'bg-gray-200'}`}>
                {msg.text}
              </span>
            </div>
          ))}
        </div>
        <div className="p-4 border-t-2 border-black flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a repo..."
            className="flex-1 px-3 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label="Chat input"
          />
          <button
            onClick={handleSendMessage}
            className="bg-[#F9C79A] text-black font-bold px-4 py-2 border-2 border-black rounded-lg hover:bg-amber-400"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
