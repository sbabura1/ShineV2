import React from "react";
import { sectorQRSkills } from "../data";

function makeSprintQuestions(sector){
 const skills=sectorQRSkills[sector.id]||[]; const sk=i=>skills[i%skills.length];
 return [
  [sk(0),"A dataset contains the same record twice. What should an analyst do first?",["Average the records","Flag and verify the duplicate","Delete both records","Convert both to percentages"],1],
  [sk(1),"A value rises from 40 to 50. What is the percent increase?",["10%","20%","25%","50%"],2],
  [sk(2),"There are 36 events among 12,000 people. What is the rate per 1,000?",["0.3","3","30","300"],1],
  [sk(3),"Two groups have different population sizes. Which measure usually gives the fairest comparison?",["Raw totals","A population-adjusted rate","The largest value","The category name"],1],
  [sk(4),"Values are 8, 9, 9, 10, and 34. Which measure best represents a typical value?",["Mean","Median","Range","Maximum"],1],
  [sk(5),"Which graph is generally best for showing change over time?",["Line graph","Pie chart","Single number","Venn diagram"],0],
  [sk(6),"120 of 400 cases are in Category A. What percentage is that?",["12%","25%","30%","40%"],2],
  [sk(7),"A sample reports a 20% outcome rate. Which statement is strongest?",["Exactly 20% will occur everywhere","The rate is evidence, but sampling and uncertainty matter","The result proves causation","The denominator is irrelevant"],1],
  [sk(0),"One value is ten times larger than nearby values. What should you do first?",["Assume it is correct","Remove it","Investigate whether it is real or an error","Replace it with zero"],2],
  [sk(1),"A value falls from 80 to 60. What is the percent decrease?",["20%","25%","33%","40%"],1],
  [sk(2),"150 miles are traveled in 3 hours. What is the unit rate?",["30 mph","45 mph","50 mph","75 mph"],2],
  [sk(3),"48 of 80 in Group A and 30 of 60 in Group B meet a criterion. Which has the higher proportion?",["Group A","Group B","Equal","Cannot determine"],0],
  [sk(4),"What is the mean of 12, 16, and 20?",["14","16","18","48"],1],
  [sk(5),"A chart starts its vertical axis at 95, making a small difference look huge. What is the issue?",["Sampling error","Misleading scale","Duplicate data","Unit conversion"],1],
  [sk(6),`Which conclusion best reflects strong quantitative reasoning in ${sector.label}?`,["Act on the biggest number immediately","Combine data quality, appropriate measures, context, and uncertainty","Ignore denominators","Choose the result supporting the original claim"],1]
 ].map(x=>({skill:x[0],prompt:x[1],choices:x[2],correct:x[3]}));
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
     React.createElement("p",{style:{color:"var(--muted)"}},"Question ",q+1," of ",qs.length," • ",cur.skill),
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
         "You may answer Question 15 before submitting. If you submit now, the unanswered question will count as incorrect."
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
