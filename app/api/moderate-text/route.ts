import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY is not configured" }, { status: 500 })
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: `You are a content moderation system. Analyze the following text and determine if it contains harmful, offensive, illegal, or inappropriate content. 
            
            Respond with a JSON object with the following fields:
            1. "isSafe": boolean (true if the content is safe, false if it's potentially harmful)
            2. "reason": string (brief explanation of why the content is flagged or why it's safe)
            3. "metrics": array of objects with the following structure:
               {
                 "name": string (name of the category),
                 "value": number (score from 0 to 1, where 0 is safe and 1 is harmful),
                 "description": string (brief explanation of this category's presence)
               }
            
            Include the following categories in your metrics:
            - Hate Speech
            - Violence/Threats
            - Sexual Content
            - Self-Harm
            - Illegal Activities
            - Harassment/Bullying
            
            Be thorough but fair in your assessment.`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(JSON.stringify(error))
    }

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)

    // Add raw analysis for transparency
    result.rawAnalysis = JSON.stringify(result, null, 2)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in text moderation API:", error)
    return NextResponse.json({ error: "Failed to moderate text" }, { status: 500 })
  }
}
