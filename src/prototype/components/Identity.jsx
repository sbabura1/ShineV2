import React from "react";
import AssessmentIndicators from "./AssessmentIndicators";
import { sectors } from "../data";

export default function Identity({ identity, setIdentity, onContinue, preAssessmentComplete, postAssessmentComplete, projectAssessmentComplete, allSectorsComplete, completedCount, onPostAssessment }) {
    return React.createElement("main", { className: "page" },
        React.createElement("div", { className: "section-title" },
            React.createElement("div", null,
                React.createElement("h2", null, "Build Your Nexus Identity"),
                React.createElement("p", null, "Who will you become in Scalaris?"))),
        React.createElement("div", { className: "grid cols-3" },
            React.createElement("div", { className: "card" },
                React.createElement("div", { className: "eyebrow" }, "Avatar"),
                React.createElement("div", { style: { fontSize: 88, textAlign: "center", padding: "20px 0" } }, identity.avatar),
                React.createElement("div", { className: "avatar-choice" }, ["🧑🏽‍🚀", "👩🏻‍💼", "🧑🏿‍🔬", "👨🏼‍💻", "👩🏽‍⚕️", "🧑🏻‍🚒"].map(a => React.createElement("button", { key: a, className: identity.avatar === a ? "active" : "", onClick: () => setIdentity({ ...identity, avatar: a }) }, a)))),
            React.createElement("div", { className: "card", style: { gridColumn: "span 2" } },
                React.createElement("div", { className: "form-row" },
                    React.createElement("div", null,
                        React.createElement("label", null, "Identity Name"),
                        React.createElement("input", { value: identity.name, onChange: e => setIdentity({ ...identity, name: e.target.value }) })),
                    React.createElement("div", null,
                        React.createElement("label", null, React.createElement("span", { className: "faculty-link" }, "Faculty Name")),
                        React.createElement("select", { value: identity.faculty, onChange: e => setIdentity({ ...identity, faculty: e.target.value }) },
                            React.createElement("option", null, "Dr. Maya Chen"),
                            React.createElement("option", null, "Prof. Elena Ruiz"),
                            React.createElement("option", null, "Dr. Marcus Reed"),
                            React.createElement("option", null, "Faculty Not Listed"))),
                    React.createElement("div", null,
                        React.createElement("label", null, "Starting Sector"),
                        React.createElement("select", { value: identity.sector, onChange: e => {
                                const s = sectors.find(x => x.id === e.target.value);
                                setIdentity({ ...identity, sector: e.target.value, role: s.roles.split(" • ")[0] });
                            } }, sectors.map(s => React.createElement("option", { key: s.id, value: s.id },
                            s.name,
                            " \u2014 ",
                            s.label)))),
                    React.createElement("div", null,
                        React.createElement("label", null, "Starting Role"),
                        React.createElement("input", { value: identity.role, onChange: e => setIdentity({ ...identity, role: e.target.value }) }))),
                React.createElement("div", { className: "callout", style: { marginTop: 18 } },
                    React.createElement("b", null, "Identity is more than appearance."),
                    React.createElement("br", null),
                    "Your rank, sector clearance, Beacon Trust, data clearance, and mission authority grow as you demonstrate quantitative reasoning."),
                React.createElement(AssessmentIndicators, { preAssessmentComplete, postAssessmentComplete, projectAssessmentComplete, allSectorsComplete, completedCount, totalSectors: sectors.length, onPostAssessment }),
                React.createElement("div", { className: "cta-row", style: { justifyContent: "flex-start" } },
                    React.createElement("button", { className: "btn", onClick: onContinue }, "CONTINUE TO THE NEXUS \u2192")))));
}
