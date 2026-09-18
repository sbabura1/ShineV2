import React from "react";

export default function Worldview({ onEnter }) {
    return React.createElement("main", { className: "page" },
        React.createElement("div", { className: "section-title" },
            React.createElement("div", null,
                React.createElement("h2", null, "Scalaris World Model"),
                React.createElement("p", null, "The learning architecture behind the simulation."))),
        React.createElement("div", { className: "grid cols-3" }, [
            ["🪐", "Scalaris", "The world where students experience quantitative reasoning through authentic professional contexts."],
            ["◎", "The Nexus", "The central hub where students build identity, choose sectors, see progress, and access missions."],
            ["☀️", "Beacon", "The AI guide that coaches and challenges without making decisions for the student."],
            ["🧑‍🚀", "Identity", "A persistent professional avatar that grows through demonstrated reasoning and responsibility."],
            ["📊", "Data Lab", "Every mission starts with data quality, anomalies, missing information, and pattern detection."],
            ["🎯", "Missions", "Connected problems requiring multiple quantitative reasoning skills and a consequential decision."]
        ].map(([i, h, p]) => React.createElement("div", { className: "card", key: h },
            React.createElement("div", { style: { fontSize: 32 } }, i),
            React.createElement("h3", null, h),
            React.createElement("p", { style: { color: "var(--muted)", lineHeight: 1.55 } }, p)))),
        React.createElement("div", { className: "card", style: { marginTop: 18 } },
            React.createElement("div", { className: "eyebrow" }, "The Scalaris Experience"),
            React.createElement("h2", { style: { margin: "8px 0 10px" } }, "Inspect \u2192 Question \u2192 Analyze \u2192 Solve \u2192 Explain"),
            React.createElement("p", { style: { color: "var(--muted)", maxWidth: 900 } }, "Students progress from solving calculations, to solving sector problems, to completing Nexus Missions that integrate evidence across multiple sectors."),
            React.createElement("button", { className: "btn", onClick: onEnter }, "BUILD MY IDENTITY \u2192")));
}
