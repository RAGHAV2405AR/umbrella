"use client"

import { motion } from "framer-motion"
import { User, Bot } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface ChatMessageProps {
  message: ChatMessage
  isLatest?: boolean
  index?: number
}

export function ChatMessage({ message, isLatest = false, index = 0 }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={cn(
        "flex gap-3 p-4 rounded-xl backdrop-blur-sm",
        isUser ? "bg-primary/5 border border-primary/10" : "bg-card/30 border border-border",
      )}
    >
      <div className="flex-shrink-0 mt-1">
        {isUser ? (
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-8 h-8 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center"
          >
            <User className="h-4 w-4 text-primary-foreground" />
          </motion.div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-8 h-8 rounded-full bg-secondary/80 backdrop-blur-sm flex items-center justify-center"
          >
            <Bot className="h-4 w-4 text-secondary-foreground" />
          </motion.div>
        )}
      </div>
      <div className="flex-1 space-y-2">
        <p className="text-sm font-medium">{isUser ? "You" : "Assistant"}</p>
        <div className="prose prose-sm dark:prose-invert max-w-none">{message.content}</div>
      </div>
    </motion.div>
  )
}
