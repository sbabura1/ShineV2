# Scalaris Source Palette Notes

## Architecture

- `theme.css` owns semantic light and dark tokens. Components consume roles such as `--surface`, `--text`, `--primary`, and `--accent` rather than theme-specific colors.
- `utils/theme.js` resolves the saved preference or the operating-system preference, applies it to `<html data-theme>`, and persists manual changes under `scalaris:theme`.
- The inline script in `index.html` applies the resolved theme before React and CSS paint, preventing a light/dark flash.
- `#/design-system` is the component and data-visualization demonstration route.

## Palette Source

- Dark mode restores the navy, cyan, blue, purple, gold, green, orange, and rose values from `Scalaris - 10-19.html`.
- Light mode restores the pale-blue page, white panels, blue-gray borders, navy text, and dark cyan values from the same HTML.
- Primary buttons are cyan again. Gold, success, danger, and secondary buttons retain their original semantic colors.

## Visual Constraints

- The original cyan and purple atmospheric page background, Nexus field, illuminated core, network lines, and node treatments are restored.
- The updated avatar and Beacon assets remain intact, and their builder previews stay flat so the generated assets remain visually honest.
- The rebuilt card composition, spacing, routes, and responsive layout remain intact while using the HTML's original surface colors and shadows.
- Inter/Geist is used throughout the interface, while monospace remains limited to aligned metrics and technical data.

## Layout Direction

- The rebuilt card hierarchy and **Accent ladder** layout are retained; only the colors come from the original Scalaris HTML.
- The Nexus network remains the signature product element.
- Assessment states are one divided strip, sector navigation is a two-column directory instead of a four-up card wall, and the active mission receives more visual weight than locked missions.
- The pricing values on `#/design-system` are illustrative demo content and should be replaced before any public pricing use.
