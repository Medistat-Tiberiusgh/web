```

Geodata from https://www.dataportal.se/en/datasets/197_4312

# Roadmap:

This "Omni-search" approach—where the search bar acts as a command center—is a very modern and intuitive way to handle complex data. It moves away from rigid menus and lets the user "ask" the data a question.

To make this work without it feeling like a chaotic "data dump," you need a Modular Card-Based Layout.

Here is how you can structure that "Search-to-Insight" flow.

1. The Navigation: The "Omni-Search" Command Bar
   Instead of a standard search box, think of this as a Filter Builder.

How it works: When a user types "Stockholm," it turns into a visual tag (chip) in the search bar. If they then type "Paracetamol," that becomes a second tag.

The Logic: \* No tags = National Overview (2006–2024).

Geography tag = Region Profile.

Drug/ATC tag = Drug Deep Dive.

Both tags = How that specific drug behaves in that specific region.

2. The Layout: The "Dynamic Dashboard"
   Since you don't know exactly what the user will search for, your UI needs to be a grid of cards that rearrange or change content based on the "Search Context."

Top Row: The "Pulse" (KPI Cards)

These are small, high-level summary cards that update instantly.

Total Patients: (For the selected filters).

Per 1,000 Inhabitants: (The "Relative Burden" metric).

Narcotic Share: % of the current selection that are narcotics.

Middle Row: The "Main Story" (Primary Charts)

The Trend Line (Large Card): A line chart showing per_1000 or num_prescriptions over the 19-year span.

Tip: If the user selects two drugs, this chart automatically shows two lines for comparison.

The Geographic Heatmap: A choropleth map of Sweden. If a specific region is already searched, highlight it; if not, show the intensity across the country.

Bottom Row: The "Demographic Breakdown" (Detailed Analysis)

Gender Gap (Butterfly Chart): A mirrored bar chart showing Men vs. Women. It’s the best way to visualize "Gender Skew" at a glance.

Age Distribution (Horizontal Bar Chart): Show the 18 age bands. This reveals if a drug is an "elderly drug" (e.g., heart medication) or a "youth drug" (e.g., ADHD medication).

3. Best Charts for Your Specific Metrics
   Analysis Type Best Chart Type Why?
   Trend (2006–2024) Line Chart Best for seeing "spikes" or "drops" over long periods.
   Regional Rank Sorted Bar Chart Clearly shows which of the 21 regions is the highest "outlier."
   Chronic Use Scatter Plot X-axis: Patients, Y-axis: Prescriptions. High dots = high repeat use.
   Narcotic vs Non Donut Chart Good for a quick "composition" overview of a category.
4. Prioritization: Where to start?
   If you are building this from scratch, don't try to build all 1,999 ATC deep-dives at once. Start with this Development Roadmap:

Phase 1: The "National Trend" (The MVP)

Build the search bar to handle just Drugs.

Goal: Can I search for "Antibiotics" and see a national line chart of use from 2006–2024?

Focus: Data cleaning and the time-series line chart.

Phase 2: The "Regional Layer"

Add the Geography dimension.

Goal: Can I filter that Antibiotic search to just "Skåne"?

Focus: Implementing the map and regional comparison bars.

Phase 3: The "Demographic Deep-Dive"

Add Age and Gender.

Goal: "Show me Antidepressants in Stockholm for Women aged 18–24."

Focus: Complex filtering logic and the Butterfly/Age charts.

Phase 4: The "Intelligence Layer"

Goal: Auto-calculate the "Patients vs. Prescriptions" ratio and flag narcotics automatically.

- fix hovering tooltip
- fix text so that the cards use the same text

use RxNav API and MedlinePlus for substance information

What the current API exposes vs what it could
What Current API What you could add
Overall trend trend — gender=3, age=99, national same per region over time
Gender breakdown genderSplit — gender=1/2, age=99 (all ages) gender × specific age band
Age breakdown ageSplit — gender=3, age=1-18 (latest year only) all years, not just latest
Regional snapshot regionalPopularity — all regions, latest year regional trend over time
Combined nothing gender × age grid
What I'd actually add and why

1. Demographic grid — highest value, most portfolio impact

Add a demographicGrid field: returns gender=1/2 × age_group=1-18 for the latest year. This powers a heatmap where age is on the Y-axis, men/women are two columns, and cell color is per_1000 intensity.

Why: you'd immediately see patterns that neither the age chart nor the gender chart can show alone. For example — an antidepressant heavily prescribed to women aged 30–60, or a blood pressure drug skewed toward older men. That's a genuinely insightful visualisation, and it's the kind of thing that looks impressive in a portfolio because it takes a real analytical thought to design.

2. Regional trend over time — medium value

The current map shows one snapshot year. Add regionalTrend (or extend the existing query) to return the trend for the selected region over all years. The chart would then show national trend vs your region's trend — which is already on the roadmap, but currently the regional line is flat because you only have one point.

Actually wait — looking at useDashboardInsights, you already pass regionId to useDrugInsights and get regional.trend. Does that trend have multiple years? Let me check.

Bash
IN
awk -F',' '$2 == 1 && $4 == 3 && $5 == 99 && $3 == "A01AA01"' /Users/tiberius/Developer/repos/gitlab/1dv027/from-csv-to-database/sample/prescription_data.csv | head -10

OUT
2022,1,A01AA01,3,99,85855,37874,"35,55"
2023,1,A01AA01,3,99,97650,42786,"40,02"
2024,1,A01AA01,3,99,102977,44793,"41,95"
[rerun: b1]
Bash
IN
awk -F',' '$2 == 0 && $4 == 3 && $5 == 99 && $3 == "A01AA01"' /Users/tiberius/Developer/repos/gitlab/1dv027/from-csv-to-database/sample/prescription_data.csv

OUT
2022,0,A01AA01,3,99,699121,282777,"66,89"
2023,0,A01AA01,3,99,766290,306198,"72,83"
2024,0,A01AA01,3,99,803446,319839,"76,14"
[rerun: b2]
Good — the sample only covers 2022–2024 but the full dataset goes to 2006. The regional trend data is already in the database year by year, so the backend probably already returns it. The TrendChart should already show a multi-year regional line — worth verifying that works before adding anything new.

What I'd actually recommend adding
Priority 1 — Demographic heatmap (gender × age)

This is the single highest-value thing you could add. Right now gender and age are two separate charts. The database has every combination — men aged 50–54, women aged 30–34, etc. A heatmap with age bands on the Y-axis and men/women as two side-by-side columns, cell color = per_1000 intensity, would show patterns neither chart can reveal alone:

Is this drug predominantly prescribed to older women?
Is the male skew concentrated in one specific age group or spread evenly?
That's a genuinely analytical insight, and it looks impressive because you need to understand the data structure to design it. It requires one new API field and one new component.

Priority 2 — Age trends over time

The ageSplit currently gives you only the latest year. But every year from 2006–2024 is in the database. If you return all years for each age band, you can show how the prescribing age profile of a drug shifted over time — which is clinically interesting (has Sertralin been increasingly prescribed to younger people?). This is a small API change with a big storytelling payoff.

Priority 3 — Prescriptions per patient by age

You already compute the overall chronic use ratio (prescriptions/patients). The same metric exists per age band — older patients might refill 5–6 times vs younger patients once. This adds depth to the age chart without needing a new chart type, just an extra bar or number on each row.

What I'd skip for now
Combined gender+age filter on the trend chart — possible, but the data payload becomes large (36 combinations per year × 19 years) and the UX for selecting "men aged 50–54" in the search bar is awkward. The heatmap shows that story more naturally without needing a filter.

More regional breakdowns — the regional map and ranking already do this well. More regional slicing adds complexity without a clear new insight.

My concrete suggestion
Do the heatmap first. It's the most visually impressive, it requires an API change that shows you understand the data model, and it's the kind of chart that makes a portfolio reviewer stop and look.

The API change would be adding a demographicGrid field to the drugInsights query that returns gender=1/2 × age_group=1-18 rows for the selected year. On the frontend, a grid component where age is the Y-axis, the two genders are columns, and each cell is colored by per_1000 relative to the max — similar to a GitHub contribution graph but 2D.

Do you want to start there, or would you rather verify the regional trend is working correctly first since that's already supposed to be in the data?
```
