'use client'
import Chat from "@/app/components/Chat";

export default function Home() {
  return (
    <main className="flex min-h-screen bg-white text-black flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Simple Chat App</h1>
      <Chat />
    </main>
  );
}
