"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
import { ResultCard } from "@/components/ui/result-card"
import { Loader2, ImageIcon } from "lucide-react"

interface AnalysisResult {
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

export default function ImageAnalysisPage() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
    setResult(null)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || isLoading) return

    setIsLoading(true)
    setResult(null)

    try {
      // Convert image to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })

      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64 }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze image")
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error:", error)
      setResult({
        isSafe: false,
        reason: "An error occurred while analyzing the image. Please try again.",
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
            <ImageIcon className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Image Analysis</h1>
          <p className="text-muted-foreground mb-2">Upload an image to check for potentially harmful content</p>
          <p className="text-xs text-muted-foreground">
            Our two-LLM pipeline provides enhanced accuracy through multi-stage analysis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FileUpload onFileSelect={handleFileSelect} accept="image/*" maxSize={5} label="Upload Image" />

          {preview && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex justify-center">
              <motion.img
                whileHover={{ scale: 1.02 }}
                src={preview || "/placeholder.svg"}
                alt="Preview"
                className="max-h-[300px] rounded-lg border border-border shadow-lg"
              />
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
              "Analyze Image"
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
              title="Image Analysis Result"
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
