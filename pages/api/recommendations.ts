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

  const { userId } = req.body;
  if (!userId) {
    console.warn('[API] userId is required');
    return res.status(400).json({ error: 'userId is required' });
  }

  console.log(`[API] /api/recommendations called with userId: ${userId}`);

  try {
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

    const prompt = `Based on the following user posts, suggest a single book recommendation (title and author only) that would be meaningful to them. Focus on the themes, interests, or topics expressed in their posts.

User posts:
${JSON.stringify(userPosts, null, 2)}

Provide the recommendation in JSON format like this:
{ "title": "Book Title", "author": "Book Author", "reason": "Why this book is recommended based on their posts." }
`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // You can choose a different model like "gpt-4" if preferred
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
      });

      const recommendationText = completion.choices[0].message.content;
      let recommendation;
      try {
        recommendation = JSON.parse(recommendationText!);
      } catch (parseError) {
        console.error('[API] Error parsing OpenAI response:', parseError);
        // Fallback if OpenAI doesn't return valid JSON
        recommendation = { title: "Generic Book", author: "AI Assistant", reason: "Could not parse recommendation." };
      }

      console.log('[API] Generated recommendation:', recommendation);
      return res.status(200).json({ recommendation });
    } catch (openaiError) {
      console.error('[API] Error calling OpenAI API:', openaiError);
      return res.status(500).json({ error: 'Failed to generate recommendation', details: openaiError });
    }
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 