import React, { useEffect, useState } from 'react';
import { getIncomingChatRequests, acceptChatRequest, rejectChatRequest, getConversations } from '../api/api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faSearch, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import userIcon from "../img/user.png"; // Default user icon

const ConversationList = () => {
  const [requests, setRequests] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const { conversationId: activeConversationId } = useParams();
  const currentUserId = localStorage.getItem('userId');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, convRes] = await Promise.all([
        getIncomingChatRequests(),
        getConversations()
      ]);
      setRequests(reqRes);
      const validConversations = convRes.filter(c => c.otherUser);
      setConversations(validConversations);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onAccept = async (id) => {
    try {
      const res = await acceptChatRequest(id);
      nav(`/chat/${res.conversationId}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const onReject = async (id) => {
    try {
      await rejectChatRequest(id);
      setRequests(r => r.filter(x => x._id !== id));
    } catch (err) { console.error(err); }
  };

  const getUserName = (user) => {
    return user?.name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Unknown User";
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center text-gray-500">
      Loading...
    </div>
  );

  const filteredConversations = conversations.filter(c =>
    getUserName(c.otherUser)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    // Main container uses flex-col. Switched to bg-white for a cleaner look
    <div className="h-full bg-white flex flex-col">

      {/* Section 1: Chat Requests */}
      {requests.length > 0 && (
        // Added more padding and a subtle border
        <div className="p-3 border-b border-gray-200 flex-shrink-0">
          <h5 className="px-1 pb-2 text-sm font-semibold text-gray-700">
            Chat Requests
          </h5>
          <ul className="space-y-2">
            {requests.map(r => (
              // Softer shadow and rounded-lg
              <li key={r._id} className="bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={r.from?.photo || userIcon}
                    alt={userIcon}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-medium truncate text-gray-800">{getUserName(r.from)}</div>
                    <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                {/* --- IMPROVED: Cleaner buttons --- */}
                <div className="flex gap-2 mt-3 justify-end">
                  <button
                    onClick={() => onAccept(r._id)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-sky-500 text-white rounded-md text-sm font-medium hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 transition-colors"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    Accept
                  </button>
                  <button
                    onClick={() => onReject(r._id)}
                    className="flex items-center gap-1.5 px-3 py-1 border border-gray-300 bg-white text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Section 2: Conversations (This container will grow and its list will scroll) */}
      <div className="flex-1 min-h-0 flex flex-col p-3">
        <h5 className="px-1 pb-2 text-sm font-semibold text-gray-700 flex-shrink-0">
          Conversations
        </h5>

        {/* --- IMPROVED: Search Bar with Icon --- */}
        {conversations.length > 0 && (
          <div className="pb-2 flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name..."
                className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* --- UPDATED: List container is now scrollable --- */}
        {filteredConversations.length > 0 ? (
          // Added a subtle bg-gray-50 for contrast
          <ul className="space-y-1 -mx-1 px-1 py-1 flex-1 overflow-y-auto bg-gray-50 rounded-lg">
            {filteredConversations.map(c => {
              
              // --- BUG FIX: Get the *actual* last message ---
              // Checks messages array first, then falls back to c.lastMessage
              const lastMessage = (c.messages && c.messages.length > 0) 
                ? c.messages[c.messages.length - 1] 
                : c.lastMessage;
              // --- END BUG FIX ---

              const isUnread = lastMessage && lastMessage.sender?._id !== currentUserId;
              const isActive = c._id === activeConversationId;

              return (
                <li key={c._id}>
                  <Link
                    to={`/chat/${c._id}`}
                    // --- IMPROVED: Bolder active state ---
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-150 ${
                      isActive
                        ? 'bg-sky-500 text-white shadow-md' // Strong active state
                        : 'hover:bg-sky-50' // Gentle hover state
                    }`}
                  >
                    <img
                      src={c.otherUser?.photo || "/default-user.png"}
                      alt="User"
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-baseline">
                        <h5 className={`font-semibold truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>
                          {getUserName(c.otherUser)}
                        </h5>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className={`text-xs ${isActive ? 'text-sky-100' : 'text-gray-400'}`}>
                            {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {/* Unread dot is hidden if active, since you're reading it */}
                          {(isUnread && !isActive) && (
                            <div className="w-2.5 h-2.5 bg-sky-500 rounded-full" title="Unread" />
                          )}
                        </div>
                      </div>
                      <p className={`text-sm truncate ${
                        isActive 
                          ? 'text-sky-100' // Active message text
                          : isUnread 
                            ? 'text-gray-800 font-medium' // Unread style
                            : 'text-gray-500' // Read style
                      }`}>
                        {/* Use the fixed lastMessage variable */}
                        {lastMessage?.text || (lastMessage ? "..." : "No messages yet")}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-gray-500 p-4 text-sm bg-gray-50 rounded-lg">
            {searchQuery.length > 0 ? 'No matches found.' : 'No active chats.'}
          </div>
        )}
      </div>

      {/* "Empty All" State - Only shows if both lists are empty */}
      {requests.length === 0 && conversations.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-gray-400">
          <FontAwesomeIcon icon={faComments} className="text-5xl mb-4" />
          <h5 className="text-lg font-semibold text-gray-500">All clear</h5>
          <p className="text-sm">No new requests or conversations.</p>
        </div>
      )}
    </div>
  );
};

export default ConversationList;