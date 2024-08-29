import {
	Plugin,
	MarkdownView,
	Modal,
	MarkdownRenderer,
	ButtonComponent,
} from "obsidian";
import splitTextIntoChunks from "./utils/splitTextByParagraph";
import { sanitizeText } from "./utils/santizeText";
import { SanityCheckSettingTab } from "./settings";

interface SanityCheckSetting {
	apiKey: string;
	apiEndpoint: string;
	apiModel: string;
}
const DEFAULT_SETTINGS: Partial<SanityCheckSetting> = {
	apiKey: "",
	apiEndpoint: "https://api.openai.com/v1",
	apiModel: "gpt-4-mini",
};

export default class SanityCheckPlugin extends Plugin {
	settings: SanityCheckSetting;

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async onload() {
		// This adds a simple command that can be triggered anywhere

		await this.loadSettings();
		this.addSettingTab(new SanityCheckSettingTab(this.app, this));

		this.addCommand({
			id: "run-sanity-check-on-selection",
			name: "Run sanity check on selected text",
			callback: async () => {
				// Implement your sanity check logic here
				console.log("Running sanity check...");
				// Example: You can add more complex logic or call other functions

				// some logics here:
				// need to handle selected text and the whole doc differently
				// this command only handles selected text
				// selected text need to be splitted into chunks first (by paragraph)
				// each chunk will be processed by LLM and output the sanitized version
				// need to push the sanitized chunk back to a new list of chunks
				// send back the entire new list of chunks, and replace the selection
				// make sure the whole process can be undone

				const editor =
					this.app.workspace.getActiveViewOfType(
						MarkdownView
					)?.editor;
				if (!editor) {
					console.error("No active editor found");
					return;
				}

				const selection = editor.getSelection();
				if (!selection) {
					console.error("No text selected");
					return;
				}

				// Split the selected text into chunks
				const chunks = splitTextIntoChunks(selection);

				// Process each chunk
				const sanitizedChunks = await Promise.all(
					chunks.map(async (chunk) => {
						const apiKey = this.settings.apiKey;
						const apiEndpoint = this.settings.apiEndpoint;
						const apiModel = this.settings.apiModel;

						return sanitizeText(
							chunk,
							apiKey,
							apiEndpoint,
							apiModel
						);
					})
				);

				// Join the sanitized chunks
				const sanitizedText = {
					markdown: sanitizedChunks
						.map((chunk) => chunk.markdown)
						.join("\n\n"),
					plainText: sanitizedChunks
						.map((chunk) => chunk.plainText)
						.join("\n\n"),
				};

				// Show the modal
				new ChangesModal(this, selection, sanitizedText).open();

				// ... remove or comment out the direct replacement code ...
			},
		});
	}

	onunload() {
		// Clean up resources if needed
	}
}

// TODO: display the original text and markdown in the left-and-right split view

class ChangesModal extends Modal {
	plugin: SanityCheckPlugin;
	originalText: string;
	sanitizedText: { markdown: string; plainText: string };

	constructor(
		plugin: SanityCheckPlugin,
		originalText: string,
		sanitizedText: { markdown: string; plainText: string }
	) {
		super(plugin.app);
		this.plugin = plugin;
		this.originalText = originalText;
		this.sanitizedText = sanitizedText;
	}

	onOpen() {
		let { contentEl } = this;
		this.setTitle("Review Changes");

		// Display changes
		let changesEl = contentEl.createDiv();
		MarkdownRenderer.render(
			this.app,
			this.sanitizedText.markdown,
			changesEl,
			"",
			this.plugin
		);

		// Button container
		const buttonContainer = contentEl.createDiv({
			cls: "sanity-check-button-container",
		});

		// Add buttons
		new ButtonComponent(buttonContainer)
			.setButtonText("Accept")
			.setCta()
			.onClick(() => {
				this.acceptChanges();
				this.close();
			});

		new ButtonComponent(buttonContainer)
			.setButtonText("Reject")
			.onClick(() => {
				this.close();
			});
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}

	acceptChanges() {
		const activeView =
			this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
		if (activeView) {
			const editor = activeView.editor;
			const cursor = editor.getCursor();

			// Replace the selected text with the plain text version
			editor.replaceSelection(this.sanitizedText.plainText);

			// Attempt to restore the cursor position
			editor.setCursor(cursor);
		}
	}
}
