import ChatWindow from "@/components/chat/ChatWindow";
import PageHeader from "@/components/ui/PageHeader";

export default function ChatPage() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Assistant"
        title="Ask the knowledge base"
        description="Search across uploaded company documents and get grounded answers with citations."
      />
      <ChatWindow />
    </div>
  );
}
