import { App, Modal, setIcon } from "obsidian";
import { TlpLevel } from "./tlp-levels";

/**
 * A visual modal for selecting a TLP classification level.
 *
 * Each option is rendered as a row with:
 *   [colored badge]  TLP:LEVEL  —  short description
 *
 * Keyboard-navigable: arrow keys to move, Enter to select, Esc to cancel.
 */
export class TlpSelectorModal extends Modal {
	private levels: TlpLevel[];
	private currentValue: string | null;
	private onSelect: (level: TlpLevel) => void;
	private selectedIndex: number;
	private optionEls: HTMLElement[] = [];

	constructor(
		app: App,
		levels: TlpLevel[],
		currentValue: string | null,
		onSelect: (level: TlpLevel) => void
	) {
		super(app);
		this.levels = levels;
		this.currentValue = currentValue?.toUpperCase() ?? null;
		this.onSelect = onSelect;
		this.selectedIndex = Math.max(
			0,
			levels.findIndex((l) => l.value === this.currentValue)
		);
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.addClass("tlp-selector-modal");

		// Title
		const title = contentEl.createDiv({ cls: "tlp-modal-title" });
		title.setText("Document classification");

		// Subtitle
		const subtitle = contentEl.createDiv({ cls: "tlp-modal-subtitle" });
		subtitle.setText("Select the TLP level for this document");

		// Options list
		const list = contentEl.createDiv({ cls: "tlp-options-list" });

		this.levels.forEach((level, index) => {
			const row = list.createDiv({ cls: "tlp-option-row" });

			// Active indicator
			if (level.value === this.currentValue) {
				row.addClass("is-active");
			}

			// Badge
			const badge = row.createSpan({ cls: "tlp-badge" });
			badge.setCssStyles({
				backgroundColor: level.bgColor,
				color: level.fontColor,
				border:
					level.value === "CLEAR"
						? "1px solid #555"
						: `1px solid ${level.fontColor}40`,
			});
			badge.setText(level.label);

			// Description
			const desc = row.createSpan({ cls: "tlp-option-desc" });
			desc.setText(level.description);

			// Check icon for current selection
			if (level.value === this.currentValue) {
				const check = row.createSpan({ cls: "tlp-check" });
				setIcon(check, "check");
			}

			// Interaction
			row.addEventListener("click", () => {
				this.onSelect(level);
				this.close();
			});

			row.addEventListener("mouseenter", () => {
				this.setHighlight(index);
			});

			this.optionEls.push(row);
		});

		// Set initial highlight
		this.setHighlight(this.selectedIndex);

		// Keyboard navigation
		this.scope.register([], "ArrowDown", (e) => {
			e.preventDefault();
			this.setHighlight(
				(this.selectedIndex + 1) % this.levels.length
			);
		});

		this.scope.register([], "ArrowUp", (e) => {
			e.preventDefault();
			this.setHighlight(
				(this.selectedIndex - 1 + this.levels.length) %
					this.levels.length
			);
		});

		this.scope.register([], "Enter", (e) => {
			e.preventDefault();
			this.onSelect(this.levels[this.selectedIndex]);
			this.close();
		});
	}

	private setHighlight(index: number): void {
		this.optionEls[this.selectedIndex]?.removeClass("is-highlighted");
		this.selectedIndex = index;
		this.optionEls[this.selectedIndex]?.addClass("is-highlighted");
	}

	onClose(): void {
		this.contentEl.empty();
		this.optionEls = [];
	}
}
