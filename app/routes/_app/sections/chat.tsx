import React from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/sections/chat")({
  component: ChatSection,
});

function ChatSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Chat Section</h2>
      <p>Here you can implement your chat functionality.</p>
    </div>
  );
}
