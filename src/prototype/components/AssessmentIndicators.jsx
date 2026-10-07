import React from 'react';

export default function AssessmentIndicators({preAssessmentComplete,preAssessmentSkipped,postAssessmentComplete,projectAssessmentComplete,allSectorsComplete,completedCount,totalSectors,onPostAssessment}) {
    const postReady = allSectorsComplete && !postAssessmentComplete;
    return React.createElement("div",{className:"assessment-indicators"},
        React.createElement("div",{className:"assessment-indicator "+(preAssessmentComplete?"complete":"ready")},
            React.createElement("div",{className:"indicator-top"},React.createElement("strong",null,"Pre-Assessment"),React.createElement("span",{className:"indicator-status"},preAssessmentSkipped?"Skipped":preAssessmentComplete?"Complete":"Optional")),
            React.createElement("div",{className:"indicator-detail"},preAssessmentSkipped?"Available anytime from the Nexus.":preAssessmentComplete?"Baseline assessment completed.":"Take it now or explore Sectors first.")),
        React.createElement("div",{className:"assessment-indicator "+(postAssessmentComplete?"complete":postReady?"ready":"locked"),onClick:postReady&&onPostAssessment?onPostAssessment:undefined,style:{cursor:postReady&&onPostAssessment?"pointer":"default"}},
            React.createElement("div",{className:"indicator-top"},React.createElement("strong",null,"Post-Assessment"),React.createElement("span",{className:"indicator-status"},postAssessmentComplete?"Complete":postReady?"Ready":"Locked")),
            React.createElement("div",{className:"indicator-detail"},postAssessmentComplete?"Post-assessment completed.":postReady?"All Sectors complete — open assessment.":(completedCount||0)+" of "+(totalSectors||0)+" Sectors completed.")),
        React.createElement("div",{className:"assessment-indicator "+(projectAssessmentComplete?"complete":"locked")},
            React.createElement("div",{className:"indicator-top"},React.createElement("strong",null,"Project Assessment"),React.createElement("span",{className:"indicator-status"},projectAssessmentComplete?"Complete":"Not Yet Complete")),
            React.createElement("div",{className:"indicator-detail"},projectAssessmentComplete?"Project assessment completed.":"Project assessment status will appear here."))
    );
}
