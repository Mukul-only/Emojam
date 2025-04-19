import { useState, useEffect, useRef } from "react";
import SendIcon from "../assets/send.svg?react";
import ChatIcon from "../assets/chat.svg?react";
function Chat({ messages, sendMessage, username, ...rest } = props) {
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll on new message
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    sendMessage(messageInput.trim());
    setMessageInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 px-4 py-2 w-fit ">
        <ChatIcon className="w-6 h-6" />
        <h2 className="font-semibold text-gray-200 text-md">Game Chat</h2>
      </div>
      <div className="line " />
      {/* Messages area */}
      <div className="flex flex-col flex-1 gap-2 p-4 overflow-y-auto h-11">
        {messages.length === 0 ? (
          <div className="py-4 text-center text-gray-400">No messages yet</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`px-3 py-2 rounded-xl max-w-xs w-fit whitespace-pre-wrap break-words ${
                message.user === "system"
                  ? "bg-[#242424] border border-[#2D2D2D] text-gray-400 italic mx-auto "
                  : message.user === username
                  ? "bg-blue-600 border border-blue-500 text-white font-medium ml-auto"
                  : "bg-[#303030] border border-[#3C3C3C] text-white"
              }`}
            >
              {message.user !== "system" && (
                <div className="mb-1 text-xs font-extrabold text-white">
                  {message.user === username ? "You" : message.user}
                </div>
              )}
              <div className="text-sm">{message.text}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="line" />
      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-2">
        <div className="flex">
          <textarea
            rows={1}
            className="flex-grow text-sm resize-none input"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            className="ml-2 text-sm btn btn-primary"
            disabled={!messageInput.trim()}
          >
            <SendIcon className="w-5 h-5 " />
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat;
