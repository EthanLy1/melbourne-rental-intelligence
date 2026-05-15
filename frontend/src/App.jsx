import { useMemo, useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { BED_TYPES, BAR_COLORS } from "./config/constants";
import { useRentalData } from "./hooks/useRentalData";
import { formatPrice } from "./utils/helpers";
import InsightCard from "./components/InsightCard";
import DataInsights from "./components/DataInsights";
import MapView from "./components/MapView";
import RegionAnalytics from "./components/RegionAnalytics";
import AdditionalCharts from "./components/AdditionalCharts";
import Top10Tables from "./components/Top10Tables";

// debounce function to improve search bar performance
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}

// navigation header
const NAV_ITEMS = [
  { id: "map", label: "Map", icon: "🗺️" },
  { id: "insights", label: "Insights", icon: "🧠" },
  { id: "region-analytics", label: "Regions", icon: "📊" },
  { id: "additional-charts", label: "Trends", icon: "📈" },
  { id: "rankings", label: "Rankings", icon: "🏆" },
  { id: "filters", label: "Search", icon: "🔍" },
  { id: "listings", label: "Listings", icon: "📋" },
];

export default function App() {
  const { rentals, loading, error } = useRentalData();
  const [search, setSearch] = useState("");  
  const [mapSearch, setMapSearch] = useState("");  
  const [region, setRegion] = useState("All");
  const [sortKey, setSortKey] = useState("Suburb");
  const [sortDir, setSortDir] = useState("asc");
  const [activeBedType, setActiveBedType] = useState("twoBedFlat");
  const [chartBedTypes, setChartBedTypes] = useState(BED_TYPES.map((b) => b.key));
  const [activeSection, setActiveSection] = useState("insights");
  const debouncedSearch = useDebounce(search, 300);
  const debouncedMapSearch = useDebounce(mapSearch, 300);  

  // update active section based on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = NAV_ITEMS.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(NAV_ITEMS[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 110;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const toggleChartBedType = (key) => {
    setChartBedTypes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const regions = useMemo(() => {
    return ["All", ...new Set(rentals.map((r) => r.Region).filter(Boolean))];
  }, [rentals]);

 const filteredRentals = useMemo(() => {
  const searchLower = debouncedSearch.toLowerCase(); 
  const filtered = rentals.filter((rental) => {
    const suburbMatch = (rental.Suburb || "").toLowerCase().includes(searchLower);
    const regionMatch = region === "All" || rental.Region === region;
    return suburbMatch && regionMatch;
  });
  return [...filtered].sort((a, b) => {
    const aVal = sortKey === "Suburb" ? (a.Suburb || "") : (a[sortKey] ?? -Infinity);
    const bVal = sortKey === "Suburb" ? (b.Suburb || "") : (b[sortKey] ?? -Infinity);
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });
}, [rentals, debouncedSearch, region, sortKey, sortDir]); 

  const stats = useMemo(() => {
    const valid = filteredRentals.filter((r) => r[activeBedType] != null && r[activeBedType] !== 0);
    if (!valid.length) return { highest: null, lowest: null, avg: null };
    let highest = valid[0], lowest = valid[0], total = 0;
    for (const rental of valid) {
      const value = rental[activeBedType];
      if (value > highest[activeBedType]) highest = rental;
      if (value < lowest[activeBedType]) lowest = rental;
      total += value;
    }
    return { highest, lowest, avg: total / valid.length };
  }, [filteredRentals, activeBedType]);

  const activeLabel = BED_TYPES.find((b) => b.key === activeBedType)?.label || "";

  if (loading) return <div style={{ padding: 20, color: "#333" }}>Loading Melbourne Rental Data...</div>;
  if (error) return <div style={{ padding: 20, color: "red" }}>{error}</div>;

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", color: "#333" }}>
      
      {/* sticky header */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: "#1a1a2e",
        color: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}>
        <div style={{
          padding: "20px 24px 12px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          textAlign: "center", 
        }}>
          <h1 style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: "-0.5px",
            color: "white",
            textAlign: "center", 
          }}>
            Melbourne Rental Intelligence
          </h1>
          <p style={{
            margin: "6px 0 0",
            fontSize: 13,
            opacity: 0.7,
            color: "rgba(255,255,255,0.8)",
            textAlign: "center", 
          }}>
            Comprehensive rental market analytics for Melbourne metropolitan area
          </p>
        </div>

        <div style={{
          padding: "0 24px",
          display: "flex",
          gap: 4,
          overflowX: "auto",
          scrollbarWidth: "thin",
          justifyContent: "center", 
        }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 20px",
                border: "none",
                background: "transparent",
                color: activeSection === item.id ? "white" : "rgba(255,255,255,0.6)",
                fontSize: 14,
                fontWeight: activeSection === item.id ? 600 : 400,
                cursor: "pointer",
                borderBottom: activeSection === item.id ? "2px solid #667eea" : "2px solid transparent",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* main content*/}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px", color: "#333" }}>
        
        {/* property type filter at top */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 32,
          padding: "4px",
        }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#555", marginRight: 8, alignSelf: "center" }}> </span>
         
        </div>


        {/* sections/order */}
        <section id="map" style={{ marginBottom: 48, scrollMarginTop: 110 }}>
 
  <MapView 
    rentals={rentals} 
    activeBedType={activeBedType} 
    search={debouncedMapSearch} 
    region={region} 
    onBedTypeChange={setActiveBedType}
    mapSearchValue={mapSearch}
    onMapSearchChange={setMapSearch}
  />
</section>

        {/* map summary cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}>
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #eee" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#666" }}>💰 Most Expensive</p>
            <strong style={{ fontSize: 20, color: "#222" }}>{stats.highest?.Suburb || "—"}</strong>
            <p style={{ margin: "4px 0 0", fontSize: 18, color: "#667eea", fontWeight: 600 }}>{formatPrice(stats.highest?.[activeBedType])}</p>
          </div>
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #eee" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#666" }}>📉 Cheapest</p>
            <strong style={{ fontSize: 20, color: "#222" }}>{stats.lowest?.Suburb || "—"}</strong>
            <p style={{ margin: "4px 0 0", fontSize: 18, color: "#667eea", fontWeight: 600 }}>{formatPrice(stats.lowest?.[activeBedType])}</p>
          </div>
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #eee" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#666" }}>📊 Avg {activeLabel}</p>
            <strong style={{ fontSize: 28, color: "#222" }}>{stats.avg != null ? `$${stats.avg.toFixed(0)}` : "—"}</strong>
          </div>
        </div>

        <section id="insights" style={{ marginBottom: 48, scrollMarginTop: 110 }}>
          <DataInsights rentals={rentals} />
        </section>

        <section id="region-analytics" style={{ marginBottom: 48, scrollMarginTop: 110 }}>
          <RegionAnalytics rentals={rentals} />
        </section>

        <section id="additional-charts" style={{ marginBottom: 48, scrollMarginTop: 110 }}>
          <AdditionalCharts rentals={rentals} />
        </section>

        <section id="rankings" style={{ marginBottom: 48, scrollMarginTop: 110 }}>
          <Top10Tables rentals={filteredRentals} />
        </section>

        {/* search and filters interactivity */}
        <section id="filters" style={{ marginBottom: 48, scrollMarginTop: 110 }}>
          <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #eee" }}>
            <h2 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 600, color: "#222" }}>🔍 Search &amp; Filter</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
              <input 
                type="text" 
                placeholder="Search suburb..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                style={{ flex: 1, minWidth: 200, padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, color: "#333", background: "white" }}
              />
              <select value={region} onChange={(e) => setRegion(e.target.value)} style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, background: "white", color: "#333" }}>
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, background: "white", color: "#333" }}>
                <option value="Suburb">Suburb (A–Z)</option>
                {BED_TYPES.map(({ key, label }) => <option key={key} value={key}>{label} price</option>)}
              </select>
              <button onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))} style={{ padding: "10px 20px", background: "#667eea", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>
                {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#555" }}>Chart Filters:</span>
              <button 
                onClick={() => chartBedTypes.length === BED_TYPES.length ? setChartBedTypes([]) : setChartBedTypes(BED_TYPES.map((b) => b.key))} 
                style={{ padding: "4px 12px", background: chartBedTypes.length === BED_TYPES.length ? "#667eea" : "#f0f0f0", color: chartBedTypes.length === BED_TYPES.length ? "white" : "#333", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
              >
                All
              </button>
              {BED_TYPES.map(({ key, label }) => (
                <label key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer", color: "#333" }}>
                  <input type="checkbox" checked={chartBedTypes.includes(key)} onChange={() => toggleChartBedType(key)} />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* search and filters chart */}
        <div style={{ background: "white", borderRadius: 12, padding: 20, marginBottom: 48, border: "1px solid #eee", overflowX: "auto" }}>
          <div style={{ minWidth: Math.max(filteredRentals.length * 55, 800), height: 500 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredRentals} margin={{ top: 20, right: 20, left: 10, bottom: 120 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="Suburb" angle={-45} textAnchor="end" interval={0} height={110} tick={{ fontSize: 11, fill: "#555" }} />
                <YAxis tick={{ fill: "#555" }} />
                <Tooltip formatter={(value) => value != null && value !== 0 ? `$${value}` : "No data"} contentStyle={{ backgroundColor: "white", color: "#333", border: "1px solid #ddd" }} />
                <Legend wrapperStyle={{ color: "#333" }} />
                {BED_TYPES.filter(({ key }) => chartBedTypes.includes(key)).map(({ key, label }, index) => (
                  <Bar key={key} dataKey={key} name={label} fill={BAR_COLORS[index]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* listings */}
        <section id="listings" style={{ scrollMarginTop: 110 }}>
          <h2 style={{ margin: "0 0 20px 0", fontSize: 20, fontWeight: 600, color: "#222" }}>📋 Detailed Listings ({filteredRentals.length} suburbs)</h2>
          {filteredRentals.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666" }}>No suburbs found.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {filteredRentals.map((rental) => (
                <div key={rental.Suburb} style={{ background: "white", borderRadius: 12, padding: 20, border: "1px solid #eee" }}>
                  <h3 style={{ margin: 0, fontSize: 16, color: "#222" }}>{rental.Suburb}</h3>
                  <p style={{ margin: "4px 0 12px", fontSize: 12, color: "#666" }}>{rental.Region}</p>
                  {BED_TYPES.map(({ key, label }) => (
                    <p key={key} style={{ margin: 4, fontSize: 13, display: "flex", justifyContent: "space-between", color: "#333" }}>
                      <span style={{ color: "#666" }}>{label}:</span>
                      <strong style={{ color: "#222" }}>{formatPrice(rental[key])}</strong>
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* back to top button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "#1a1a2e",
            color: "white",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}