"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift, X, Sparkles } from "lucide-react"

interface GiftRecommendationTabProps {
  contentCount: number
  onRecommendationClick: () => void
}

export default function GiftRecommendationTab({ contentCount, onRecommendationClick }: GiftRecommendationTabProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Show the gift tab when user has 10+ uploads
    if (contentCount >= 10 && !isDismissed) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [contentCount, isDismissed])

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
  }

  const handleClick = () => {
    onRecommendationClick()
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 mt-4 animate-in slide-in-from-top-4 duration-500">
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl border-0 max-w-sm">
        <CardHeader className="pb-2 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="absolute -top-2 -right-2 h-6 w-6 text-white/70 hover:text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Gift className="h-6 w-6 text-yellow-300" />
              <Sparkles className="h-3 w-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <CardTitle className="text-lg">You've Got a Gift!</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-white/90 mb-3">
            🎉 Congratulations! You've uploaded {contentCount} items. Your personalized book recommendations are ready!
          </CardDescription>
          <Button onClick={handleClick} className="w-full bg-white text-blue-600 hover:bg-white/90 font-medium">
            <Gift className="h-4 w-4 mr-2" />
            Open Your Gift
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
