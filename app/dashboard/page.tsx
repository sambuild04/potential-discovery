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
import LevelUpCelebration from "@/components/level-up-celebration"
import { Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"

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

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [contents, setContents] = useState<Content[]>([])
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [activeTab, setActiveTab] = useState("content")
  const [showLevelUpCelebration, setShowLevelUpCelebration] = useState(false)
  const [lastCelebratedLevel, setLastCelebratedLevel] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserAndContent = async () => {
      setLoading(true)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setUser(null)
        setLoading(false)
        return
      }
      setUser(user as any)

      // Fetch last celebrated level from database
      const { data: userProgress, error: progressError } = await supabase
        .from('user_progress')
        .select('last_celebrated_level')
        .eq('user_id', user.id)
        .single();

      if (progressError && progressError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error("Error fetching user progress:", progressError);
      } else if (userProgress) {
        setLastCelebratedLevel(userProgress.last_celebrated_level);
      }

      // Fetch posts for this user
      const { data: posts, error: postsError } = await supabase
        .from("contents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      if (postsError) {
        setContents([])
      } else {
        setContents(posts || [])
      }
      setLoading(false)
    }
    fetchUserAndContent()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleLevelUp = async (newLevel: number) => {
    // Trigger celebration at every 10-level milestone (10, 20, 30, ...)
    const newMilestoneReached = newLevel % 10 === 0 && newLevel >= 10; // Check if it's a milestone
    const hasNotBeenCelebratedBefore = newLevel > lastCelebratedLevel; // Check if it's a new, uncelebrated milestone

    if (newMilestoneReached && hasNotBeenCelebratedBefore && user) { // Ensure user exists for database update
      setShowLevelUpCelebration(true);

      // Persist the celebrated level to database
      const { error: upsertError } = await supabase
        .from('user_progress')
        .upsert(
          { user_id: user.id, last_celebrated_level: newLevel },
          { onConflict: 'user_id', ignoreDuplicates: false } // Use onConflict to update if exists
        );

      if (upsertError) {
        console.error("Error upserting user progress:", upsertError);
        toast({
          title: "Error",
          description: "Failed to save celebration status.",
          variant: "destructive",
        });
      } else {
        setLastCelebratedLevel(newLevel); // Update state only on successful DB write
      }
    }
  }

  const handleViewRecommendations = () => {
    setShowLevelUpCelebration(false)
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

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <h2 className="text-2xl font-bold mb-4">Please sign in to access your dashboard</h2>
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
        >
          Sign In
        </button>
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

      <LevelUpCelebration
        isVisible={showLevelUpCelebration}
        onClose={() => setShowLevelUpCelebration(false)}
        onViewRecommendations={handleViewRecommendations}
        level={currentLevel}
      />
    </>
  )
}
