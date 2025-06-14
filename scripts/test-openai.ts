import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function testOpenAI() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say hello!" },
      ],
      max_tokens: 20,
    })
    console.log("OpenAI API test successful! Response:")
    console.log(completion.choices[0].message.content)
  } catch (error) {
    console.error("OpenAI API test failed:", error)
  }
}

testOpenAI() 