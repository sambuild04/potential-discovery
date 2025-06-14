"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import ModernUploadForm from "@/components/modern-upload-form"
import ContentGrid from "@/components/content-grid"
import Recommendations from "@/components/recommendations"
import LevelProgress from "@/components/level-progress"
import Level10Celebration from "@/components/level-10-celebration"
import { Plus } from "lucide-react"

type User = {
  id: string
  email: string
  user_metadata: {
    full_name: string
  }
}

type Content = {
  id: string
  title: string
  type: "image" | "video" | "diary"
  url: string
  description?: string
  created_at: string
}

// Mock user data
const mockUser: User = {
  id: "mock-user-123",
  email: "demo@example.com",
  user_metadata: {
    full_name: "Demo User",
  },
}

// Mock initial content to show some existing posts
const initialMockContent: Content[] = [
  {
    id: "1",
    title: "My Morning Reflection",
    type: "diary",
    url: "Today I woke up feeling grateful for the small moments in life. There's something beautiful about the quiet morning hours when the world is still waking up. I've been thinking about how we often rush through our days without taking time to appreciate what we have.",
    description: "",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    title: "Sunset at the Beach",
    type: "image",
    url: "/placeholder.svg?height=400&width=600",
    description: "Captured this amazing sunset during my evening walk. The colors were absolutely breathtaking.",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    title: "Thoughts on Personal Growth",
    type: "diary",
    url: "I've been reading about mindfulness and how it can transform our daily experience. It's fascinating how simply paying attention to the present moment can shift our entire perspective. I want to practice being more present in my conversations and daily activities.",
    description: "",
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
]

export default function Dashboard() {
  const [user] = useState<User>(mockUser)
  const [loading, setLoading] = useState(true)
  const [contents, setContents] = useState<Content[]>(initialMockContent)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [activeTab, setActiveTab] = useState("content")
  const [showLevel10Celebration, setShowLevel10Celebration] = useState(false)
  const [previousLevel, setPreviousLevel] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleSignOut = async () => {
    router.push("/")
  }

  const handleLevelUp = (newLevel: number) => {
    if (newLevel === 10 && previousLevel < 10) {
      setShowLevel10Celebration(true)
    }
    setPreviousLevel(newLevel)
  }

  const handleViewRecommendations = () => {
    setShowLevel10Celebration(false)
    setActiveTab("discover")
  }

  const handleCreatePost = () => {
    setShowUploadForm(true)
  }

  const handleCloseUploadForm = () => {
    setShowUploadForm(false)
  }

  const handleUploadSuccess = (newContent: Content) => {
    setContents((prev) => [newContent, ...prev])
    toast({
      title: "Post created!",
      description: "Your content has been added to your collection.",
    })
  }

  const handleDeleteContent = (id: string) => {
    setContents((prev) => prev.filter((content) => content.id !== id))
    toast({
      title: "Content deleted",
      description: "The content has been removed from your collection.",
    })
  }

  const currentLevel = contents.length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.user_metadata?.full_name}</h1>
            <p className="text-gray-500">Share your journey and unlock personalized recommendations</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreatePost}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Post
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mb-8">
          <LevelProgress currentLevel={currentLevel} onLevelUp={handleLevelUp} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="content">My Posts ({contents.length})</TabsTrigger>
            <TabsTrigger value="discover" disabled={currentLevel < 10}>
              Book Recommendations
              {currentLevel >= 10 && <span className="ml-2 h-2 w-2 bg-purple-500 rounded-full animate-pulse"></span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-6">
            {contents.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">Start Your Journey!</h3>
                  <p className="text-gray-500 mb-4">
                    Create your first post to begin leveling up and unlock personalized book recommendations.
                  </p>
                  <button
                    onClick={handleCreatePost}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Create Your First Post
                  </button>
                </CardContent>
              </Card>
            ) : (
              <ContentGrid contents={contents} onUpdate={() => {}} onDelete={handleDeleteContent} />
            )}
          </TabsContent>

          <TabsContent value="discover" className="mt-6">
            {currentLevel >= 10 ? (
              <Recommendations userId={user.id} contentCount={contents.length} />
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">Almost There!</h3>
                  <p className="text-gray-500 mb-4">
                    Reach Level 10 by creating {10 - currentLevel} more posts to unlock your personalized book
                    recommendations.
                  </p>
                  <button
                    onClick={handleCreatePost}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Continue Your Journey
                  </button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {showUploadForm && user && (
        <ModernUploadForm userId={user.id} onSuccess={handleUploadSuccess} onClose={handleCloseUploadForm} />
      )}

      <Level10Celebration
        isVisible={showLevel10Celebration}
        onClose={() => setShowLevel10Celebration(false)}
        onViewRecommendations={handleViewRecommendations}
      />
    </>
  )
}
