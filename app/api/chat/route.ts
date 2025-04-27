import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY is not configured" }, { status: 500 })
    }

    // System prompt specifically focused on the Umbrella moderation project
    const systemPrompt = `You are the Umbrella Assistant, an AI specifically designed to help with content moderation tasks.

Your primary purpose is to assist users with the Umbrella Moderation Dashboard, which offers the following tools:

1. Text Moderation - Analyzes text for harmful content like hate speech, violence, sexual content, etc.
2. Image Analysis - Examines images for inappropriate or harmful visual content
3. Voice Analysis - Transcribes and analyzes audio for concerning speech or content
4. Deepfake Detection - Identifies potentially AI-generated or manipulated media

You should:
- Provide helpful information about content moderation best practices
- Explain how the different tools in the Umbrella dashboard work
- Guide users on which tool to use for specific moderation needs
- Explain the two-LLM pipeline approach used for more accurate analysis
- Help interpret moderation results and metrics
- Suggest appropriate actions based on moderation findings

You should NOT:
- Provide advice on how to bypass content moderation systems
- Help users create harmful content
- Discuss topics unrelated to content moderation or the Umbrella platform

Always maintain a professional, helpful tone focused on content safety and moderation.`

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(JSON.stringify(error))
    }

    const data = await response.json()
    const message = data.choices[0].message.content

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}
