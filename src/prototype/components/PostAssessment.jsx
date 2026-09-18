import React from "react";
import { sectors } from "../data";

export default function PostAssessment({identity,completedSectors,onBack,onComplete}) {
    return React.createElement("main",{className:"page"},
        React.createElement("div",{className:"postassess-card"},
            React.createElement("button",{className:"btn secondary",onClick:onBack},"← RETURN TO THE NEXUS"),
            React.createElement("div",{className:"card",style:{marginTop:16,padding:26}},
                React.createElement("div",{className:"eyebrow"},"Unlocked · 14 of 14 Sectors Complete"),
                React.createElement("h2",{style:{fontSize:38,margin:"7px 0"}},"Scalaris Post-Assessment"),
                React.createElement("p",{style:{color:"var(--muted)",fontSize:15,lineHeight:1.6}},identity.name,", you have completed the full Scalaris Sector sequence. The Post-Assessment is now available."),
                React.createElement("div",{className:"callout",style:{marginTop:18}},React.createElement("strong",null,"Post-Assessment access rule"),React.createElement("div",{style:{marginTop:5,color:"var(--muted)",fontSize:13}},"This assessment remains inaccessible until every Scalaris Sector has been completed. The current prototype records a Sector as complete when its mission is finished.")),
                React.createElement("div",{className:"sector-completion-grid"},sectors.map(s=>React.createElement("div",{key:s.id,className:"sector-completion-item "+(completedSectors.includes(s.id)?"done":"")},React.createElement("span",null,s.icon," ",s.name),React.createElement("span",null,completedSectors.includes(s.id)?"✓ Complete":"Locked")))),
                React.createElement("div",{className:"cta-row",style:{justifyContent:"flex-start",marginTop:22}},React.createElement("button",{className:"btn gold",onClick:onComplete},"MARK POST-ASSESSMENT COMPLETE"),React.createElement("span",{style:{color:"var(--muted)",fontSize:12,alignSelf:"center"}},"Prototype completion control; assessment instrument can be inserted here.")))
        )
    );
}
