import fs from 'node:fs';
import path from 'node:path';

const sourcePath = process.argv[2];
if (!sourcePath) throw new Error('Pass the Scalaris HTML file path.');

const root = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(sourcePath, 'utf8');
const styles = [...html.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/gi)];
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
if (styles.length !== 1 || scripts.length < 3) throw new Error('Unexpected Scalaris HTML structure.');

const source = scripts.at(-1)[1];
const prototypeRoot = path.join(root, 'src', 'prototype');
const componentsRoot = path.join(prototypeRoot, 'components');
const assetsRoot = path.join(prototypeRoot, 'assets');
fs.mkdirSync(componentsRoot, { recursive: true });
fs.mkdirSync(assetsRoot, { recursive: true });

fs.writeFileSync(path.join(prototypeRoot, 'scalaris-prototype.css'), `${styles[0][1].trim()}\n`);

for (const [name, fileName] of [['BEACON_IMAGE', 'beacon.png'], ['PACE_CHECK_IMAGE', 'pace-check.png']]) {
  const match = source.match(new RegExp(`const ${name}='data:image\\/png;base64,([^']+)';`));
  if (!match) throw new Error(`Could not extract ${name}.`);
  fs.writeFileSync(path.join(assetsRoot, fileName), Buffer.from(match[1], 'base64'));
}

function between(start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  if (startIndex < 0 || endIndex < 0) throw new Error(`Missing source marker: ${start} -> ${end}`);
  return source.slice(startIndex, endIndex).trim();
}

const exportedData = [
  'sectors', 'sectorQRFramework', 'sectorQRSkills', 'sprintSkillBank',
  'sprintApplicationBank', 'crimeData', 'missionSteps', 'preAttitudeStatements',
  'preCognitiveQuestions', 'majors',
];
let dataSource = between('const sectors =', 'function AssessmentVisual');
for (const name of exportedData) {
  dataSource = dataSource.replace(new RegExp(`(^|\\n)const ${name}\\s*=`, 'm'), `$1export const ${name} =`);
}
fs.writeFileSync(path.join(prototypeRoot, 'data.js'), `${dataSource}\n`);

const componentSpecs = [
  ['AssessmentVisual', 'function AssessmentVisual', 'function PreAssessment', `import React from 'react';\n`],
  ['PreAssessment', 'function PreAssessment', 'function App', `import React, { useState } from 'react';\nimport AssessmentVisual from './AssessmentVisual';\nimport { majors, preAttitudeStatements, preCognitiveQuestions } from '../data';\n`],
  ['Topbar', 'function Topbar', 'function Worldview', `import React from 'react';\n`],
  ['Worldview', 'function Worldview', 'function AssessmentIndicators', `import React from 'react';\n`],
  ['AssessmentIndicators', 'function AssessmentIndicators', 'function PostAssessment', `import React from 'react';\n`],
  ['PostAssessment', 'function PostAssessment', 'function Identity', `import React from 'react';\nimport AssessmentIndicators from './AssessmentIndicators';\n`],
  ['Identity', 'function Identity', 'function Nexus', `import React from 'react';\nimport AssessmentIndicators from './AssessmentIndicators';\nimport { sectors } from '../data';\n`],
  ['Nexus', 'function Nexus', 'function SectorHub', `import React from 'react';\nimport AssessmentIndicators from './AssessmentIndicators';\nimport { sectors } from '../data';\n`],
  ['SectorHub', 'function SectorHub', 'function makeSprintQuestions', `import React from 'react';\nimport { sectorQRSkills } from '../data';\n`],
  ['ShineSprint', 'function makeSprintQuestions', 'function Mission', `import React, { useState } from 'react';\nimport { sectorQRSkills, sprintApplicationBank, sprintSkillBank } from '../data';\n`],
];

for (const [name, start, end, imports] of componentSpecs) {
  let body = between(start, end);
  body = body.replace(new RegExp(`function ${name}\\s*\\(`), `export default function ${name}(`);
  fs.writeFileSync(path.join(componentsRoot, `${name}.jsx`), `${imports}\n${body}\n`);
}

let beaconSource = between('const h=React.createElement;', 'ReactDOM.createRoot');
beaconSource = beaconSource
  .replace('function BeaconSectorMission(', 'export function BeaconSectorMission(')
  .replace('function BeaconSectorProfile(', 'export function BeaconSectorProfile(');
const beaconImports = `import React, { useState } from 'react';
import { missionSteps, sectorQRSkills } from '../data';
import { useSavedState } from '../utils/useSavedState';
import BEACON_IMAGE from '../assets/beacon.png';
import PACE_CHECK_IMAGE from '../assets/pace-check.png';
`;
fs.writeFileSync(path.join(componentsRoot, 'BeaconMission.jsx'), `${beaconImports}\n${beaconSource}\n`);

console.log('Imported Scalaris authored styles, data, screens, and image assets.');
