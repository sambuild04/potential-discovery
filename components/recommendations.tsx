"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface RecommendationsProps {
  userId: string
  contentCount: number
}

interface Recommendation {
  id: string
  title: string
  description: string
  reason: string
  link: string
  type: "article" | "book" | "video" | "activity"
}

export default function Recommendations({ userId, contentCount }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // First check if we have existing recommendations
        const { data: existingRecs, error: fetchError } = await supabase
          .from("recommendations")
          .select("*")
          .eq("user_id", userId)

        if (fetchError) throw fetchError

        if (existingRecs && existingRecs.length > 0) {
          setRecommendations(existingRecs)
          setLoading(false)
          return
        }

        // If no existing recommendations, generate new ones
        const response = await fetch("/api/recommendations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        })

        if (!response.ok) {
          throw new Error("Failed to generate recommendations")
        }

        const { recommendation } = await response.json()
        setRecommendations([recommendation])
      } catch (error: any) {
        console.error("Error fetching recommendations:", error)
        setError("Failed to load recommendations. Please try again later.")
        toast({
          title: "Error",
          description: "Failed to load recommendations. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [userId, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Analyzing your content...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="max-w-xl mx-auto mt-8">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-8">No book recommendation available yet. Try creating more posts or refreshing the page.</div>
    )
  }

  if (contentCount < 10) {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle>Keep adding content</AlertTitle>
        <AlertDescription>
          Upload at least {10 - contentCount} more items to unlock personalized book recommendations that can help make
          your life more meaningful.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-blue-600">Your Personalized Book Recommendation</h2>
        <p className="text-gray-500 mt-2">
          Based on your journey, we've found a book that might help make your life more meaningful
        </p>
      </div>

      {recommendations.map((rec) => (
        <Card key={rec.id} className="overflow-hidden border-l-4 border-l-blue-500 max-w-2xl mx-auto">
          <CardHeader className="pb-2">
            <div className="text-xs font-medium text-blue-600 uppercase tracking-wider">{rec.type}</div>
            <CardTitle className="text-xl">{rec.title}</CardTitle>
            <CardDescription>{rec.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-3 rounded-md mb-4">
              <h4 className="font-medium text-blue-700 mb-1">Why we recommend this:</h4>
              <p className="text-sm text-gray-700">{rec.reason}</p>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => window.open(rec.link, "_blank")}>
              Explore This Book
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
