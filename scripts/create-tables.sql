-- Create contents table
CREATE TABLE IF NOT EXISTS public.contents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('image', 'video', 'diary')),
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only access their own content
CREATE POLICY "Users can view their own content" ON public.contents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content" ON public.contents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content" ON public.contents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content" ON public.contents
    FOR DELETE USING (auth.uid() = user_id);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    reason TEXT,
    link TEXT,
    type TEXT NOT NULL CHECK (type IN ('article', 'book', 'video', 'activity')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for recommendations
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- Create policy for recommendations
CREATE POLICY "Users can view their own recommendations" ON public.recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recommendations" ON public.recommendations
    FOR INSERT WITH CHECK (auth.uid() = user_id);
