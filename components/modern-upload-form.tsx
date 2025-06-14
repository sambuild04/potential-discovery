"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { X, Eye, Bold, Italic, Link, List, ListOrdered, Type, ImageIcon, Video, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ModernUploadFormProps {
  userId: string
  onSuccess: (content: any) => void
  onClose: () => void
}

export default function ModernUploadForm({ userId, onSuccess, onClose }: ModernUploadFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [contentType, setContentType] = useState<"image" | "diary">("diary")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      // Check file size (limit to 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit. Please choose a smaller file.")
        setFile(null)
        e.target.value = ""
        return
      }

      setFile(selectedFile)
      setError(null)
    }
  }

  const handleContentTypeChange = (type: "image" | "diary") => {
    setContentType(type)
    setFile(null)
    setError(null)
  }

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onClose()
  }

  const validateForm = () => {
    if (!title.trim()) {
      setError("Please enter a title for your post.")
      return false
    }

    if (contentType === "diary" && !description.trim()) {
      setError("Please write some content for your diary entry.")
      return false
    }

    if ((contentType === "image") && !file) {
      setError(`Please select a ${contentType} file to upload.`)
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Create mock content
      let url = ""

      if (contentType === "diary") {
        url = description.trim()
      } else if (contentType === "image") {
        // Generate a placeholder image URL based on the title
        const query = encodeURIComponent(title.toLowerCase().replace(/\s+/g, "+"))
        url = `/placeholder.svg?height=400&width=600&query=${query}`
      } else if (contentType === "video") {
        // For video, we'll use a placeholder that represents a video
        url = `/placeholder.svg?height=300&width=500&query=video+placeholder+${encodeURIComponent(title)}`
      }

      const newContent = {
        id: Date.now().toString(),
        title: title.trim(),
        description: contentType === "diary" ? "" : description.trim(),
        type: contentType,
        url: url,
        created_at: new Date().toISOString(),
      }

      onSuccess(newContent)

      // Reset form
      setTitle("")
      setDescription("")
      setFile(null)
      setContentType("diary")

      onClose()
    } catch (err: any) {
      console.error("Upload error:", err)
      const errorMessage = err.message || "Upload failed. Please try again."
      setError(errorMessage)
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Create New Post</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <Alert className="bg-red-900/50 border-red-700 text-red-100 animate-in slide-in-from-top duration-300">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-100">{error}</AlertDescription>
            </Alert>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post's title here..."
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Content Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Content Type</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleContentTypeChange("diary")}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
                  contentType === "diary"
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Type className="h-4 w-4" />
                Text Entry
              </button>
              <button
                type="button"
                onClick={() => handleContentTypeChange("image")}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
                  contentType === "image"
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                Image
              </button>
              {/* Video option temporarily disabled
              <button
                type="button"
                onClick={() => handleContentTypeChange("video")}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
                  contentType === "video"
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Video className="h-4 w-4" />
                Video
              </button>
              */}
            </div>
          </div>

          {/* Content Area */}
          {contentType === "diary" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Content</label>
              <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center gap-1 p-3 border-b border-slate-700">
                  <button
                    type="button"
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  >
                    <Bold className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  >
                    <Italic className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  >
                    <Link className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </button>
                </div>

                {/* Text Area */}
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write something about your post..."
                  className="bg-transparent border-0 text-white placeholder:text-slate-500 min-h-[200px] resize-none focus:ring-0"
                  required
                />
              </div>
            </div>
          )}

          {/* File Upload for Image/Video */}
          {contentType === "image" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Upload Image
                  <span className="text-slate-500">(Mock - will generate placeholder)</span>
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="bg-slate-800 border-slate-700 text-white file:bg-slate-700 file:text-white file:border-0"
                  required
                />
                {file && (
                  <div className="text-xs text-slate-400">
                    Selected file: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Description (Optional)</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description for your content..."
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[100px]"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-md font-medium transition-colors relative"
            >
              {loading ? (
                <>
                  <span className="opacity-0">Publish Post</span>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                  </span>
                </>
              ) : (
                "Publish Post"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
