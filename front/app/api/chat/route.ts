import { Configuration, OpenAIApi } from 'openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(config)

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const response = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      stream: true,
      messages: [
        {
          role: 'system',
          content: `You are a helpful English teacher for Japanese speakers. 
When a user asks for English phrases for a specific situation, provide exactly 3 natural English expressions with Japanese translations.
Format your response as follows:

1. [English sentence 1]
   [Japanese translation 1]

2. [English sentence 2]
   [Japanese translation 2]

3. [English sentence 3]
   [Japanese translation 3]

Keep the suggestions practical and commonly used in real conversations.`,
        },
        ...messages,
      ],
    })

    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Error in chat API:', error)
    return new Response('Error processing request', { status: 500 })
  }
}
