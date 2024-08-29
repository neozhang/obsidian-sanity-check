import SanityCheckPlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";

export class SanityCheckSettingTab extends PluginSettingTab {
	plugin: SanityCheckPlugin;

	constructor(app: App, plugin: SanityCheckPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("OpenAI or compatible API key")
			.setDesc("Bring your own API key")
			.addText((text) => {
				text.setPlaceholder("sk-")
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("OpenAI or compatible API Endpoint")
			.setDesc("Use a custom endpoint")
			.addText((text) => {
				text.setPlaceholder("https://api.openai.com/v1")
					.setValue(this.plugin.settings.apiEndpoint)
					.onChange(async (value) => {
						this.plugin.settings.apiEndpoint = value;
						await this.plugin.saveSettings();
					});
			});

		const modelSetting = new Setting(containerEl)
			.setName("Model name")
			.setDesc("Choose your preferred model")
			.addDropdown((dropdown) => {
				dropdown
					.addOptions({
						"gpt-4o-mini": "gpt-4o-mini",
						"gpt-4o": "gpt-4o",
						Custom: "Custom",
					})
					.setValue(
						["gpt-4o-mini", "gpt-4o"].includes(
							this.plugin.settings.apiModel
						)
							? this.plugin.settings.apiModel
							: "Custom"
					)
					.onChange(async (value) => {
						this.plugin.settings.apiModel = value;
						await this.plugin.saveSettings();
						this.display(); // Re-render the settings tab
					});
			});

		if (!["gpt-4-mini", "gpt-4o"].includes(this.plugin.settings.apiModel)) {
			new Setting(containerEl)
				.setName("Custom model")
				.setDesc(
					"Refer to your API documentation for available models."
				)
				.addText((text) => {
					text.setValue(this.plugin.settings.apiModel).onChange(
						async (value) => {
							this.plugin.settings.apiModel = value;
							await this.plugin.saveSettings();
						}
					);
				});
		}
	}
}
