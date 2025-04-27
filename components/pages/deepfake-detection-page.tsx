"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
import { ResultCard } from "@/components/ui/result-card"
import { Loader2, AlertTriangle } from "lucide-react"

interface DetectionResult {
  isSafe: boolean
  reason: string
  metrics?: Array<{
    name: string
    value: number
    description?: string
  }>
  firstLLMAnalysis?: string
  rawAnalysis?: string
}

export default function DeepfakeDetectionPage() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
    setResult(null)

    // Create preview for images and videos
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else if (selectedFile.type.startsWith("video/")) {
      setPreview(URL.createObjectURL(selectedFile))
    } else {
      setPreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || isLoading) return

    setIsLoading(true)
    setResult(null)

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })

      const response = await fetch("/api/detect-deepfake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file: base64,
          filename: file.name,
          fileType: file.type,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to detect deepfake")
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error:", error)
      setResult({
        isSafe: false,
        reason: "An error occurred while analyzing the file. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderPreview = () => {
    if (!preview) return null

    if (file?.type.startsWith("image/")) {
      return (
        <img
          src={preview || "/placeholder.svg"}
          alt="Preview"
          className="max-h-[300px] rounded-lg border border-border"
        />
      )
    } else if (file?.type.startsWith("video/")) {
      return <video src={preview} controls className="max-h-[300px] w-full rounded-lg border border-border" />
    } else if (file?.type.startsWith("audio/")) {
      return <audio src={preview} controls className="w-full rounded-lg border border-border" />
    }

    return null
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 backdrop-blur-sm rounded-full mb-2">
            <AlertTriangle className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Deepfake Detection</h1>
          <p className="text-muted-foreground mb-2">
            Upload an image, audio, or video file to check if it might be AI-generated
          </p>
          <p className="text-xs text-muted-foreground">
            Our two-LLM pipeline provides enhanced accuracy through multi-stage analysis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FileUpload
            onFileSelect={handleFileSelect}
            accept="image/*,audio/*,video/*"
            maxSize={20}
            label="Upload Media File"
          />

          {preview && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex justify-center">
              {renderPreview()}
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
              "Detect Deepfake"
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
              title="Deepfake Detection Result"
              isSafe={result.isSafe}
              reason={result.reason}
              metrics={result.metrics}
              firstLLMAnalysis={result.firstLLMAnalysis}
              rawAnalysis={result.rawAnalysis}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
