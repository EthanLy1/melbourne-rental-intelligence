# Melbourne Rental Intelligence <img src="./frontend/public/logo.png" height="32" alt="Logo">
![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.13-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![FastAPI](https://img.shields.io/badge/FastAPI-0.136.1-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)
![Recharts](https://img.shields.io/badge/Recharts-3.8-8884d8)

![Demo Animation](./screenshots/demo.gif)

### Live Demo: ...

This project is an interactive rental-market analytics dashboard for Melbourne. Renters, investors and real estate professionals can explore median rent prices across 119 suburbs through interactive maps, charts, and data-driven insights. 

---

## 🔍 Overview

- A full-stack rental analytics dashboard that visualises median weekly rent across Melbourne's metropolitan area. It replaces manual suburb-by-suburb comparison with a single interactive interface for exploring affordability, pricing hotspots, and regional market trends.
- Useful for renters searching for affordable suburbs, property investors tracking market trends, and real estate professionals needing quick regional comparisons to guide their decisions.

Built as a portfolio project to demonstrate full-stack development, data visualisation, and analytics skills using real-world rental data. The project transforms raw dataset into interactive visual insights that make Melbourne’s rental market easier to explore and understand.

---

## ✨ Features

- Interactive Melbourne rental map with price-based clustering
- Rule-based smart insights detecting anomalies in rental pricing
- Region-level analytics for comparing affordability across regions
- Top 10 suburb rankings (expensive vs affordable)
- Advanced filtering with search, sort, suburb, region, and property type
- Property-type comparison visualisations
- Responsive dashboard design

---

## 🚀 What Makes This Project Unique

- Combines geospatial mapping (Leaflet) with statistical analytics (Pandas + Recharts)
- Generates automated market insights instead of just displaying raw data
- Provides multi-level analysis: suburb → region → state-wide trends
- Fully interactive dashboard replacing traditional static rental reports

---

## 🧱 Tech Stack

**Frontend**
- React 19
- Vite
- Recharts
- React-Leaflet / Leaflet
- Axios 
- Custom CSS-in-JS styling

**Backend**
- Python
- FastAPI
- PostgreSQL
- SQLAlchemy (ORM)

**Visualisation / Tools**
- Recharts
- Leaflet / React-Leaflet
- CSS-in-JS
- Custom percentile coloring

**Data Processing (Notebook-only)**
- Pandas

---

## 🏗️ Architecture

- FastAPI backend serves processed rental data via REST API
- React frontend consumes API and renders interactive visualisations
- Data is cleaned and transformed using Pandas before exposure
- Leaflet + Recharts handle geospatial and statistical rendering

---

## 📁 Project Structure

```text
melbourne-rental-intelligence/
├── backend/
│   ├── database.py          
│   └── main.py               
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
├── README.md
└── requirements.txt
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

## 📊 Data Intelligence & Insights

For data source and cleaning details, see [DATA.md](DATA.md)

- Detects suburbs significantly above/below market average (20%+ anomalies)
- Compares regional premiums and affordability pockets across Melbourne
- Generates automated insights about market trends and price variances
- Visualises price distributions from budget to luxury using percentile-based coloring
- Tracks median rent trends across 5 property types and 9 regions

---

## 📸 Screenshots

### Interactive Rental Map
![Interactive Map](./screenshots/map.png)

### Smart Insights
![Smart Insights](./screenshots/insights.png)

### Additional Analytics
![Additional Analytics](./screenshots/additional.png)

### Rankings Tables
![Rankings Tables](./screenshots/rankings.png)

### Search & Filter
![Search & Filter](./screenshots/search.png)

### Mobile View
![Mobile View](./screenshots/mobile.png)

---

## 💡 Future Improvements

- Export visualisations as downloadable reports (PDF/CSV)
- Implement user accounts with feature to save/favourite custom searches/filters
- Improve data preprocessing with missing-value imputation strategies
- Implement React.lazy() for code splitting and faster initial load

---

## 📌 Notes

I built this as a portfolio project to demonstrate full-stack data visualisation skills, and end-to-end development skills. From data cleaning and analysis, to building an intuitive, insight-driven dashboard that uses real-world rental data.

---

## 📜 License

This project is licensed under the MIT License. You are free to use, modify, and distribute this code for personal or commercial purposes, provided you include the original copyright notice.

See the [LICENSE](LICENSE) file for full details.