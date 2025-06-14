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
    console.log('[API] /api/recommendations called with userId:', userId)

    // Fetch user's content
    const { data: contents, error: contentError } = await supabase
      .from("contents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (contentError) {
      console.error('[API] Supabase contentError:', contentError)
      throw contentError
    }

    if (!contents || contents.length === 0) {
      console.warn('[API] No content found for user:', userId)
      return NextResponse.json({ error: "No content found" }, { status: 404 })
    }

    console.log(`[API] Found ${contents.length} content items for user ${userId}`)

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
    let completion
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are a book recommendation expert. Analyze the user's content and recommend ONE book that would be most meaningful to them. \nFor the book, provide:\n1. Title\n2. Brief description\n3. Specific reason why this book would be meaningful to the user, based on their content\n4. A link to find the book (use a placeholder URL for now)\n\nFormat the response as a JSON object with these fields:\n{\n  "title": string,\n  "description": string,\n  "reason": string,\n  "link": string,\n  "type": "book"\n}`,
          },
          {
            role: "user",
            content: `Here is the user's content to analyze:\n\n${contentText}`,
          },
        ],
        response_format: { type: "json_object" },
      })
    } catch (openaiError) {
      console.error('[API] OpenAI error:', openaiError)
      throw openaiError
    }

    const content = completion.choices[0].message.content
    if (!content) {
      console.error('[API] No content received from OpenAI')
      throw new Error("No content received from OpenAI")
    }
    const recommendation = JSON.parse(content)

    // Save recommendation to database
    const { error: insertError } = await supabase.from("recommendations").insert({
      user_id: userId,
      ...recommendation,
    })

    if (insertError) {
      console.error('[API] Supabase insertError:', insertError)
      throw insertError
    }

    console.log('[API] Recommendation successfully generated and saved for user:', userId)
    return NextResponse.json({ recommendation })
  } catch (error: any) {
    console.error("[API] Error generating recommendations:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 