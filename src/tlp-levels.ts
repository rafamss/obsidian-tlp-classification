/**
 * Traffic Light Protocol (TLP) level definitions.
 *
 * Colors follow the official TLP 2.0 specification.
 * Reference: https://www.first.org/tlp/
 */

export interface TlpLevel {
	/** Display label, e.g. "TLP:RED" */
	label: string;
	/** Frontmatter value, e.g. "RED" */
	value: string;
	/** Font color (hex) used in the PDF header badge */
	fontColor: string;
	/** Background color (hex) used in the PDF header badge */
	bgColor: string;
	/** Short description shown in the selector */
	description: string;
}

/**
 * Built-in TLP levels per the official specification.
 * Order matters — shown top to bottom in the selector.
 */
export const DEFAULT_TLP_LEVELS: TlpLevel[] = [
	{
		label: "TLP:RED",
		value: "RED",
		fontColor: "#FF2B2B",
		bgColor: "#000000",
		description: "Named recipients only",
	},
	{
		label: "TLP:AMBER+STRICT",
		value: "AMBER+STRICT",
		fontColor: "#FFC000",
		bgColor: "#000000",
		description: "Organization only",
	},
	{
		label: "TLP:AMBER",
		value: "AMBER",
		fontColor: "#FFC000",
		bgColor: "#000000",
		description: "Limited distribution",
	},
	{
		label: "TLP:GREEN",
		value: "GREEN",
		fontColor: "#33FF00",
		bgColor: "#000000",
		description: "Community-wide",
	},
	{
		label: "TLP:CLEAR",
		value: "CLEAR",
		fontColor: "#FFFFFF",
		bgColor: "#000000",
		description: "Public / unrestricted",
	},
];

/**
 * Look up a TLP level by its frontmatter value (case-insensitive).
 */
export function findTlpLevel(
	value: string,
	levels: TlpLevel[] = DEFAULT_TLP_LEVELS
): TlpLevel | undefined {
	const normalized = value.trim().toUpperCase();
	return levels.find((l) => l.value === normalized);
}
