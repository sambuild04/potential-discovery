"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, BookOpen, Sparkles, Gift, X } from "lucide-react"

interface LevelUpCelebrationProps {
  isVisible: boolean
  onClose: () => void
  onViewRecommendations: () => void
  level: number
}

export default function LevelUpCelebration({ isVisible, onClose, onViewRecommendations, level }: LevelUpCelebrationProps) {
  const [show, setShow] = useState(isVisible)

  useEffect(() => {
    setShow(isVisible)
  }, [isVisible])

  const handleClose = () => {
    setShow(false)
    onClose()
  }

  const handleViewRecommendations = () => {
    setShow(false)
    onViewRecommendations()
  }

  if (!show) return null

  const message = `Level ${level}! Your personalized book recommendations await! 📚`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
      <Card className="w-[90%] max-w-md bg-purple-900 text-white shadow-lg relative animate-scale-in">
        <button onClick={handleClose} className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors">
          <X className="h-6 w-6" />
        </button>
        <CardHeader className="text-center">
          <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4 animate-bounce-in" />
          <CardTitle className="text-3xl font-extrabold tracking-tight">
            Congratulations!
          </CardTitle>
          <p className="text-lg text-white/90 mt-2">You've leveled up!</p>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <BookOpen className="h-8 w-8 text-yellow-300 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">{message}</h3>
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
