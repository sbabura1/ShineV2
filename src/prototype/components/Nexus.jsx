import React from 'react';
import AssessmentIndicators from './AssessmentIndicators';
import { sectors } from '../data';

export default function Nexus({ identity, onSector, onMission, preAssessmentComplete, preAssessmentSkipped, preAssessmentResult, onPreAssessment, onSkipPreAssessment, completedSectors, postAssessmentComplete, projectAssessmentComplete, onPostAssessment }) {
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
                    ? (preAssessmentSkipped ? "You can explore Vitalis now and take the assessment later." : "Baseline saved · Skills level: " + preAssessmentResult.band + " (" + preAssessmentResult.pct + "%)")
                    : "Take the baseline assessment now, or skip it and begin exploring Vitalis.")),
            React.createElement("div", { className: "cta-row" },
                React.createElement("button", { className: preAssessmentComplete ? "btn secondary" : "btn gold", onClick: onPreAssessment },
                    preAssessmentComplete ? (preAssessmentSkipped ? "TAKE PRE-ASSESSMENT" : "RETAKE PRE-ASSESSMENT") : "BEGIN PRE-ASSESSMENT →"),
                !preAssessmentComplete && React.createElement("button", { className: "btn secondary", onClick: onSkipPreAssessment }, "SKIP PRE-ASSESSMENT"))),
        React.createElement(AssessmentIndicators, { preAssessmentComplete, preAssessmentSkipped, postAssessmentComplete, projectAssessmentComplete, allSectorsComplete, completedCount: completedSectors.length, totalSectors: sectors.length, onPostAssessment }),
        React.createElement("div", { className: "section-title", style: { marginTop: 22 } },
            React.createElement("div", null,
                React.createElement("div", { className: "eyebrow" }, "Central Hub"),
                React.createElement("h2", null, "Welcome to The Nexus"),
                React.createElement("p", null, "Explore Scalaris as a connected network of quantitative reasoning contexts.")),
            React.createElement("button", { className: "btn gold", onClick: onMission }, "CONTINUE ACTIVE MISSION")),
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
                React.createElement("div", { className: "nexus-core" },
                    React.createElement("div", null,
                        React.createElement("strong", null, "THE NEXUS"),
                        React.createElement("span", { style: { fontSize: 10, color: "#dff8ff", letterSpacing: ".08em" } }, "CENTRAL HUB"))),
                networkNodes.map(([id, x, y]) => {
                    const s = sectors.find(t => t.id === id);
                    const isOpen = id === "vitalis";
                    return React.createElement("button", {
                        key: id,
                        title: isOpen ? `${s.name}: ${s.label}` : `${s.name}: coming soon`,
                        className: "sector-node " + (isOpen ? "open" : "locked"),
                        style: { left: `${x}%`, top: `${y}%` },
                        onClick: isOpen ? () => onSector(id) : undefined,
                        disabled: !isOpen,
                        "aria-disabled": !isOpen
                    },
                        React.createElement("span", { className: "node-icon" }, s.icon),
                        React.createElement("span", { className: "node-name" }, s.name),
                        React.createElement("span", { className: "node-status" }, isOpen ? (completedSectors.includes(id) ? "Complete" : "Open") : "Coming soon")
                    );
                }),
                React.createElement("div", { className: "network-legend" },
                    React.createElement("span", { className: "tag" }, "SOLID = Nexus connection"),
                    React.createElement("span", { className: "tag" }, "DASHED = Cross-sector relationship"))),
            React.createElement("div", { className: "side-stack" },
                React.createElement("div", { className: "card beacon" },
                    React.createElement("div", { className: "beacon-orb" }, "\u2600\uFE0F"),
                    React.createElement("div", { className: "beacon-copy" },
                        React.createElement("h3", null, "Beacon"),
                        React.createElement("p", null,
                            "\u201CWelcome back, ",
                            identity.name.split(" ")[0],
                            ". The network shows how sectors connect. Try a new context or continue your active mission.\u201D"))),
                React.createElement("div", { className: "card" },
                    React.createElement("div", { className: "eyebrow" }, "Identity Snapshot"),
                    React.createElement("h3", null, identity.role),
                    React.createElement("div", { className: "stat-row" },
                        React.createElement("div", { className: "stat" },
                            React.createElement("b", null, "7"),
                            React.createElement("span", null, "NEXUS LEVEL")),
                        React.createElement("div", { className: "stat" },
                            React.createElement("b", null, "620"),
                            React.createElement("span", null, "REPUTATION")),
                        React.createElement("div", { className: "stat" },
                            React.createElement("b", null, "1"),
                            React.createElement("span", null, "SECTORS OPEN"))),
                    React.createElement("div", { style: { marginTop: 15, fontSize: 12, color: "var(--muted)" } }, "Next rank: Senior Analyst"),
                    React.createElement("div", { className: "progress", style: { marginTop: 7 } },
                        React.createElement("div", { style: { width: "68%" } }))),
                React.createElement("div", { className: "card" },
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
                React.createElement("p", null, "Vitalis is available now. Additional sectors will unlock as their missions are completed."))),
        React.createElement("div", { className: "grid cols-4" }, sectors.map((s) => {
            const isOpen = s.id === "vitalis";
            return React.createElement(isOpen ? "button" : "div", { className: "card sector " + (isOpen ? "open" : "locked"), key: s.id, onClick: isOpen ? () => onSector(s.id) : undefined, "aria-disabled": !isOpen },
            React.createElement("div", null,
                React.createElement("div", { className: "sector-icon" }, s.icon),
                React.createElement("h3", null, s.name),
                React.createElement("div", { className: "roles" }, s.roles),
                React.createElement("p", null, s.desc)),
            React.createElement("footer", null,
                React.createElement("span", { className: "tag" }, isOpen ? (completedSectors.includes(s.id) ? "COMPLETE" : "OPEN") : "COMING SOON"),
                isOpen && React.createElement("span", null, "\u2192")));
        })));
}
