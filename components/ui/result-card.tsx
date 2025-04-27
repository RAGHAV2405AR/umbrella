"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, AlertTriangle, ChevronDown, ChevronUp, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface AnalysisMetric {
  name: string
  value: number
  description?: string
}

interface ResultCardProps {
  title: string
  isSafe: boolean
  reason?: string
  className?: string
  metrics?: AnalysisMetric[]
  rawAnalysis?: string
  firstLLMAnalysis?: string
}

export function ResultCard({
  title,
  isSafe,
  reason,
  className,
  metrics = [],
  rawAnalysis,
  firstLLMAnalysis,
}: ResultCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [showRawAnalysis, setShowRawAnalysis] = useState(false)
  const [showFirstLLMAnalysis, setShowFirstLLMAnalysis] = useState(false)

  const getColorForValue = (value: number) => {
    if (value < 0.3) return "bg-green-500 dark:bg-green-600"
    if (value < 0.6) return "bg-yellow-500 dark:bg-yellow-600"
    return "bg-red-500 dark:bg-red-600"
  }

  const getTextColorForValue = (value: number) => {
    if (value < 0.3) return "text-green-600 dark:text-green-400"
    if (value < 0.6) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "backdrop-blur-lg bg-card/40 border rounded-xl p-6 shadow-lg",
        isSafe
          ? "border-green-500/30 dark:border-green-700/30 shadow-green-500/5"
          : "border-red-500/30 dark:border-red-700/30 shadow-red-500/5",
        className,
      )}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          {isSafe ? (
            <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-red-500 dark:text-red-400" />
          )}
        </motion.div>
        <h3 className="text-lg font-medium">{title}</h3>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={cn(
            "px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm",
            isSafe
              ? "bg-green-100/30 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100/30 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          )}
        >
          {isSafe ? "Safe" : "Flagged"}
        </motion.div>

        {metrics && metrics.length > 0 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="ml-auto flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            {showDetails ? "Hide Details" : "Show Details"}
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
      </div>

      {reason && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 bg-background/40 backdrop-blur-sm p-3 rounded-lg"
        >
          <h4 className="text-sm font-medium mb-2">Reason:</h4>
          <p className="text-sm text-muted-foreground">{reason}</p>
        </motion.div>
      )}

      <AnimatePresence>
        {showDetails && metrics && metrics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 overflow-hidden"
          >
            <div className="bg-background/40 backdrop-blur-sm p-4 rounded-lg space-y-4">
              <h4 className="text-sm font-medium">Detailed Analysis:</h4>

              <div className="space-y-3">
                {metrics.map((metric, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">{metric.name}</span>
                      <span className={cn("text-xs font-bold", getTextColorForValue(metric.value))}>
                        {Math.round(metric.value * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={metric.value * 100}
                      className="h-2 bg-background"
                      indicatorClassName={getColorForValue(metric.value)}
                    />
                    {metric.description && <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {firstLLMAnalysis && (
        <div className="mt-4">
          <button
            onClick={() => setShowFirstLLMAnalysis(!showFirstLLMAnalysis)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showFirstLLMAnalysis ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            First LLM Analysis
          </button>

          <AnimatePresence>
            {showFirstLLMAnalysis && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-2 bg-background/40 backdrop-blur-sm p-3 rounded-lg overflow-hidden"
              >
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{firstLLMAnalysis}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {rawAnalysis && (
        <div className="mt-4">
          <button
            onClick={() => setShowRawAnalysis(!showRawAnalysis)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showRawAnalysis ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Raw Analysis Data
          </button>

          <AnimatePresence>
            {showRawAnalysis && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-2 bg-background/40 backdrop-blur-sm p-3 rounded-lg overflow-hidden"
              >
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{rawAnalysis}</pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
