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

	const rawLevels = cache.frontmatter.levels;
	if (!Array.isArray(rawLevels)) {
		return null;
	}

	const levels: TlpLevel[] = [];
	for (const raw of rawLevels) {
		if (
			typeof raw.value === "string" &&
			typeof raw.fontColor === "string"
		) {
			levels.push({
				value: raw.value.toUpperCase(),
				label: raw.label || `TLP:${raw.value.toUpperCase()}`,
				fontColor: raw.fontColor,
				bgColor: raw.bgColor || "#000000",
				description: raw.description || "",
			});
		}
	}

	return levels.length > 0 ? levels : null;
}
