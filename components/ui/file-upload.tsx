"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, FileIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept: string
  maxSize?: number // in MB
  label?: string
}

export function FileUpload({ onFileSelect, accept, maxSize = 10, label = "Upload File" }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`)
      return
    }

    setSelectedFile(file)
    setError(null)
    onFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    // Check file type
    const fileType = file.type
    const acceptedTypes = accept.split(",").map((type) => type.trim())

    if (
      !acceptedTypes.some((type) => {
        if (type.startsWith(".")) {
          return file.name.endsWith(type)
        }
        return fileType.match(new RegExp(type.replace("*", ".*")))
      })
    ) {
      setError(`Invalid file type. Accepted: ${accept}`)
      return
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`)
      return
    }

    setSelectedFile(file)
    setError(null)
    onFileSelect(file)
  }

  const clearFile = () => {
    setSelectedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
        id="file-upload"
      />

      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer backdrop-blur-sm transition-all duration-200 ${
              isDragging
                ? "bg-primary/10 border-primary"
                : "bg-card/30 border-border hover:border-primary/50 hover:bg-card/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">{label}</p>
              <p className="text-sm text-muted-foreground mt-1">Drag and drop or click to browse</p>
              <p className="text-xs text-muted-foreground mt-2">Max size: {maxSize}MB</p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="backdrop-blur-sm bg-card/30 border rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                clearFile()
              }}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-sm text-destructive mt-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
