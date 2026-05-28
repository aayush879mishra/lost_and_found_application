import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import socket from "../socket";
import { Send, MessageSquare, Package, Calendar, User } from "lucide-react";

function ChatInbox() {
  const location = useLocation();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);
  
  const messagesEndRef = useRef(null);
  
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser.user_id;

  const config = { headers: { Authorization: `Bearer ${token}` } };
  const incomingRoomId = location.state?.autoSelectRoomId;

  // 1. Fetch available inbox channels
  useEffect(() => {
    if (!token) return;
    
    const fetchInbox = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/chat/rooms", config);
        
        // Setup simple boolean unread flag on data load
        const sortedInitialRooms = res.data.map(room => ({
          ...room,
          hasUnread: false 
        })).sort((a, b) => {
          const timeA = new Date(a.latest_message_time || a.created_at).getTime();
          const timeB = new Date(b.latest_message_time || b.created_at).getTime();
          return timeB - timeA;
        });

        setRooms(sortedInitialRooms);

        if (incomingRoomId && sortedInitialRooms.length > 0) {
          const targetedRoom = sortedInitialRooms.find(r => Number(r.room_id) === Number(incomingRoomId));
          if (targetedRoom) {
            setActiveRoom(targetedRoom);
          }
        }
      } catch (err) {
        console.error("Failed to load user inbox:", err);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchInbox();
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [token, incomingRoomId]);

  // 2. Room switching & Dynamic Live Re-sorting with simple unread flags
  useEffect(() => {
    const handleIncomingMessage = (newMsg) => {
      setRooms((prevRooms) => {
        const updatedRooms = prevRooms.map((room) => {
          if (Number(room.room_id) === Number(newMsg.room_id)) {
            const isCurrentlyActive = activeRoom && Number(activeRoom.room_id) === Number(newMsg.room_id);
            const isFromMe = Number(newMsg.sender_id) === Number(currentUserId);

            return {
              ...room,
              latest_message_time: newMsg.created_at,
              // Simply mark true if it's not the active screen and not written by the current user
              hasUnread: !isCurrentlyActive && !isFromMe
            };
          }
          return room;
        });

        return [...updatedRooms].sort((a, b) => {
          const timeA = new Date(a.latest_message_time || a.created_at).getTime();
          const timeB = new Date(b.latest_message_time || b.created_at).getTime();
          return timeB - timeA;
        });
      });

      if (activeRoom && Number(newMsg.room_id) === Number(activeRoom.room_id)) {
        setMessages((prev) => [...prev, newMsg]);
      }
    };

    socket.on("receive_message", handleIncomingMessage);

    if (!activeRoom) {
      return () => {
        socket.off("receive_message", handleIncomingMessage);
      };
    }

    // Flush unread flag immediately on room click selector
    setRooms(prev => prev.map(r => Number(r.room_id) === Number(activeRoom.room_id) ? { ...r, hasUnread: false } : r));

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/chat/messages/${activeRoom.room_id}`, config);
        setMessages(res.data);
      } catch (err) {
        console.error("Could not fetch conversation history:", err);
      }
    };

    fetchMessages();
    socket.emit("join_room", activeRoom.room_id);

    return () => {
      socket.off("receive_message", handleIncomingMessage);
    };
  }, [activeRoom]);

  // 3. Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Send Message Handler
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeRoom) return;

    const messagePayload = {
      room_id: activeRoom.room_id,
      sender_id: currentUserId,
      message_text: typedMessage.trim()
    };

    socket.emit("send_message", messagePayload);
    setTypedMessage("");
  };

  if (loadingRooms) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-slate-50 flex overflow-hidden border-t border-slate-200">
      
      {/* LEFT COLUMN: SIDEBAR */}
      <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-500" /> Messages
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Discuss details regarding lost or found objects.</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {rooms.map((room) => {
            const isSelected = activeRoom?.room_id === room.room_id;
            return (
              <button
                key={room.room_id}
                onClick={() => setActiveRoom(room)}
                className={`w-full p-4 flex items-center gap-4 text-left transition-colors duration-150 border-l-4 relative ${
                  isSelected 
                    ? "bg-emerald-50/50 border-emerald-500" 
                    : "border-transparent hover:bg-slate-50"
                }`}
              >
                <img
                  src={room.item_image ? `http://localhost:5000${room.item_image}` : "https://placehold.co/100"}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                  alt={room.item_name}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <p className={`text-sm truncate ${room.hasUnread ? "font-black text-black" : "font-extrabold text-slate-900"}`}>
                      {room.participant_name}
                    </p>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      room.item_type === 'lost' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
                    }`}>
                      {room.item_type}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <p className={`text-xs flex items-center gap-1 truncate ${room.hasUnread ? "text-slate-900 font-black" : "text-slate-600 font-semibold"}`}>
                      <Package className="w-3 h-3 text-slate-400 shrink-0" /> {room.item_name}
                    </p>
                    
                    {/* SIMPLE UNREAD DOT SIGN */}
                    {room.hasUnread && (
                      <span className="w-2.5 h-2.5 bg-[#4F46E5] rounded-full shrink-0 shadow-sm animate-pulse" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {rooms.length === 0 && (
            <div className="p-12 text-center text-slate-400 italic">
              <MessageSquare className="w-10 h-10 mx-auto opacity-20 mb-3" />
              <p className="text-sm font-medium">Your chat inbox is completely empty.</p>
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT COLUMN: CHAT INTERACTIVE WORKSPACE */}
      <main className="flex-1 bg-slate-100 flex flex-col h-full">
        {activeRoom ? (
          <>
            <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center gap-3">
                <div className="space-y-0.5">
                  <p className="font-extrabold text-slate-900 leading-tight flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-400" /> {activeRoom.participant_name}
                  </p>
                  <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    Context: <span className="text-slate-500 font-medium underline">{activeRoom.item_name}</span>
                  </p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Started On
                </p>
                <p className="text-xs font-bold text-slate-700">
                  {new Date(activeRoom.created_at).toLocaleDateString()}
                </p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, index) => {
                const isMyMessage = Number(msg.sender_id) === Number(currentUserId);
                return (
                  <div key={msg.message_id || index} className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-md px-4 py-2.5 rounded-2xl shadow-sm text-sm font-medium leading-relaxed ${
                      isMyMessage
                        ? "bg-emerald-500 text-white rounded-br-none"
                        : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                    }`}>
                      <p className="whitespace-pre-wrap break-words">{msg.message_text}</p>
                      <span className={`block text-[9px] text-right mt-1 font-bold ${
                        isMyMessage ? "text-emerald-100" : "text-slate-400"
                      }`}>
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just Now"}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex gap-3 items-center shrink-0">
              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder={`Message ${activeRoom.participant_name}...`}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!typedMessage.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-500 text-white p-3 rounded-xl transition-all font-bold shrink-0 flex items-center justify-center shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm mb-4 animate-pulse">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Your Workspace Open</h3>
            <p className="text-slate-500 text-sm max-w-sm font-medium mt-1">
              Select a conversation thread from the sidebar panel map to start chatting with claim owners securely.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default ChatInbox;