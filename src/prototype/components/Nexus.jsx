import React from 'react';
import AssessmentIndicators from './AssessmentIndicators';
import { preCognitiveQuestions, sectorQRFramework, sectors } from '../data';
import { Sparkles } from 'lucide-react';
import SectorIcon from './SectorIcon';

const BASELINE_SKILL_MAP = {
    'frequency tables':[0], 'univariate table interpretation':[0],
    'percentage interpretation and rescaling':[2,12,13], 'row and column percentages':[4,16,17],
    'selecting measures of central tendency':[1], 'graph selection':[5],
    'adding and comparing percentages':[2,6,17], 'table interpretation':[0,10,11,16,17],
    'spreadsheet analysis and pivot tables':[18], 'percent change':[15], 'table selection':[4],
    'graph interpretation':[7,8,9], 'rates and proportions':[2,6,12,16,17], 'rates and ratios':[14],
    'independent and dependent variables':[3], 'correlation interpretation':[19],
    'correlation versus causation':[6,11], 'evidence-based inference':[6,10,11]
};

function sectorBaselineMastery(id, result) {
    const skills = Object.values(sectorQRFramework[id].groups).flat();
    const covered = skills.filter((skill) => BASELINE_SKILL_MAP[skill.toLowerCase()]);
    const indices = [...new Set(covered.flatMap((skill) => BASELINE_SKILL_MAP[skill.toLowerCase()]))];
    if (!result?.cognitive || !indices.length || indices.some((index) => result.cognitive[index] === undefined)) return { pct: null, tone: 'neutral', covered: 0, total: skills.length };
    const correct = indices.filter((index) => result.cognitive[index] === preCognitiveQuestions[index].a).length;
    const raw = correct / indices.length * 100;
    return { pct: Math.round(raw), tone: raw < 50 ? 'red' : raw < 80 ? 'yellow' : 'green', covered: covered.length, total: skills.length, questions: indices.length };
}

function NexusOverview({ onClose }) {
    const steps = [
        ['1. Build your identity', 'Choose your identity, Beacon companion, starting sector, and screen mode. Faculty can manage sector discussion boards here.'],
        ['2. Check your starting point', 'Take the optional three-part pre-assessment. Sector indicators summarize relevant baseline answers.'],
        ['3. Explore a sector', 'Review its workforce connection and quantitative reasoning skills, then complete its SHINE Sprint Skills Checkup.'],
        ['4. Investigate a mission', 'Choose a challenge level, examine data, and make evidence-based decisions. Beacon offers support after each challenge.'],
        ['5. Connect and reflect', 'Discuss results with classmates when Faculty enables the board, assess your reasoning, and reflect on what you learned.'],
        ['6. Return and grow', 'Return to the Nexus and review your mission record. Additional sectors remain clearly marked as coming soon.']
    ];
    return <section className="card nexus-overview" aria-label="Scalaris system overview"><div className="discussion-heading"><div><div className="eyebrow">Nexus Central Hub</div><h2>How Scalaris Works</h2></div><button type="button" className="btn secondary" onClick={onClose}>Close overview</button></div><p>Scalaris connects quantitative reasoning to workforce decisions. The Nexus is your home base for choosing a sector, reviewing progress, and planning your next learning experience.</p><div className="grid cols-3">{steps.map(([title, body]) => <div key={title} className="callout"><h3>{title}</h3><p>{body}</p></div>)}</div><div className="callout" style={{ marginTop: 18 }}><strong>Reading the sector rings</strong><p>Red: below 50%. Yellow: 50% to below 80%. Green: 80% or higher. Gray: not assessed. These are estimated baselines, not certification of every sector skill.</p></div></section>;
}

export default function Nexus({ identity, onSector, onMission, preAssessmentComplete, preAssessmentSkipped, preAssessmentResult, onPreAssessment, onSkipPreAssessment, completedSectors, postAssessmentComplete, projectAssessmentComplete, onPostAssessment }) {
    const [overviewOpen, setOverviewOpen] = React.useState(false);
    const masteryFor = (id) => sectorBaselineMastery(id, preAssessmentSkipped ? null : preAssessmentResult);
    const networkNodes = [
        ["gateway", 15, 16], ["mosaic", 34, 10], ["civitas", 63, 11], ["horizon", 84, 19],
        ["sentinel", 9, 38], ["lumina", 27, 35], ["vitalis", 79, 35], ["terra", 91, 48],
        ["forge", 8, 64], ["transit", 26, 71], ["harvest", 76, 72], ["arena", 91, 70],
        ["venture", 38, 87], ["mercator", 63, 88]
    ];
    const crossLinks = [
        ["gateway","mosaic"], ["mosaic","civitas"], ["civitas","horizon"],
        ["sentinel","lumina"], ["vitalis","terra"], ["terra","harvest"],
        ["forge","transit"], ["transit","venture"], ["venture","mercator"],
        ["harvest","arena"], ["mercator","harvest"]
    ];
    const nodeMap = Object.fromEntries(networkNodes.map(([id,x,y]) => [id,{x,y}]));
    const allSectorsComplete = completedSectors.length === sectors.length;
    return React.createElement("main", { className: "page" },
        React.createElement("div", { className: "preassess-lock-banner " + (preAssessmentComplete ? "complete" : "") },
            React.createElement("div", null,
                React.createElement("strong", null, preAssessmentSkipped ? "Pre-Assessment Skipped" : preAssessmentComplete ? "✓ Nexus Pre-Assessment Complete" : "Optional: Nexus Pre-Assessment"),
                React.createElement("p", null, preAssessmentComplete
                    ? (preAssessmentSkipped ? "You can explore every sector now and take the assessment later." : "Baseline saved · Skills level: " + preAssessmentResult.band + " (" + preAssessmentResult.pct + "%)")
                    : "Take the baseline assessment now, or skip it and begin exploring any sector.")),
            React.createElement("div", { className: "cta-row" },
                React.createElement("button", { className: preAssessmentComplete ? "btn secondary" : "btn gold", onClick: onPreAssessment },
                    preAssessmentComplete ? (preAssessmentSkipped ? "Take Pre-Assessment" : "Retake Pre-Assessment") : "Begin Pre-Assessment →"),
                !preAssessmentComplete && React.createElement("button", { className: "btn secondary", onClick: onSkipPreAssessment }, "Skip Pre-Assessment"))),
        React.createElement(AssessmentIndicators, { preAssessmentComplete, preAssessmentSkipped, postAssessmentComplete, projectAssessmentComplete, allSectorsComplete, completedCount: completedSectors.length, totalSectors: sectors.length, onPostAssessment }),
        React.createElement("div", { className: "section-title", style: { marginTop: 22 } },
            React.createElement("div", null,
                React.createElement("div", { className: "eyebrow" }, "Central Hub"),
                React.createElement("h1", null, "Welcome to The Nexus"),
                React.createElement("p", null, "Explore Scalaris as a connected network of quantitative reasoning contexts.")),
            React.createElement("button", { className: "btn accent", onClick: onMission }, "Continue Active Mission")),
        overviewOpen && React.createElement(NexusOverview, { onClose: () => setOverviewOpen(false) }),
        React.createElement("div", { className: "nexus-layout" },
            React.createElement("div", { className: "card world-map" },
                React.createElement("svg", { className: "constellation-lines", viewBox: "0 0 100 100", preserveAspectRatio: "none", "aria-hidden": "true" },
                    networkNodes.map(([id,x,y]) => React.createElement("line", {
                        key: "core-" + id, className: "network-line", x1: "50", y1: "50", x2: x, y2: y
                    })),
                    crossLinks.map(([a,b]) => React.createElement("line", {
                        key: a + "-" + b, className: "network-line cross",
                        x1: nodeMap[a].x, y1: nodeMap[a].y, x2: nodeMap[b].x, y2: nodeMap[b].y
                    }))),
                React.createElement("button", { type: "button", className: "nexus-core", onClick: () => setOverviewOpen(!overviewOpen), "aria-expanded": overviewOpen, "aria-label": "Open Scalaris system overview" },
                    React.createElement("div", null,
                        React.createElement("strong", null, "THE NEXUS"),
                        React.createElement("span", { className: "nexus-core-label" }, "Central Hub · Overview"))),
                networkNodes.map(([id, x, y]) => {
                    const s = sectors.find(t => t.id === id);
                    const isOpen = true;
                    const mastery = masteryFor(id);
                    return React.createElement("button", {
                        key: id,
                        title: isOpen ? `${s.name}: ${s.label}` : `${s.name}: coming soon`,
                        className: "sector-node " + (isOpen ? `open mastery-${mastery.tone}` : "locked"),
                        style: { left: `${x}%`, top: `${y}%` },
                        onClick: isOpen ? () => onSector(id) : undefined,
                        disabled: !isOpen,
                        "aria-disabled": !isOpen
                    },
                        React.createElement("span", { className: "node-icon" }, React.createElement(SectorIcon, { sectorId: s.id, size: 25 })),
                        React.createElement("span", { className: "node-name" }, s.name),
                        isOpen && React.createElement("span", { className: "node-mastery" }, mastery.pct === null ? "Not assessed" : `${mastery.pct}% mastery`),
                        React.createElement("span", { className: "node-status" }, isOpen ? (completedSectors.includes(id) ? "Complete" : "Baseline estimate") : "Coming soon")
                    );
                }),
                React.createElement("div", { className: "network-legend" },
                    React.createElement("span", { className: "tag" }, "Red <50% · Yellow 50–79% · Green ≥80%"),
                    React.createElement("span", { className: "tag" }, "Gray = not assessed · Baseline estimates"))),
            React.createElement("div", { className: "side-stack" },
                React.createElement("div", { className: "card beacon" },
                    React.createElement("div", { className: "beacon-orb" }, React.createElement(Sparkles, { size: 22, "aria-hidden": "true" })),
                    React.createElement("div", { className: "beacon-copy" },
                        React.createElement("h3", null, "Beacon"),
                        React.createElement("p", null,
                            "\u201CWelcome back, ",
                            identity.name.split(" ")[0],
                            ". The network shows how sectors connect. Try a new context or continue your active mission.\u201D"))),
                React.createElement("div", { className: "card identity-snapshot" },
                    React.createElement("div", { className: "eyebrow" }, "Identity Snapshot"),
                    React.createElement("h3", null, identity.role),
                    React.createElement("div", { className: "stat-row" },
                        React.createElement("div", { className: "stat" },
                            React.createElement("b", null, "7"),
                            React.createElement("span", null, "Nexus level")),
                        React.createElement("div", { className: "stat" },
                            React.createElement("b", null, "620"),
                            React.createElement("span", null, "Reputation")),
                        React.createElement("div", { className: "stat" },
                            React.createElement("b", null, "14"),
                            React.createElement("span", null, "Sectors open"))),
                    React.createElement("div", { style: { marginTop: 15, fontSize: 12, color: "var(--muted)" } }, "Next rank: Senior Analyst"),
                    React.createElement("div", { className: "progress", style: { marginTop: 7 } },
                        React.createElement("div", { style: { width: "68%" } }))),
                React.createElement("div", { className: "card credentials-card" },
                    React.createElement("div", { className: "eyebrow" }, "Unlocked Credentials"),
                    React.createElement("p", null,
                        React.createElement("span", { className: "tag" }, "Signal Finder"),
                        " ",
                        React.createElement("span", { className: "tag" }, "Rate Reasoner"),
                        " ",
                        React.createElement("span", { className: "tag" }, "Evidence Builder")),
                    React.createElement("p", { style: { color: "var(--muted)", fontSize: 12 } }, "Cross-sector credential progress: 2 of 3 required sectors.")))),
        React.createElement("div", { className: "section-title", style: { marginTop: 26 } },
            React.createElement("div", null,
                React.createElement("h2", null, "14 Sectors of Scalaris"),
                React.createElement("p", null, "Every sector has its own workforce context, skills checkup, mission data, and questions."))),
        React.createElement("div", { className: "grid cols-4" }, sectors.map((s) => {
            const isOpen = true;
            return React.createElement(isOpen ? "button" : "div", { className: "card sector " + (isOpen ? "open" : "locked"), key: s.id, onClick: isOpen ? () => onSector(s.id) : undefined, "aria-disabled": !isOpen },
            React.createElement("div", null,
                React.createElement("div", { className: "sector-icon" }, React.createElement(SectorIcon, { sectorId: s.id, size: 26 })),
                React.createElement("h3", null, s.name),
                React.createElement("div", { className: "roles" }, s.roles),
                React.createElement("p", null, s.desc)),
            React.createElement("footer", null,
                React.createElement("span", { className: "tag" }, isOpen ? (completedSectors.includes(s.id) ? "Complete" : "Open") : "Coming soon"),
                isOpen && React.createElement("span", null, "\u2192")));
        })));
}
