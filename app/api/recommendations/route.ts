import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import OpenAI from "openai"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    // Fetch user's content
    const { data: contents, error: contentError } = await supabase
      .from("contents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (contentError) throw contentError

    if (!contents || contents.length === 0) {
      return NextResponse.json({ error: "No content found" }, { status: 404 })
    }

    // Prepare content for AI analysis
    const contentText = contents
      .map((content) => {
        if (content.type === "diary") {
          return `Diary Entry: ${content.title}\n${content.url}`
        } else {
          return `${content.type}: ${content.title}\n${content.description || ""}`
        }
      })
      .join("\n\n")

    // Generate recommendations using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a book recommendation expert. Analyze the user's content and recommend ONE book that would be most meaningful to them. 
          For the book, provide:
          1. Title
          2. Brief description
          3. Specific reason why this book would be meaningful to the user, based on their content
          4. A link to find the book (use a placeholder URL for now)
          
          Format the response as a JSON object with these fields:
          {
            "title": string,
            "description": string,
            "reason": string,
            "link": string,
            "type": "book"
          }`,
        },
        {
          role: "user",
          content: `Here is the user's content to analyze:\n\n${contentText}`,
        },
      ],
      response_format: { type: "json_object" },
    })

    const content = completion.choices[0].message.content
    if (!content) throw new Error("No content received from OpenAI")
    const recommendation = JSON.parse(content)

    // Save recommendation to database
    const { error: insertError } = await supabase.from("recommendations").insert({
      user_id: userId,
      ...recommendation,
    })

    if (insertError) throw insertError

    return NextResponse.json({ recommendation })
  } catch (error: any) {
    console.error("Error generating recommendations:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 