"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, BookOpen, Sparkles, Gift, X } from "lucide-react"

interface Level10CelebrationProps {
  isVisible: boolean
  onClose: () => void
  onViewRecommendations: () => void
}

export default function Level10Celebration({ isVisible, onClose, onViewRecommendations }: Level10CelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  const handleClose = () => {
    onClose()
  }

  const handleViewRecommendations = () => {
    onViewRecommendations()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </div>
          ))}
        </div>
      )}

      <Card className="bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 text-white max-w-md w-full animate-in zoom-in-95 duration-500 border-0 shadow-2xl">
        <CardHeader className="text-center relative">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex justify-center mb-4">
            <div className="relative">
              <Trophy className="h-16 w-16 text-yellow-300 animate-pulse" />
              <div className="absolute -top-2 -right-2 animate-spin">
                <Sparkles className="h-6 w-6 text-yellow-300" />
              </div>
            </div>
          </div>

          <CardTitle className="text-2xl font-bold mb-2">🎉 CONGRATULATIONS! 🎉</CardTitle>
          <p className="text-white/90">You've reached Level 10!</p>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <BookOpen className="h-8 w-8 text-yellow-300 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Book Recommendations Unlocked!</h3>
            <p className="text-sm text-white/80">
              Your personal journey has been analyzed, and we've curated the perfect books just for you!
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleViewRecommendations}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-purple-600 hover:bg-white/90 font-semibold rounded-md transition-colors"
            >
              <Gift className="h-4 w-4" />
              View My Book Recommendations
            </button>

            <button
              onClick={handleClose}
              className="w-full px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              I'll check them out later
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
