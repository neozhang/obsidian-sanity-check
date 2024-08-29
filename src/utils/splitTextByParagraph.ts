/**
 * Splits a long text into chunks, separated by paragraphs.
 * @param text The input text to be split.
 * @param maxChunkLength The maximum length of each chunk (default: 1000 characters).
 * @returns An array of text chunks.
 */
function splitTextIntoChunks(
	text: string,
	maxChunkLength: number = 1000
): string[] {
	// Split the text into paragraphs
	const paragraphs = text.split(/\n\s*\n/);

	const chunks: string[] = [];
	let currentChunk = "";

	for (const paragraph of paragraphs) {
		if (currentChunk.length + paragraph.length + 1 <= maxChunkLength) {
			// Add paragraph to the current chunk
			currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
		} else {
			// Start a new chunk
			if (currentChunk) {
				chunks.push(currentChunk);
			}
			currentChunk = paragraph;
		}
	}

	// Add the last chunk if it's not empty
	if (currentChunk) {
		chunks.push(currentChunk);
	}

	return chunks;
}

export default splitTextIntoChunks;
