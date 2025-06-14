import { supabase } from "@/lib/supabase"

async function setupSupabase() {
  console.log("Setting up Supabase storage and tables...")

  try {
    // Create storage bucket if it doesn't exist
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      throw bucketsError
    }

    const userContentBucket = buckets.find((bucket) => bucket.name === "user-content")

    if (!userContentBucket) {
      console.log("Creating user-content storage bucket...")
      const { error: createBucketError } = await supabase.storage.createBucket("user-content", {
        public: true,
        fileSizeLimit: 5242880, // 5MB in bytes
      })

      if (createBucketError) {
        throw createBucketError
      }

      console.log("Storage bucket created successfully")
    } else {
      console.log("Storage bucket already exists")
    }

    // Create contents table if it doesn't exist
    console.log("Setting up database tables...")
    const { error: createTableError } = await supabase.rpc("create_contents_table_if_not_exists")

    if (createTableError) {
      // If the RPC doesn't exist, create the table directly
      const { error: directCreateError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS contents (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          type TEXT NOT NULL,
          url TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
        );
      `)

      if (directCreateError) {
        throw directCreateError
      }
    }

    console.log("Database tables set up successfully")
    console.log("Supabase setup completed successfully!")
  } catch (error) {
    console.error("Error setting up Supabase:", error)
  }
}

setupSupabase()
