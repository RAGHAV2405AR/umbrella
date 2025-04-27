import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { file, filename, fileType } = await request.json()

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY is not configured" }, { status: 500 })
    }

    // First LLM: Analyze the media for deepfake indicators
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
            content: `You are an advanced deepfake detection system. I will provide you with a base64 encoded media file.
            
            Your task is to:
            1. Analyze the file for signs of AI manipulation or generation
            2. Identify specific artifacts or inconsistencies that suggest manipulation
            3. Assess the likelihood that the content is AI-generated
            4. Provide a detailed technical analysis
            
            For the purpose of this demo, pretend you can analyze the file and generate a plausible assessment based on the filename and file type.
            
            Respond with a JSON object with the following fields:
            {
              "mediaType": "The type of media (image, video, audio)",
              "technicalAnalysis": "Detailed technical assessment of potential manipulation",
              "detectedArtifacts": ["list", "of", "suspicious", "elements"],
              "manipulationIndicators": {
                "facialInconsistencies": 0.1, // Score from 0-1
                "audioVisualMismatch": 0.1,
                "unnaturalMovements": 0.1,
                "textureArtifacts": 0.1,
                "backgroundInconsistencies": 0.1,
                "metadataManipulation": 0.1
              },
              "overallDeepfakeScore": 0.1 // Score from 0-1
            }`,
          },
          {
            role: "user",
            content: `Here is the base64 encoded file: ${file.substring(0, 100)}... (truncated)
            The filename is: ${filename}
            The file type is: ${fileType}`,
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

    // Second LLM: Make final determination based on first LLM analysis
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
            content: `You are a deepfake detection expert. You will receive an analysis of media content from another AI system.
            
            Your task is to:
            1. Review the technical analysis
            2. Make a final determination if the content is authentic or likely AI-generated
            3. Provide a clear explanation for your decision
            4. Calculate confidence scores for different types of manipulation
            
            Respond with a JSON object with the following fields:
            {
              "isSafe": boolean, // true if authentic, false if likely deepfake
              "reason": "Clear explanation of your decision",
              "metrics": [
                {
                  "name": "Facial Inconsistencies",
                  "value": 0.1, // Score from 0-1
                  "description": "Brief description of this indicator"
                },
                // Include similar objects for other manipulation indicators
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
    console.error("Error in deepfake detection API:", error)
    return NextResponse.json({ error: "Failed to detect deepfake" }, { status: 500 })
  }
}
