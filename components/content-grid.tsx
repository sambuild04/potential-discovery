"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"

interface Content {
  id: string
  title: string
  type: "image" | "video" | "diary"
  url: string
  description?: string
  created_at: string
}

interface ContentGridProps {
  contents: Content[]
  onUpdate: () => void
  onDelete?: (id: string) => void
}

export default function ContentGrid({ contents, onUpdate, onDelete }: ContentGridProps) {
  const { toast } = useToast()
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const handleDelete = async (id: string) => {
    if (!onDelete) return

    // Update loading state for this item
    setLoadingStates((prev) => ({ ...prev, [id]: true }))

    try {
      // Simulate delete delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      onDelete(id)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: false }))
    }
  }

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }))
  }

  if (contents.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-700">No content yet</h3>
        <p className="text-gray-500 mt-2">
          Start by uploading images, videos, or diary entries to build your collection.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contents.map((content) => (
        <Card key={content.id} className="overflow-hidden">
          <CardHeader className="p-4">
            <CardTitle className="text-lg truncate">{content.title}</CardTitle>
            <div className="text-xs text-gray-500">{format(new Date(content.created_at), "MMM d, yyyy")}</div>
          </CardHeader>

          <CardContent className="p-4 pt-0">
            {content.type === "image" && (
              <div className="relative h-48 w-full overflow-hidden rounded-md bg-slate-100">
                <img
                  src={content.url}
                  alt={content.title}
                  className="object-cover w-full h-full"
                />
              </div>
            )}

            {content.type === "diary" && (
              <div className="h-48 overflow-hidden">
                <p className="text-gray-600 line-clamp-6">{content.url}</p>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-4 pt-0 flex justify-between">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setSelectedContent(content)}>
                  View
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{selectedContent?.title}</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  {selectedContent?.type === "image" && (
                    <div className="w-full h-[60vh] bg-slate-100 rounded-lg overflow-hidden">
                      <img
                        src={selectedContent.url}
                        alt={selectedContent.title}
                        className="object-contain w-full h-full"
                      />
                    </div>
                  )}

                  {selectedContent?.type === "diary" && (
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap">{selectedContent.url}</p>
                    </div>
                  )}

                  {selectedContent?.description && (
                    <div className="mt-4">
                      <h4 className="font-medium">Description</h4>
                      <p className="text-gray-600">{selectedContent.description}</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDelete(content.id)}
                disabled={loadingStates[content.id]}
              >
                {loadingStates[content.id] ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
