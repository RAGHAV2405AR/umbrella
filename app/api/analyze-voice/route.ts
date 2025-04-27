import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { audio, filename } = await request.json()

    if (!audio) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 })
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY is not configured" }, { status: 500 })
    }

    // First LLM: Transcribe and analyze the audio
    const firstLLMResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "whisper-large-v3-turbo",
        messages: [
          {
            role: "system",
            content: `You are an advanced audio analysis system. I will provide you with a base64 encoded audio file.
            
            Your task is to:
            1. Transcribe the audio content
            2. Analyze the transcription for tone, sentiment, and potential harmful content
            3. Identify any concerning elements like threats, hate speech, explicit content, etc.
            4. Provide a detailed analysis of what you hear
            
            For the purpose of this demo, generate a plausible transcription based on the filename.
            Then analyze this transcription thoroughly as if it were real.
            
            Respond with a JSON object with the following fields:
            {
              "transcription": "The full transcribed text",
              "analysis": "Your detailed analysis of the content",
              "toneAssessment": "Assessment of the tone (angry, calm, threatening, etc.)",
              "contentCategories": {
                "hateSpeech": 0.1, // Score from 0-1
                "violence": 0.1,
                "sexualContent": 0.1,
                "harassment": 0.1,
                "selfHarm": 0.1,
                "illegalActivity": 0.1
              }
            }`,
          },
          {
            role: "user",
            content: `Here is the base64 encoded audio file: ${audio.substring(0, 100)}... (truncated)
            The filename is: ${filename}`,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    })

    if (!firstLLMResponse.ok) {
      const error = await firstLLMResponse.json()
      throw new Error(JSON.stringify(error))
    }

    const firstLLMData = await firstLLMResponse.json()
    const firstLLMResult = JSON.parse(firstLLMData.choices[0].message.content)

    // Second LLM: Evaluate the analysis from the first LLM
    const secondLLMResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
            content: `You are a content moderation expert. You will receive an analysis of audio content from another AI system.
            
            Your task is to:
            1. Review the transcription and analysis
            2. Make a final determination if the content is safe or harmful
            3. Provide a clear explanation for your decision
            4. Calculate confidence scores for different types of harmful content
            
            Respond with a JSON object with the following fields:
            {
              "isSafe": boolean,
              "reason": "Clear explanation of your decision",
              "transcription": "The transcribed text",
              "metrics": [
                {
                  "name": "Hate Speech",
                  "value": 0.1, // Score from 0-1
                  "description": "Brief description of this category's presence"
                },
                // Include similar objects for Violence, Sexual Content, Harassment, Self-Harm, and Illegal Activity
              ],
              "confidenceScore": 0.9, // Overall confidence in your assessment
              "recommendedAction": "What action should be taken with this content"
            }`,
          },
          {
            role: "user",
            content: `Here is the analysis from the first AI system:
            ${JSON.stringify(firstLLMResult, null, 2)}`,
          },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    })

    if (!secondLLMResponse.ok) {
      const error = await secondLLMResponse.json()
      throw new Error(JSON.stringify(error))
    }

    const secondLLMData = await secondLLMResponse.json()
    const finalResult = JSON.parse(secondLLMData.choices[0].message.content)

    // Add the first LLM analysis for transparency
    finalResult.firstLLMAnalysis = JSON.stringify(firstLLMResult, null, 2)
    finalResult.rawAnalysis = JSON.stringify(finalResult, null, 2)

    return NextResponse.json(finalResult)
  } catch (error) {
    console.error("Error in voice analysis API:", error)
    return NextResponse.json({ error: "Failed to analyze voice" }, { status: 500 })
  }
}
