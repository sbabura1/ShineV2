import React from 'react';
import { sectorQRFramework, sectorQRSkills } from '../data';

const vitalisMissions = [
    { number: "01", title: "Clinic Capacity Signal", description: "Compare appointments, provider-days, and wait times to identify a defensible staffing signal.", data: "Appointments · Provider-days · Wait times", active: true },
    { number: "02", title: "Emergency Department Flow", description: "Investigate how arrival patterns and treatment capacity affect emergency-department waits.", data: "Hourly arrivals · Capacity · Wait percentiles" },
    { number: "03", title: "Community Health Trends", description: "Compare population rates over time and separate meaningful trends from changes in group size.", data: "Population counts · Rates · Time series" },
    { number: "04", title: "Resource Allocation", description: "Balance staffing hours, patient needs, and a limited operating budget across clinic locations.", data: "Staffing hours · Acuity · Budget" },
    { number: "05", title: "Screening and Risk", description: "Interpret screening results while accounting for false positives, base rates, and uncertainty.", data: "Screening results · Base rates · Risk" },
    { number: "06", title: "Program Evaluation", description: "Evaluate whether a health program improved outcomes using baseline and comparison-group evidence.", data: "Baseline · Follow-up · Comparison groups" }
];

export default function SectorHub({ sector, identity, missionLevel, setMissionLevel, onBack, onMission, onSprint }) {
    const skills = sectorQRSkills[sector.id] || [];
    return React.createElement("main", { className: "page" },
        React.createElement("button", { className: "btn secondary", onClick: onBack }, "← BACK TO NEXUS"),
        React.createElement("div", { className: "card", style: { marginTop: 16, padding: 26 } },
            React.createElement("div", { style: { fontSize: 42 } }, sector.icon),
            React.createElement("div", { className: "eyebrow" }, sector.name, " Sector"),
            React.createElement("h2", { style: { fontSize: 40, margin: "6px 0" } }, sector.label),
            React.createElement("p", { style: { maxWidth: 850, color: "var(--muted)", fontSize: 16 } }, sector.desc),
            React.createElement("div", { className: "mission-meta" },
                React.createElement("span", { className: "tag" }, identity.role),
                React.createElement("span", { className: "tag" }, "Workforce: " + sectorQRFramework[sector.id].workforce)),
            React.createElement("div", { className: "sector-skill-box" },
                React.createElement("div", { className: "eyebrow" }, "Quantitative Reasoning Skills in This Sector"),
                Object.entries(sectorQRFramework[sector.id].groups).map(([category,items]) => React.createElement("section", {className:"qr-category",key:category}, React.createElement("h3",null,category),React.createElement("div", { className: "sector-skill-list" }, items.map(x => React.createElement("span", { className: "sector-skill", key: x }, x))))),
                React.createElement("button", { className: "btn sprint-launch", onClick: onSprint }, "SHINE SPRINT SKILLS CHECKUP →"))),
        React.createElement("div", { className: "section-title", style: { marginTop: 24 } }, React.createElement("div", null,
            React.createElement("h2", null, "Vitalis Missions"), React.createElement("p", null, "Mission 01 is available now. The remaining health-data missions are prepared for future release."))),
        React.createElement("div", { className: "mission-card-grid" }, vitalisMissions.map((mission)=>React.createElement("article", {className:"card sector-mission-card"+(mission.active?" active":" locked"),key:mission.number},
          React.createElement("div",{className:"mission-card-top"},React.createElement("div",{className:"eyebrow"},"Mission "+mission.number),React.createElement("span",{className:"tag"},mission.active?"ACTIVE":"LOCKED")),
          React.createElement("h3",null,mission.title),
          React.createElement("p",{className:"mission-card-description"},mission.description),
          React.createElement("div",{className:"mission-data-label"},"DATA FOCUS"),
          React.createElement("p",{className:"mission-data-copy"},mission.data),
          mission.active && React.createElement(React.Fragment,null,
            React.createElement("label",{style:{marginTop:14}},"Mission Skill Level"),
            React.createElement("select",{value:missionLevel,onChange:e=>setMissionLevel(e.target.value)},["Beginning","Intermediate","Advanced"].map(x=>React.createElement("option",{key:x},x))),
            React.createElement("button",{className:"btn",style:{marginTop:14},onClick:onMission},"START MISSION 01 →")),
          !mission.active && React.createElement("button",{className:"btn secondary",type:"button",disabled:true},"COMING SOON")))));
}
