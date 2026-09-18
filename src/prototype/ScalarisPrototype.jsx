import React, { useState } from "react";
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
import Worldview from "./components/Worldview";

export default function ScalarisPrototype() {
    const [screen, setScreen] = useState("landing");
    const [identity, setIdentity] = useState({ name: "Jordan Vega", avatar: "🧑🏽‍🚀", faculty: "Dr. Maya Chen", sector: "sentinel", role: "Crime Analyst" });
    const [missionLevel, setMissionLevel] = useState("Beginning");
    const [beaconOpen, setBeaconOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [anomalies, setAnomalies] = useState([]);
    const [toast, setToast] = useState("");
    const [preAssessmentComplete, setPreAssessmentComplete] = useState(false);
    const [preAssessmentResult, setPreAssessmentResult] = useState(null);
    const [completedSectors, setCompletedSectors] = useState([]);
    const [postAssessmentComplete, setPostAssessmentComplete] = useState(false);
    const [projectAssessmentComplete, setProjectAssessmentComplete] = useState(false);
    const sector = sectors.find(s => s.id === identity.sector) || sectors[0];
    const go = s => { setScreen(s); window.scrollTo({ top: 0, behavior: "smooth" }); };
    const notify = msg => { setToast(msg); setTimeout(() => setToast(""), 2200); };
    if (screen === "landing")
        return React.createElement("div", { className: "app" },
            React.createElement("div", { className: "hero" },
                React.createElement("div", { className: "hero-inner" },
                    React.createElement("div", { className: "eyebrow" }, "Quantitative Reasoning Simulation World"),
                    React.createElement("h1", null, "SCALARIS"),
                    React.createElement("div", { className: "nexus-word" }, "THE NEXUS"),
                    React.createElement("p", { className: "tagline" }, "Enter a world where data shapes decisions. Build an identity, explore professional sectors, investigate messy data, apply quantitative reasoning, and make the call."),
                    React.createElement("div", { className: "cta-row" },
                        React.createElement("button", { className: "btn", onClick: () => go("identity") }, "ENTER THE NEXUS \u2192"),
                        React.createElement("button", { className: "btn secondary", onClick: () => go("worldview") }, "VIEW WORLD MODEL")))));
    return React.createElement("div", { className: "app" },
        React.createElement(Topbar, { identity: identity, onHome: () => go("nexus") }),
        screen === "worldview" && React.createElement(Worldview, { onEnter: () => go("identity") }),
        screen === "identity" && React.createElement(Identity, { identity: identity, setIdentity: setIdentity, onContinue: () => go("nexus"), preAssessmentComplete, postAssessmentComplete, projectAssessmentComplete, allSectorsComplete: completedSectors.length === sectors.length, completedCount: completedSectors.length, onPostAssessment: () => { if (completedSectors.length === sectors.length) go("postassessment"); } }),
        screen === "preassessment" && React.createElement(PreAssessment, { identity: identity, onExit: () => go("nexus"), onComplete: (result) => { setPreAssessmentResult(result); setPreAssessmentComplete(true); go("nexus"); notify("Pre-assessment complete. All Sectors are now unlocked."); } }),
        screen === "postassessment" && React.createElement(PostAssessment, { identity, completedSectors, onBack: () => go("nexus"), onComplete: () => { setPostAssessmentComplete(true); go("nexus"); notify("Post-assessment marked complete."); } }),
        screen === "nexus" && React.createElement(Nexus, { identity: identity, preAssessmentComplete: preAssessmentComplete, preAssessmentResult: preAssessmentResult, completedSectors, postAssessmentComplete, projectAssessmentComplete, onPostAssessment: () => { if (completedSectors.length === sectors.length) go("postassessment"); }, onPreAssessment: () => go("preassessment"), onSector: (id) => {
                if (!preAssessmentComplete) { go("preassessment"); return; }
                const s = sectors.find(x => x.id === id);
                setIdentity({ ...identity, sector: id, role: s.roles.split(" • ")[0] });
                go("sector");
            }, onMission: () => { if (!preAssessmentComplete) { go("preassessment"); return; } setStep(0); go("mission"); } }),
        screen === "sector" && React.createElement(SectorHub, { sector: sector, identity: identity, missionLevel: missionLevel, setMissionLevel: setMissionLevel, onBack: () => go("nexus"), onMission: () => { setStep(0); go("mission"); }, onSprint: () => go("sprint") }),
        screen === "sprint" && React.createElement(ShineSprint, {
            sector: sector,
            onBack: () => go("sector")
        }),
        screen === "mission" && React.createElement(Mission, { sector: sector, identity: identity, missionLevel: missionLevel, step: step, setStep: setStep, anomalies: anomalies, setAnomalies: setAnomalies, selectedAnswer: selectedAnswer, setSelectedAnswer: setSelectedAnswer, notify: notify, onFinish: () => { setCompletedSectors(prev => prev.includes(identity.sector) ? prev : [...prev, identity.sector]); go("profile"); } }),
        screen === "profile" && React.createElement(Profile, { identity: identity, onNexus: () => go("nexus"), onReplay: () => { setStep(0); setAnomalies([]); setSelectedAnswer(null); go("mission"); }, preAssessmentComplete, postAssessmentComplete, projectAssessmentComplete, completedSectors, onPostAssessment: () => { if (completedSectors.length === sectors.length) go("postassessment"); } }),
        beaconOpen && React.createElement("div", { className: "beacon-panel" },
            React.createElement("h3", null, "Beacon AI"),
            React.createElement("p", null, "Ask for a hint, challenge your reasoning, clarify a quantitative concept, or check the evidence you are using. Beacon will coach without making the decision for you."),
            React.createElement("button", { className: "btn secondary", style: { marginTop: 12 }, onClick: () => setBeaconOpen(false) }, "CLOSE")),
        React.createElement("button", { className: "beacon-fab", title: "Open Beacon AI", "aria-label": "Open Beacon AI", onClick: () => setBeaconOpen(!beaconOpen) },
            React.createElement("span", { className: "beacon-glyph", "aria-hidden": "true" }, "B")),
        toast && React.createElement("div", { className: "toast", style: { bottom: 105 } }, toast));
}
