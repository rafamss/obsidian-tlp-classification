import {
	Plugin,
	TFile,
	MarkdownView,
	Notice,
	debounce,
} from "obsidian";
import { DEFAULT_TLP_LEVELS, TlpLevel, findTlpLevel } from "./tlp-levels";
import { generateTemplate } from "./header-template";
import { TlpSelectorModal } from "./tlp-selector-modal";
import { TlpSettingTab, TlpPluginSettings, DEFAULT_SETTINGS } from "./settings";
import { parseCustomLevels } from "./custom-levels";

export default class TlpClassificationPlugin extends Plugin {
	settings: TlpPluginSettings = DEFAULT_SETTINGS;

	/** Active TLP levels (built-in or loaded from custom file) */
	private levels: TlpLevel[] = DEFAULT_TLP_LEVELS;

	/** Status bar element */
	private statusBarEl: HTMLElement | null = null;

	/** Observer for the properties panel */
	private propertiesObserver: MutationObserver | null = null;

	// ─── Lifecycle ──────────────────────────────────────────

	async onload(): Promise<void> {
		await this.loadSettings();
		await this.loadCustomLevels();

		// Settings tab
		this.addSettingTab(new TlpSettingTab(this.app, this));

		// Status bar
		this.statusBarEl = this.addStatusBarItem();
		this.statusBarEl.addClass("tlp-status-bar");
		this.statusBarEl.addEventListener("click", () => {
			this.openTlpSelector();
		});

		// Commands
		this.addCommand({
			id: "set-tlp-classification",
			name: "Set TLP classification",
			callback: () => this.openTlpSelector(),
		});

		this.addCommand({
			id: "remove-tlp-classification",
			name: "Remove TLP classification",
			callback: () => this.removeTlpFromActiveFile(),
		});

		// React to file changes
		this.registerEvent(
			this.app.metadataCache.on("changed", (file) => {
				const activeFile =
					this.app.workspace.getActiveFile();
				if (activeFile && file.path === activeFile.path) {
					this.debouncedSync(file);
					this.updateStatusBar();
					this.debouncedEnhanceProperties();
				}
			})
		);

		// React to active file change
		this.registerEvent(
			this.app.workspace.on("file-open", () => {
				this.updateStatusBar();
				this.debouncedEnhanceProperties();
			})
		);

		// React to layout changes (properties panel open/close)
		this.registerEvent(
			this.app.workspace.on("layout-change", () => {
				this.debouncedEnhanceProperties();
			})
		);

		// Observe DOM for properties panel mutations
		this.setupPropertiesObserver();

		// Initial status bar update
		this.app.workspace.onLayoutReady(() => {
			this.updateStatusBar();
			this.debouncedEnhanceProperties();
			this.checkBetterExportPdf();
		});
	}

	onunload(): void {
		if (this.propertiesObserver) {
			this.propertiesObserver.disconnect();
			this.propertiesObserver = null;
		}
	}

	// ─── Soft dependency check ─────────────────────────────

	/**
	 * Check if Better Export PDF is installed and enabled.
	 * Show a one-time notice if it's missing — the plugin still
	 * works for classification, but PDF badges won't render.
	 */
	private async checkBetterExportPdf(): Promise<void> {
		const plugins = (this.app as any).plugins;
		const isInstalled =
			plugins?.enabledPlugins?.has("better-export-pdf") ||
			plugins?.getPlugin?.("better-export-pdf");

		if (!isInstalled) {
			const alreadyWarned = await this.loadData();
			if (!alreadyWarned?.betterExportPdfWarningShown) {
				new Notice(
					"TLP Classification: For TLP badges in exported PDFs, " +
					"install the \"Better Export PDF\" plugin. " +
					"The classification selector works independently.",
					8000
				);
				await this.saveData({
					...((await this.loadData()) || {}),
					betterExportPdfWarningShown: true,
				});
			}
		}
	}

	// ─── Settings ───────────────────────────────────────────

	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	// ─── Custom levels ──────────────────────────────────────

	async loadCustomLevels(): Promise<void> {
		if (this.settings.customLevelsFile) {
			const custom = await parseCustomLevels(
				this.app,
				this.settings.customLevelsFile
			);
			this.levels = custom ?? DEFAULT_TLP_LEVELS;
		} else {
			this.levels = DEFAULT_TLP_LEVELS;
		}
	}

	// ─── Properties panel enhancement ───────────────────────

	/**
	 * Set up a MutationObserver that watches for the properties panel
	 * rendering so we can enhance the TLP property row.
	 */
	private setupPropertiesObserver(): void {
		this.propertiesObserver = new MutationObserver(() => {
			this.debouncedEnhanceProperties();
		});

		// Observe the entire workspace container for subtree changes
		const container = document.querySelector(".workspace");
		if (container) {
			this.propertiesObserver.observe(container, {
				childList: true,
				subtree: true,
			});
		}
	}

	/**
	 * Find the TLP property row in the Properties panel and replace
	 * the native input with our custom badge widget.
	 */
	private enhancePropertiesPanel(): void {
		const propName = this.settings.tlpPropertyName.toLowerCase();

		// Find all property rows matching our TLP property name
		const rows = document.querySelectorAll(
			`.metadata-property[data-property-key="${propName}"]`
		);

		rows.forEach((row) => {
			// Skip if already enhanced
			if (row.querySelector(".tlp-property-widget")) return;

			const valueContainer = row.querySelector(
				".metadata-property-value"
			);
			if (!valueContainer) return;

			// Get current TLP value
			const file = this.app.workspace.getActiveFile();
			const tlpValue = file ? this.getTlpFromFile(file) : null;
			const level = tlpValue
				? findTlpLevel(tlpValue, this.levels)
				: null;

			// Hide the native input
			const nativeInput = valueContainer.querySelector(
				"input, select, .multi-select-container, .metadata-input-longtext"
			);
			if (nativeInput) {
				(nativeInput as HTMLElement).style.display = "none";
			}

			// Create our custom widget
			const widget = document.createElement("div");
			widget.className = "tlp-property-widget";
			widget.setAttribute("aria-label", "Click to change TLP classification");

			if (level) {
				// Render the badge
				const badge = document.createElement("span");
				badge.className = "tlp-prop-badge";
				badge.style.backgroundColor = level.bgColor;
				badge.style.color = level.fontColor;
				if (level.value === "CLEAR") {
					badge.style.border = "1px solid #555";
				} else {
					badge.style.border = `1px solid ${level.fontColor}40`;
				}
				badge.textContent = level.label;
				widget.appendChild(badge);

				// Chevron
				const chevron = document.createElement("span");
				chevron.className = "tlp-prop-chevron";
				chevron.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
				widget.appendChild(chevron);
			} else {
				// No classification yet
				const placeholder = document.createElement("span");
				placeholder.className = "tlp-prop-placeholder";
				placeholder.textContent = "Set classification…";
				widget.appendChild(placeholder);
			}

			// Open selector on click
			widget.addEventListener("click", (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.openTlpSelector();
			});

			valueContainer.appendChild(widget);
		});
	}

	private debouncedEnhanceProperties = debounce(
		() => this.enhancePropertiesPanel(),
		100,
		true
	);

	// ─── TLP selector ───────────────────────────────────────

	openTlpSelector(): void {
		const file = this.app.workspace.getActiveFile();
		if (!file) {
			new Notice("No active file");
			return;
		}

		const currentTlp = this.getTlpFromFile(file);

		new TlpSelectorModal(
			this.app,
			this.levels,
			currentTlp,
			(level: TlpLevel) => {
				this.applyTlpToFile(file, level);
			}
		).open();
	}

	// ─── Frontmatter operations ─────────────────────────────

	/**
	 * Read the current TLP value from a file's frontmatter.
	 */
	private getTlpFromFile(file: TFile): string | null {
		const cache = this.app.metadataCache.getFileCache(file);
		const propName = this.settings.tlpPropertyName;
		const value = cache?.frontmatter?.[propName];
		return typeof value === "string" ? value : null;
	}

	/**
	 * Write the TLP level and auto-generated template to the frontmatter.
	 */
	private async applyTlpToFile(
		file: TFile,
		level: TlpLevel
	): Promise<void> {
		const template = generateTemplate(level, {
			position: this.settings.badgePosition,
			target: this.settings.templateTarget,
			showPageNumber: this.settings.showPageNumber,
		});

		const propName = this.settings.tlpPropertyName;
		const target = this.settings.templateTarget;

		await this.app.fileManager.processFrontMatter(
			file,
			(frontmatter) => {
				frontmatter[propName] = level.value;
				frontmatter[target] = template;
			}
		);

		new Notice(`Classification set to ${level.label}`);
		this.updateStatusBar();

		// Re-enhance the properties panel after a short delay
		// to let Obsidian re-render the frontmatter
		setTimeout(() => this.enhancePropertiesPanel(), 200);
	}

	/**
	 * Remove TLP classification from the active file.
	 */
	private async removeTlpFromActiveFile(): Promise<void> {
		const file = this.app.workspace.getActiveFile();
		if (!file) {
			new Notice("No active file");
			return;
		}

		const propName = this.settings.tlpPropertyName;
		const target = this.settings.templateTarget;

		await this.app.fileManager.processFrontMatter(
			file,
			(frontmatter) => {
				delete frontmatter[propName];
				delete frontmatter[target];
			}
		);

		new Notice("TLP classification removed");
		this.updateStatusBar();
	}

	// ─── Sync: keep template in sync when TLP changes manually ──

	/**
	 * If the user manually edits the TLP property in the frontmatter,
	 * regenerate the headerTemplate to match.
	 */
	private syncTemplateToTlp(file: TFile): void {
		const tlpValue = this.getTlpFromFile(file);
		if (!tlpValue) return;

		const level = findTlpLevel(tlpValue, this.levels);
		if (!level) return;

		const expected = generateTemplate(level, {
			position: this.settings.badgePosition,
			target: this.settings.templateTarget,
			showPageNumber: this.settings.showPageNumber,
		});

		const cache = this.app.metadataCache.getFileCache(file);
		const target = this.settings.templateTarget;
		const current = cache?.frontmatter?.[target];

		// Only write if out of sync
		if (current !== expected) {
			this.app.fileManager.processFrontMatter(
				file,
				(frontmatter) => {
					frontmatter[target] = expected;
				}
			);
		}
	}

	/** Debounced version to avoid rapid frontmatter rewrites */
	private debouncedSync = debounce(
		(file: TFile) => this.syncTemplateToTlp(file),
		1000,
		true
	);

	// ─── Status bar ─────────────────────────────────────────

	updateStatusBar(): void {
		if (!this.statusBarEl) return;

		if (!this.settings.showStatusBar) {
			this.statusBarEl.style.display = "none";
			return;
		}
		this.statusBarEl.style.display = "";

		const file = this.app.workspace.getActiveFile();
		if (!file) {
			this.statusBarEl.empty();
			return;
		}

		const tlpValue = this.getTlpFromFile(file);
		this.statusBarEl.empty();

		if (tlpValue) {
			const level = findTlpLevel(tlpValue, this.levels);
			if (level) {
				// Dot indicator
				const dot = this.statusBarEl.createSpan({
					cls: "tlp-status-dot",
				});
				dot.style.backgroundColor = level.fontColor;

				// Label
				const label = this.statusBarEl.createSpan({
					cls: "tlp-status-label",
				});
				label.setText(level.label);
				label.style.color = level.fontColor;
			} else {
				// Unknown TLP value
				const label = this.statusBarEl.createSpan({
					cls: "tlp-status-label",
				});
				label.setText(`TLP:${tlpValue}`);
			}
		} else {
			// No classification
			const label = this.statusBarEl.createSpan({
				cls: "tlp-status-label tlp-status-none",
			});
			label.setText("No TLP");
		}
	}
}
