# Melbourne Rental Intelligence <img src="./frontend/public/logo.png" height="32" alt="Logo">
![Python](https://img.shields.io/badge/Python-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-green)
![React](https://img.shields.io/badge/React-61dafb)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791)
![Leaflet](https://img.shields.io/badge/Leaflet-199900)

![Demo Animation](./screenshots/demo.gif)

### Live Demo: [Melbourne Rental Intelligence](https://melbourne-rental-intelligence.onrender.com/)

>⚠️ **Note:** First load may take 15-30 seconds as the backend wakes up from inactivity (free tier). Refresh if needed!

---

## Overview

If I wanted to explore rental prices, I would have to manually search suburb after suburb across multiple listings sites. I wanted a single interface to explore affordability hotspots, and regional trends — so I built a dashboard that does exactly that. **Melbourne Rental Intelligence**. A full-stack analytics dashboard that visualises median weekly rent across Melbourne using interactive maps, dynamic charts, and suburb-level analysis.

---

## Features

- Interactive rental map that visualises affordability hotspots with searching and filtering. 
- Rule-based smart insights that detect anomalies in rental pricing, with data statements. 
- Region analytics that display cheapest, expensive, and average visualisations. 
- Trends that show price and suburb distribution with filtering. 
- Top 10 suburb rankings (expensive vs affordable). 
- Searching, filtering, and sorting suburbs.
- Detailed listings with search and pin feature, as well as price category colour indicators.

---

## Technologies

**Frontend:** React, Vite

**Backend:** Python, FastAPI, PostgreSQL, SQLAlchemy

**Data Processing:** Pandas

**Mapping & Charts:** Leaflet, Recharts

**Styling: CSS-in-JS**

**Data Fetching: Axios**

---

## Architecture

**Data engineering:** Loaded raw Excel data from the Victorian Government. Cleaned and transformed it with Pandas.

**Database:** Set up PostgreSQL database on pgAdmin4 locally.

**API Development:** Built a FastAPI backend serving rental data via a RESTful API.

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
│   │   │   ├── DetailedListings.jsx
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

## Data & Insights

📊 4-bedroom houses show the widest price range in Melbourne, from $470/wk in Melton to $1,875/wk in Toorak, a 300% difference driven purely by location.

🗺️ South Eastern Melbourne is 45% cheaper than Inner Melbourne for a 3-bedroom house ($835/wk vs $1,005/wk), saving renters $455/week or nearly $23,676/year.

📈 At $1,875/wk, Toorak 4-bedroom houses sit 104% above the Melbourne average of $918, signalling premium demand, limited supply, and suburb desirability.

For data source and cleaning details, see [DATA.md](DATA.md)

---

## 📸 Screenshots

### Rental Map:
![map](./screenshots/map.png)

### Smart Insights:
![insights](./screenshots/insights.png)

### Region Analytics:
![region](./screenshots/region.png)

### Search & Filter:
![search](./screenshots/search.png)

### Detailed Listings:
![listings](./screenshots/listings.png)

### Mobile View:
![mobile](./screenshots/mobile.png)

---

## Future Improvements

- Export visualisations as downloadable reports (PDF/CSV)

- Improve data preprocessing with missing-value imputation strategies

- Implement user accounts with feature to save/favourite custom searches/filters

---

## Notes

I built this as a portfolio project to demonstrate full-stack data visualisation skills. From data cleaning and analysis, to building an intuitive, insight-driven dashboard that uses real-world rental data.

Some suburbs and property type combinations display "No data" where the source dataset contained missing or blank values. Rather than imputing or estimating figures, I chose to represent these gaps honestly to keep the data genuine.

---

## License

This project is licensed under the MIT License. You are free to use, modify, and distribute this code for personal or commercial purposes, provided you include the original copyright notice.

See the [LICENSE](LICENSE) file for full details.