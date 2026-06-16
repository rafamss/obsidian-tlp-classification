import { App, TFile } from "obsidian";
import { TlpLevel } from "./tlp-levels";

/**
 * Parse custom TLP levels from a markdown file in the vault.
 *
 * Expected format (YAML frontmatter):
 *
 * ```markdown
 * ---
 * levels:
 *   - value: RED
 *     label: "TLP:RED"
 *     fontColor: "#FF2B2B"
 *     bgColor: "#000000"
 *     description: "Named recipients only"
 *   - value: AMBER
 *     label: "TLP:AMBER"
 *     fontColor: "#FFC000"
 *     bgColor: "#000000"
 *     description: "Limited distribution"
 * ---
 * ```
 *
 * The body of the markdown can contain documentation about the
 * organization's classification policy.
 */
export async function parseCustomLevels(
	app: App,
	filePath: string
): Promise<TlpLevel[] | null> {
	const file = app.vault.getAbstractFileByPath(filePath);
	if (!(file instanceof TFile)) {
		return null;
	}

	const cache = app.metadataCache.getFileCache(file);
	if (!cache?.frontmatter?.levels) {
		return null;
	}

	const rawLevels: unknown = cache.frontmatter.levels;
	if (!Array.isArray(rawLevels)) {
		return null;
	}

	const levels: TlpLevel[] = [];
	for (const item of rawLevels as unknown[]) {
		if (typeof item !== "object" || item === null) {
			continue;
		}
		const raw = item as Record<string, unknown>;
		if (
			typeof raw.value === "string" &&
			typeof raw.fontColor === "string"
		) {
			const value = raw.value.toUpperCase();
			levels.push({
				value,
				label:
					typeof raw.label === "string"
						? raw.label
						: `TLP:${value}`,
				fontColor: raw.fontColor,
				bgColor:
					typeof raw.bgColor === "string"
						? raw.bgColor
						: "#000000",
				description:
					typeof raw.description === "string"
						? raw.description
						: "",
			});
		}
	}

	return levels.length > 0 ? levels : null;
}
