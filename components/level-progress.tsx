"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Star, Trophy, BookOpen } from "lucide-react"

interface LevelProgressProps {
  currentLevel: number
  onLevelUp?: (level: number) => void
}

const levelMessages = [
  { level: 1, message: "Great start! 🌟", color: "bg-green-500" },
  { level: 2, message: "Keep going! 💪", color: "bg-green-500" },
  { level: 3, message: "You're on fire! 🔥", color: "bg-orange-500" },
  { level: 4, message: "Awesome progress! ✨", color: "bg-blue-500" },
  { level: 5, message: "Halfway there! 🚀", color: "bg-purple-500" },
  { level: 6, message: "Fantastic! 🎉", color: "bg-pink-500" },
  { level: 7, message: "Almost there! 💎", color: "bg-indigo-500" },
  { level: 8, message: "So close! 🎯", color: "bg-red-500" },
  { level: 9, message: "One more to go! 🏆", color: "bg-yellow-500" },
  {
    level: 10,
    message: "🎊 LEVEL 10! Your first book recommendation awaits! 📚",
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
  },
]

const getEncouragementMessage = (level: number) => {
  const levelData = levelMessages.find((l) => l.level === level)
  if (levelData) return levelData

  if (level > 10) {
    return {
      level,
      message: `Level ${level}! You're a content master! 🌟`,
      color: "bg-gradient-to-r from-blue-500 to-purple-500",
    }
  }

  return { level: 0, message: "Start your journey! 🚀", color: "bg-gray-500" }
}

export default function LevelProgress({ currentLevel, onLevelUp }: LevelProgressProps) {
  const [displayLevel, setDisplayLevel] = useState(0)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (currentLevel > displayLevel) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setDisplayLevel(currentLevel)
        setShowLevelUp(true)
        onLevelUp?.(currentLevel)

        // Hide level up message after 3 seconds
        setTimeout(() => {
          setShowLevelUp(false)
          setIsAnimating(false)
        }, 3000)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [currentLevel, displayLevel, onLevelUp])

  const progressPercentage = Math.min((displayLevel / 10) * 100, 100)
  const encouragement = getEncouragementMessage(displayLevel)

  return (
    <div className="space-y-4">
      {/* Level Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {displayLevel >= 10 ? (
              <Trophy className="h-5 w-5 text-yellow-500" />
            ) : (
              <Star className="h-5 w-5 text-blue-500" />
            )}
            <span className="font-semibold text-lg">Level {displayLevel}</span>
          </div>
          {displayLevel >= 10 && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <BookOpen className="h-3 w-3 mr-1" />
              Book Master
            </Badge>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {displayLevel < 10 ? `${10 - displayLevel} more to unlock books!` : "Books unlocked! 🎉"}
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Progress to Book Recommendations</span>
              <span className="font-medium">{displayLevel}/10</span>
            </div>

            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${
                    displayLevel >= 10
                      ? "bg-gradient-to-r from-purple-500 to-pink-500"
                      : "bg-gradient-to-r from-blue-400 to-blue-600"
                  } ${isAnimating ? "animate-pulse" : ""}`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {/* Level markers */}
              <div className="absolute top-0 w-full h-3 flex justify-between items-center px-1">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-1 rounded-full ${
                      i < displayLevel ? "bg-white" : "bg-gray-400"
                    } transition-colors duration-300`}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Up Animation */}
      {showLevelUp && (
        <Card className={`${encouragement.color} text-white animate-in slide-in-from-bottom-4 duration-500`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {displayLevel >= 10 ? (
                  <div className="relative">
                    <Trophy className="h-8 w-8 text-yellow-300" />
                    <Sparkles className="h-4 w-4 text-yellow-300 absolute -top-1 -right-1 animate-spin" />
                  </div>
                ) : (
                  <div className="relative">
                    <Star className="h-8 w-8 text-yellow-300" />
                    <Sparkles className="h-3 w-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                )}
              </div>
              <div>
                <div className="font-bold text-lg">Level Up!</div>
                <div className="text-sm opacity-90">{encouragement.message}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Level Preview */}
      {displayLevel > 0 && displayLevel < 10 && (
        <div className="text-center text-sm text-gray-500">
          Next: {getEncouragementMessage(displayLevel + 1).message}
        </div>
      )}
    </div>
  )
}
