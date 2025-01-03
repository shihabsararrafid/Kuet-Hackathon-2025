"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileUp, Send, FileText, Sparkles, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import axios from "axios";
import { toast } from "@/hooks/use-toast";

// Types for messages and chat state
type MessageType = {
  id: string;
  content: string;
  role: "user" | "ai" | "system";
  timestamp: Date;
  files?: string[];
};

type PDFFile = {
  id: string;
  name: string;
  path: string;
};

type StoredPDF = {
  id: string;
  title: string;
  path: string;
  uploadedAt: string;
};

const BanglishChatbot: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedPDF, setAttachedPDF] = useState<PDFFile | null>(null);
  const [storedPDFs, setStoredPDFs] = useState<StoredPDF[]>([]);
  const [isStoredPDFDialogOpen, setIsStoredPDFDialogOpen] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Fetch stored PDFs when component mounts
  useEffect(() => {
    const fetchStoredPDFs = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/translations/all-pdfs`,
          {
            withCredentials: true,
          }
        );
        setStoredPDFs(response.data.data);
      } catch (error) {
        console.error("Failed to fetch stored PDFs", error);
      }
    };

    fetchStoredPDFs();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle file upload from computer
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append("pdfs", files[0]);

    try {
      const response = await axios.post("/api/chat/upload-pdf", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const uploadedFile: PDFFile = response.data.files[0];
      setAttachedPDF(uploadedFile);
      toast({ title: `PDF uploaded successfully: ${uploadedFile.name}` });
    } catch (error) {
      toast({ title: "Failed to upload PDF", variant: "destructive" });
      console.error(error);
    }
  };

  // Handle PDF selection from stored PDFs
  const handleStoredPDFSelection = (pdf: StoredPDF) => {
    const newPDFFile: PDFFile = {
      id: pdf.id,
      name: pdf.title,
      path: pdf.path,
    };

    setAttachedPDF(newPDFFile);
    setIsStoredPDFDialogOpen(false);
    toast({ title: `${pdf.title} added successfully` });
  };

  // Upload PDF handler with dropdown
  const handlePDFUploadDropdown = () => {
    const dropdownMenu = (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <FileUp className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* <DropdownMenuItem onSelect={() => fileInputRef.current?.click()}>
            Upload from Computer
          </DropdownMenuItem> */}
          <DropdownMenuItem onSelect={() => setIsStoredPDFDialogOpen(true)}>
            Select from Stored PDFs
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    return dropdownMenu;
  };

  // Send message to chatbot
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: MessageType = {
      id: `user-${Date.now()}`,
      content: input,
      role: "user",
      timestamp: new Date(),
      files: attachedPDF ? [attachedPDF.path] : undefined,
    };

    // Optimistically add user message
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Decide which endpoint to use based on whether we have an existing chat
      const endpoint = currentChatId
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/chatbot/${currentChatId}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/chatbot`;

      const payload = {
        message: input,
      };

      const response = await axios.post(endpoint, payload, {
        withCredentials: true,
      });

      console.log(response);

      // If it's a new chat, set the chat ID
      if (!currentChatId) {
        setCurrentChatId(response.data.data.id);
        // Add AI message to messages
        const aiMessage: MessageType = {
          id: `ai-${Date.now()}`,
          content: response.data.data.messages[0].content,
          role: "ai",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const aiMessage: MessageType = {
          id: `ai-${Date.now()}`,
          content: response.data.data.content,
          role: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      toast({ title: "Failed to send message", variant: "destructive" });
      console.error(error);
      // Remove the optimistically added user message
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  // Remove attached PDF
  const removeAttachedPDF = () => {
    setAttachedPDF(null);
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto h-[50vh] mt-10 flex flex-col">
        <CardContent className="flex-grow overflow-hidden p-4">
          <ScrollArea className="h-full pr-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-4 flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-black"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </ScrollArea>
        </CardContent>

        {attachedPDF && (
          <div className="px-4 pb-2 flex gap-2">
            <div className="flex items-center bg-gray-100 p-2 rounded-md">
              <FileText className="mr-2 h-5 w-5 text-blue-500" />
              <span className="text-sm">{attachedPDF.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 h-6 w-6"
                onClick={removeAttachedPDF}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <CardFooter className="flex gap-2">
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          {handlePDFUploadDropdown()}
          <Input
            placeholder="Type your message in Banglish..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-grow"
          />
          <Button onClick={sendMessage} disabled={isLoading}>
            {isLoading ? (
              <Sparkles className="h-5 w-5 animate-pulse" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Stored PDFs Dialog */}
      <Dialog
        open={isStoredPDFDialogOpen}
        onOpenChange={setIsStoredPDFDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select PDF from Stored Documents</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {storedPDFs.length === 0 ? (
              <p className="text-center text-gray-500">No stored PDFs found</p>
            ) : (
              storedPDFs?.map((pdf) => (
                <div
                  key={pdf.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleStoredPDFSelection(pdf)}
                >
                  <div className="flex items-center">
                    <FileText className="mr-3 h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">{pdf.title}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded on{" "}
                        {new Date(pdf.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BanglishChatbot;
