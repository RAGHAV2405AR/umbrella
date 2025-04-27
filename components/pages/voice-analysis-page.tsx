"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
import { ResultCard } from "@/components/ui/result-card"
import { Loader2, Mic } from "lucide-react"

interface AnalysisResult {
  isSafe: boolean
  reason: string
  transcription?: string
  metrics?: Array<{
    name: string
    value: number
    description?: string
  }>
  firstLLMAnalysis?: string
  rawAnalysis?: string
}

export default function VoiceAnalysisPage() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
    setResult(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || isLoading) return

    setIsLoading(true)
    setResult(null)

    try {
      // Convert audio to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })

      const response = await fetch("/api/analyze-voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audio: base64, filename: file.name }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze audio")
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error:", error)
      setResult({
        isSafe: false,
        reason: "An error occurred while analyzing the audio. Please try again.",
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
            <Mic className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Voice Analysis</h1>
          <p className="text-muted-foreground mb-2">
            Upload an audio file to transcribe and check for potentially harmful content
          </p>
          <p className="text-xs text-muted-foreground">
            Our two-LLM pipeline provides enhanced accuracy through multi-stage analysis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FileUpload onFileSelect={handleFileSelect} accept=".mp3,.wav,.ogg" maxSize={10} label="Upload Audio File" />

          {file && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 border border-border rounded-lg backdrop-blur-sm bg-card/30"
            >
              <p className="text-sm font-medium">{file.name}</p>
              <audio controls className="w-full mt-2">
                <source src={URL.createObjectURL(file)} type={file.type} />
                Your browser does not support the audio element.
              </audio>
            </motion.div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !file}
            className="w-full bg-primary/80 backdrop-blur-sm hover:bg-primary"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Audio"
            )}
          </Button>
        </form>

        {result && (
          <div className="mt-8 space-y-6">
            {result.transcription && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-border rounded-lg backdrop-blur-sm bg-card/30"
              >
                <h3 className="text-lg font-medium mb-2">Transcription</h3>
                <p className="text-sm text-muted-foreground">{result.transcription}</p>
              </motion.div>
            )}

            <ResultCard
              title="Voice Analysis Result"
              isSafe={result.isSafe}
              reason={result.reason}
              metrics={result.metrics}
              firstLLMAnalysis={result.firstLLMAnalysis}
              rawAnalysis={result.rawAnalysis}
            />
          </div>
        )}
      </motion.div>
    </div>
  )
}
