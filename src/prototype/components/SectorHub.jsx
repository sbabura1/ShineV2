import React from "react";
import { sectorQRSkills } from "../data";

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
                React.createElement("span", { className: "tag" }, "Data Lab Required")),
            React.createElement("div", { className: "sector-skill-box" },
                React.createElement("div", { className: "eyebrow" }, "Quantitative Reasoning Skills in This Sector"),
                React.createElement("div", { className: "sector-skill-list" }, skills.map(x => React.createElement("span", { className: "sector-skill", key: x }, x))),
                React.createElement("button", { className: "btn sprint-launch", onClick: onSprint }, "SHINE SPRINT SKILLS CHECKUP →"))),
        React.createElement("div", { className: "section-title", style: { marginTop: 24 } }, React.createElement("div", null,
            React.createElement("h2", null, "Available Missions"), React.createElement("p", null, "Select a challenge level for each mission."))),
        React.createElement("div", { className: "grid cols-3" }, [
          ["Mission 01 • Active","The West District Spike","A dramatic change appears in recent incident reports. Determine whether the pattern is real and advise command staff."],
          ["Mission 02","Response Time Divide","Investigate why some neighborhoods wait longer for emergency response."],
          ["Mission 03","The Mayor's Claim","Two leaders cite different statistics. Determine whether either claim is misleading."]
        ].map((m,i)=>React.createElement("div", {className:"card"+(i?" locked":""),key:m[1]},
          React.createElement("div",{className:"eyebrow"},m[0]),React.createElement("h3",null,m[1]),React.createElement("p",{style:{color:"var(--muted)"}},m[2]),
          i===0 && React.createElement(React.Fragment,null,
            React.createElement("label",{style:{marginTop:14}},"Mission Skill Level"),
            React.createElement("select",{value:missionLevel,onChange:e=>setMissionLevel(e.target.value)},["Beginning","Intermediate","Advanced"].map(x=>React.createElement("option",{key:x},x))),
            React.createElement("button",{className:"btn",style:{marginTop:14},onClick:onMission},"START MISSION"))))));
}
