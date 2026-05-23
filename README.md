# Melbourne Rental Intelligence <img src="./frontend/public/logo.png" height="32" alt="Logo">
![Python](https://img.shields.io/badge/Python-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-green)
![React](https://img.shields.io/badge/React-61dafb)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791)
![Leaflet](https://img.shields.io/badge/Leaflet-199900)

![Demo Animation](./screenshots/demo.gif)

### Live Demo: [Melbourne Rental Intelligence](https://melbourne-rental-intelligence.onrender.com/)

>⚠️ **Note:** First load may take 15-30 seconds as the backend wakes up from inactivity (free tier). Refresh if needed!

This project is an interactive rental-market analytics dashboard for Melbourne. Renters, investors and real estate professionals can explore median rent prices across 119 suburbs through interactive maps, charts, and data-driven insights. 

---

## Overview

If I wanted to explore rental prices, I would have to manually search suburb after suburb across multiple listings sites. I wanted a single interface to explore affordability hotspots, and regional trends — so I built a dashboard that does exactly that. This project transforms raw dataset into interactive visual insights that make Melbourne’s rental market easier to explore and understand.

---

## Features

- An interactive rental map that visualises affordability hotspots with searching and filtering. 
- Rule-based smart insights that detect anomalies in rental pricing. 
- Region analytics that display cheapest, expensive, and average visualisations. 
- Trends that show price and suburb distribution with filtering. 
- Top 10 suburb rankings (expensive vs affordable). 
- Searching, filtering, and sorting suburbs connected with detailed listings below.

---

## Technologies

#### Core Stack
- Frontend: React, Vite
- Backend: Python, FastAPI, PostgreSQL, SQLAlchemy
- Data Processing: Pandas

#### Key Libraries
- Mapping & Charts: Leaflet, Recharts
- Styling: CSS-in-JS
- Data Fetching: Axios

---

## Architecture

**Data engineering:** Loaded raw Excel data from the Victorian Government. Cleaned and transformed it with Pandas.

**Database:** Set up PostgreSQL database on pgAdmin4 locally.

**API Development:** Had FastAPI backend that provides database via RESTful API.

**Frontend implementation:** Built React dashboard with reusable chart components (Recharts) and interactive map (Leaflet), dynamic filters and responsive layout.

**Deployment:** Used Render to deploy FastAPI backend and React frontend. Database hosted on Neon.


---

## Project Structure

```text
melbourne-rental-intelligence/
├── backend/
│   ├── database.py          
│   ├── main.py      
│   └── requirements.txt      
├── data/
│   └── clean_rental_data.csv 
├── frontend/
│   ├── src/
│   │   ├── components/        
│   │   │   ├── AdditionalCharts.jsx
│   │   │   ├── DataInsights.jsx
│   │   │   ├── MapView.jsx
│   │   │   ├── RegionAnalytics.jsx
│   │   │   ├── SearchFilters.jsx
│   │   │   └── Top10Tables.jsx
│   │   ├── config/   
│   │   │   └── constants.js       
│   │   ├── hooks/        
│   │   │   └── useRentalData.js       
│   │   ├── utils/     
│   │   │   └── helpers.js    
│   │   ├── App.jsx   
│   │   ├── index.css  
│   │   ├── main.jsx     
│   │   └── styles.js     
│   └─ index.html
├── notebooks/
│   └── data_exploration.ipynb
├── .gitignore
├── DATA.md
├── LICENSE
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/EthanLy1/melbourne-rental-intelligence.git
cd melbourne-rental-intelligence
```


### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Create a .env file with your database URL
```
DATABASE_URL=postgresql://user:password@localhost:5432/melbourne_rentals
```

---

## 📊 Data & Insights

Inner Melbourne is 42% more expensive than Outer Western Melbourne for a 2-bedroom flat — $672/wk vs $475/wk average.

The most affordable suburb for a 2-bed flat is Melton at $365/wk, while Fitzroy sits at $750/wk for the same property type — a $385/wk difference.

At the top end, a 4-bedroom house in Toorak costs $1,875/wk — nearly 4x the $470/wk median in Melton for the same property type.

For data source and cleaning details, see [DATA.md](DATA.md)

---

## 📸 Screenshots

### Rental Map:
![Interactive Map](./screenshots/map.png)

### Smart Insights:
![Smart Insights](./screenshots/insights.png)

### Additional Analytics:
![Additional Analytics](./screenshots/additional.png)

### Rankings Tables:
![Rankings Tables](./screenshots/rankings.png)

### Search & Filter:
![Search & Filter](./screenshots/search.png)

### Mobile View:
![Mobile View](./screenshots/mobile.png)

---

## Future Improvements

- Export visualisations as downloadable reports (PDF/CSV)
- Improve data preprocessing with missing-value imputation strategies
- Implement user accounts with feature to save/favourite custom searches/filters

---

## Notes

I built this as a portfolio project to demonstrate full-stack data visualisation skills. From data cleaning and analysis, to building an intuitive, insight-driven dashboard that uses real-world rental data.

---

## License

This project is licensed under the MIT License. You are free to use, modify, and distribute this code for personal or commercial purposes, provided you include the original copyright notice.

See the [LICENSE](LICENSE) file for full details.