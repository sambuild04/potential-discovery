export {};

import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[API] Request method: ${req.method}`);
  console.log(`[API] Request body:`, req.body);

  if (req.method !== 'POST') {
    console.warn(`[API] Method not allowed: ${req.method}`);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, contentCount } = req.body;
  if (!userId) {
    console.warn('[API] userId is required');
    return res.status(400).json({ error: 'userId is required' });
  }

  console.log(`[API] /api/recommendations called with userId: ${userId}, contentCount: ${contentCount}`);

  try {
    // Determine the level milestone for caching
    const levelMilestone = Math.floor(contentCount / 10) * 10;
    if (levelMilestone < 10) { // Recommendations only start from level 10
      return res.status(200).json({ recommendations: [], message: "Reach Level 10 to unlock recommendations." });
    }

    // 1. Check if recommendations already exist for this user at this level milestone
    const { data: existingRecommendations, error: fetchError } = await supabase
      .from('user_recommendations')
      .select('recommendations')
      .eq('user_id', userId)
      .eq('content_count_at_generation', levelMilestone)
      .single();

    if (existingRecommendations) {
      console.log(`[API] Returning cached recommendations for userId: ${userId}, level: ${levelMilestone}`);
      return res.status(200).json({ recommendations: existingRecommendations.recommendations });
    }

    // 2. If not found, fetch user content and generate new recommendations
    const { data: userContent, error: contentError } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId);

    if (contentError) {
      console.error('[API] Error fetching user content:', contentError);
      return res.status(500).json({ error: 'Failed to fetch user content' });
    }

    if (!userContent || userContent.length === 0) {
      console.warn(`[API] No content found for user: ${userId}`);
      return res.status(200).json({ recommendation: null, message: "No content found for user." });
    }

    // Extract relevant information from user content to build the prompt for OpenAI
    const userPosts = userContent.map(post => ({
      title: post.title,
      content: post.content,
      // Add other relevant fields from your 'posts' table if desired
    }));

    let numRecommendations = 1;
    if (contentCount >= 20 && contentCount < 30) {
      numRecommendations = 2;
    } else if (contentCount >= 30) {
      numRecommendations = 3;
    }

    let progressMessage = ``;
    if (contentCount !== undefined) {
      if (contentCount < 10) {
        progressMessage = `The user is still building their content base (${contentCount} posts). Provide a foundational recommendation.`;
      } else if (contentCount >= 10 && contentCount < 20) {
        progressMessage = `The user has reached Level 10 and has ${contentCount} posts. Provide an insightful recommendation.`;
      } else if (contentCount >= 20 && contentCount < 30) {
        progressMessage = `The user is at Level 20+ with ${contentCount} posts. Provide diverse and insightful recommendations.`;
      } else if (contentCount >= 30) {
        progressMessage = `The user is at Level 30+ with ${contentCount} posts. Provide comprehensive and unique recommendations.`;
      }
    }

    const prompt = `Based on a deep analysis of the following user posts, suggest ${numRecommendations} book recommendations (title, author, a brief description, and a reason for recommendation). The reason MUST be highly specific and directly linked to the themes, keywords, and specific details found within the provided user posts, not generic concepts. ${progressMessage}

User posts:
${JSON.stringify(userPosts, null, 2)}

Provide the recommendations as a JSON array of objects, like this:
[
  { "title": "Book Title 1", "author": "Book Author 1", "description": "A brief summary of book 1.", "reason": "Why this book is recommended based on their posts.", "type": "book" },
  { "title": "Book Title 2", "author": "Book Author 2", "description": "A brief summary of book 2.", "reason": "Why this book is recommended based on their posts.", "type": "book" }
]
`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 500,
      });

      const recommendationText = completion.choices[0].message.content;
      let recommendations: any[] = [];

      try {
        const parsed = JSON.parse(recommendationText!);
        // Ensure parsed is an array, even if OpenAI returns a single object
        const rawRecommendations = Array.isArray(parsed) ? parsed : [parsed];

        recommendations = rawRecommendations.map(rec => ({
          id: rec.id || Math.random().toString(36).substring(2, 15), // Generate a simple ID if not provided
          title: rec.title || "Untitled Book",
          author: rec.author || "Unknown Author",
          description: rec.description || "No description provided.",
          reason: rec.reason || "Based on your journey.",
          type: rec.type || "book",
        }));
      } catch (parseError) {
        console.error('[API] Error parsing OpenAI response:', parseError);
        // Fallback if OpenAI doesn't return valid JSON or missing fields
        recommendations = [{ id: "fallback", title: "Generic Book", author: "AI Assistant", description: "Could not generate a specific recommendation.", reason: "An issue occurred while processing your request.", type: "book" }];
      }

      // 3. Store the newly generated recommendations in the database
      const { error: insertError } = await supabase
        .from('user_recommendations')
        .insert({
          user_id: userId,
          content_count_at_generation: levelMilestone,
          recommendations: recommendations, // Store the array of recommendations
        });

      if (insertError) {
        console.error('[API] Error storing recommendations:', insertError);
        // Continue to return recommendations even if storage fails
      }

      console.log('[API] Generated recommendations:', recommendations);
      return res.status(200).json({ recommendations });
    } catch (openaiError) {
      console.error('[API] Error calling OpenAI API:', openaiError);
      return res.status(500).json({ error: 'Failed to generate recommendation', details: openaiError });
    }
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 