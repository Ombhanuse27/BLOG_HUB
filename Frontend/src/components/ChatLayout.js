import React from 'react';
import { useParams } from 'react-router-dom';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';

const ChatLayout = () => {
  const { conversationId } = useParams();

  return (
    <div className="flex h-[calc(100vh-80px)]"> {/* Adjust height based on your Navbar */}
      {/* Left Pane: Conversation List */}
      <div className="w-full md:w-1/3 border-r overflow-y-auto bg-gray-50">
        <ConversationList />
      </div>

      {/* Right Pane: Chat Window or Placeholder */}
      <div className="hidden md:flex flex-1 flex-col">
        {conversationId ? (
          <ChatWindow key={conversationId} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center text-gray-400">
              <FontAwesomeIcon icon={faComments} className="text-6xl mb-4" />
              <h3 className="text-xl">Select a conversation</h3>
              <p>Choose from your conversations to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;