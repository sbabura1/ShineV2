import React from 'react';
import { sectorQRFramework } from '../data';
import { sectorMissionConfigs } from './BeaconMission';
import SectorDiscussion from './DiscussionBoard';
import SectorIcon from './SectorIcon';

export default function SectorHub({ sector, identity, viewerRole, missionLevel, setMissionLevel, onBack, onMission, onSprint }) {
    const config = sectorMissionConfigs[sector.id];
    const missions = [
        { number: "01", title: config.title, description: config.intro, data: `${config.numerator} · ${config.denominator} · ${config.outcome}`, active: true },
        { number: "02", title: "Response Time Divide", description: `Investigate why outcomes differ across ${config.unit.toLowerCase()} groups after adjusting for ${config.denominator.toLowerCase()}.`, data: `${config.outcome} · Comparative rates · Context` },
        { number: "03", title: "The Leader's Claim", description: `Evaluate two competing claims about ${sector.label.toLowerCase()} and identify which conclusion the evidence supports.`, data: "Competing statistics · Evidence quality · Uncertainty" }
    ];
    return React.createElement("main", { className: "page" },
        React.createElement("button", { className: "btn secondary", onClick: onBack }, "← Back to Nexus"),
        React.createElement(SectorDiscussion, { key: sector.id, sector, identity, viewerRole }),
        React.createElement("div", { className: "card sector-hero", style: { marginTop: 16, padding: 26 } },
            React.createElement("div", { className: "sector-hero-icon" }, React.createElement(SectorIcon, { sectorId: sector.id, size: 32 })),
            React.createElement("div", { className: "eyebrow" }, sector.name, " Sector"),
            React.createElement("h1", { style: { fontSize: 40, margin: "6px 0" } }, sector.label),
            React.createElement("p", { style: { maxWidth: 850, color: "var(--muted)", fontSize: 16 } }, sector.desc),
            React.createElement("div", { className: "mission-meta" },
                React.createElement("span", { className: "tag" }, identity.role),
                React.createElement("span", { className: "tag" }, "Workforce: " + sectorQRFramework[sector.id].workforce)),
            React.createElement("div", { className: "sector-skill-box" },
                React.createElement("div", { className: "eyebrow" }, "Quantitative Reasoning Skills in This Sector"),
                Object.entries(sectorQRFramework[sector.id].groups).map(([category,items]) => React.createElement("section", {className:"qr-category",key:category}, React.createElement("h3",null,category),React.createElement("div", { className: "sector-skill-list" }, items.map(x => React.createElement("span", { className: "sector-skill", key: x }, x))))),
                React.createElement("button", { className: "btn sprint-launch", onClick: onSprint }, "SHINE Sprint Skills Checkup →"))),
        React.createElement("div", { className: "section-title", style: { marginTop: 24 } }, React.createElement("div", null,
            React.createElement("h2", null, `${sector.name} Missions`), React.createElement("p", null, "Mission 01 uses this sector’s own data, quantitative reasoning skills, questions, and assessment. Additional missions are coming soon."))),
        React.createElement("div", { className: "mission-card-grid" }, missions.map((mission)=>React.createElement("article", {className:"card sector-mission-card"+(mission.active?" active":" locked"),key:mission.number},
          React.createElement("div",{className:"mission-card-top"},React.createElement("div",{className:"eyebrow"},"Mission "+mission.number),React.createElement("span",{className:"tag"},mission.active?"Active":"Locked")),
          React.createElement("h3",null,mission.title),
          React.createElement("p",{className:"mission-card-description"},mission.description),
          React.createElement("div",{className:"mission-data-label"},"DATA FOCUS"),
          React.createElement("p",{className:"mission-data-copy"},mission.data),
          mission.active && React.createElement(React.Fragment,null,
            React.createElement("label",{htmlFor:"mission-skill-level",style:{marginTop:14}},"Mission Skill Level"),
            React.createElement("select",{id:"mission-skill-level",name:"missionSkillLevel",autoComplete:"off",value:missionLevel,onChange:e=>setMissionLevel(e.target.value)},["Beginning","Intermediate","Advanced"].map(x=>React.createElement("option",{key:x},x))),
            React.createElement("button",{className:"btn",style:{marginTop:14},onClick:onMission},"Start Mission 01 →")),
          !mission.active && React.createElement("button",{className:"btn secondary",type:"button",disabled:true},"Coming Soon")))));
}
