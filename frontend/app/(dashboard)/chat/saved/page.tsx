"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send, Sparkles } from "lucide-react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

// Types for chat and message
type MessageType = {
  id: number;
  chatId: string;
  question: string;
  content: string;
  createdAt: string;
};

type ChatType = {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: MessageType[];
};

const ChatHistoryComponent: React.FC = () => {
  const [chats, setChats] = useState<ChatType[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch chat history when component mounts
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/chatbot/chats`,
          { withCredentials: true }
        );

        // Sort chats by most recent first
        const sortedChats = response.data.data.sort(
          (a: ChatType, b: ChatType) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setChats(sortedChats);
      } catch (error) {
        toast({
          title: "Failed to fetch chat history",
          variant: "destructive",
        });
        console.error(error);
      }
    };

    fetchChats();
  }, []);

  // Send message to selected chat
  const sendMessage = async () => {
    if (!input.trim() || !selectedChat) return;

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chatbot/${selectedChat.id}`,
        {
          message: input,
        },
        { withCredentials: true }
      );

      // Update the selected chat with the new message
      const newMessage: MessageType = {
        id: response.data.data.id,
        chatId: selectedChat.id,
        question: input,
        content: response.data.data.content,
        createdAt: new Date().toISOString(),
      };

      setSelectedChat((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, newMessage],
            }
          : null
      );

      setInput("");
    } catch (error) {
      toast({
        title: "Failed to send message",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render chat list
  const renderChatList = () => {
    return chats.map((chat) => (
      <Card
        key={chat.id}
        className={`mb-2 cursor-pointer ${
          selectedChat?.id === chat.id ? "border-primary" : ""
        }`}
        onClick={() => setSelectedChat(chat)}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            {chat.title ||
              `Chat from ${new Date(chat.createdAt).toLocaleDateString()}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          {chat.messages.length > 0
            ? chat.messages[0].content.substring(0, 100) + "..."
            : "No messages"}
        </CardContent>
      </Card>
    ));
  };

  // Render selected chat messages
  const renderSelectedChatMessages = () => {
    if (!selectedChat) return null;

    return (
      <div className="flex flex-col h-full">
        <ScrollArea className="flex-grow pr-4">
          {selectedChat.messages.map((msg) => (
            <React.Fragment key={msg.id}>
              {/* User Message */}
              {msg.question && (
                <div className="mb-4 flex justify-end">
                  <div className="max-w-[80%] p-3 rounded-lg bg-blue-500 text-white">
                    {msg.question}
                  </div>
                </div>
              )}

              {/* AI Response */}
              <div className="mb-4 flex justify-start">
                <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 text-black">
                  {msg.content}
                </div>
              </div>
            </React.Fragment>
          ))}
        </ScrollArea>
        <div className="mt-4 flex gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-grow"
          />
          <Button onClick={sendMessage} disabled={isLoading || !selectedChat}>
            {isLoading ? (
              <Sparkles className="h-5 w-5 animate-pulse" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-3 mx-5 my-5 gap-4 h-[70vh]">
      {/* Chat List */}
      <div className="col-span-1 overflow-y-auto pr-2">
        <h2 className="text-xl font-bold mb-4">Chat History</h2>
        {renderChatList()}
      </div>

      {/* Selected Chat View */}
      <Card className="col-span-2 flex flex-col">
        <CardHeader>
          <CardTitle>
            {selectedChat
              ? selectedChat.title ||
                `Chat from ${new Date(
                  selectedChat.createdAt
                ).toLocaleDateString()}`
              : "Select a Chat"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          {selectedChat ? (
            renderSelectedChatMessages()
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a chat to view or continue conversation
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatHistoryComponent;
