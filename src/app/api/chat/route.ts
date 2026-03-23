import { openai } from '@ai-sdk/openai';
import { streamText, embed } from 'ai';
import { supabaseAdmin } from '@/lib/supabase';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, sessionId } = await req.json();
    console.log(`[Chat API] Received request for sessionId: ${sessionId}`);

    // Get the user's latest message
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || latestMessage.role !== 'user') {
      return new Response('Invalid message format', { status: 400 });
    }

    const query = latestMessage.content;

    // 1. Generate an embedding for the user's query
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: query,
    });

    // 2. Search for relevant document chunks using the query embedding
    // Note: Ensure you have an RPC function named `match_documents` in Supabase
    const { data: documents, error } = await supabaseAdmin.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.1, // lowered threshold to pull in broader relevant data
      match_count: 5, // return top 5 chunks
    });

    if (error) {
      console.error('Vector search error:', error);
      // Fallback to normal chat if search fails
    }

    // 3. Construct the context from the semantic search results
    let contextText = '';
    if (documents && documents.length > 0) {
      contextText = documents.map((doc: any) => {
        const fullContext = doc.metadata?.parentContext || doc.content;
        return `[Source File: ${doc.metadata?.fileName || 'Unknown'}]\n${fullContext}`;
      }).join('\n\n---\n\n');
    }

    // 4. Create the final prompt instructing the AI to use context
    const systemPrompt = `You are a helpful and knowledgeable AI assistant. 
Use the following retrieved context from the user's uploaded documents as your primary source of truth. 
If the context contains relevant information, use it to answer the question.
If the context doesn't fully answer the question, or if there is no context provided, you are welcome to use your own general knowledge to assist the user. 
Always aim to be as helpful as possible.

Context:
${contextText || "No explicitly matched context found in database."}`;

    const coreMessages = messages.map((m: any) => {
      let contentString = m.content || '';
      
      // If content is empty but the newer AI SDK 'parts' array exists, extract text from it
      if (!contentString && Array.isArray(m.parts)) {
        contentString = m.parts.map((p: any) => p.text || '').join('');
      }

      return {
        role: m.role,
        content: contentString || ' ', // fallback to a space to prevent OpenAI 400 Bad Request
      };
    });

    // 5. Stream the response directly to the client
    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages: coreMessages,
      onFinish: async ({ text }) => {
        try {
          if (!sessionId) return;
          const lastUserMessage = messages[messages.length - 1];
          await supabaseAdmin.from('chat_messages').insert([
            { session_id: sessionId, role: 'user', content: lastUserMessage.content || '[Complex Payload]' },
            { session_id: sessionId, role: 'assistant', content: text }
          ]);
        } catch (err) {
          console.error('[DB] Failed to save chat transaction:', err);
        }
      }
    });

    return result.toUIMessageStreamResponse();

  } catch (error: any) {
    console.error('Chat Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
