export {};

import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  console.log(`[API] /api/recommendations called with userId: ${userId}`);

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

  // ... existing code for generating recommendation ...
  // For example:
  const recommendation = { title: "Sample Book", author: "Sample Author" };
  return res.status(200).json({ recommendation });
} 