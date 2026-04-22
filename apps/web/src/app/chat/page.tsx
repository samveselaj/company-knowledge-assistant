import ChatWindow from "@/components/chat/ChatWindow";

export default function ChatPage() {
  return (
    <div>
      <div className="page-header"><h1>💬 Chat</h1><p>Ask questions about your company documents</p></div>
      <ChatWindow />
    </div>
  );
}
