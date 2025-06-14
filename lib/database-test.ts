import { supabase } from "./supabase"

export async function testDatabaseConnection() {
  try {
    console.log("Testing database connection...")

    // Test authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("Auth error:", authError)
      return { success: false, error: "Authentication failed" }
    }

    if (!user) {
      console.error("No user found")
      return { success: false, error: "User not authenticated" }
    }

    console.log("User authenticated:", user.id)

    // Test database connection by trying to select from contents table
    const { data, error } = await supabase.from("contents").select("count").eq("user_id", user.id).limit(1)

    if (error) {
      console.error("Database connection error:", error)
      return { success: false, error: error.message }
    }

    console.log("Database connection successful")
    return { success: true, user }
  } catch (err: any) {
    console.error("Connection test failed:", err)
    return { success: false, error: err.message }
  }
}

export async function testStorageConnection() {
  try {
    console.log("Testing storage connection...")

    // List buckets to test storage connection
    const { data, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error("Storage connection error:", error)
      return { success: false, error: error.message }
    }

    const userContentBucket = data.find((bucket) => bucket.name === "user-content")

    if (!userContentBucket) {
      console.error("user-content bucket not found")
      return { success: false, error: "Storage bucket not found" }
    }

    console.log("Storage connection successful")
    return { success: true, bucket: userContentBucket }
  } catch (err: any) {
    console.error("Storage test failed:", err)
    return { success: false, error: err.message }
  }
}
