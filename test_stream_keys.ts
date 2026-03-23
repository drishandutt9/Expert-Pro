import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

async function main() {
  try {
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      prompt: 'hello',
    });
    // We get the result object, which has stream getters and response formatters
    // Since some properties are mapped to prototypes, we can use a loop:
    let methods = [];
    for (const key in result) {
      methods.push(key);
    }
    console.log("ALL KEYS:", methods);
  } catch (e) {
    console.error(e);
  }
}
main();
