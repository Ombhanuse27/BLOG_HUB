
// src/components/IncomingChatRequests.jsx
import React, { useEffect, useState } from 'react';
import { getIncomingChatRequests, acceptChatRequest, rejectChatRequest } from '../api/api';
import { useNavigate } from 'react-router-dom';

const IncomingChatRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await getIncomingChatRequests();
      setRequests(res);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const onAccept = async (id) => {
    try {
      const res = await acceptChatRequest(id);
      // response contains conversationId — navigate to chat window
      nav(`/chat/${res.conversationId}`);
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

  if (loading) return <div>Loading...</div>;
  if (!requests.length) return <div>No chat requests</div>;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h4 className="font-semibold mb-2">Chat requests</h4>
      <ul className="space-y-2">
        {requests.map(r => (
          <li key={r._id} className="flex items-center justify-between">
            <div>
              <div className="font-medium flex items-center gap-2">
  <img
    src={r.from?.photo || "/default-user.png"}
    alt="User"
    className="w-8 h-8 rounded-full"
  />
  {r.from?.name ||
    `${r.from?.firstName || ""} ${r.from?.lastName || ""}`.trim() ||
    "Unknown User"}
</div>


              <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onAccept(r._id)} className="px-3 py-1 bg-sky-500 text-white rounded">Accept</button>
              <button onClick={() => onReject(r._id)} className="px-3 py-1 border rounded">Reject</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IncomingChatRequests;
