import { TlpLevel } from "./tlp-levels";

export type BadgePosition = "left" | "center" | "right";
export type TemplateTarget = "headerTemplate" | "footerTemplate";

export interface TemplateOptions {
	position: BadgePosition;
	target: TemplateTarget;
	showPageNumber: boolean;
}

const DEFAULT_OPTIONS: TemplateOptions = {
	position: "right",
	target: "headerTemplate",
	showPageNumber: false,
};

/**
 * Build the inline HTML for the TLP badge.
 *
 * Puppeteer's header/footer templates only support inline styles
 * and a handful of magic CSS classes (title, pageNumber, totalPages, etc.).
 * No external stylesheets, no <link>, no JS.
 */
function buildBadgeHtml(level: TlpLevel): string {
	const border =
		level.value === "CLEAR"
			? "border:1px solid #555;"
			: `border:1px solid ${level.fontColor}40;`;

	return (
		`<span style="` +
		`-webkit-print-color-adjust:exact;` +
		`print-color-adjust:exact;` +
		`font-size:9px;` +
		`font-weight:600;` +
		`letter-spacing:1.5px;` +
		`font-family:system-ui,-apple-system,sans-serif;` +
		`padding:3px 12px;` +
		`border-radius:0;` +
		`background-color:${level.bgColor};` +
		`color:${level.fontColor};` +
		`${border}` +
		`display:inline-block;` +
		`">${level.label}</span>`
	);
}

/**
 * Build a page number element (uses Puppeteer magic classes).
 */
function buildPageNumber(): string {
	return (
		`<span style="font-size:9px;font-family:system-ui,sans-serif;color:#999;">` +
		`<span class="pageNumber"></span> / <span class="totalPages"></span>` +
		`</span>`
	);
}

/**
 * Generate the complete headerTemplate / footerTemplate string
 * ready to be inserted into the document's frontmatter.
 */
export function generateTemplate(
	level: TlpLevel,
	options: Partial<TemplateOptions> = {}
): string {
	const opts = { ...DEFAULT_OPTIONS, ...options };
	const badge = buildBadgeHtml(level);
	const pageNum = opts.showPageNumber ? buildPageNumber() : "";

	// Determine flex alignment
	let justifyContent: string;
	let leftSlot: string;
	let centerSlot: string;
	let rightSlot: string;

	switch (opts.position) {
		case "left":
			leftSlot = badge;
			centerSlot = "";
			rightSlot = pageNum;
			justifyContent = "space-between";
			break;
		case "center":
			leftSlot = pageNum;
			centerSlot = badge;
			rightSlot = "";
			justifyContent = "center";
			break;
		case "right":
		default:
			leftSlot = "";
			centerSlot = pageNum;
			rightSlot = badge;
			justifyContent = pageNum ? "space-between" : "flex-end";
			break;
	}

	// When there's only the badge (no page number), keep it simple
	if (!pageNum) {
		const align =
			opts.position === "left"
				? "flex-start"
				: opts.position === "center"
				? "center"
				: "flex-end";

		return (
			`<div style="width:100vw;display:flex;justify-content:${align};` +
			`align-items:center;padding:0 24px;">` +
			badge +
			`</div>`
		);
	}

	// With page number, use a three-column layout
	return (
		`<div style="width:100vw;display:flex;justify-content:space-between;` +
		`align-items:center;padding:0 24px;">` +
		`<div>${leftSlot}</div>` +
		`<div>${centerSlot}</div>` +
		`<div>${rightSlot}</div>` +
		`</div>`
	);
}
