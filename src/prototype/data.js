const sectors = [
    { id: "sentinel", name: "Sentinel", label: "Public Safety & Crime", icon: "🛡️", roles: "Crime Analyst • Investigator • Emergency Operations Analyst", desc: "Investigate crime, emergency response, community safety, and resource deployment.", color: "#57d8ff" },
    { id: "vitalis", name: "Vitalis", label: "Health & Wellness", icon: "⚕️", roles: "Hospital Administrator • Public Health Analyst • Healthcare Operations Specialist", desc: "Make evidence-based decisions involving patients, hospitals, public health, and wellness.", color: "#79e2a4" },
    { id: "venture", name: "Venture", label: "Business & Entrepreneurship", icon: "📈", roles: "Business Strategist • Entrepreneur • Market Analyst", desc: "Analyze customers, pricing, costs, profitability, and business growth.", color: "#ffd166" },
    { id: "terra", name: "Terra", label: "Environment & Sustainability", icon: "🌎", roles: "Environmental Analyst • Sustainability Officer", desc: "Investigate water, energy, pollution, conservation, and sustainability.", color: "#7ad7a5" },
    { id: "civitas", name: "Civitas", label: "Government & Community", icon: "🏛️", roles: "City Planner • Policy Analyst • Community Data Specialist", desc: "Use budgets, population data, and evidence to advise communities.", color: "#b48cff" },
    { id: "arena", name: "Arena", label: "Sports & Performance", icon: "🏟️", roles: "Sports Analyst • Scout • Performance Director", desc: "Use statistics to improve athlete, team, and organizational performance.", color: "#ff9e7a" },
    { id: "forge", name: "Forge", label: "Engineering & Manufacturing", icon: "⚙️", roles: "Process Engineer • Quality Analyst • Operations Engineer", desc: "Solve production, design, quality, efficiency, and systems problems.", color: "#c9d2dd" },
    { id: "transit", name: "Transit", label: "Transportation & Logistics", icon: "🚇", roles: "Transportation Planner • Logistics Analyst • Network Planner", desc: "Optimize the movement of people, materials, and information.", color: "#6b8cff" },
    { id: "mercator", name: "Mercator", label: "Finance & Economics", icon: "💹", roles: "Financial Analyst • Budget Advisor • Risk Analyst", desc: "Compare costs, risk, return, growth, and financial tradeoffs.", color: "#ffd166" },
    { id: "harvest", name: "Harvest", label: "Food & Agricultural Systems", icon: "🌾", roles: "Agricultural Systems Analyst • Food Operations Manager", desc: "Balance food production, resources, costs, and sustainability.", color: "#d6e56f" },
    { id: "lumina", name: "Lumina", label: "Science & Research", icon: "🔬", roles: "Research Analyst • Laboratory Scientist • Investigator", desc: "Evaluate experiments, claims, samples, uncertainty, and scientific evidence.", color: "#8dd8ff" },
    { id: "horizon", name: "Horizon", label: "Workforce & Future Planning", icon: "🧭", roles: "Workforce Analyst • Career Strategist • Economic Development Specialist", desc: "Analyze careers, wages, training pathways, and workforce trends.", color: "#b48cff" },
    { id: "gateway", name: "Gateway", label: "Immigration & Migration", icon: "🧳", roles: "Migration Policy Analyst • Community Demographer • Resettlement Planner", desc: "Analyze migration patterns, demographic change, public services, labor participation, and competing policy claims.", color: "#35d0ba" },
    { id: "mosaic", name: "Mosaic", label: "Humanities & Culture", icon: "📚", roles: "Cultural Researcher • Historian • Humanities Analyst", desc: "Use quantitative evidence alongside historical and cultural sources to investigate people, ideas, representation, and change over time.", color: "#ff7f8b" }
 ];
const sectorQRSkills = {
  sentinel:["Data Quality & Anomaly Detection","Rates & Ratios","Percent Change","Bivariate Tables","Measures of Center","Data Visualization","Comparative Reasoning","Risk & Probability"],
  vitalis:["Rates & Proportions","Percentages","Risk & Probability","Measures of Center","Variation","Bivariate Tables","Trend Interpretation","Data Quality"],
  venture:["Percent Change","Ratios & Unit Rates","Revenue, Cost & Profit","Break-Even Reasoning","Weighted Averages","Trend Analysis","Data Visualization","Forecasting"],
  terra:["Rates & Unit Conversions","Percent Change","Proportional Reasoning","Trend Analysis","Measures of Center","Variation","Data Visualization","Estimation"],
  civitas:["Percentages","Rates Per Capita","Budget Proportions","Weighted Averages","Population Change","Bivariate Tables","Data Visualization","Comparative Reasoning"],
  arena:["Rates & Ratios","Percentages","Measures of Center","Variation","Weighted Averages","Probability","Trend Analysis","Bivariate Data"],
  forge:["Rates & Unit Conversions","Percent Error","Tolerance & Variation","Proportions","Efficiency","Measures of Center","Trend Analysis","Estimation"],
  transit:["Distance & Time Rates","Unit Rates","Percent Change","Weighted Averages","Capacity Utilization","Optimization Reasoning","Trend Analysis","Data Visualization"],
  mercator:["Percent Change","Simple & Compound Growth","Ratios","Weighted Averages","Risk & Probability","Inflation Adjustment","Trend Analysis","Forecasting"],
  harvest:["Rates & Yields","Proportions","Percent Change","Unit Conversions","Measures of Center","Variation","Cost Analysis","Trend Interpretation"],
  lumina:["Data Quality","Measures of Center","Variation","Probability","Sampling","Percent Error","Bivariate Relationships","Evidence Evaluation"],
  horizon:["Percent Change","Rates & Ratios","Median & Mean","Weighted Averages","Bivariate Tables","Trend Analysis","Cost-Benefit Reasoning","Forecasting"],
  gateway:["Rates Per Capita","Percent Change","Population Proportions","Bivariate Tables","Measures of Center","Trend Analysis","Data Visualization","Comparative Reasoning"],
  mosaic:["Percentages","Rates & Ratios","Measures of Center","Bivariate Tables","Time-Series Trends","Sampling","Data Visualization","Quantitative Argument"]
};
const crimeData = [
    { incident: "S-1042", district: "North", type: "Vehicle Theft", calls: 43, arrests: 12, pop: 12500, rate: "3.44" },
    { incident: "S-1043", district: "South", type: "Vehicle Theft", calls: 51, arrests: 18, pop: 18100, rate: "2.82" },
    { incident: "S-1044", district: "West", type: "Vehicle Theft", calls: 510, arrests: 15, pop: 14900, rate: "34.23", issue: "outlier" },
    { incident: "S-1045", district: "East", type: "Vehicle Theft", calls: 47, arrests: "—", pop: 15500, rate: "3.03", issue: "missing" },
    { incident: "S-1045", district: "East", type: "Vehicle Theft", calls: 47, arrests: "—", pop: 15500, rate: "3.03", issue: "duplicate" },
    { incident: "S-1047", district: "West", type: "veh theft", calls: 56, arrests: 16, pop: 14900, rate: "3.76", issue: "category" }
];
const missionSteps = ["Briefing", "Data Lab", "Find Signal", "Build Evidence", "Make Call", "Assessment", "Debrief"];

const preAttitudeStatements = [
"I am comfortable entering data into a spreadsheet such as Excel or Google Sheets.",
"I feel confident using spreadsheet software to carry out simple data analysis.",
"I am comfortable calculating percentages.",
"I feel confident interpreting percentages.",
"I am comfortable working with rates and ratios.",
"I feel confident reading bivariate tables that compare two variables.",
"I feel confident reading and interpreting graphs.",
"I feel confident distinguishing between row percentages and column percentages in a table.",
"I feel confident explaining the results of quantitative analysis in words.",
"I am interested in learning more about quantitative data analysis.",
"It is fun to work with spreadsheet software.",
"I find working with data and numbers enjoyable.",
"I enjoy quantitative problems that challenge me.",
"Courses that require working with data and numbers are stressful for me.",
"Data analysis is a difficult skill.",
"Data analysis is boring.",
"I try to avoid taking math and quantitative courses.",
"I plan to take the bare minimum number of math or statistics courses I need to take in college.",
"Data analysis is helpful for understanding content in non-math classes.",
"Data analysis is an important skill to learn in college.",
"The best way to learn data analysis is through class projects.",
"Learning to analyze data is worth the effort.",
"Data analysis skills will be useful for my future education or career.",
"Being good at data analysis will help me make decisions about issues that matter to me or my community.",
"All people have the ability to improve their quantitative skills."
];

const preCognitiveQuestions = [
{q:"Which statement is supported by the table?",opts:["Student 1 is part-time.","Student 4 studied 8 hours.","Student 5 is full-time and studied 12 hours.","Student 7 is part-time and studied 6 hours."],a:2,skill:"Data Reading",visual:"study"},
{q:"What is the average number of study hours among part-time students?",opts:["6","7","8","9"],a:1,skill:"Measures of Center",visual:"study"},
{q:"What percentage of full-time students studied 10 hours or more?",opts:["25%","40%","50%","75%"],a:2,skill:"Percentages",visual:"study"},
{q:"A researcher asks whether the number of tutoring sessions a student attends predicts the student's quiz score. Which variables are the independent and dependent variables?",opts:["Independent variable: quiz score; dependent variable: tutoring sessions","Independent variable: tutoring sessions; dependent variable: quiz score","Both variables are dependent variables","The variables cannot be identified from the question"],a:1,skill:"Variables"},
{q:"Which table would be most helpful if your objective is to compare rates of shuttle usage among those living on-campus vs. off-campus?",opts:["Column percentages: Used 80%/30%, Did not 20%/70%, totals 100%/100%","Row percentages: Used 57.1%/42.9%, Did not 12.5%/87.5%","Counts only: Used 4/3, Did not 1/7","All three tables are equally useful"],a:0,skill:"Bivariate Tables",visual:"shuttle"},
{q:"Which graph would be most helpful if your objective is to compare rates of shuttle usage among those living on-campus vs. off-campus?",opts:["Graph A","Graph B","Graph C","Graph D"],a:0,skill:"Data Visualization",visual:"graphChoices"},
{q:"Which conclusion is best supported by the shuttle data?",opts:["On-campus students were more likely to use the shuttle: 80% compared with 30%.","Off-campus students were more likely to use the shuttle: 80% compared with 30%.","The two groups used the shuttle at the same rate.","The data show that living on campus causes students to use the shuttle."],a:0,skill:"Comparative Reasoning",visual:"shuttle"},
{q:"Based on the graph, how many students scored 80 or higher?",opts:["5","8","14","20"],a:1,skill:"Graph Reading",visual:"scores"},
{q:"How many errors did Section A make in Session 4?",opts:["8","10","13","14"],a:1,skill:"Graph Reading",visual:"errors"},
{q:"Which statement best describes the pattern in the graph?",opts:["Errors increased in both sections.","Errors decreased in both sections, and the decrease was larger in Section A.","Only Section B improved.","There was no relationship between session number and errors."],a:1,skill:"Trend Analysis",visual:"errors"},
{q:"What percentage of non-tutoring participants were first-year students?",opts:["36%","42%","48%","Cannot be determined from the data"],a:3,skill:"Data Sufficiency",visual:"tutoring"},
{q:"Which statement is supported by the tutoring composition table?",opts:["First-year students made up a larger percentage of tutoring participants than of all students.","Transfer students made up a larger percentage of tutoring participants than of all students.","Continuing students made up a smaller percentage of tutoring participants than of all students.","The table shows that tutoring caused students to remain in college."],a:0,skill:"Comparative Reasoning",visual:"tutoring"},
{q:"A campus clinic recorded 3 flu cases among 1,000 students during one month. What percentage of the observations does this represent?",opts:["0.03%","0.3%","3%","30%"],a:1,skill:"Percentages"},
{q:"Which statement correctly interprets 0.07%?",opts:["About 7 out of every 10,000.","About 7 out of every 1,000.","About 7 out of every 100.","About 70 out of every 1,000."],a:0,skill:"Percentages"},
{q:"In a workshop, 18 students used laptops and 12 used tablets. What is the simplified ratio of the first quantity to the second?",opts:["2:3","3:2","6:4","18:30"],a:1,skill:"Rates & Ratios"},
{q:"The number of students attending a review session increased from 40 to 50. What was the percentage increase?",opts:["10%","20%","25%","40%"],a:2,skill:"Percent Change"},
{q:"Among full-time students, what percentage used the library database?",opts:["35%","50%","60%","70%"],a:3,skill:"Bivariate Tables",visual:"library"},
{q:"Which statement correctly compares the 'Yes' percentages within the two enrollment groups?",opts:["70% of full-time students and 50% of part-time students used the database.","50% of full-time students and 70% of part-time students used the database.","35% of full-time students and 25% of part-time students used the database.","The groups cannot be compared because the table contains counts."],a:0,skill:"Bivariate Tables",visual:"library"},
{q:"You want to compare the percentage distribution of preferred study methods according to gender in Excel or Google Sheets. Which specific spreadsheet command would allow you to do this?",opts:["Drop Cap","Pivot Tables","Quick Tables","Correlation","Compare Variables"],a:1,skill:"Spreadsheet Skills"},
{q:"A researcher records tutoring sessions and quiz scores: (1,62), (2,68), (3,74), (4,80), (5,86). Which is the best estimate of the correlation?",opts:["+0.9","+0.2","-0.2","-0.9"],a:0,skill:"Correlation"}
];

const majors = ["Accounting","African American Studies","Anthropology","Aquatic and fishery sciences","Architecture or Architectural design","Art history","Art","Astronomy","Atmospheric sciences","Biochemistry","Bioengineering","Biology (including marine, molecular, etc.)","Botany","Business","Chemical engineering","Chemistry","Cinematography","Civil and environmental engineering","Classics","Communication","Comparative literature","Computer engineering or computer science","Construction management","Criminal science and forensics","Criminology","Dance","Design","Digital arts","Drama, including acting, writing, theatre","Earth and space science","Ecology","Economics","Education, including early childhood and special education","Electrical engineering","English","Environmental science","Ethnic studies","Film studies","Finance","Food science, including nutrition science","Foreign language and literature","Genetics","Geography","Geology","Health sciences","History","Industrial engineering","International studies","Kinesiology, including sports medicine and exercise biology","Library science","Linguistics","Management","Materials science and engineering","Mathematics","Mechanical engineering","Medical technology","Music, including performance, composition, history, music education, and recording technology","Nursing","Oceanography","Philosophy","Physics","Physiology","Political science","Psychology","Religious studies","Resource management, including forestry and wildlife management","Rhetoric","Social justice","Social welfare or social work","Sociology","Speech, language, and hearing sciences and disorders","Statistics","Technical communication, a field that includes tech writing","Urban Studies or City Planning","Women's Studies","Undecided","Other"];

export { sectors, sectorQRSkills, crimeData, missionSteps, preAttitudeStatements, preCognitiveQuestions, majors };
