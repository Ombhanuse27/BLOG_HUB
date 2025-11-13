import React, { useState } from 'react';
import { sendChatRequest } from '../api/api';

const ChatRequestButton = ({ targetUserId, onSent }) => { // 1. Add onSent prop
  const [status, setStatus] = useState('idle'); // idle | loading | sent | error

  const handleSend = async () => {
    setStatus('loading');
    try {
      await sendChatRequest(targetUserId);
      setStatus('sent');
      if (onSent) onSent(); // 2. Call onSent on success
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div>
      {status === 'sent' ? (
        <button className="px-4 py-2 rounded-full border bg-gray-100" disabled>Request Sent</button>
      ) : (
        <button 
          onClick={handleSend} 
          disabled={status === 'loading'}
          className="px-4 py-2 rounded-full bg-sky-500 text-white"
        >
          {status === 'loading' ? 'Sending...' : 'Request to Chat'}
        </button>
      )}
      {status === 'error' && <p className="text-xs text-red-500 mt-1">Failed to send</p>}
    </div>
  );
};

export default ChatRequestButton;