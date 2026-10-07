export const sectors = [
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
export const sectorQRFramework = {
  "gateway": {
    "workforce": "Immigration and migration",
    "groups": {
      "Arithmetic & Data Interpretation": [
        "Frequency tables",
        "univariate table interpretation",
        "percentage interpretation and rescaling",
        "row and column percentages"
      ],
      "Scientific Reasoning": [
        "Formulating research questions",
        "variables and constants",
        "levels of measurement",
        "evidence-based inference"
      ],
      "Business / Contextual Analytics": [
        "Compare migration trends",
        "evaluate population-based service needs",
        "recognize misleading uses of migration data"
      ]
    }
  },
  "mosaic": {
    "workforce": "Humanities and culture",
    "groups": {
      "Arithmetic & Data Interpretation": [
        "Data grouping and categorization",
        "selecting measures of central tendency",
        "graph selection",
        "preparing tables and graphs"
      ],
      "Scientific Reasoning": [
        "Research ethics",
        "operationalizing concepts",
        "formulating research questions",
        "levels of measurement"
      ],
      "Business / Contextual Analytics": [
        "Compare cultural participation patterns",
        "evaluate access to cultural resources",
        "recognize misleading uses of cultural data"
      ]
    }
  },
  "civitas": {
    "workforce": "Government and community",
    "groups": {
      "Arithmetic & Data Interpretation": [
        "Adding and comparing percentages",
        "table interpretation",
        "row and column percentages",
        "spreadsheet analysis and pivot tables"
      ],
      "Scientific Reasoning": [
        "Operationalizing concepts",
        "research design and variable selection",
        "controlling for variables",
        "evidence-based inference"
      ],
      "Business / Contextual Analytics": [
        "Compare community needs",
        "evaluate budget allocations",
        "recognize misleading uses of community data"
      ]
    }
  },
  "horizon": {
    "workforce": "Workforce and future planning",
    "groups": {
      "Arithmetic & Data Interpretation": [
        "Percent change",
        "selecting measures of central tendency",
        "table selection",
        "spreadsheet analysis and pivot tables"
      ],
      "Scientific Reasoning": [
        "Formulating research questions",
        "developing hypotheses",
        "independent and dependent variables",
        "correlation interpretation"
      ],
      "Business / Contextual Analytics": [
        "Analyze workforce trends",
        "compare career costs and benefits",
        "evaluate workforce forecasts"
      ]
    }
  },
  "sentinel": {
    "workforce": "Public safety and crime",
    "groups": {
      "Arithmetic & Data Interpretation": [
        "Rates per capita",
        "percentage interpretation and rescaling",
        "frequency tables",
        "graph interpretation"
      ],
      "Scientific Reasoning": [
        "Research ethics",
        "operationalizing concepts",
        "correlation versus causation",
        "controlling for variables"
      ],
      "Business / Contextual Analytics": [
        "Compare public safety patterns",
        "prioritize prevention resources",
        "recognize misleading uses of crime data"
      ]
    }
  },
  "lumina": {
    "workforce": "Science and research",
    "groups": {
      "Arithmetic & Data Interpretation": [
        "Spreadsheet data organization",
        "selecting measures of central tendency",
        "table selection",
        "preparing tables and graphs"
      ],
      "Scientific Reasoning": [
        "Research ethics",
        "developing hypotheses",
        "research design and variable selection",
        "levels of measurement"
      ],
      "Business / Contextual Analytics": [
        "Evaluate evidence for research decisions",
        "compare proposed studies",
        "recognize misleading uses of research data"
      ]
    }
  },
  "vitalis": {
    "workforce": "Health and wellness",
    "groups": {
      "Arithmetic & Data Interpretation": [
        "Rates and proportions",
        "univariate table interpretation",
        "row and column percentages",
        "selecting measures of central tendency"
      ],
      "Scientific Reasoning": [
        "Research ethics",
        "independent and dependent variables",
        "correlation versus causation",
        "controlling for variables"
      ],
      "Business / Contextual Analytics": [
        "Interpret health trends",
        "compare health interventions",
        "recognize misleading uses of health data"
      ]
    }
  },
  "terra": {
    "workforce": "Environment and sustainability",
    "groups": {
      "Arithmetic & Data Interpretation": [
        "Unit conversions",
        "spreadsheet data organization",
        "graph selection",
        "graph interpretation"
      ],
      "Scientific Reasoning": [
        "Formulating research questions",
        "developing hypotheses",
        "variables and constants",
        "evidence-based inference"
      ],
      "Business / Contextual Analytics": [
        "Compare environmental trends",
        "evaluate sustainability options",
        "recognize misleading uses of environmental data"
      ]
    }
  },
  "forge": {
    "workforce": "Engineering and manufacturing",
    "groups": {
      "Arithmetic & Data Interpretation": [
        "Rates and ratios",
        "percent error",
        "selecting measures of central tendency",
        "table interpretation"
      ],
      "Scientific Reasoning": [
        "Developing hypotheses",
        "variables and constants",
        "independent and dependent variables",
        "research design and variable selection"
      ],
      "Business / Contextual Analytics": [
        "Evaluate production efficiency",
        "compare manufacturing options",
        "interpret tolerance and variation for quality decisions"
      ]
    }
  },
  "transit": {
    "workforce": "Transportation and logistics",
    "groups": {
      "Arithmetic & Data Interpretation": [
        "Distance and time rates",
        "spreadsheet analysis and pivot tables",
        "table selection",
        "graph interpretation"
      ],
      "Scientific Reasoning": [
        "Formulating research questions",
        "research design and variable selection",
        "controlling for variables",
        "evidence-based inference"
      ],
      "Business / Contextual Analytics": [
        "Evaluate capacity utilization",
        "compare route and scheduling options",
        "recognize misleading uses of transportation data"
      ]
    }
  },
  "harvest": {
    "workforce": "Food and agricultural systems",
    "groups": {
      "Arithmetic & Data Interpretation": [
        "Rates and yields",
        "spreadsheet data organization",
        "data grouping and categorization",
        "selecting measures of central tendency"
      ],
      "Scientific Reasoning": [
        "Developing hypotheses",
        "variables and constants",
        "independent and dependent variables",
        "correlation versus causation"
      ],
      "Business / Contextual Analytics": [
        "Compare production costs",
        "evaluate agricultural yield trends",
        "compare resource allocation options"
      ]
    }
  },
  "arena": {
    "workforce": "Sports and performance",
    "groups": {
      "Arithmetic & Data Interpretation": [
        "Rates and ratios",
        "adding and comparing percentages",
        "selecting measures of central tendency",
        "graph interpretation"
      ],
      "Scientific Reasoning": [
        "Operationalizing concepts",
        "correlation interpretation",
        "correlation versus causation",
        "controlling for variables"
      ],
      "Business / Contextual Analytics": [
        "Compare performance trends",
        "select improvement strategies",
        "recognize misleading uses of performance data"
      ]
    }
  },
  "venture": {
    "workforce": "Business and entrepreneurship",
    "groups": {
      "Arithmetic & Data Interpretation": [
        "Percent change",
        "spreadsheet analysis and pivot tables",
        "frequency tables",
        "preparing tables and graphs"
      ],
      "Scientific Reasoning": [
        "Formulating research questions",
        "operationalizing concepts",
        "research ethics",
        "research design and variable selection"
      ],
      "Business / Contextual Analytics": [
        "Analyze revenue, costs, and profit",
        "evaluate break-even scenarios",
        "recognize misleading uses of business data"
      ]
    }
  },
  "mercator": {
    "workforce": "Finance and economics",
    "groups": {
      "Arithmetic & Data Interpretation": [
        "Percentage interpretation and rescaling",
        "adding and comparing percentages",
        "data grouping and categorization",
        "table interpretation"
      ],
      "Scientific Reasoning": [
        "Levels of measurement",
        "correlation interpretation",
        "correlation versus causation",
        "evidence-based inference"
      ],
      "Business / Contextual Analytics": [
        "Compare inflation-adjusted values",
        "evaluate growth and financial forecasts",
        "recognize misleading uses of economic data"
      ]
    }
  }
};
export const sectorQRSkills = Object.fromEntries(Object.entries(sectorQRFramework).map(([id,entry]) => [id,Object.values(entry.groups).flat()]));
export const sprintSkillBank = {
  "frequency tables": [
    "Responses are bus, walk, bus, bike, bus, walk. What frequency belongs to bus?",
    [
      "3",
      "2",
      "50"
    ],
    0
  ],
  "univariate table interpretation": [
    "A table reports only travel mode: 30 bus, 20 walk, 10 bike. What does it describe?",
    [
      "The distribution of one variable",
      "The relationship between two variables",
      "A causal effect of travel mode"
    ],
    0
  ],
  "percentage interpretation and rescaling": [
    "A rate of 12% is equivalent to how many out of 250?",
    [
      "30",
      "12",
      "48"
    ],
    0
  ],
  "row and column percentages": [
    "A row contains 30 participants and 20 nonparticipants. What is the participant percentage within this row?",
    [
      "60%",
      "30%",
      "150%"
    ],
    0
  ],
  "data grouping and categorization": [
    "Records use Bus, bus, and BUS for the same category. How should you group them?",
    [
      "Standardize all three labels into one category",
      "Count them as three different modes",
      "Delete every bus record"
    ],
    0
  ],
  "selecting measures of central tendency": [
    "For values 8, 9, 9, 10, 34, which center is less affected by the unusually high value?",
    [
      "Median: 9",
      "Mean: 14",
      "Maximum: 34"
    ],
    0
  ],
  "graph selection": [
    "Which graph best compares counts across several categories?",
    [
      "Bar chart",
      "Scatterplot with no numeric axes",
      "An unlabeled line"
    ],
    0
  ],
  "preparing tables and graphs": [
    "Which feature makes a prepared graph interpretable?",
    [
      "A descriptive title, labeled axes, units, and source",
      "Removing the denominator and units",
      "Displaying only the largest value"
    ],
    0
  ],
  "adding and comparing percentages": [
    "Two nonoverlapping groups comprise 20% and 35% of the same population. What is their combined share?",
    [
      "55%",
      "7%",
      "15%"
    ],
    0
  ],
  "table interpretation": [
    "A table shows Group A: 60 of 100 meet a criterion; Group B: 40 of 50. Which has the higher proportion?",
    [
      "Group B: 80%",
      "Group A: 60%",
      "They are equal because both have more than 30 cases"
    ],
    0
  ],
  "spreadsheet analysis and pivot tables": [
    "Which pivot-table setup summarizes total spending by district?",
    [
      "District in rows; sum of spending in values",
      "Spending in rows; no values",
      "District labels summed as numbers"
    ],
    0
  ],
  "percent change": [
    "A value rises from 40 to 50. What is the percent increase?",
    [
      "25%",
      "10%",
      "20%"
    ],
    0
  ],
  "table selection": [
    "Which table best examines participation by age group?",
    [
      "A two-way table crossing age group with participation",
      "A list of participant names only",
      "One overall total without groups"
    ],
    0
  ],
  "rates per capita": [
    "36 events occur among 12,000 people. What is the rate per 1,000 people?",
    [
      "3",
      "30",
      "0.3"
    ],
    0
  ],
  "graph interpretation": [
    "A graph starts its vertical axis at 95, making values 98 and 100 look far apart. What should you check?",
    [
      "Whether the axis scale exaggerates the difference",
      "Whether the larger value proves causation",
      "Whether the smaller value must be an error"
    ],
    0
  ],
  "spreadsheet data organization": [
    "Which layout supports reliable spreadsheet analysis?",
    [
      "One observation per row and one variable per column",
      "Multiple observations in each merged cell",
      "Totals mixed into the raw observations"
    ],
    0
  ],
  "rates and proportions": [
    "48 of 80 patients meet a criterion. What proportion is that?",
    [
      "0.60 or 60%",
      "0.48 or 48%",
      "1.67 or 167%"
    ],
    0
  ],
  "unit conversions": [
    "How many meters are in 2.5 kilometers?",
    [
      "2,500",
      "250",
      "25,000"
    ],
    0
  ],
  "rates and ratios": [
    "A process produces 120 units in 4 hours. What is the hourly rate?",
    [
      "30 units per hour",
      "480 units per hour",
      "0.033 units per hour"
    ],
    0
  ],
  "percent error": [
    "A measured value is 105 and the accepted value is 100. What is the absolute percent error?",
    [
      "5%",
      "4.76%",
      "105%"
    ],
    0
  ],
  "distance and time rates": [
    "A vehicle travels 150 miles in 3 hours. What is its average speed?",
    [
      "50 miles per hour",
      "450 miles per hour",
      "45 miles per hour"
    ],
    0
  ],
  "rates and yields": [
    "A farm harvests 600 kilograms from 3 hectares. What is yield per hectare?",
    [
      "200 kilograms per hectare",
      "1,800 kilograms per hectare",
      "0.005 kilograms per hectare"
    ],
    0
  ],
  "formulating research questions": [
    "Which research question is clear and answerable using data?",
    [
      "How does average wait time differ between two clinics this month?",
      "Why is everything unfair?",
      "Is this topic interesting?"
    ],
    0
  ],
  "variables and constants": [
    "A study records wait times at one clinic during June. Which is a variable?",
    [
      "Each patient’s wait time",
      "The fixed study month of June",
      "The clinic selected for this study"
    ],
    0
  ],
  "levels of measurement": [
    "Travel mode is recorded as bus, walk, or bike. What measurement level applies?",
    [
      "Nominal: categories without an inherent order",
      "Ratio: numeric values with a true zero",
      "Interval: equal numeric gaps"
    ],
    0
  ],
  "evidence-based inference": [
    "A voluntary survey suggests strong support for a program. What is the best inference?",
    [
      "Support appears strong among respondents; representativeness needs checking",
      "Every resident supports the program",
      "The survey proves the program caused support"
    ],
    0
  ],
  "research ethics": [
    "Before collecting identifiable participant data, what is the responsible step?",
    [
      "Check consent, privacy protections, required IRB review, and honest reporting including AI use",
      "Publish names to make results convincing",
      "Use AI to invent missing responses"
    ],
    0
  ],
  "operationalizing concepts": [
    "How could a study operationalize access to services?",
    [
      "Measure travel time to the nearest service location",
      "Use the word access without a measure",
      "Assume all participants have equal access"
    ],
    0
  ],
  "research design and variable selection": [
    "To compare an intervention with usual practice, which data are most useful?",
    [
      "Intervention status, outcomes, and relevant baseline characteristics",
      "Only participant names",
      "Only the intervention’s promotional claims"
    ],
    0
  ],
  "controlling for variables": [
    "Two groups differ in age and outcomes. How can you examine whether age explains part of the difference?",
    [
      "Compare outcomes within similar age groups",
      "Ignore age because totals are available",
      "Assume age cannot matter"
    ],
    0
  ],
  "developing hypotheses": [
    "Which statement is a testable hypothesis?",
    [
      "Participants receiving reminders will have higher attendance than those without reminders",
      "Attendance matters",
      "The program is excellent"
    ],
    0
  ],
  "independent and dependent variables": [
    "A study tests whether reminders affect attendance. Which is the dependent variable?",
    [
      "Attendance",
      "Whether reminders are sent",
      "The study’s title"
    ],
    0
  ],
  "correlation interpretation": [
    "Hours of training and performance have a positive correlation. What does that indicate?",
    [
      "Higher training hours tend to accompany higher performance",
      "Training is proven to cause higher performance",
      "Every person improves by exactly the same amount"
    ],
    0
  ],
  "correlation versus causation": [
    "Two variables rise together. What can you conclude from that fact alone?",
    [
      "They are associated; causation needs additional evidence",
      "One definitely causes the other",
      "No other variable could explain the pattern"
    ],
    0
  ]
};
export const sprintApplicationBank = {
  "gateway": [
    [
      "Your task is to compare migration trends. Which approach best supports a decision in immigration and migration?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ],
    [
      "Your task is to evaluate population-based service needs. Which approach best supports a decision in immigration and migration?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ],
    [
      "A headline about immigration and migration cites a large total while omitting group sizes. What should you do?",
      [
        "Check denominators, comparable groups, and the original source",
        "Accept the headline because the total is large",
        "Treat the total as proof of cause"
      ],
      0
    ]
  ],
  "mosaic": [
    [
      "Your task is to compare cultural participation patterns. Which approach best supports a decision in humanities and culture?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ],
    [
      "Your task is to evaluate access to cultural resources. Which approach best supports a decision in humanities and culture?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ],
    [
      "A headline about humanities and culture cites a large total while omitting group sizes. What should you do?",
      [
        "Check denominators, comparable groups, and the original source",
        "Accept the headline because the total is large",
        "Treat the total as proof of cause"
      ],
      0
    ]
  ],
  "civitas": [
    [
      "Your task is to compare community needs. Which approach best supports a decision in government and community?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ],
    [
      "Your task is to evaluate budget allocations. Which approach best supports a decision in government and community?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ],
    [
      "A headline about government and community cites a large total while omitting group sizes. What should you do?",
      [
        "Check denominators, comparable groups, and the original source",
        "Accept the headline because the total is large",
        "Treat the total as proof of cause"
      ],
      0
    ]
  ],
  "horizon": [
    [
      "Your task is to analyze workforce trends. Which approach best supports a decision in workforce and future planning?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ],
    [
      "Your task is to compare career costs and benefits. Which approach best supports a decision in workforce and future planning?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ],
    [
      "A forecast assumes the recent trend will continue. What should you report alongside it?",
      [
        "The assumption, uncertainty, and alternative scenarios",
        "A guarantee that it will happen",
        "Only the most optimistic estimate"
      ],
      0
    ]
  ],
  "sentinel": [
    [
      "Your task is to compare public safety patterns. Which approach best supports a decision in public safety and crime?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ],
    [
      "Your task is to prioritize prevention resources. Which approach best supports a decision in public safety and crime?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ],
    [
      "A headline about public safety and crime cites a large total while omitting group sizes. What should you do?",
      [
        "Check denominators, comparable groups, and the original source",
        "Accept the headline because the total is large",
        "Treat the total as proof of cause"
      ],
      0
    ]
  ],
  "lumina": [
    [
      "Your task is to evaluate evidence for research decisions. Which approach best supports a decision in science and research?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ],
    [
      "Your task is to compare proposed studies. Which approach best supports a decision in science and research?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ],
    [
      "A headline about science and research cites a large total while omitting group sizes. What should you do?",
      [
        "Check denominators, comparable groups, and the original source",
        "Accept the headline because the total is large",
        "Treat the total as proof of cause"
      ],
      0
    ]
  ],
  "vitalis": [
    [
      "Your task is to interpret health trends. Which approach best supports a decision in health and wellness?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ],
    [
      "Your task is to compare health interventions. Which approach best supports a decision in health and wellness?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ],
    [
      "A headline about health and wellness cites a large total while omitting group sizes. What should you do?",
      [
        "Check denominators, comparable groups, and the original source",
        "Accept the headline because the total is large",
        "Treat the total as proof of cause"
      ],
      0
    ]
  ],
  "terra": [
    [
      "Your task is to compare environmental trends. Which approach best supports a decision in environment and sustainability?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ],
    [
      "Your task is to evaluate sustainability options. Which approach best supports a decision in environment and sustainability?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ],
    [
      "A headline about environment and sustainability cites a large total while omitting group sizes. What should you do?",
      [
        "Check denominators, comparable groups, and the original source",
        "Accept the headline because the total is large",
        "Treat the total as proof of cause"
      ],
      0
    ]
  ],
  "forge": [
    [
      "Your task is to evaluate production efficiency. Which approach best supports a decision in engineering and manufacturing?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ],
    [
      "Your task is to compare manufacturing options. Which approach best supports a decision in engineering and manufacturing?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ],
    [
      "A part must measure 10 ± 0.2 millimeters. Which measurement meets the tolerance?",
      [
        "10.1 mm",
        "10.4 mm",
        "9.7 mm"
      ],
      0
    ]
  ],
  "transit": [
    [
      "A vehicle uses 60 of its 80 available seats. What is capacity utilization?",
      [
        "75%",
        "60%",
        "133%"
      ],
      0
    ],
    [
      "Your task is to compare route and scheduling options. Which approach best supports a decision in transportation and logistics?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ],
    [
      "A headline about transportation and logistics cites a large total while omitting group sizes. What should you do?",
      [
        "Check denominators, comparable groups, and the original source",
        "Accept the headline because the total is large",
        "Treat the total as proof of cause"
      ],
      0
    ]
  ],
  "harvest": [
    [
      "Your task is to compare production costs. Which approach best supports a decision in food and agricultural systems?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ],
    [
      "Your task is to evaluate agricultural yield trends. Which approach best supports a decision in food and agricultural systems?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ],
    [
      "Your task is to compare resource allocation options. Which approach best supports a decision in food and agricultural systems?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ]
  ],
  "arena": [
    [
      "Your task is to compare performance trends. Which approach best supports a decision in sports and performance?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ],
    [
      "Your task is to select improvement strategies. Which approach best supports a decision in sports and performance?",
      [
        "Compare relevant, consistent measures and state limitations",
        "Choose the largest raw number without context",
        "Select only evidence that confirms your initial view"
      ],
      0
    ],
    [
      "A headline about sports and performance cites a large total while omitting group sizes. What should you do?",
      [
        "Check denominators, comparable groups, and the original source",
        "Accept the headline because the total is large",
        "Treat the total as proof of cause"
      ],
      0
    ]
  ],
  "venture": [
    [
      "Revenue is $1,000 and total costs are $750. What is profit?",
      [
        "$250",
        "$1,750",
        "$750"
      ],
      0
    ],
    [
      "Fixed costs are $600. Price is $20 and variable cost is $8 per unit. How many units break even?",
      [
        "50",
        "30",
        "75"
      ],
      0
    ],
    [
      "A headline about business and entrepreneurship cites a large total while omitting group sizes. What should you do?",
      [
        "Check denominators, comparable groups, and the original source",
        "Accept the headline because the total is large",
        "Treat the total as proof of cause"
      ],
      0
    ]
  ],
  "mercator": [
    [
      "Income rises 5% while prices rise 8%. What does this suggest about purchasing power?",
      [
        "Purchasing power decreased",
        "Purchasing power increased 13%",
        "Purchasing power necessarily stayed equal"
      ],
      0
    ],
    [
      "A forecast assumes the recent trend will continue. What should you report alongside it?",
      [
        "The assumption, uncertainty, and alternative scenarios",
        "A guarantee that it will happen",
        "Only the most optimistic estimate"
      ],
      0
    ],
    [
      "A headline about finance and economics cites a large total while omitting group sizes. What should you do?",
      [
        "Check denominators, comparable groups, and the original source",
        "Accept the headline because the total is large",
        "Treat the total as proof of cause"
      ],
      0
    ]
  ]
};
export const crimeData = [
    { incident: "S-1042", district: "North", type: "Vehicle Theft", calls: 43, arrests: 12, pop: 12500, rate: "3.44" },
    { incident: "S-1043", district: "South", type: "Vehicle Theft", calls: 51, arrests: 18, pop: 18100, rate: "2.82" },
    { incident: "S-1044", district: "West", type: "Vehicle Theft", calls: 510, arrests: 15, pop: 14900, rate: "34.23", issue: "outlier" },
    { incident: "S-1045", district: "East", type: "Vehicle Theft", calls: 47, arrests: "—", pop: 15500, rate: "3.03", issue: "missing" },
    { incident: "S-1045", district: "East", type: "Vehicle Theft", calls: 47, arrests: "—", pop: 15500, rate: "3.03", issue: "duplicate" },
    { incident: "S-1047", district: "West", type: "veh theft", calls: 56, arrests: 16, pop: 14900, rate: "3.76", issue: "category" }
];
export const missionSteps = ["Briefing", "Data Lab", "Find Signal", "Build Evidence", "Make Call", "Assessment", "Debrief"];

export const preAttitudeStatements = [
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

export const preCognitiveQuestions = [
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

export const majors = ["Accounting","African American Studies","Anthropology","Aquatic and fishery sciences","Architecture or Architectural design","Art history","Art","Astronomy","Atmospheric sciences","Biochemistry","Bioengineering","Biology (including marine, molecular, etc.)","Botany","Business","Chemical engineering","Chemistry","Cinematography","Civil and environmental engineering","Classics","Communication","Comparative literature","Computer engineering or computer science","Construction management","Criminal science and forensics","Criminology","Dance","Design","Digital arts","Drama, including acting, writing, theatre","Earth and space science","Ecology","Economics","Education, including early childhood and special education","Electrical engineering","English","Environmental science","Ethnic studies","Film studies","Finance","Food science, including nutrition science","Foreign language and literature","Genetics","Geography","Geology","Health sciences","History","Industrial engineering","International studies","Kinesiology, including sports medicine and exercise biology","Library science","Linguistics","Management","Materials science and engineering","Mathematics","Mechanical engineering","Medical technology","Music, including performance, composition, history, music education, and recording technology","Nursing","Oceanography","Philosophy","Physics","Physiology","Political science","Psychology","Religious studies","Resource management, including forestry and wildlife management","Rhetoric","Social justice","Social welfare or social work","Sociology","Speech, language, and hearing sciences and disorders","Statistics","Technical communication, a field that includes tech writing","Urban Studies or City Planning","Women's Studies","Undecided","Other"];
