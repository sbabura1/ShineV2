import React from 'react';
import AssessmentIndicators from './AssessmentIndicators';
import CharacterBuilder from './CharacterBuilderGenerated';
import { FacultyDiscussionSettings } from './DiscussionBoard';
import { sectors } from '../data';

export default function Identity({ viewerRole, identity, setIdentity, onContinue, preAssessmentComplete, preAssessmentSkipped, postAssessmentComplete, projectAssessmentComplete, allSectorsComplete, completedCount, onPostAssessment }) {
    return React.createElement("main", { className: "page" },
        React.createElement("div", { className: "section-title" },
            React.createElement("div", null,
                React.createElement("h1", null, "Build Your Nexus Identity"),
                React.createElement("p", null, "Who will you become in Scalaris?"))),
        React.createElement("div", { className: "grid cols-3 identity-layout" },
            React.createElement("div", { className: "card identity-avatar-card" },
                React.createElement(CharacterBuilder, { kind: "avatar", identity, setIdentity }),
                React.createElement(CharacterBuilder, { kind: "beacon", identity, setIdentity })),
            React.createElement("div", { className: "card identity-details-card", style: { gridColumn: "span 2" } },
                viewerRole === "faculty" && React.createElement(FacultyDiscussionSettings, null),
                React.createElement("div", { className: "form-row" },
                    React.createElement("div", null,
                        React.createElement("label", { htmlFor: "identity-name" }, "Identity Name"),
                        React.createElement("input", { id: "identity-name", name: "identityName", autoComplete: "name", value: identity.name, onChange: e => setIdentity({ ...identity, name: e.target.value }) })),
                    React.createElement("div", null,
                        React.createElement("label", { htmlFor: "faculty-name" }, React.createElement("span", { className: "faculty-link" }, "Faculty Name")),
                        React.createElement("select", { id: "faculty-name", name: "faculty", autoComplete: "off", value: identity.faculty, onChange: e => setIdentity({ ...identity, faculty: e.target.value }) },
                            React.createElement("option", null, "Dr. Maya Chen"),
                            React.createElement("option", null, "Prof. Elena Ruiz"),
                            React.createElement("option", null, "Dr. Marcus Reed"),
                            React.createElement("option", null, "Faculty Not Listed"))),
                    React.createElement("div", null,
                        React.createElement("label", { htmlFor: "starting-sector" }, "Starting Sector"),
                        React.createElement("select", { id: "starting-sector", name: "startingSector", autoComplete: "off", value: identity.sector, onChange: e => {
                                const s = sectors.find(x => x.id === e.target.value);
                                setIdentity({ ...identity, sector: e.target.value, role: s.roles.split(" • ")[0] });
                            } }, sectors.map(s => React.createElement("option", { key: s.id, value: s.id },
                            s.name,
                            " \u2014 ",
                            s.label)))),
                    React.createElement("div", null,
                        React.createElement("label", { htmlFor: "starting-role" }, "Starting Role"),
                        React.createElement("input", { id: "starting-role", name: "startingRole", autoComplete: "off", value: identity.role, onChange: e => setIdentity({ ...identity, role: e.target.value }) }))),
                React.createElement("div", { className: "callout", style: { marginTop: 18 } },
                    React.createElement("b", null, "Identity is more than appearance."),
                    React.createElement("br", null),
                    "Your rank, sector clearance, Beacon Trust, data clearance, and mission authority grow as you demonstrate quantitative reasoning."),
                React.createElement(AssessmentIndicators, { preAssessmentComplete, preAssessmentSkipped, postAssessmentComplete, projectAssessmentComplete, allSectorsComplete, completedCount, totalSectors: sectors.length, onPostAssessment }),
                React.createElement("div", { className: "cta-row", style: { justifyContent: "flex-start" } },
                    React.createElement("button", { className: "btn", onClick: onContinue }, "Continue to the Nexus →")))));
}
