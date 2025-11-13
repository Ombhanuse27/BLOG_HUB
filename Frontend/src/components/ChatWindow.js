import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { getConversation } from '../api/api';
import { useParams } from 'react-router-dom';
// ... (userIcon import kept)

// const SOCKET_URL = 'http://localhost:5000'; // adjust for prod

const SOCKET_URL = 'https://blog-hub-ud2n.onrender.com'; // adjust for prod

const ChatWindow = () => {
  const { conversationId } = useParams();
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId'); // Get current user ID
  const [socket, setSocket] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();

  // This logic is unchanged
  useEffect(() => {
    const init = async () => {
      if (!conversationId) return;
      // fetch existing messages
      const conv = await getConversation(conversationId);
      setConversation(conv);
      setMessages(conv.messages || []);
    };
    init();
  }, [conversationId]);

  // This logic is unchanged
  useEffect(() => {
    if (!conversationId || !token) return;
    // connect socket with auth token via handshake
    const s = io(SOCKET_URL, { auth: { token } });
    setSocket(s);

    s.on('connect', () => {
      s.emit('joinConversation', { conversationId });
    });

    s.on('newMessage', ({ conversationId: cId, message }) => {
      if (cId === conversationId) {
        setMessages(prev => [...prev, message]);
      }
    });

    s.on('error', (err) => {
      console.error('Socket error:', err);
    });

    return () => {
      s.disconnect();
    };
  }, [conversationId, token]);

  // This logic is unchanged
  useEffect(() => {
    // auto scroll
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // This logic is unchanged
  const sendMessage = () => {
    if (!messageText?.trim() || !socket) return;

    const optimisticMessage = {
      _id: Date.now().toString(), // temp ID
      sender: { _id: currentUserId }, // Sender is me
      text: messageText.trim(),
      createdAt: new Date().toISOString()
    };

    // optimistic UI: append the message
    setMessages(prev => [...prev, optimisticMessage]);

    socket.emit('sendMessage', { conversationId, text: messageText.trim() });
    setMessageText('');
  };

  // Get the other participant's name for the header
  const otherUser = conversation?.participants.find(p => p._id !== currentUserId);
  const otherUserName = otherUser?.name || `${otherUser?.firstName || ""} ${otherUser?.lastName || ""}`.trim() || "Chat";

  return (
    // --- IMPROVED: Main container ---
    // Switched to bg-gray-50 for the outer container
    // p-4 removed, padding is now on the children
    <div className="flex flex-col h-full bg-gray-50">
      
      {/* --- IMPROVED: Header --- */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <img
            src={otherUser?.photo || "/default-user.png"}
            alt="User"
            className="w-10 h-10 rounded-full object-cover"
          />
          <h3 className="text-lg font-semibold text-gray-800">
            {otherUserName}
          </h3>
        </div>
      </div>

      {/* --- IMPROVED: Message List --- */}
      {/* flex-1, overflow-y-auto, and p-4 for padding and scrolling */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((m) => {
          const isMe = m.sender?._id === currentUserId;
          return (
            // --- IMPROVED: Message Bubble Wrapper ---
            <div key={m._id || m.createdAt} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              
              {/* --- IMPROVED: Message Bubble --- */}
              {/* - Added 'break-words' to fix width/height issues
                - Changed max-w-[80%] to responsive [75%] / sm:[65%]
                - Changed rounding to rounded-2xl with a "tail"
                - Changed 'bg-gray-100' to 'bg-white' for better contrast
              */}
              <div 
                className={`px-4 py-2.5 rounded-2xl max-w-[75%] sm:max-w-[65%] break-words ${
                  isMe 
                    ? 'bg-sky-500 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-200'
                }`}
              >
                <div className="text-sm">{m.text}</div>
                <div className={`text-xs mt-1.5 text-right ${isMe ? 'text-sky-200' : 'text-gray-400'}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* --- IMPROVED: Input Bar --- */}
      {/* Sits at the bottom with a clear border and background */}
      <div className="flex-shrink-0 flex gap-3 items-center bg-white border-t border-gray-200 p-4">
        <input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
          placeholder="Type a message..."
        />
        <button 
          onClick={sendMessage} 
          className="px-5 py-2.5 bg-sky-500 text-white rounded-full text-sm font-medium
                     hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2
                     disabled:opacity-50"
          disabled={!messageText.trim()} // Added disabled state
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;