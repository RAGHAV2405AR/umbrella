"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Sidebar from "@/components/sidebar"
import ChatbotPage from "@/components/pages/chatbot-page"
import TextModerationPage from "@/components/pages/text-moderation-page"
import ImageAnalysisPage from "@/components/pages/image-analysis-page"
import VoiceAnalysisPage from "@/components/pages/voice-analysis-page"
import DeepfakeDetectionPage from "@/components/pages/deepfake-detection-page"
import { ModeToggle } from "@/components/mode-toggle"
import { Shield } from "lucide-react"

export type TabType = "dashboard" | "text" | "image" | "voice" | "deepfake"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <ChatbotPage />
      case "text":
        return <TextModerationPage />
      case "image":
        return <ImageAnalysisPage />
      case "voice":
        return <VoiceAnalysisPage />
      case "deepfake":
        return <DeepfakeDetectionPage />
      default:
        return <ChatbotPage />
    }
  }

  if (!mounted) return null

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 overflow-hidden relative">
        <div className="flex justify-between items-center p-4 backdrop-blur-sm bg-background/80 border-b z-10 sticky top-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Umbrella</h1>
          </motion.div>
          <ModeToggle />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.4 }}
            className="h-[calc(100%-4rem)] p-6 overflow-auto"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
