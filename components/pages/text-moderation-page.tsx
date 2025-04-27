"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ResultCard } from "@/components/ui/result-card"
import { Loader2, FileText } from "lucide-react"

interface ModerationResult {
  isSafe: boolean
  reason: string
  metrics?: Array<{
    name: string
    value: number
    description?: string
  }>
  rawAnalysis?: string
}

export default function TextModerationPage() {
  const [text, setText] = useState("")
  const [result, setResult] = useState<ModerationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || isLoading) return

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/moderate-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error("Failed to moderate text")
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error:", error)
      setResult({
        isSafe: false,
        reason: "An error occurred while moderating the text. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 backdrop-blur-sm rounded-full mb-2">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Text Moderation</h1>
          <p className="text-muted-foreground">Enter text to check for potentially harmful content</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to moderate..."
            className="min-h-[200px] backdrop-blur-sm bg-card/30 border-primary/20"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="w-full bg-primary/80 backdrop-blur-sm hover:bg-primary"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Moderating...
              </>
            ) : (
              "Moderate Text"
            )}
          </Button>
        </form>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <ResultCard
              title="Text Moderation Result"
              isSafe={result.isSafe}
              reason={result.reason}
              metrics={result.metrics}
              rawAnalysis={result.rawAnalysis}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
