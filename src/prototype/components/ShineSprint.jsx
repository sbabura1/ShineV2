import React, { useState } from 'react';
import { sectorQRSkills, sprintApplicationBank, sprintSkillBank } from '../data';

function makeSprintQuestions(sector){
 const entry=sectorQRFramework[sector.id];
 return Object.entries(entry.groups).flatMap(([category,skills],groupIndex)=>skills.map((skill,index)=>{
  const item=groupIndex===2?sprintApplicationBank[sector.id][index]:sprintSkillBank[skill.toLowerCase()];
  // Rotate answer positions deterministically so correct choices are distributed.
  const offset=(groupIndex*4+index)%item[1].length;
  const choices=item[1].map((_,i)=>item[1][(i+offset)%item[1].length]);
  return {skill,category,prompt:item[0],choices,correct:(item[2]-offset+choices.length)%choices.length};
 }));
}
export default function ShineSprint({sector,onBack}){
 const qs=makeSprintQuestions(sector);
 const [q,setQ]=React.useState(0);
 const [ans,setAns]=React.useState({});
 const [showSummary,setShowSummary]=React.useState(false);
 const [reflection,setReflection]=React.useState({});
 const [reflectionSubmitted,setReflectionSubmitted]=React.useState(false);

 const cur=qs[q];
 const answered=ans[q]!==undefined;

 const choose=(i)=>{
   setAns(prev=>Object.assign({},prev,{[q]:i}));
 };

 const goNext=()=>{
   if(q < qs.length-1){
     setQ(q+1);
     window.scrollTo({top:0,behavior:"smooth"});
   }
 };

 const submitCheckup=()=>{
   // Always show the summary screen. The final question may be left unanswered;
   // it will simply count as incorrect rather than blocking submission.
   setShowSummary(true);
   window.scrollTo({top:0,behavior:"smooth"});
 };

 const restart=()=>{
   setQ(0);
   setAns({});
   setShowSummary(false);
   setReflection({});
   setReflectionSubmitted(false);
   window.scrollTo({top:0,behavior:"smooth"});
 };

 if(showSummary){
   const score=qs.reduce((n,item,i)=>n+(ans[i]===item.correct?1:0),0);
   const pct=Math.round((score/qs.length)*100);
   const answeredCount=Object.keys(ans).length;

   const skillStats={};
   qs.forEach((item,i)=>{
     const key=item.skill||"Quantitative Reasoning";
     if(!skillStats[key])skillStats[key]={correct:0,total:0};
     skillStats[key].total+=1;
     if(ans[i]===item.correct)skillStats[key].correct+=1;
   });

   const skillRows=Object.entries(skillStats).map(([name,v])=>({
     name:name,
     correct:v.correct,
     total:v.total,
     pct:Math.round((v.correct/v.total)*100)
   })).sort((a,b)=>a.pct-b.pct || a.name.localeCompare(b.name));

   const band=score>=13?"Ready to Advance":score>=10?"Developing Confidence":score>=7?"Building Foundation":"Skill Builder Recommended";
   const performance=score>=13
     ?"Strong performance. You demonstrated consistent competency with the quantitative reasoning skills assessed and are ready to apply them in more complex sector missions."
     :score>=10
     ?"Solid performance. You demonstrated a useful QR foundation, with a few skill areas that would benefit from targeted review before advanced mission work."
     :score>=7
     ?"Developing performance. You showed emerging competency, but several quantitative reasoning skills need additional practice and feedback."
     :"Foundation-building performance. Your results identify several quantitative reasoning skills to strengthen before moving into more complex missions.";

   // Use the lowest-performing assessed skills to personalize the first three reflection questions.
   const lowestSkills=skillRows.slice(0,3).map(x=>x.name);
   const fallback=(sectorQRSkills[sector.id]||[]).slice(0,3);
   const focus=[0,1,2].map(i=>lowestSkills[i]||fallback[i]||"quantitative reasoning");

   const reflectionQs=[
     `Based on this SHINE Sprint, how confident are you in your competency with ${focus[0]}?`,
     `Based on this SHINE Sprint, how confident are you in your competency with ${focus[1]}?`,
     `Based on this SHINE Sprint, how confident are you in your competency with ${focus[2]}?`,
     `How confident are you that you can select and apply the right quantitative reasoning skill when you encounter a new ${sector.label} problem?`,
     "How confident are you that you can explain your quantitative reasoning, use evidence correctly, and defend your conclusion?"
   ];

   const allReflectionsComplete=reflectionQs.every((_,i)=>reflection[i]!==undefined);
   const confidenceAverage=allReflectionsComplete
     ? (reflectionQs.reduce((sum,_,i)=>sum+reflection[i],0)/reflectionQs.length).toFixed(1)
     : null;

   return React.createElement("main",{className:"page"},
     React.createElement("div",{className:"card sprint-shell"},
       React.createElement("div",{className:"eyebrow"},"SHINE Sprint Skills Checkup • Summary"),
       React.createElement("h2",null,sector.name," • ",sector.label),
       React.createElement("p",{style:{color:"var(--muted)",marginTop:4,lineHeight:1.6}},
         "Your SHINE Sprint is complete. Review your score and skill performance, then assess your confidence with the quantitative reasoning skills you just used."
       ),

       React.createElement("div",{className:"sprint-results-grid"},
         React.createElement("div",{className:"sprint-result-card"},
           React.createElement("div",{className:"sprint-result-label"},"Overall Score"),
           React.createElement("div",{className:"sprint-score"},score," / ",qs.length),
           React.createElement("div",{className:"sprint-band"},band),
           React.createElement("div",{className:"sprint-percent"},
             pct,"% correct • ",answeredCount," of ",qs.length," questions answered"
           )
         ),
         React.createElement("div",{className:"sprint-result-card"},
           React.createElement("div",{className:"sprint-result-label"},"Performance Summary"),
           React.createElement("p",{style:{color:"var(--muted)",lineHeight:1.65,marginTop:6}},performance),
           React.createElement("div",{className:"skill-performance"},
             skillRows.map(row=>React.createElement("div",{className:"skill-performance-row",key:row.name},
               React.createElement("div",{className:"skill-performance-name"},row.name),
               React.createElement("div",{className:"skill-performance-track"},
                 React.createElement("span",{style:{width:row.pct+"%"}})
               ),
               React.createElement("div",{className:"skill-performance-value"},row.correct,"/",row.total)
             ))
           )
         )
       ),

       React.createElement("div",{className:"reflection-section"},
         React.createElement("div",{className:"eyebrow"},"Student Skills Competency Reflection"),
         React.createElement("h3",{style:{margin:"8px 0 6px"}},"How confident are you with the skills you just assessed?"),
         React.createElement("p",{style:{color:"var(--muted)",marginTop:0,lineHeight:1.6}},
           "Rate each statement from 1 to 5. The first three questions focus on QR skill areas identified by your Sprint performance."
         ),

         reflectionQs.map((text,i)=>React.createElement("div",{className:"reflection-question",key:i},
           React.createElement("h4",null,(i+1)+". ",text),
           React.createElement("div",{className:"confidence-scale"},
             [1,2,3,4,5].map(v=>React.createElement("button",{
               type:"button",
               key:v,
               className:"confidence-option "+(reflection[i]===v?"selected":""),
               onClick:()=>setReflection(prev=>Object.assign({},prev,{[i]:v}))
             },
               React.createElement("div",{style:{fontWeight:800,fontSize:15}},v),
               React.createElement("div",{style:{marginTop:3}},
                 v===1?"Not Yet":v===2?"Low":v===3?"Developing":v===4?"Confident":"Very Confident"
               )
             ))
           ),
           React.createElement("div",{className:"confidence-anchors"},
             React.createElement("span",null,"1 = Not Yet Confident"),
             React.createElement("span",null,"5 = Very Confident")
           )
         )),

         !reflectionSubmitted && React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginTop:18,flexWrap:"wrap"}},
           React.createElement("div",{style:{color:"var(--muted)",fontSize:12}},
             Object.keys(reflection).length," of 5 reflection questions completed"
           ),
           React.createElement("button",{
             type:"button",
             className:"btn",
             disabled:!allReflectionsComplete,
             onClick:()=>setReflectionSubmitted(true)
           },"SUBMIT REFLECTION")
         ),

         reflectionSubmitted && React.createElement(React.Fragment,null,
           React.createElement("div",{className:"reflection-complete"},
             React.createElement("b",null,"Reflection complete. "),
             "Your average confidence rating is ",confidenceAverage," out of 5. Your performance score and confidence self-assessment are now paired to help guide your next learning step."
           ),
           React.createElement("div",{style:{display:"flex",justifyContent:"flex-end",gap:10,marginTop:16,flexWrap:"wrap"}},
             React.createElement("button",{type:"button",className:"btn secondary",onClick:restart},"RETAKE SHINE SPRINT"),
             React.createElement("button",{type:"button",className:"btn",onClick:onBack},"RETURN TO SECTOR")
           )
         )
       )
     )
   );
 }

 return React.createElement("main",{className:"page"},
   React.createElement("button",{type:"button",className:"btn secondary",onClick:onBack},"← BACK TO SECTOR"),
   React.createElement("div",{className:"card sprint-shell",style:{marginTop:18}},
     React.createElement("div",{className:"eyebrow"},"SHINE Sprint Skills Checkup"),
     React.createElement("h2",null,sector.name," • ",sector.label),
     React.createElement("p",{style:{color:"var(--muted)"}},"Question ",q+1," of ",qs.length," • ",cur.category," • ",cur.skill),
     React.createElement("div",{className:"progress"},
       React.createElement("div",{style:{width:((q+1)/qs.length*100)+"%"}})
     ),
     React.createElement("h3",{style:{marginTop:22}},cur.prompt),
     cur.choices.map((c,i)=>React.createElement("button",{
       type:"button",
       key:i,
       className:"sprint-choice "+(ans[q]===i?"selected":""),
       onClick:()=>choose(i)
     },String.fromCharCode(65+i),". ",c)),

     // Give explicit feedback when the final question has not yet been answered,
     // but never make Submit Checkup inert.
     q===qs.length-1 && !answered &&
       React.createElement("p",{style:{color:"var(--gold)",fontSize:12,marginTop:13}},
         `You may answer Question ${qs.length} before submitting. If you submit now, the unanswered question will count as incorrect.`
       ),

     React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginTop:20,gap:12,flexWrap:"wrap"}},
       React.createElement("button",{
         type:"button",
         className:"btn secondary",
         disabled:q===0,
         onClick:()=>{ if(q>0){setQ(q-1);window.scrollTo({top:0,behavior:"smooth"});} }
       },"← PREVIOUS"),

       q===qs.length-1
         ? React.createElement("button",{
             type:"button",
             className:"btn",
             onClick:submitCheckup
           },"SUBMIT CHECKUP")
         : React.createElement("button",{
             type:"button",
             className:"btn",
             disabled:!answered,
             onClick:goNext
           },"NEXT →")
     )
   )
 );
}
