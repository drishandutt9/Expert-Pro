'use client';

import dynamic from 'next/dynamic';

const ChatClient = dynamic(() => import('@/components/ChatClient'), {
  ssr: false,
});

export default function ChatPage() {
  return <ChatClient />;
}
