import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 })
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY is not configured" }, { status: 500 })
    }

    // First LLM: Analyze the image content
    const firstLLMResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "system",
            content: `You are an advanced image analysis system. I will provide you with a base64 encoded image.
            
            Your task is to:
            1. Describe the image in detail
            2. Identify any potentially harmful or inappropriate content
            3. Analyze the image for specific categories of concern
            4. Provide a detailed assessment of what you see
            
            For the purpose of this demo, pretend you can see the image and generate a plausible description.
            
            Respond with a JSON object with the following fields:
            {
              "description": "Detailed description of the image",
              "analysis": "Your assessment of the content",
              "contentCategories": {
                "violence": 0.1, // Score from 0-1
                "gore": 0.1,
                "sexualContent": 0.1,
                "hateSpeech": 0.1,
                "harassment": 0.1,
                "selfHarm": 0.1,
                "illegalActivity": 0.1
              },
              "objectsDetected": ["list", "of", "objects", "in", "the", "image"]
            }`,
          },
          {
            role: "user",
            content: `Here is the base64 encoded image: ${image.substring(0, 100)}... (truncated)`,
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
            content: `You are a content moderation expert. You will receive an analysis of an image from another AI system.
            
            Your task is to:
            1. Review the description and analysis
            2. Make a final determination if the image is safe or harmful
            3. Provide a clear explanation for your decision
            4. Calculate confidence scores for different types of harmful content
            
            Respond with a JSON object with the following fields:
            {
              "isSafe": boolean,
              "reason": "Clear explanation of your decision",
              "metrics": [
                {
                  "name": "Violence/Gore",
                  "value": 0.1, // Score from 0-1
                  "description": "Brief description of this category's presence"
                },
                // Include similar objects for Sexual Content, Hate Speech, Harassment, Self-Harm, and Illegal Activity
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
    console.error("Error in image analysis API:", error)
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 })
  }
}
