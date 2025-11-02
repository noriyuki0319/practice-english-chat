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
    const { messages, suggestionIndex } = await req.json()

    // suggestionIndexが指定されている場合は、その番号の提案のみを返す
    const indexText = suggestionIndex !== undefined 
      ? ` This is suggestion number ${suggestionIndex + 1} out of 3. Provide a different expression than the previous ones.`
      : ''

    const response = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      stream: true,
      messages: [
        {
          role: 'system',
          content: `You are a helpful English teacher for Japanese speakers. 
When a user asks for English phrases for a specific situation, provide exactly ONE natural English expression with Japanese translation.
Format your response as follows (without brackets):

English sentence
Japanese translation

Keep the suggestion practical and commonly used in real conversations.${indexText}`,
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
