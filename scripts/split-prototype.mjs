import fs from 'node:fs';

const sourcePath = 'src/prototype/ScalarisPrototype.jsx';
const source = fs.readFileSync(sourcePath, 'utf8');
const componentsDir = 'src/prototype/components';

fs.mkdirSync(componentsDir, { recursive: true });

function between(start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = end ? source.indexOf(end, startIndex) : source.length;
  if (startIndex < 0 || endIndex < 0) throw new Error(`Missing source boundary: ${start} -> ${end}`);
  return source.slice(startIndex, endIndex).trim();
}

function component(name, imports, start, end, exportName = name) {
  const body = between(start, end).replace(
    `function ${exportName}(`,
    `export default function ${exportName}(`,
  );
  fs.writeFileSync(`${componentsDir}/${name}.jsx`, `${imports}\n\n${body}\n`, 'utf8');
}

const data = between('const sectors = [', 'function AssessmentVisual');
fs.writeFileSync(
  'src/prototype/data.js',
  `${data}\n\nexport { sectors, sectorQRSkills, crimeData, missionSteps, preAttitudeStatements, preCognitiveQuestions, majors };\n`,
  'utf8',
);

component('AssessmentVisual', 'import React from "react";', 'function AssessmentVisual', 'function PreAssessment');
component(
  'PreAssessment',
  'import React, { useState } from "react";\nimport AssessmentVisual from "./AssessmentVisual";\nimport { majors, preAttitudeStatements, preCognitiveQuestions } from "../data";',
  'function PreAssessment',
  'export default function ScalarisPrototype',
);
component('Topbar', 'import React from "react";', 'function Topbar', 'function Worldview');
component('Worldview', 'import React from "react";', 'function Worldview', 'function AssessmentIndicators');
component('AssessmentIndicators', 'import React from "react";', 'function AssessmentIndicators', 'function PostAssessment');
component(
  'PostAssessment',
  'import React from "react";\nimport { sectors } from "../data";',
  'function PostAssessment',
  'function Identity',
);
component(
  'Identity',
  'import React from "react";\nimport AssessmentIndicators from "./AssessmentIndicators";\nimport { sectors } from "../data";',
  'function Identity',
  'function Nexus',
);
component(
  'Nexus',
  'import React from "react";\nimport AssessmentIndicators from "./AssessmentIndicators";\nimport { sectors } from "../data";',
  'function Nexus',
  'function SectorHub',
);
component(
  'SectorHub',
  'import React from "react";\nimport { sectorQRSkills } from "../data";',
  'function SectorHub',
  'function makeSprintQuestions',
);
component(
  'ShineSprint',
  'import React from "react";\nimport { sectorQRSkills } from "../data";',
  'function makeSprintQuestions',
  'function Mission',
  'ShineSprint',
);
component(
  'Mission',
  'import React from "react";\nimport CrimeTable from "./CrimeTable";\nimport { missionSteps } from "../data";',
  'function Mission',
  'function CrimeTable',
);
component(
  'CrimeTable',
  'import React from "react";\nimport { crimeData } from "../data";',
  'function CrimeTable',
  'function Profile',
);
component(
  'Profile',
  'import React from "react";\nimport AssessmentIndicators from "./AssessmentIndicators";',
  'function Profile',
  null,
);

const app = between('export default function ScalarisPrototype', 'function Topbar');
const appImports = `import React, { useState } from "react";
import "./scalaris-prototype.css";
import { sectors } from "./data";
import AssessmentIndicators from "./components/AssessmentIndicators";
import Identity from "./components/Identity";
import Mission from "./components/Mission";
import Nexus from "./components/Nexus";
import PostAssessment from "./components/PostAssessment";
import PreAssessment from "./components/PreAssessment";
import Profile from "./components/Profile";
import SectorHub from "./components/SectorHub";
import ShineSprint from "./components/ShineSprint";
import Topbar from "./components/Topbar";
import Worldview from "./components/Worldview";`;

fs.writeFileSync(sourcePath, `${appImports}\n\n${app}\n`, 'utf8');
console.log('Split the Scalaris prototype into data and 12 feature components.');
