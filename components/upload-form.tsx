"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"

interface UploadFormProps {
  userId: string
  onSuccess: () => void
}

export default function UploadForm({ userId, onSuccess }: UploadFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [contentType, setContentType] = useState<"image" | "video" | "diary">("image")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let url = ""

      // For diary entries, we don't need to upload a file
      if (contentType === "diary") {
        url = description // Store the diary text directly
      } else if (file) {
        // Upload file to Supabase Storage
        const fileExt = file.name.split(".").pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `${userId}/${contentType}/${fileName}`

        const { error: uploadError, data } = await supabase.storage.from("user-content").upload(filePath, file)

        if (uploadError) throw uploadError

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("user-content").getPublicUrl(filePath)

        url = publicUrl
      } else {
        throw new Error("Please select a file to upload")
      }

      // Save content metadata to database
      const { error } = await supabase.from("contents").insert({
        user_id: userId,
        title,
        description,
        type: contentType,
        url,
      })

      if (error) throw error

      toast({
        title: "Upload successful!",
        description: "Your content has been added to your collection.",
      })

      // Reset form
      setTitle("")
      setDescription("")
      setFile(null)

      // Refresh content list
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your content a title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Content Type</Label>
        <RadioGroup
          value={contentType}
          onValueChange={(value) => setContentType(value as "image" | "video" | "diary")}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="image" id="image" />
            <Label htmlFor="image">Image</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="video" id="video" />
            <Label htmlFor="video">Video</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="diary" id="diary" />
            <Label htmlFor="diary">Diary Entry</Label>
          </div>
        </RadioGroup>
      </div>

      {contentType === "diary" ? (
        <div className="space-y-2">
          <Label htmlFor="diary-content">Diary Entry</Label>
          <Textarea
            id="diary-content"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write your thoughts, reflections, or experiences..."
            className="min-h-[200px]"
            required
          />
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your content"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Upload {contentType}</Label>
            <Input
              id="file"
              type="file"
              accept={contentType === "image" ? "image/*" : "video/*"}
              onChange={handleFileChange}
              required
            />
          </div>
        </>
      )}

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
        {loading ? "Uploading..." : "Upload Content"}
      </Button>
    </form>
  )
}
