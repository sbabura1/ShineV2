import React, { useState } from 'react';
import { missionSteps, sectorQRSkills } from '../data';
import { useSavedState } from '../utils/useSavedState';
import BEACON_IMAGE from '../assets/beacon.png';
import PACE_CHECK_IMAGE from '../assets/pace-check.png';

const h=React.createElement;
const clinicRows=[['North',48,12,8],['South',60,15,11],['West',72,12,19],['East',50,10,9]];
const Q=(skill,prompt,choices,correct,explain,hint,wrong)=>({skill,prompt,choices,correct,explain,hint,wrong});
function vitalisTasks(level){
 const advanced=level==='Advanced',begin=level==='Beginning';
 return [
 {goal:'Frame the decision before reading the numbers.',scene:'The clinic director needs a staffing recommendation. West’s patients wait 19 days. Your team has one temporary provider available for a 30-day pilot. These are fictional training data from the same reporting period; a provider-day is one provider working one day.',qs:[Q('Decision framing','What should your investigation establish first?',['Which clinic has the largest total','Whether comparable data support a capacity concern','How to guarantee the pilot will work'],1,'Check comparable reporting periods, staffing units, and evidence before choosing an intervention.','Start with a question the data can answer.',['A total ignores staffing time.','','These data cannot guarantee an outcome.']),Q('Data quality',advanced?'Which validation would most strengthen the comparison?':'What must be consistent across the clinics?',['Reporting period and definition of provider-day','The clinic names must have equal length','All appointment totals must match'],0,'Use the same reporting period and definition of provider-day. Confirm this with the source before real action.','Fair comparisons need consistent definitions.')]},
 {goal:'Validate the table and calculate fair staffing-adjusted rates.',scene:'Read the clinic ledger. Beacon will check your calculations one at a time.',qs:[Q('Reading data','Which clinic has the longest wait?',['North: 8 days','South: 11 days','West: 19 days','East: 9 days'],2,'West has a 19-day wait, the longest in the table.','Compare the wait-time column.'),Q('Rates',begin?'West has 72 appointments and 12 provider-days. What is 72 ÷ 12?':'What is West’s appointment rate per provider-day?',['4','6','12','72'],1,'72 ÷ 12 = 6 appointments per provider-day.','Divide appointments by staffing time.',['4 is North and South’s rate.','','12 is the denominator, not the rate.','72 is a total, not a rate.']),Q('Comparative reasoning','Which clinics share the same rate?',['North and South','West and East','South and East'],0,'North: 48 ÷ 12 = 4. South: 60 ÷ 15 = 4. Equal rates can coexist with different waits.','Calculate both rates before comparing.'),Q('Difference','How much longer is West’s wait than East’s?',['6 days','9 days','10 days','14 days'],2,'19 − 9 = 10 days.','Subtract East’s wait from West’s.'),Q('Evidence limits','Which conclusion does this table support?',['Totals prove West is understaffed','West has the highest rate and longest wait, suggesting capacity pressure','Equal rates always mean equal waits'],1,'West’s rate of 6 and wait of 19 suggest pressure, but do not establish its cause.','A pattern is evidence, not proof of causation.')]},
 {goal:'Separate a useful signal from an unsupported causal claim.',scene:'The director says: “West has more appointments, so it definitely needs permanent staff.” Decide what the pattern really tells you.',qs:[Q('Rates',advanced?'How much higher is West’s rate than North’s, relative to North?':begin?'Which clinic handles the most appointments per provider-day?':'West’s rate is 6 and North’s is 4. What is the relative increase?',advanced||!begin?['25%','50%','2%']:['North','West','South'],1,begin?'West handles 6 appointments per provider-day; North and South handle 4.':'(6 − 4) ÷ 4 × 100 = 50%. This compares rates, not total appointments.','Use the baseline rate as the denominator.'),Q('Uncertainty','What should you investigate before claiming the cause?',['Visit complexity, unmet demand, and scheduling rules','Only the clinic’s color scheme','Nothing; correlation establishes cause'],0,'Visit complexity, demand, and scheduling could explain waits independently of staffing.','Look for alternative explanations.')]},
 {goal:'Build a quantitative claim with a clear limitation.',scene:'Prepare evidence the director can inspect: one comparison, one explanation, and one boundary on the claim.',qs:[Q('Evidence','Which statement combines accurate numbers and a defensible claim?',['West: 6 appointments/provider-day and a 19-day wait; pressure is plausible, cause unconfirmed','West: 72 appointments/provider-day; staffing is proven to be the cause','North and South have identical waits'],0,'The rate is 6, not 72. North and South have different waits. Name both the signal and its limitation.','Pair one calculated rate with one observed outcome.'),Q('Measures of center',advanced?'What is the median wait across all four clinics?':'Which comparison supports the size of West’s wait-time gap? ',advanced?['11.75 days','10 days','19 days']:['West waits 10 days longer than East','West waits twice as long as every clinic','West has no wait-time difference'],advanced?1:0,advanced?'Sort 8, 9, 11, 19; the median is (9 + 11) ÷ 2 = 10 days. The mean is 11.75 days.':'West’s 19 days minus East’s 9 days equals a 10-day gap.','Use the middle two values for the median; use subtraction for a gap.')]},
 {goal:'Choose a proportional response and a measurable follow-up.',scene:'One temporary provider can add 6 provider-days at West. Choose an action that helps patients while testing the capacity hypothesis.',qs:[Q('Decision','What is the most defensible next step?',['Move all staff to West permanently','Run a 30-day staffing pilot at West and monitor outcomes','Ignore the longer wait'],1,'A time-limited pilot responds to the signal while allowing evaluation. Monitor all clinics so improvements at West do not hide harm elsewhere.','Choose a reversible action matched to the evidence.',['Permanent redistribution goes beyond these four rows.','','Ignoring the signal leaves the longer wait unaddressed.']),Q('Forecast limits',begin?'With 6 extra provider-days, West would have 18. If appointments stay at 72, what is 72 ÷ 18?':'If West gains 6 provider-days and appointments remain at 72, what is the new rate?',['4 appointments/provider-day','6 appointments/provider-day','A guaranteed 4-day wait'],0,'72 ÷ (12 + 6) = 4 appointments/provider-day. This conditional calculation does not predict wait time.','Hold appointments constant and update the denominator.'),...(advanced?[Q('Evaluation','Which evaluation design best tests the pilot?',['Compare comparable pre/post periods, track other clinics and visit complexity','Measure only the first day','Assume a lower rate guarantees success'],0,'Track wait times, demand, case mix, and access across clinics in comparable periods. Without controls, causal confidence remains limited.','Specify outcomes, comparisons, and confounders.')]:[])]},
 {goal:'Check independent transfer using a fresh clinic scenario.',scene:'Assessment: a new clinic handles 90 appointments over 15 provider-days and has a 14-day wait. Answer independently. Beacon gives a scored review after submission.',qs:[Q('Transfer rates','What is the new clinic’s rate?',['5','6','15','90'],1,'90 ÷ 15 = 6 appointments per provider-day.','Divide completed units by work-days.'),Q('Transfer limits','What can you conclude from that rate and wait?',['Same rate as West proves the same cause','The clinic needs investigation; equal rates do not guarantee equal waits','The wait must be 19 days'],1,'The rate matches West, but its wait is 14 days. Rates alone cannot explain every wait-time difference.','Compare the metric without assuming a shared cause.'),Q('Transfer decision',advanced?'Which additional evidence best supports a causal evaluation?':'What should you monitor after a staffing pilot?',['Wait times, demand, case mix, and access at all clinics','Only total staffing expenditure','Only the director’s confidence'],0,'Measure outcomes and alternative explanations, including effects on other clinics.','Track outcomes and conditions that may change them.')]},
 {goal:'Reflect on your reasoning and carry it to a new context.',scene:'The director reviews your work. Identify the habit you want to carry forward, then write a short reflection.',qs:[Q('Reflection','Which habit transfers best to a new sector?',['Compare normalized measures, check quality, and state uncertainty','Choose the largest total every time','Assume patterns establish cause'],0,'Fair measures and explicit uncertainty transfer across sectors. Your reflection will record how you used them here.','Choose a reasoning habit that works beyond healthcare.')]}];
}

const QR_LIBRARY={
 rates:{name:'Rates & unit rates',video:'https://www.khanacademy.org/v/finding-unit-rates',reading:'https://www.khanacademy.org/math/pre-algebra/pre-algebra-ratios-rates/pre-algebra-rates/a/rate-review',rule:'A unit rate compares a quantity with one unit of another quantity. Keep the units in your answer.',example:'A fictional clinic completes 40 completed units in 8 work-days: 40 ÷ 8 = 5 units per work-day.',practice:'Try it: 54 units over 9 work-days. What is the unit rate?',answer:'6 units per work-day.'},
 percent:{name:'Percent change',video:'https://www.khanacademy.org/math/revision-term-1-tg-math-class-8/xa35e3d5a0b2f5ac7%3Aweek-2/xa35e3d5a0b2f5ac7%3Acomparing-quantities-using-proportion/v/finding-percentage-change',rule:'Percent change = (new value − baseline value) ÷ baseline value × 100. Use the original value as the denominator.',example:'A rate rises from 5 to 7: (7 − 5) ÷ 5 × 100 = 40%.',practice:'Try it: a rate rises from 8 to 10. What is the percent increase?',answer:'25%.'},
 median:{name:'Median & measures of center',video:'https://www.khanacademy.org/math/statistics-probability/stat-desc-data/median/v/median',practiceLink:'https://www.khanacademy.org/e/mean_median_and_mode',rule:'Sort the values. The median is the middle value, or the average of the two middle values for an even-sized dataset.',example:'For waits of 4, 7, 9, 20 days, the median is (7 + 9) ÷ 2 = 8 days.',practice:'Try it: find the median of 3, 6, 10, 17.',answer:'8.'},
 evidence:{name:'Data quality, evidence & uncertainty',video:'https://www.khanacademy.org/math/engageny-alg-1/alg1-2/alg1-2d-correlation/v/correlation-and-causality',rule:'Check consistent units and reporting periods. A pattern can support a hypothesis without proving its cause. Consider alternative explanations.',example:'Two groups can share a rate but have different outcomes because demand, participant characteristics, or operating conditions differ.',practice:'Try it: what else would you measure before attributing a longer wait to staffing?',answer:'Demand, visit complexity, staffing definitions, scheduling, and comparable reporting periods.'}
};
function qrTopic(q,level,step){const skill=q.skill.toLowerCase();if(/percent/.test(skill))return 'percent';if(/central tendency|median|measures of center/.test(skill))return 'median';if(/rate|ratio|proportion|yield|unit conversion/.test(skill))return 'rates';if(step===2&&q.skill==='Rates'&&level!=='Beginning')return 'percent';if(q.skill==='Measures of center'&&level==='Advanced')return 'median';if(['Rates','Transfer rates','Forecast limits','Comparative reasoning','Difference','Reading data'].includes(q.skill))return 'rates';return 'evidence';}
function QRResources({topic,level,locked}){
 const [open,setOpen]=useState(false),[video,setVideo]=useState(false);const dialog=React.useRef(null);React.useEffect(()=>{setOpen(false);setVideo(false);},[topic]);React.useEffect(()=>{if(video&&!dialog.current.open)dialog.current.showModal();else if(!video&&dialog.current?.open)dialog.current.close();},[video]);const item=QR_LIBRARY[topic];
 const link=(title,url)=>h('a',{className:'btn secondary',href:url,target:'_blank',rel:'noopener noreferrer'},title);
 return h('section',{className:'v-qr-resources','aria-label':'Quantitative reasoning learning support'},h('div',{className:'v-resource-buttons'},h('button',{type:'button',className:'btn secondary',disabled:locked,onClick:()=>setVideo(true)},'Video'),h('button',{type:'button',className:'btn secondary',disabled:locked,'aria-expanded':open,onClick:()=>setOpen(!open)},'Resources')),locked&&h('small',null,'Learning support unlocks after you complete the challenge and view the results.'),h('dialog',{ref:dialog,className:'v-video-modal','aria-labelledby':'beacon-video-title',onClose:()=>setVideo(false),onClick:e=>{if(e.target===dialog.current)setVideo(false);}},h('div',{className:'v-video-header'},h('h3',{id:'beacon-video-title'},'Beacon · Demo video'),h('button',{type:'button',className:'btn secondary',onClick:()=>setVideo(false),'aria-label':'Close demo video'},'Close')),h('p',null,'Demo preview · '+item.name),video&&h('iframe',{src:'https://www.youtube.com/embed/'+(topic==='evidence'?'ROpbdO-gRUo':'Zm0KaIw-35k'),title:'Beacon demo YouTube video',allow:'accelerometer; encrypted-media; gyroscope; picture-in-picture',allowFullScreen:true}),h('p',{className:'v-demo-note'},'Sample video for this demo. Final mission videos will be added later.'),h('a',{href:'https://www.youtube.com/watch?v='+(topic==='evidence'?'ROpbdO-gRUo':'Zm0KaIw-35k'),target:'_blank',rel:'noopener noreferrer',className:'btn secondary'},'Watch on YouTube')),open&&!locked&&h('div',{className:'v-resource-content'},h('h4',null,item.name+' · '+level),h('p',null,item.rule),h('p',null,item.example),h('p',null,item.practice),h('details',null,h('summary',null,'Check the practice answer'),h('p',null,item.answer)),h('p',null,level==='Beginning'?'Start with the worked example. Name each unit before calculating.':level==='Intermediate'?'Explain why this method makes the comparison fair.':'Identify an assumption, an alternative explanation, and additional evidence that would test your conclusion.'),item.reading&&link('Read rate review',item.reading),item.practiceLink&&link('Practice mean, median and mode',item.practiceLink)));
}


function StuckSupport({topic,level,onClose}){const item=QR_LIBRARY[topic];const steps={rates:['Identify the quantities: 40 completed units and 8 work-days.','Divide completed units by work-days: 40 ÷ 8 = 5.','Report the units: 5 units per work-day. Compare rates rather than totals.'],percent:['Identify the baseline rate (5) and the new rate (7).','Calculate the change: 7 − 5 = 2. Divide by the baseline: 2 ÷ 5 = 0.4.','Convert to a percentage: 0.4 × 100 = 40% increase.'],median:['Put the waits in order: 4, 7, 9, 20 days.','There are four values, so use the two middle values: 7 and 9.','Average them: (7 + 9) ÷ 2 = 8 days. The largest wait does not determine the median.'],evidence:['Observe: two groups share a rate but have different outcomes.','Separate the observation from the explanation: resources may matter, but the rate alone cannot explain the difference.','Check demand, participant characteristics, operating conditions, and reporting periods before claiming a cause.']};const link=(title,url)=>h('a',{href:url,target:'_blank',rel:'noopener noreferrer'},title);return h('section',{className:'v-stuck-support','aria-label':'Worked example and helpful web resources'},h('h3',null,'Let’s work through an example'),h('p',null,'You can build this skill one step at a time. This example uses different numbers from your mission.'),h('h4',null,item.name),h('ol',null,steps[topic].map((t,i)=>h('li',{key:i},t))),h('p',null,level==='Beginning'?'Try the same steps with your own numbers. Keep the unit beside the answer.':level==='Intermediate'?'Explain why this method supports a fair comparison, then try it with the mission data.':'Check the assumptions behind this method and explain what additional evidence could change your conclusion.'),h('h4',null,'Helpful web resources'),h('ul',null,h('li',null,link('Watch: '+item.name+' — Khan Academy',item.video)),h('li',null,topic==='rates'?link('Read: Rate review — Khan Academy',item.reading):topic==='median'?link('Practice: Mean, median and mode — Khan Academy',item.practiceLink):topic==='evidence'?link('Watch: Correlation and causality — YouTube','https://www.youtube.com/watch?v=ROpbdO-gRUo'):link('Try the percent-change worked example and practice','https://www.khanacademy.org/math/revision-term-1-tg-math-class-8/xa35e3d5a0b2f5ac7%3Aweek-2/xa35e3d5a0b2f5ac7%3Acomparing-quantities-using-proportion/v/finding-percentage-change'))),h('p',{className:'v-lock'},'Web resources open in a new tab.'),h('button',{type:'button',className:'btn secondary',onClick:onClose},'Close example'));}



function looksLikeRushing(times){return times.length>=3&&times.slice(-3).every(t=>t>=0&&t<4000);}
function RushReminder({onClose}){const ref=React.useRef(null);React.useEffect(()=>{ref.current.showModal();},[]);return h('dialog',{ref,className:'v-rush-modal','aria-labelledby':'rush-title',onCancel:e=>{e.preventDefault();onClose();}},h('div',{className:'v-rush-layout'},h('img',{src:PACE_CHECK_IMAGE,alt:'A comical dog rushing at full speed toward a race finish line',className:'v-rush-photo'}),h('div',null,h('div',{className:'eyebrow'},'Beacon’s pace check'),h('h2',{id:'rush-title'},'Easy there, turbo.'),h('p',{className:'v-rush-joke'},'Paws for a second—this is a data challenge, not a dog race!'),h('p',null,'Those last three answers came in very quickly. You may already know the material; this is just a reminder to check your reasoning.'),h('ol',null,h('li',null,'Read the whole question.'),h('li',null,'Check the numbers and units.'),h('li',null,'Explain to yourself why your answer fits.')),h('button',{type:'button',className:'btn',autoFocus:true,onClick:onClose},'Got it — back to the challenge'))),h('small',{className:'v-photo-credit'},'Illustration created for Scalaris.'));}


function BeaconCartwheel({score,total,onClose}){const ref=React.useRef(null);const [replay,setReplay]=useState(0);React.useEffect(()=>{const el=ref.current;el.showModal();return()=>{if(el.open)el.close();};},[]);return h('dialog',{ref,className:'v-cartwheel-modal','aria-labelledby':'cartwheel-title',onCancel:e=>{e.preventDefault();onClose();}},h('div',{className:'v-cartwheel-head'},h('div',{className:'eyebrow'},'Challenge complete'),h('h2',{id:'cartwheel-title'},'You did it!'),h('p',null,`${score} of ${total} correct · ${Math.round(score/total*100)}%`)),h('div',{className:'v-cartwheel-stage','aria-label':'Beacon grows larger and performs cartwheels'},h('div',{key:replay,className:'v-cartwheel-traveler'},h('img',{src:BEACON_IMAGE,alt:'Beacon celebrating your achievement',className:'v-cartwheel-image'}))),h('p',null,'Strong work connecting the evidence to your answers!'),h('div',{className:'v-cartwheel-buttons'},h('button',{type:'button',className:'btn secondary',onClick:()=>setReplay(replay+1)},'Replay cartwheels'),h('button',{type:'button',className:'btn',onClick:onClose,autoFocus:true},'Continue')));}

function beaconResultMood(correct,total){return total>0&&correct/total>=0.8?'dance':'encourage';}
function needsBeaconSupport(entries){return entries.length>=2&&entries.slice(-2).every(r=>!r.correct);}
const sectorMissionConfigs = {
  "gateway": {
    "title": "Migration Service Planning",
    "leader": "Migration services coordinator",
    "unit": "Community",
    "numerator": "Residents requesting support",
    "denominator": "Residents surveyed",
    "outcome": "Average travel time (minutes)",
    "intro": "Compare migration-related service needs and choose an access pilot."
  },
  "mosaic": {
    "title": "Culture Access Challenge",
    "leader": "Cultural programs director",
    "unit": "Venue",
    "numerator": "Participating residents",
    "denominator": "Residents surveyed",
    "outcome": "Travel time (minutes)",
    "intro": "Compare cultural participation and choose an access initiative."
  },
  "civitas": {
    "title": "Community Budget Challenge",
    "leader": "Community planning team",
    "unit": "District",
    "numerator": "Residents requesting a service",
    "denominator": "Residents surveyed",
    "outcome": "Service wait (days)",
    "intro": "Use community needs data to recommend a budget allocation pilot."
  },
  "horizon": {
    "title": "Career Pathways Challenge",
    "leader": "Workforce planning team",
    "unit": "Program",
    "numerator": "Participants placed in jobs",
    "denominator": "Program participants",
    "outcome": "Training duration (weeks)",
    "intro": "Compare workforce pathways and recommend a training pilot."
  },
  "sentinel": {
    "title": "Public Safety Prevention Challenge",
    "leader": "Public safety analyst",
    "unit": "District",
    "numerator": "Reported incidents",
    "denominator": "Population",
    "outcome": "Response time (minutes)",
    "intro": "Compare population-adjusted incident patterns and propose a prevention pilot."
  },
  "lumina": {
    "title": "Research Evidence Challenge",
    "leader": "Research review team",
    "unit": "Study",
    "numerator": "Participants showing improvement",
    "denominator": "Study participants",
    "outcome": "Follow-up duration (weeks)",
    "intro": "Compare research evidence and recommend a follow-up study."
  },
  "terra": {
    "title": "Sustainability Resource Challenge",
    "leader": "Sustainability planning team",
    "unit": "Site",
    "numerator": "Water saved (liters)",
    "denominator": "Baseline water use (liters)",
    "outcome": "Monitoring period (days)",
    "intro": "Compare conservation performance and recommend a sustainability pilot."
  },
  "forge": {
    "title": "Manufacturing Quality Challenge",
    "leader": "Quality improvement team",
    "unit": "Production line",
    "numerator": "Defective units",
    "denominator": "Units inspected",
    "outcome": "Downtime (hours)",
    "intro": "Compare manufacturing quality and propose a process improvement pilot."
  },
  "transit": {
    "title": "Transportation Capacity Challenge",
    "leader": "Transit planning team",
    "unit": "Route",
    "numerator": "Occupied seats",
    "denominator": "Available seats",
    "outcome": "Delay (minutes)",
    "intro": "Compare capacity utilization and choose a route scheduling pilot."
  },
  "harvest": {
    "title": "Agricultural Resource Challenge",
    "leader": "Agricultural operations team",
    "unit": "Farm",
    "numerator": "Harvest (kilograms)",
    "denominator": "Land area (hectares)",
    "outcome": "Water use (kiloliters)",
    "intro": "Compare yields and resource use before proposing an agricultural pilot."
  },
  "arena": {
    "title": "Performance Improvement Challenge",
    "leader": "Performance coaching team",
    "unit": "Team",
    "numerator": "Successful attempts",
    "denominator": "Total attempts",
    "outcome": "Practice time (hours)",
    "intro": "Compare performance patterns and choose a training pilot."
  },
  "venture": {
    "title": "Business Growth Challenge",
    "leader": "Business strategy team",
    "unit": "Product",
    "numerator": "Revenue (dollars)",
    "denominator": "Costs (dollars)",
    "outcome": "Customer satisfaction (%)",
    "intro": "Compare revenue and costs to recommend a business experiment."
  },
  "mercator": {
    "title": "Financial Forecast Challenge",
    "leader": "Economic analysis team",
    "unit": "Region",
    "numerator": "Current price index",
    "denominator": "Baseline price index",
    "outcome": "Income growth (%)",
    "intro": "Compare price changes and evaluate a financial planning scenario."
  },
  "vitalis": {
    "title": "The Community Clinic Capacity Challenge",
    "leader": "Clinic director",
    "unit": "Clinic",
    "numerator": "Appointments",
    "denominator": "Provider-days",
    "outcome": "Wait (days)",
    "intro": "Make a staffing decision from evidence, then test it."
  }
};
function missionConfig(sector){const c=sectorMissionConfigs[sector.id];return {...c,rows:sector.id==='vitalis'?clinicRows:[['North',48,120,8],['South',60,150,11],['West',72,120,19],['East',50,100,9]],metric:sector.id==='vitalis'?'Appointments / provider-day':c.numerator+' / '+c.denominator};}
function sectorMissionTasks(sector,level){
 if(sector.id==='vitalis')return vitalisTasks(level);
 const c=missionConfig(sector),skills=sectorQRFramework[sector.id].groups,qs=makeSprintQuestions(sector);
 const convert=item=>Q(item.skill,item.prompt,item.choices,item.correct,'The supported answer is '+item.choices[item.correct]+'. Check the definition, units, and evidence behind this choice.','Focus on '+item.skill.toLowerCase()+'. Separate what you observed from what you can conclude.');
 const select=(start,end)=>qs.slice(start,end).map(convert);
 const calc=Q('Contextual ratio calculation',`West reports 72 ${c.numerator.toLowerCase()} and 120 ${c.denominator.toLowerCase()}. What is their ratio?`,['0.6','1.67','72'],0,'72 ÷ 120 = 0.6. Retain both units and check whether this measure is appropriate for the decision.','Divide the first quantity by the second; label both units.');
 const scene=`You are advising the ${c.leader.toLowerCase()}. ${c.intro} The table contains fictional training data from the same reporting period. Check definitions before making comparisons.`;
 return [
 {goal:'Frame an answerable question and plan the investigation.',scene,qs:select(4,6)},
 {goal:'Read the data and apply the sector’s arithmetic skills.',scene:'Inspect the ledger independently. Answer each challenge before asking Beacon for a hint.',qs:[calc,...select(0,4)]},
 {goal:'Investigate the pattern using scientific reasoning.',scene:'A difference in the table is a signal to investigate. Test the explanation rather than assuming a cause.',qs:select(6,8)},
 {goal:'Build a defensible evidence statement.',scene:'Connect the numbers to the decision. Identify one limitation and the data needed to address it.',qs:[Q('Evidence-based comparison',`Which evidence statement accurately describes West in the ${c.unit.toLowerCase()} ledger?`,['West’s ratio is 0.6 and its outcome value is 19; the cause of differences is unconfirmed','West’s ratio is 72 and it proves the cause','All groups have identical outcomes'],0,'West: 72 ÷ 120 = 0.6, outcome 19. These observations do not establish causation.','Use a computed measure, the observed outcome, and a limitation.'),...select(8,9)]},
 {goal:'Choose an action appropriate to the sector and its evidence.',scene:c.intro+' Specify an outcome to monitor and an assumption to test.',qs:select(9,11)},
 {goal:'Demonstrate independent transfer to a fresh case.',scene:`Assessment: a new ${c.unit.toLowerCase()} reports 90 ${c.numerator.toLowerCase()} and 150 ${c.denominator.toLowerCase()}. Beacon support unlocks after the results.`,qs:[Q('Transfer calculation','What is the ratio in this new case?',['0.6','6','1.67'],0,'90 ÷ 150 = 0.6. Check the unit and context.','Divide the first quantity by the second.'),Q('Transfer interpretation','The new case has the same ratio as West. What does this establish?',['The measured ratios match; underlying causes may differ','The same intervention is guaranteed to work','The outcome must also be 19'],0,'Equal ratios do not establish equal causes or outcomes.','Keep the observation separate from the explanation.'),Q('Transfer evaluation',level==='Advanced'?'Which design strengthens an evaluation of your proposed action?':'What should you monitor after your proposed action?',['Comparable outcomes over time, relevant baseline differences, and unintended effects','Only the leader’s opinion','Only one favorable observation'],0,'Compare consistent measures and investigate competing explanations.','State outcomes, comparisons, and limitations.')]},
 {goal:'Reflect and transfer your reasoning to another context.',scene:'Record what changed your thinking, what remains uncertain, and what you will check next.',qs:[Q('Reflection','Which habit would strengthen your next investigation?',['Define measures, check evidence, and acknowledge uncertainty','Always choose the largest total','Assume every relationship is causal'],0,'Clear measures and transparent limitations support decisions across sectors.','Describe a habit you can use with new data.')]}
 ];
}
function speakBeacon(text,settings){
 const synth=window.speechSynthesis;
 if(!synth||!window.SpeechSynthesisUtterance)return false;
 const utterance=new window.SpeechSynthesisUtterance(text);
 const selected=synth.getVoices().find(v=>v.voiceURI===settings.voiceURI);
 if(selected){utterance.voice=selected;utterance.lang=selected.lang;}
 utterance.rate=Math.min(1.5,Math.max(0.6,Number(settings.rate)||1));
 utterance.pitch=Math.min(1.5,Math.max(0.6,Number(settings.pitch)||1));
 synth.cancel();synth.speak(utterance);return true;
}
function BeaconVoiceSettings({settings,setSettings,voices,refresh}){
 const [status,setStatus]=useState('');
 const available=!!window.speechSynthesis&&!!window.SpeechSynthesisUtterance;
 const missing=settings.voiceURI&&!voices.some(v=>v.voiceURI===settings.voiceURI);
 const update=(key,value)=>{window.speechSynthesis?.cancel();setSettings({...settings,[key]:value});setStatus('Settings saved.');};
 return h('details',{className:'v-voice-settings'},h('summary',null,'Voice settings'),
 h('p',null,'Choose a voice and preview it to find the sound you want. Your settings are saved for every sector on this device.'),
 !available?h('p',{role:'status'},'Voice playback is unavailable in this browser.'):
 h(React.Fragment,null,
 h('label',null,'Beacon voice',h('select',{value:missing?'':settings.voiceURI,onChange:e=>update('voiceURI',e.target.value)},
 h('option',{value:''},'Device default'),voices.map(v=>h('option',{key:v.voiceURI,value:v.voiceURI},v.name+' · '+v.lang+(v.default?' · Default':''))))),
 missing&&h('p',{role:'status'},'Your saved voice is unavailable here. Beacon will use the device default until you select another voice.'),
 !voices.length&&h('p',{role:'status'},'No voice list is available yet. Try Refresh voices after installing a voice.'),
 h('label',null,'Speed: '+Number(settings.rate).toFixed(2)+'×',h('input',{type:'range',min:0.6,max:1.5,step:0.05,value:settings.rate,onChange:e=>update('rate',Number(e.target.value))})),
 h('label',null,'Pitch: '+Number(settings.pitch).toFixed(2),h('input',{type:'range',min:0.6,max:1.5,step:0.05,value:settings.pitch,onChange:e=>update('pitch',Number(e.target.value))})),
 h('div',{className:'v-voice-actions'},
 h('button',{type:'button',className:'btn secondary',onClick:()=>{const ok=speakBeacon('Hi, I’m Beacon! Take your time, check the evidence, and we’ll figure this out together.',settings);setStatus(ok?'Playing voice preview.':'Voice preview could not start.');}},'Preview voice'),
 h('button',{type:'button',className:'btn secondary',onClick:()=>{window.speechSynthesis.cancel();setStatus('Preview stopped.');}},'Stop'),
 h('button',{type:'button',className:'btn secondary',onClick:()=>{refresh();setStatus('Voice list refreshed.');}},'Refresh voices'),
 h('button',{type:'button',className:'btn secondary',onClick:()=>{window.speechSynthesis.cancel();setSettings({voiceURI:'',rate:1,pitch:1});setStatus('Default voice settings restored.');}},'Reset')),
 h('p',{role:'status','aria-live':'polite'},status)));
}
export function BeaconSectorMission({sector,identity,missionLevel,step,setStep,onFinish}){
 const config=missionConfig(sector);
 const tasks=React.useMemo(()=>sectorMissionTasks(sector,missionLevel),[sector.id,missionLevel]);
 const [records,setRecords]=useState({}),[selected,setSelected]=useState(null),[qIndex,setQIndex]=useState(0),[message,setMessage]=useState(tasks[step].goal),[mood,setMood]=useState('talk'),[reflection,setReflection]=useSavedState(sector.id+'-reflection-'+missionLevel,''),[evidence,setEvidence]=useSavedState(sector.id+'-evidence-'+missionLevel,''),[voice,setVoice]=useState(false),[help,setHelp]=useState(0),[motion,setMotion]=useState(true),[talking,setTalking]=useState(false),[displayText,setDisplayText]=useState(message),[pulse,setPulse]=useState(0),[support,setSupport]=useState(null),[offered,setOffered]=useState({}),[stuckTopic,setStuckTopic]=useState(null),[cartwheel,setCartwheel]=useState(false),[rush,setRush]=useState(false),[rushShown,setRushShown]=useState(false),[beaconHelping,setBeaconHelping]=useState(false);const timing=React.useRef({start:Date.now(),times:[]});
 const [voiceSettings,setVoiceSettings]=useSavedState('voice-settings',{voiceURI:'',rate:1,pitch:1});
 const [availableVoices,setAvailableVoices]=useState([]);
 const refreshVoices=()=>setAvailableVoices(window.speechSynthesis?.getVoices()||[]);
 React.useEffect(()=>{const synth=window.speechSynthesis;if(!synth)return;refreshVoices();synth.addEventListener('voiceschanged',refreshVoices);return()=>synth.removeEventListener('voiceschanged',refreshVoices);},[]);

 React.useEffect(()=>{if(!motion||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){setDisplayText(message);setTalking(false);return;}setDisplayText('');setTalking(true);let n=0;const timer=setInterval(()=>{n=Math.min(message.length,n+4);setDisplayText(message.slice(0,n));if(n===message.length){clearInterval(timer);setTalking(false);}},24);return()=>clearInterval(timer);},[message,motion]);
 React.useEffect(()=>{timing.current.start=Date.now();const reset=()=>{timing.current.start=Date.now();};if(typeof document!=='undefined')document.addEventListener('visibilitychange',reset);return()=>{if(typeof document!=='undefined')document.removeEventListener('visibilitychange',reset);};},[step,qIndex]);
 const task=tasks[step],entries=records[step]||[],done=entries.length===task.qs.length,q=task.qs[Math.min(qIndex,task.qs.length-1)],answered=entries[qIndex]!==undefined;
 const all=Object.values(records).flat(),correct=all.filter(r=>r.correct).length,score=entries.filter(r=>r.correct).length;
 const assessment=records[5]||[],weak=[...new Set(all.filter(r=>!r.correct).map(r=>r.skill))];
 React.useEffect(()=>{setQIndex(0);setSelected(null);setMessage(tasks[step].goal);setMood('talk');setBeaconHelping(false);setHelp(0);setSupport(null);setStuckTopic(null);},[step,sector.id,missionLevel]);
 React.useEffect(()=>{if(voice)speakBeacon(message,voiceSettings);return()=>window.speechSynthesis?.cancel();},[message,voice,voiceSettings,availableVoices]);
 function offerSupport(reason){if(offered[step])return;const praise=reason==='pause'?"Take your time. Careful thinking belongs here. We can make the next step smaller if that helps.":"You’re doing the important part: trying, checking, and learning from the feedback. A missed answer gives us a useful place to start.";setOffered({...offered,[step]:true});setSupport({reason,text:praise});setMood('encourage');setMessage(praise);}
 React.useEffect(()=>{if(done||answered||support||offered[step])return;const timer=setTimeout(()=>{if(typeof document==='undefined'||document.visibilityState==='visible')offerSupport('pause');},75000);return()=>clearTimeout(timer);},[step,qIndex,selected,entries.length,support,offered[step]]);
 function takeSupport(){setBeaconHelping(step!==5);const nextStep=step===5?'Take a breath, reread the question, and choose when you’re ready. Your assessment remains independent.':missionLevel==='Beginning'?'Start with just one piece of information. '+q.hint:missionLevel==='Intermediate'?'Write down what is known, choose the right comparison, and include the units. '+q.hint:'Separate the observed pattern from your explanation. Name one assumption you can test. '+q.hint;setMessage('You can work through this one step at a time. '+nextStep);setMood('encourage');setSupport(null);}
 function submit(){if(selected===null||answered)return;const elapsed=Date.now()-timing.current.start;timing.current.times.push(elapsed);const rushing=!rushShown&&looksLikeRushing(timing.current.times);const ok=selected===q.correct;setRecords({...records,[step]:[...entries,{correct:ok,selected,skill:q.skill,prompt:q.prompt,answer:q.choices[q.correct]}]});setMood(ok?'celebrate':'think');const adaptation=ok?(missionLevel==='Advanced'?' Now consider which assumption could weaken this claim.':' You connected the evidence to the question.'):(q.wrong?.[selected]||' Check the unit, denominator, and the limit of the claim.');setMessage((ok?'Correct! ':'Not quite. ')+q.explain+adaptation);if(rushing){setRush(true);setRushShown(true);setSupport(null);}else if(!ok&&needsBeaconSupport([...entries,{correct:ok}]))offerSupport('misses');}
 function summary(){if(!done||!answered)return;setQIndex(task.qs.length);const resultMood=beaconResultMood(score,task.qs.length);setPulse(0);setMood(resultMood);if(resultMood==='dance')setCartwheel(true);const pct=Math.round(score/task.qs.length*100);const practice=[...new Set(entries.filter(r=>!r.correct).map(r=>r.skill))];setMessage(`${task.qs.length} questions completed: ${score} correct (${pct}%). `+(resultMood==='dance'?"You reached 80% or more! You connected the evidence to your answers. Time for Beacon’s victory cartwheels! ":"You’ve completed the challenge, and every attempt gives you something to build on. Let’s take one small step together. Practice "+(practice.join(', ')||'the skill that felt least certain')+" with a worked example. ")+"Give me a hint and Help me, I'm stuck are now unlocked.");}

 const summaryVisible=done&&qIndex>=task.qs.length;
 function coaching(stuck){setBeaconHelping(step!==5);setHelp(help+1);setMood('think');const misses=entries.filter(r=>!r.correct);if(stuck){const target=task.qs.find(x=>x.skill===misses[0]?.skill)||q;const topic=qrTopic(target,missionLevel,step);setStuckTopic(topic);setMessage('You can work through this. Let’s use a smaller example first: '+QR_LIBRARY[topic].example+' Follow the steps and explore the web resources below.');return;}setMessage(stuck?`Let’s break this down. ${missionLevel==='Beginning'?'Read one column at a time. Name the numerator and denominator before calculating.':missionLevel==='Intermediate'?'Write the formula, include units, then separate observation from explanation.':'Test the reporting-period assumption, identify confounders, and propose a comparison that could disprove your claim.'} ${misses.length?'Revisit: '+misses[0].prompt+' Correct result: '+misses[0].answer+'.':'You answered every question correctly; explain why an alternative was weaker.'}`:`${task.goal} ${misses.length?'Focus on '+misses[0].skill+'. ':''}${task.qs.find(x=>x.skill===misses[0]?.skill)?.hint||task.qs[0].hint}`);}
 const button=(text,fn,disabled=false,cls='btn')=>h('button',{
 key:text,type:'button',className:cls,
 onKeyDown:e=>{if(e.repeat&&(e.key==='Enter'||e.key===' '))e.preventDefault();},
 onClick:e=>{if(disabled||support||rush||cartwheel)return;if(e&&e.detail>1)return;fn();},
 disabled:disabled||!!support||rush||cartwheel
 },text);
 return h('main',{className:'page vitalis'},rush&&h(RushReminder,{onClose:()=>{setRush(false);timing.current.start=Date.now();setMessage('You set the pace. Read, check, and choose when you’re ready.');setMood('encourage');}}),cartwheel&&h(BeaconCartwheel,{score,total:task.qs.length,onClose:()=>setCartwheel(false)}),
 h('div',{className:'mission-header'},h('div',null,h('div',{className:'eyebrow'},sector.name+' · Mission 01'),h('h2',null,config.title),h('p',null,config.intro)),h('div',{className:'card'},h('b',null,missionLevel),h('p',null,missionSteps[step]),h('small',null,`${correct} / ${all.length} correct so far`))),
 h('nav',{className:'stepper','aria-label':'Mission tasks'},missionSteps.map((s,i)=>h('div',{key:s,className:'step '+(i===step?'active':records[i]?.length===tasks[i].qs.length?'done':'')},`${i+1}. ${s}`))),
 h('section',{className:'card'},h('div',{className:'eyebrow'},missionSteps[step]),h('h2',null,task.goal),h('p',{className:'v-scene'},task.scene),
 step>0&&h('div',{className:'data-wrap'},h('table',null,h('caption',null,config.unit+' ledger · same reporting period · fictional training data'),h('thead',null,h('tr',null,[config.unit,config.numerator,config.denominator,config.outcome,config.metric].map(x=>h('th',{key:x},x)))),h('tbody',null,config.rows.map(r=>h('tr',{key:r[0],className:beaconHelping&&step!==5&&r[0]==='West'?'v-west':''},r.map((v,i)=>h('td',{key:i},v)),h('td',null,missionLevel==='Advanced'&&step===1?'Calculate it':r[1]/r[2])))))),
 h('div',{className:'v-workspace'},h('section',{className:'v-challenge','aria-label':'Challenge questions'},support&&h('section',{className:'v-support',role:'status','aria-live':'polite'},h('div',{className:'eyebrow'},'A moment with Beacon'),h('h3',null,'Let’s take one small step.'),h('p',null,support.text),h('div',{className:'v-support-actions'},h('button',{type:'button',className:'btn',onClick:takeSupport},step===5?'Help me reset':'Show me a small next step'),h('button',{type:'button',className:'btn secondary',onClick:()=>{setSupport(null);setMessage('You set the pace. Keep going when you’re ready.');setMood('talk');}},'I’m ready to continue'))),h('div',{className:'eyebrow'},'Challenge questions'),h('p',null,`${Math.min(entries.length,task.qs.length)} of ${task.qs.length} answered`),h('p',{className:'v-lock'},summaryVisible?'Review your results, then select Continue when you are ready.':answered?'Your answer is recorded. Read Beacon’s feedback, then select Next question or View task results.':'Select an answer, then select Submit answer. Questions advance only when you select Next question.'),h('progress',{max:task.qs.length,value:entries.length,'aria-label':'Task progress'}),
 !summaryVisible?h(React.Fragment,null,h('h3',null,q.prompt),h('div',{className:'answers'},q.choices.map((choice,i)=>h('button',{key:choice,type:'button',className:'answer v-option '+(selected===i?'selected ':'')+(answered&&i===q.correct?'v-correct':answered&&entries[qIndex]?.selected===i?'v-wrong':''),disabled:answered||!!support,'aria-pressed':selected===i,onClick:()=>setSelected(i)},choice))),
 !answered?button('Submit answer',submit,selected===null):h(React.Fragment,null,h('p',{role:'status'},entries[qIndex].correct?'✓ Correct':'Review this answer'),button(qIndex===task.qs.length-1?'View task results':'Next question',()=>{if(!answered)return;if(qIndex===task.qs.length-1)summary();else{setBeaconHelping(false);setQIndex(qIndex+1);setSelected(null);setMood('talk');setMessage(task.qs[qIndex+1].prompt);}}))):h(React.Fragment,null,h('h3',null,`Task results: ${score} / ${task.qs.length}`),entries.map((r,i)=>h('div',{key:i,className:'v-review'},h('b',null,`${r.correct?'✓':'✕'} ${r.prompt}`),h('p',null,`Your answer: ${task.qs[i].choices[r.selected]} · Correct: ${r.answer}`))),button('Practice this task again',()=>{const copy={...records};delete copy[step];setRecords(copy);setBeaconHelping(false);setQIndex(0);setSelected(null);setMessage(task.goal);setMood('talk');},false,'btn secondary')),
 step===3&&h('label',null,'Your evidence statement (required)',h('textarea',{value:evidence,onChange:e=>setEvidence(e.target.value),placeholder:'Include a rate, a wait-time comparison, and a limitation.',rows:4})),
 step===5&&summaryVisible&&h('div',{className:'callout'},h('b',null,`Independent assessment: ${assessment.filter(r=>r.correct).length} / ${assessment.length}`),h('p',null,'This score comes from your assessment answers. Practice-task results are reported separately.')),
 step===6&&h(React.Fragment,null,h('label',null,'What evidence changed your view, what remains uncertain, and what would you test next? (required)',h('textarea',{value:reflection,onChange:e=>setReflection(e.target.value),rows:5})),h('div',{className:'callout'},h('b',null,'Mission recap'),h('p',null,`${correct} / ${all.length} correct across tasks. ${weak.length?'Practice next: '+weak.join(', '):'Strong performance across all answered skills.'}`),h('p',null,`Your evidence: ${evidence||'Return to Build Evidence to record your statement.'}`)))),
 h('aside',{className:'v-beacon '+mood+(motion?' v-motion':'')+(talking?' v-speaking':'')},h('div',{className:'eyebrow'},'Beacon · '+(mood==='dance'?'Victory dance':mood==='celebrate'?'Signal secured':mood==='think'?'Think it through':mood==='encourage'?'You can do this':'Mission guide')),h('button',{type:'button',className:'v-stage',onClick:()=>setPulse(pulse+1),'aria-label':'Greet Beacon'},h('span',{className:'v-halo','aria-hidden':true}),h('img',{key:pulse,className:'v-avatar'+(pulse?' v-greet':''),src:BEACON_IMAGE,alt:'Beacon, your quantitative reasoning guide'}),h('span',{className:'v-shadow','aria-hidden':true}),mood==='think'&&h('span',{className:'v-thought','aria-hidden':true},'• • •')),(mood==='celebrate'||mood==='dance')&&h('div',{className:'v-celebration','aria-hidden':true},...Array.from({length:12},(_,i)=>h('span',{key:i,style:{'--angle':i*30+'deg','--delay':i*.025+'s'}},i%2?'✦':'✧'))),h('div',{className:'v-dialogue',role:'status','aria-live':'polite'},h('span',{className:'v-sr-only'},message),h('span',{'aria-hidden':true},displayText),talking&&h('span',{className:'v-cursor','aria-hidden':true},'▍')),h(QRResources,{topic:qrTopic(q,missionLevel,step),level:missionLevel,locked:!summaryVisible}),stuckTopic&&h(StuckSupport,{topic:stuckTopic,level:missionLevel,onClose:()=>{setStuckTopic(null);setBeaconHelping(false);}}),h('div',{className:'v-help'},beaconHelping&&button('Finish Beacon help',()=>{setBeaconHelping(false);setStuckTopic(null);setMood('talk');setMessage(task.goal);},false,'btn secondary'),button('Give me a hint',()=>coaching(false),!summaryVisible,'btn secondary'),button("Help me, I'm stuck",()=>coaching(true),!summaryVisible,'btn secondary')),h('p',{className:'v-lock'},summaryVisible?'Task complete. Beacon help unlocked.':'Complete the challenge questions and view results to unlock help.'),button(voice?'Voice on · turn off':'Voice off · turn on',()=>setVoice(!voice),false,'btn secondary'),h(BeaconVoiceSettings,{settings:voiceSettings,setSettings:setVoiceSettings,voices:availableVoices,refresh:refreshVoices}),button(motion?'Animation on · pause':'Animation paused · resume',()=>setMotion(!motion),false,'btn secondary'),(step!==5||summaryVisible)&&h('details',null,h('summary',null,'Quick concept guide'),h('p',null,'Rate = quantity ÷ exposure or time. Percent increase = (new − baseline) ÷ baseline × 100. A pattern does not establish a cause.'))))),
 h('div',{className:'v-navigation'},button('Previous task',()=>setStep(step-1),step===0,'btn secondary'),step<6?button('Continue to '+missionSteps[step+1],()=>{if(!summaryVisible||(step===3&&evidence.trim().length<20))return;setStep(Math.min(6,step+1));},!summaryVisible||(step===3&&evidence.trim().length<20)):button('Complete mission',()=>{const result={mission:sector.id+'-01',sector:sector.id,level:missionLevel,records,evidence,reflection,assessmentScore:assessment.filter(r=>r.correct).length,assessmentTotal:assessment.length};try{localStorage.setItem('scalaris-beacon:'+sector.id+':last-result',JSON.stringify(result));}catch{}window.dispatchEvent(new CustomEvent('scalaris:mission-complete',{detail:result}));onFinish();},!summaryVisible||reflection.trim().length<20)),
 (step===3&&evidence.trim().length<20||step===6&&reflection.trim().length<20)&&h('p',{role:'status'},'Write at least 20 characters to record your reasoning and continue.'));
}

export function BeaconSectorProfile({identity,onNexus,onReplay}){let r=null;try{r=JSON.parse(localStorage.getItem('scalaris-beacon:'+identity.sector+':last-result'));}catch{}return h('main',{className:'page'},h('div',{className:'card'},h('div',{className:'eyebrow'},identity.sector.charAt(0).toUpperCase()+identity.sector.slice(1)+' · Mission 01 complete'),h('h2',null,identity.name+' — mission record'),r?h(React.Fragment,null,h('p',null,'Level: '+r.level),h('h3',null,'Assessment: '+r.assessmentScore+' / '+r.assessmentTotal),h('p',null,'Evidence: '+r.evidence),h('p',null,'Reflection: '+r.reflection),h('p',null,'This demo saves progress in this browser.')):h('p',null,'Finish this sector mission to create your record.'),h('div',{className:'cta-row'},h('button',{className:'btn',onClick:onNexus},'Return to the Nexus'),h('button',{className:'btn secondary',onClick:()=>{for(const level of ['Beginning','Intermediate','Advanced'])for(const key of ['records','reflection','evidence'])localStorage.removeItem('scalaris-beacon:'+identity.sector+'-'+key+'-'+level);onReplay();}},'Replay mission'))));}
