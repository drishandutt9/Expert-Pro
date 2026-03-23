import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { openai } from '@ai-sdk/openai';
import { embedMany, generateText } from 'ai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
const pdfParse = require('pdf-parse');

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Deduplication Check: Prevent ingestion rot by checking if file already exists
    try {
      const { data: existingDocs, error: checkError } = await supabaseAdmin
        .from('documents_v2')
        .select('id')
        .contains('metadata', { fileName: file.name })
        .limit(1);

      if (checkError) throw checkError;

      if (existingDocs && existingDocs.length > 0) {
         console.warn(`[Upload] Deduplication blocked ingestion of: ${file.name}`);
         return NextResponse.json(
           { error: `You have already uploaded this document before.` }, 
           { status: 409 }
         );
      }
    } catch (checkErr) {
      console.error('[Upload] Database deduplication check failed prematurely:', checkErr);
      // Fallback allows processing to continue if the DB temporarily fails to read the JSONB metadata
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    if (file.type === 'application/pdf') {
      try {
        // Vercel Serverless execution environments possess a Read-Only file system (EROFS) 
        // and physically lack the binaries required to execute python scripts natively.
        // As a highly robust resolution, we ingest the PDF strictly into Node's volatile RAM.
        // By statically importing pdfParse at the top, we bypass Vercel's aggressive tree-shaking module drops.
        // Secure ESM interoperability for Vercel Webpack namespace wrapping
        const pdfParserFn = pdfParse.default || pdfParse;
        const data = await pdfParserFn(buffer);
        text = data.text;
      } catch (err: any) {
        console.error("Native Node.js Serverless PDF extraction failed:", err);
        return NextResponse.json({ error: 'Failed to safely process PDF in Vercel RAM.' }, { status: 500 });
      }
    } else if (file.type === 'text/plain') {
      text = buffer.toString('utf-8');
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please upload a PDF or TXT file.' }, { status: 400 });
    }

    if (!text.trim()) {
      return NextResponse.json({ error: 'Failed to extract text from the file.' }, { status: 400 });
    }

    // Split the text into massive Parent chunks
    const parentSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 400,
    });
    const parentChunks = await parentSplitter.splitText(text);

    // Split Parents into precise Child chunks
    const childSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 400,
      chunkOverlap: 50,
    });

    const allChildRecords: { content: string, parentContext: string }[] = [];
    for (const parent of parentChunks) {
      const children = await childSplitter.splitText(parent);
      for (const child of children) {
        allChildRecords.push({ content: child, parentContext: parent });
      }
    }

    const childContents = allChildRecords.map(r => r.content);

    // Get embeddings ONLY for all tiny child chunks
    const { embeddings } = await embedMany({
      model: openai.embedding('text-embedding-3-small'),
      values: childContents,
    });

    // Generate a file summary before splitting
    let fileSummary = 'Summarization unavailable.';
    try {
      const { text: rawSummary } = await generateText({
        model: openai('gpt-4o-mini'),
        system: 'You are an expert file summarizer. Read the following document text and provide a concise, maximum 1-2 sentence summary outlining what this file is about.',
        prompt: text.substring(0, 20000), // Feed first 20k characters to stay within context
      });
      fileSummary = rawSummary;
    } catch (e) {
      console.warn("Failed to generate summary. Skipping.", e);
    }

    // Insert the child chunks, but inject the Massive Parent text into metadata!
    const records = allChildRecords.map((record, i: number) => ({
      content: record.content,
      embedding: embeddings[i],
      metadata: {
        fileName: file.name,
        fileType: file.type,
        fileSummary: fileSummary,
        parentContext: record.parentContext
      }
    }));

    // Insert into Supabase
    const { error } = await supabaseAdmin
      .from('documents_v2')
      .insert(records);

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: 'Failed to insert vectors into Supabase' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Successfully processed and vectorized ${childContents.length} chunks.` });

  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
