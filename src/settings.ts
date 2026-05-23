import { App, PluginSettingTab, Setting } from "obsidian";
import type TlpClassificationPlugin from "./main";
import { BadgePosition, TemplateTarget } from "./header-template";

export interface TlpPluginSettings {
	/** Where the badge appears: left, center, right */
	badgePosition: BadgePosition;
	/** Which frontmatter key to write: headerTemplate or footerTemplate */
	templateTarget: TemplateTarget;
	/** Also show page numbers in the header/footer */
	showPageNumber: boolean;
	/** Show the TLP indicator in the status bar */
	showStatusBar: boolean;
	/** Show a colored banner at the top of the editor */
	showEditorBanner: boolean;
	/** Block export if no TLP is set (requires Better Export PDF) */
	requireTlpForExport: boolean;
	/** Path to a markdown file defining custom TLP levels (optional) */
	customLevelsFile: string;
	/** The frontmatter property name for the TLP value */
	tlpPropertyName: string;
}

export const DEFAULT_SETTINGS: TlpPluginSettings = {
	badgePosition: "right",
	templateTarget: "headerTemplate",
	showPageNumber: false,
	showStatusBar: true,
	showEditorBanner: true,
	requireTlpForExport: false,
	customLevelsFile: "",
	tlpPropertyName: "TLP",
};

export class TlpSettingTab extends PluginSettingTab {
	plugin: TlpClassificationPlugin;

	constructor(app: App, plugin: TlpClassificationPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// --- PDF Export section ---

		new Setting(containerEl).setName("PDF export").setHeading();

		new Setting(containerEl)
			.setName("Badge position")
			.setDesc(
				"Where the TLP badge appears in the PDF header or footer."
			)
			.addDropdown((drop) =>
				drop
					.addOptions({
						left: "Left",
						center: "Center",
						right: "Right",
					})
					.setValue(this.plugin.settings.badgePosition)
					.onChange(async (value: string) => {
						this.plugin.settings.badgePosition =
							value as BadgePosition;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Template target")
			.setDesc(
				"Write the badge to headerTemplate or footerTemplate in the frontmatter."
			)
			.addDropdown((drop) =>
				drop
					.addOptions({
						headerTemplate: "Header",
						footerTemplate: "Footer",
					})
					.setValue(this.plugin.settings.templateTarget)
					.onChange(async (value: string) => {
						this.plugin.settings.templateTarget =
							value as TemplateTarget;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Show page number")
			.setDesc(
				"Include page numbers alongside the TLP badge in the exported PDF."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showPageNumber)
					.onChange(async (value) => {
						this.plugin.settings.showPageNumber = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Require classification for export")
			.setDesc(
				"Warn if a document has no TLP classification when exporting to PDF."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.requireTlpForExport)
					.onChange(async (value) => {
						this.plugin.settings.requireTlpForExport = value;
						await this.plugin.saveSettings();
					})
			);

		// --- Editor section ---

		new Setting(containerEl).setName("Editor").setHeading();

		new Setting(containerEl)
			.setName("Status bar indicator")
			.setDesc(
				"Show the current TLP level in the status bar. Click to change."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showStatusBar)
					.onChange(async (value) => {
						this.plugin.settings.showStatusBar = value;
						await this.plugin.saveSettings();
						this.plugin.updateStatusBar();
					})
			);

		new Setting(containerEl)
			.setName("Editor banner")
			.setDesc(
				"Show a thin colored stripe at the top of the editor as a classification reminder."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showEditorBanner)
					.onChange(async (value) => {
						this.plugin.settings.showEditorBanner = value;
						await this.plugin.saveSettings();
					})
			);

		// --- Advanced section ---

		new Setting(containerEl).setName("Advanced").setHeading();

		new Setting(containerEl)
			.setName("Frontmatter property name")
			.setDesc(
				'The property name used in frontmatter for the TLP value. Default: "TLP".'
			)
			.addText((text) =>
				text
					.setPlaceholder("TLP")
					.setValue(this.plugin.settings.tlpPropertyName)
					.onChange(async (value) => {
						this.plugin.settings.tlpPropertyName =
							value.trim() || "TLP";
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Custom levels file")
			.setDesc(
				"Path to a markdown file in your vault that defines custom TLP levels " +
				"(leave empty to use built-in TLP 2.0 levels). " +
				"See documentation for the expected format."
			)
			.addText((text) =>
				text
					.setPlaceholder("_config/tlp-levels.md")
					.setValue(this.plugin.settings.customLevelsFile)
					.onChange(async (value) => {
						this.plugin.settings.customLevelsFile = value.trim();
						await this.plugin.saveSettings();
						await this.plugin.loadCustomLevels();
					})
			);
	}
}
