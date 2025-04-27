"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { MessageSquare, FileText, ImageIcon, Mic, AlertTriangle, Shield, ChevronLeft, ChevronRight } from "lucide-react"
import type { TabType } from "@/components/dashboard"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}

interface TabItem {
  id: TabType
  label: string
  icon: React.ReactNode
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const tabs: TabItem[] = [
    {
      id: "dashboard",
      label: "Dashboard (Chatbot)",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      id: "text",
      label: "Text Moderation",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      id: "image",
      label: "Image Analysis",
      icon: <ImageIcon className="h-5 w-5" />,
    },
    {
      id: "voice",
      label: "Voice Analysis",
      icon: <Mic className="h-5 w-5" />,
    },
    {
      id: "deepfake",
      label: "Deepfake Detection",
      icon: <AlertTriangle className="h-5 w-5" />,
    },
  ]

  return (
    <>
      <motion.div
        initial={{ x: -250 }}
        animate={{
          x: 0,
          width: collapsed ? 80 : 280,
        }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className={cn(
          "backdrop-blur-md bg-card/80 border-r border-border h-screen overflow-y-auto z-20 relative",
          "flex flex-col",
        )}
      >
        <div className="p-4 border-b flex items-center justify-center gap-2">
          <Shield className="h-6 w-6 text-primary flex-shrink-0" />
          {!collapsed && (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xl font-bold"
            >
              Umbrella
            </motion.h1>
          )}
        </div>

        <nav className="space-y-2 p-3 flex-1">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative overflow-hidden group",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
              )}
            >
              <div className="flex-shrink-0 z-10 relative">{tab.icon}</div>

              {!collapsed && <span className="z-10 relative">{tab.label}</span>}

              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabBackground"
                  className="absolute inset-0 bg-primary/10 rounded-lg z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
      </motion.div>
    </>
  )
}
