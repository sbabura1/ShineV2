import fs from 'node:fs';

const sourcePath = process.argv[2];

if (!sourcePath) {
  throw new Error('Pass the Scalaris HTML path as the first argument.');
}

const html = fs.readFileSync(sourcePath, 'utf8');
const cssMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
const scriptMatch = html.match(/<script>\s*([\s\S]*?)<\/script>/i);

if (!cssMatch || !scriptMatch) {
  throw new Error('Could not find the inline prototype CSS and JavaScript.');
}

const rawScript = scriptMatch[1];
const sourceStart = rawScript.indexOf('const { useState } = React;');
const sourceEnd = rawScript.indexOf('ReactDOM.createRoot');

if (sourceStart < 0 || sourceEnd < 0) {
  throw new Error('Could not identify the prototype source boundaries.');
}

const source = rawScript
  .slice(sourceStart, sourceEnd)
  .trim()
  .replace(
    'const { useState } = React;',
    'import React, { useState } from "react";\nimport "./scalaris-prototype.css";',
  )
  .replace('function App() {', 'export default function ScalarisPrototype() {')
  .replace(
    /React\.createElement\("img", \{ src: "data:image\/png;base64,[^"]+", alt: "Beacon" \}\)/,
    'React.createElement("span", { className: "beacon-glyph", "aria-hidden": "true" }, "B")',
  );

fs.writeFileSync('src/prototype/ScalarisPrototype.jsx', `${source}\n`, 'utf8');
fs.writeFileSync(
  'src/prototype/scalaris-prototype.css',
  `/* Styles sourced from the supplied Scalaris HTML mock. */\n${cssMatch[1].trim()}\n.beacon-glyph{display:grid;place-items:center;width:100%;height:100%;border-radius:50%;background:radial-gradient(circle at 35% 30%,#79eaff,#1d4470 58%,#07111f 100%);color:#edf7ff;font-weight:900;font-size:24px}\n`,
  'utf8',
);

console.log(`Extracted ${source.length} characters of React and ${cssMatch[1].trim().length} characters of CSS.`);
