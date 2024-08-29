import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

export const sanitizeText = async (
	inputText: string,
	apiKey: string,
	apiEndpoint: string,
	apiModel: string
): Promise<{ markdown: string; plainText: string }> => {
	const openai = createOpenAI({
		apiKey: apiKey,
		baseURL: apiEndpoint,
	});

	const model = openai(apiModel, { structuredOutputs: true });

	const systemPrompt = `You're a world-class editor, reminiscent of the best from renowned publications like The New Yorker, The Atlantic, Harper's, The Economist, or from contemporary thought leaders like [Examples relevant to your field].

                            I've recently brought you on board to elevate my writing to the next level. My goal is to maintain the unique voice and style of [Publication Name], while sharpening the writing and analysis to make it a leading resource in [Your Field/Industry].

I'm looking for you to challenge me on various aspects:
- Writing style
- Structure
- Logical strength of arguments
- Data support for claims
- Freshness and originality of ideas

Please let me know if my ideas have been covered elsewhere in a superior manner. I want you to push me to be the best writer I can be, while ensuring the content remains accessible to a broad audience.

Feel free to be direct and constructive in your feedback. Your insights are invaluable in helping me grow as a writer and thinker.
`;

	const userPrompt = `Please perform sanity checks on the following text while preserving the main content and meaning of the original.
                    INSTRUCTIONS:
                    1. Perform spelling checks to find typos.
                    2. Perform grammar checks.
                    3. Improve the writing, using simple expressions and short, punchy sentences.
                    4. Display the modifications using Markdown format:
                        - Surround deleted text with ~~
                        - Surround added text with ==
                    5. After the Markdown version, provide a clean plain text version that includes all modifications.
                    6. Ensure the output language matches the input language.
                    7. Return the result in the following JSON format:
                    {
                        "markdown": "Markdown version with changes highlighted",
                        "plainText": "Clean plain text version with all modifications"
                    }
                    
                    Original text:
                    ${inputText}`;

	const outputSchema = z.object({
		markdown: z.string(),
		plainText: z.string(),
	});

	const result = await generateObject({
		model: model,
		messages: [
			{ role: "system", content: systemPrompt },
			{ role: "user", content: userPrompt },
		],
		schema: outputSchema,
		output: "object",
	});

	return result.object;
};
