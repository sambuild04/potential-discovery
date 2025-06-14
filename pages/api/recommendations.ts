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
    const currentLevelMilestone = Math.floor(contentCount / 10) * 10;
    if (currentLevelMilestone < 10) {
      console.warn(`[API] User ${userId} needs to reach Level 10. Current content count: ${contentCount}`);
      return res.status(200).json({ recommendations: [], message: "Reach Level 10 to unlock recommendations." });
    }

    // Fetch existing recommendations for all previous milestones for this user
    const { data: allUserRecommendations, error: fetchAllError } = await supabase
      .from('user_recommendations')
      .select('recommendations')
      .eq('user_id', userId)
      .lte('content_count_at_generation', currentLevelMilestone);

    if (fetchAllError) {
      console.error('[API] Error fetching all user recommendations:', fetchAllError);
      // Continue process, but log error
    }

    let existingUniqueRecommendations: any[] = [];
    if (allUserRecommendations) {
      const uniqueRecIds = new Set<string>();
      allUserRecommendations.forEach(record => {
        if (record.recommendations) {
          record.recommendations.forEach((rec: any) => {
            if (rec.id && !uniqueRecIds.has(rec.id)) {
              existingUniqueRecommendations.push(rec);
              uniqueRecIds.add(rec.id);
            }
          });
        }
      });
    }

    // Determine how many recommendations we *should* have at this milestone
    const targetNumRecommendations = Math.floor(currentLevelMilestone / 10); // 1 book for Level 10, 2 for 20, etc.

    // Check if we already have enough (or more) unique recommendations for this milestone
    if (existingUniqueRecommendations.length >= targetNumRecommendations) {
      // Sort recommendations by some consistent criteria if needed, or just return the first targetNumRecommendations
      const recommendationsToReturn = existingUniqueRecommendations.slice(0, targetNumRecommendations);
      console.log(`[API] Returning cached and sufficient recommendations for userId: ${userId}, level: ${currentLevelMilestone}`);
      return res.status(200).json({ recommendations: recommendationsToReturn });
    }

    // Calculate how many *new* recommendations are needed
    const numRecommendationsToGenerate = targetNumRecommendations - existingUniqueRecommendations.length;
    let newlyGeneratedRecommendations: any[] = [];

    if (numRecommendationsToGenerate > 0) {
      const { data: userContent, error: contentError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId);

      if (contentError) {
        console.error('[API] Error fetching user content for new generation:', contentError);
        return res.status(500).json({ error: 'Failed to fetch user content for recommendation generation' });
      }

      if (!userContent || userContent.length === 0) {
        console.warn(`[API] No content found for user: ${userId} to generate new recommendations.`);
        // If no content, cannot generate new, but might have existing to return
        if (existingUniqueRecommendations.length > 0) {
          return res.status(200).json({ recommendations: existingUniqueRecommendations.slice(0, targetNumRecommendations) });
        } else {
          return res.status(200).json({ recommendations: [], message: "No content found for user to generate recommendations." });
        }
      }

      const userPosts = userContent.map(post => ({
        title: post.title,
        content: post.content,
      }));

      let progressMessage = `The user has created ${contentCount} posts and is at level ${currentLevelMilestone}.`;
      if (currentLevelMilestone >= 10 && currentLevelMilestone < 20) {
        progressMessage += ` This is their first set of recommendations.`;
      } else if (currentLevelMilestone >= 20 && currentLevelMilestone < 30) {
        progressMessage += ` They are now eligible for additional recommendations. Ensure these are diverse from previous ones.`;
      } else if (currentLevelMilestone >= 30) {
        progressMessage += ` They are now eligible for even more recommendations. Ensure these are highly unique and insightful.`;
      }

      // Instruct OpenAI to generate NEW and DISTINCT books
      const prompt = `Based on a deep and thorough analysis of the following user posts, suggest ${numRecommendationsToGenerate} *new and distinct* book recommendations (title, author, a brief description, and a reason for recommendation). The reason MUST be highly specific, directly linked to the explicit themes, keywords, and significant details found within the provided user posts. **Crucially, the recommendation and its reason MUST directly align with the primary stated interests and goals in the user's posts, such as financial success or wealth building, if those themes are dominant.** Avoid generic concepts or broad personal development unless explicitly and strongly supported by the user's content.

${existingUniqueRecommendations.length > 0 ? `Already recommended books (DO NOT recommend these again):
${JSON.stringify(existingUniqueRecommendations.map(r => r.title), null, 2)}

` : ''}
User posts:
${JSON.stringify(userPosts, null, 2)}

${progressMessage}

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
          max_tokens: 700, // Increased max_tokens to accommodate more detailed responses and multiple recommendations
        });

        const recommendationText = completion.choices[0].message.content;
        let parsedRecommendations: any[] = [];
        try {
          const parsed = JSON.parse(recommendationText!); // Expecting an array now
          parsedRecommendations = Array.isArray(parsed) ? parsed : [parsed]; // Ensure it's an array

          // Filter out recommendations that have the same title as existing unique ones
          const newUniqueRecs = parsedRecommendations.filter(rec => 
            !existingUniqueRecommendations.some(eRec => 
              eRec.title && rec.title && eRec.title.toLowerCase() === rec.title.toLowerCase()
            )
          );
          
          newlyGeneratedRecommendations = newUniqueRecs.map(rec => ({
            id: rec.id || Math.random().toString(36).substring(2, 15), // Generate ID if missing
            title: rec.title || "Untitled Book",
            author: rec.author || "Unknown Author",
            description: rec.description || "No description provided.",
            reason: rec.reason || "Based on your journey.",
            type: rec.type || "book",
          }));
        } catch (parseError) {
          console.error('[API] Error parsing OpenAI response:', parseError);
          newlyGeneratedRecommendations = [{ id: "fallback-gen", title: "Generic New Book", author: "AI Assistant", description: "Could not generate a specific new recommendation.", reason: "An issue occurred during new recommendation generation.", type: "book" }];
        }
      } catch (openaiError) {
        console.error('[API] Error calling OpenAI API for new generation:', openaiError);
        // If OpenAI call fails for new generation, still return existing if any
        if (existingUniqueRecommendations.length > 0) {
          return res.status(200).json({ recommendations: existingUniqueRecommendations.slice(0, targetNumRecommendations) });
        } else {
          return res.status(500).json({ error: 'Failed to generate new recommendations', details: openaiError });
        }
      }
    }

    // Combine existing unique recommendations with newly generated ones
    let finalRecommendations = [...existingUniqueRecommendations, ...newlyGeneratedRecommendations];

    // Ensure uniqueness of the combined list (in case newly generated overlaps with existing due to AI behavior)
    const finalUniqueRecs: any[] = [];
    const finalUniqueRecTitles = new Set<string>();
    finalRecommendations.forEach(rec => {
      if (rec.title && !finalUniqueRecTitles.has(rec.title.toLowerCase())) {
        finalUniqueRecs.push(rec);
        finalUniqueRecTitles.add(rec.title.toLowerCase());
      }
    });

    // Trim to target number if more were generated than needed (e.g., if AI returned too many)
    finalRecommendations = finalUniqueRecs.slice(0, targetNumRecommendations);

    // Store/update the final set of recommendations for this milestone
    const { error: upsertError } = await supabase
      .from('user_recommendations')
      .upsert(
        {
          user_id: userId,
          content_count_at_generation: currentLevelMilestone,
          recommendations: finalRecommendations,
        },
        { onConflict: 'user_id,content_count_at_generation' } // Specify the unique constraint for upsert
      );

    if (upsertError) {
      console.error('[API] Error upserting recommendations:', upsertError);
      // Continue to return recommendations even if storage fails
    }

    console.log('[API] Final recommendations to return:', finalRecommendations);
    return res.status(200).json({ recommendations: finalRecommendations });
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 