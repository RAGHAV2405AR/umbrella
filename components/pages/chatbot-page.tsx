"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "@/components/ui/chat-message"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Umbrella moderation assistant. How can I help you today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch response")
      }

      const data = await response.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }])
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error processing your request. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-center"
      >
        <div className="inline-flex items-center justify-center p-2 bg-primary/10 backdrop-blur-sm rounded-full mb-2">
          <Bot className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Umbrella Assistant</h1>
        <p className="text-muted-foreground">Ask me anything about content moderation</p>
      </motion.div>

      <div className="flex-1 overflow-y-auto pb-20 scrollbar-thin">
        <div className="space-y-4 max-w-3xl mx-auto">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} isLatest={index === messages.length - 1} index={index} />
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="fixed bottom-0 left-0 right-0 p-4 backdrop-blur-md bg-background/80 border-t z-10"
        style={{ left: collapsed ? "80px" : "280px" }}
      >
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 backdrop-blur-sm bg-card/30 border-primary/20"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-primary/80 backdrop-blur-sm hover:bg-primary"
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
