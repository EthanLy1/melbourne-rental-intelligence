## License & Usage
Copyright (c) 2026 Ethan Ly

This project is licensed under GNU General Public License v3.0 (GPL-3.0). 
You may view, fork, and learn from this code, but any public use must provide 
attribution to the original author (Ethan Ly). Commercial use or claiming this 
work as your own is prohibited under this license.



Project Title: Melbourne Rental Intelligence

High-level Stack: e.g., Python/FastAPI/Flask for backend, React/Vue for frontend.

Overview: This project is a Melbourne rental market analysis dashboard. It visualises weekly rent prices across 100+ suburbs for different property types (1-4 bed flats and houses). In the dashboard you can filter by region, search suburbs. compare prices on a bar chart, see insights on a map, and fine the most expensive/cheapest areas. All the data is from real Melbourne suburbs with breakdowns by region Inner Melbourne, Southern Melbourne, Western Melbourne, etc. Concisely, a data dashboard for exploring Melbourne rental pices.

Features include:
Smart Insights,
Map view,
Region analytics,
Additional analytics,
Rankings,
Filter & search chart,
Listings.


How to run (terminal): 
Backend
1. cd backend
2. venv/Scripts/activate
3. uvicorn main:app --reload

Frontend
1. cd frontend
2. npm run dev


Limitations:
- Suburbs with blanks/0 are excluded in logic for insights. Meaning the suburbs excluded might actually be what the insight is asking for. Then again the data was missing these values and could not be restored unless imputation is applied. Did not want to create data values through imputation for the dataset so chose to left blanks. 
- Dataset is based on Medians. Results vary if it was Mean instead.
- Categories are based on quartiles. E.g. Affordable and Budget category is based on 0-25th Percentile. Means price might not actually be considered 'Affordable' as Affordable should be categorised for actual Melbourne market, instead of mathematics.


Additions for frontend:
src/components
src/config/constants.js
src/hooks/useRentalData.js
src/utils/helpers.js
styles.js