import { supabase } from "./supabase"

export async function setupDatabase() {
  try {
    console.log("Checking database setup...")

    // Check if the contents table exists by attempting to select from it
    const { error: checkError } = await supabase.from("contents").select("id").limit(1)

    if (checkError) {
      console.log("Contents table check result:", checkError.message)

      // If it's a relation does not exist error, the table needs to be created
      if (checkError.message.includes("relation") && checkError.message.includes("does not exist")) {
        console.log("Contents table does not exist. Please run the setup SQL script in your Supabase dashboard.")
      }
    } else {
      console.log("Contents table exists and is accessible")
    }

    // Check if storage bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error("Failed to list storage buckets:", bucketsError)
      return {
        success: false,
        error: bucketsError,
        message: "Could not access storage. Please check your Supabase configuration.",
      }
    }

    const userContentBucket = buckets?.find((bucket) => bucket.name === "user-content")

    if (!userContentBucket) {
      console.log("Storage bucket 'user-content' not found. Attempting to create...")

      // Try to create storage bucket
      const { error: createBucketError } = await supabase.storage.createBucket("user-content", {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
          "video/mp4",
          "video/webm",
          "video/quicktime",
        ],
      })

      if (createBucketError) {
        console.error("Failed to create storage bucket:", createBucketError)

        // Check if it's an RLS policy error
        if (createBucketError.message.includes("row-level security policy")) {
          console.log(
            "Storage bucket creation failed due to RLS policy. This is normal - the bucket should be created by an admin.",
          )
          return {
            success: false,
            error: createBucketError,
            message:
              "Storage bucket needs to be created by an administrator. Please run the setup SQL script in your Supabase dashboard.",
          }
        }

        return {
          success: false,
          error: createBucketError,
          message: `Failed to create storage bucket: ${createBucketError.message}`,
        }
      }

      console.log("Storage bucket created successfully")
    } else {
      console.log("Storage bucket already exists")
    }

    return { success: true }
  } catch (error) {
    console.error("Database setup error:", error)
    return {
      success: false,
      error,
      message: error instanceof Error ? error.message : "Unknown setup error",
    }
  }
}

// Alternative function to check if the app can function without full setup
export async function checkAppReadiness() {
  try {
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { ready: false, reason: "User not authenticated" }
    }

    // Check if we can access the contents table
    const { error: tableError } = await supabase.from("contents").select("id").eq("user_id", user.id).limit(1)

    if (tableError) {
      return {
        ready: false,
        reason: "Contents table not accessible",
        needsSetup: true,
      }
    }

    // Check if storage bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const userContentBucket = buckets?.find((bucket) => bucket.name === "user-content")

    if (!userContentBucket) {
      return {
        ready: false,
        reason: "Storage bucket not found",
        needsSetup: true,
      }
    }

    return { ready: true }
  } catch (error) {
    return {
      ready: false,
      reason: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
