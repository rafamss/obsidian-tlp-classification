---
levels:
  - value: RED
    label: "TLP:RED"
    fontColor: "#FF2B2B"
    bgColor: "#000000"
    description: "Named recipients only"
  - value: AMBER+STRICT
    label: "TLP:AMBER+STRICT"
    fontColor: "#FFC000"
    bgColor: "#000000"
    description: "Organization only"
  - value: AMBER
    label: "TLP:AMBER"
    fontColor: "#FFC000"
    bgColor: "#000000"
    description: "Limited distribution"
  - value: GREEN
    label: "TLP:GREEN"
    fontColor: "#33FF00"
    bgColor: "#000000"
    description: "Community-wide"
  - value: CLEAR
    label: "TLP:CLEAR"
    fontColor: "#FFFFFF"
    bgColor: "#000000"
    description: "Public / unrestricted"
  # ─── Example: custom internal level ───
  # - value: INTERNAL
  #   label: "INTERNAL"
  #   fontColor: "#7B68EE"
  #   bgColor: "#000000"
  #   description: "Internal use only"
---

# TLP Classification Policy

This file defines the TLP levels available in this vault.
Edit the `levels` list above to add, remove, or customize classification levels.

## How to use

1. Open the plugin settings and set **Custom levels file** to the path of this file
   (e.g. `_config/tlp-levels.md`).
2. The plugin will read levels from this file instead of the built-in defaults.
3. You can add organization-specific levels by uncommenting or adding new entries.

## Field reference

| Field       | Required | Description                                      |
|-------------|----------|--------------------------------------------------|
| `value`     | Yes      | The value stored in frontmatter (e.g. `RED`)     |
| `label`     | No       | Display label (defaults to `TLP:{value}`)        |
| `fontColor` | Yes      | Hex color for the badge text                     |
| `bgColor`   | No       | Hex color for the badge background (default: black) |
| `description` | No     | Short description shown in the selector          |
