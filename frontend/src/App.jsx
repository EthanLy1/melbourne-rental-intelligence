import { useMemo, useState, useEffect } from "react";
import { BED_TYPES } from "./config/constants";
import { useRentalData } from "./hooks/useRentalData";
import { formatPrice } from "./utils/helpers";
import DataInsights from "./components/DataInsights";
import MapView from "./components/MapView";
import RegionAnalytics from "./components/RegionAnalytics";
import AdditionalCharts from "./components/AdditionalCharts";
import SearchFilters from "./components/SearchFilters";
import Top10Tables from "./components/Top10Tables";
import LoadingScreen from "./components/LoadingScreen";

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

// nav bar tabs
const NAV_ITEMS = [
  { id: "map", label: "Map", icon: "🗺️" },
  { id: "insights", label: "Insights", icon: "💡" },
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
  const [isMobile, setIsMobile] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const debouncedMapSearch = useDebounce(mapSearch, 300);  

  // check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // scroll to section from navbar with animation
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const header = document.querySelector('[style*="position: sticky"]');
      const headerHeight = header ? header.getBoundingClientRect().height : (isMobile ? 140 : 110);
      
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 16; 
      
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const toggleChartBedType = (key) => {
    setChartBedTypes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAllChartTypes = () => {
    if (chartBedTypes.length === BED_TYPES.length) {
      setChartBedTypes([]);
    } else {
      setChartBedTypes(BED_TYPES.map((b) => b.key));
    }
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

  if (loading) return <LoadingScreen/>;
  if (error) return <div style={{ padding: 20, color: "red" }}>{error}</div>;

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", color: "#333" }}>
      
      {/* sticky header */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 99999,
        isolation: "isolate",
        background: "#1a1a2e",
        color: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}>
        <div style={{
          padding: isMobile ? "12px 16px 8px 16px" : "20px 24px 12px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          textAlign: "center", 
        }}>
          <h1 style={{
            margin: 0,
            fontSize: isMobile ? 18 : 24,
            fontWeight: 600,
            letterSpacing: "-0.5px",
            color: "white",
            textAlign: "center", 
          }}>
            Melbourne Rental Intelligence
          </h1>
          <p style={{
            margin: "4px 0 0",
            fontSize: isMobile ? 10 : 13,
            opacity: 0.7,
            color: "rgba(255,255,255,0.8)",
            textAlign: "center",
            display: isMobile ? "none" : "block",
          }}>
            Comprehensive rental market analytics for Melbourne metropolitan area
          </p>
        </div>

        {/* navigation bar */}
        <div style={{
          padding: isMobile ? "0 12px" : "0 24px",
          display: "flex",
          gap: isMobile ? 2 : 4,
          overflowX: "auto",
          scrollbarWidth: "thin",
          WebkitOverflowScrolling: "touch",
          justifyContent: isMobile ? "flex-start" : "center",
        }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 4 : 8,
                padding: isMobile ? "10px 12px" : "12px 20px",
                border: "none",
                background: "transparent",
                color: "rgba(255,255,255,0.7)", 
                fontSize: isMobile ? 12 : 14,
                fontWeight: 400, 
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                minHeight: 44,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.7)";
              }}
            >
              <span style={{ fontSize: isMobile ? 14 : 16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* main content */}
      <div style={{ 
        maxWidth: 1400, 
        margin: "0 auto", 
        padding: isMobile ? "16px 12px" : "32px 24px", 
        color: "#333" 
      }}>
        
        {/* map view */}
        <section id="map" style={{ marginBottom: 40, scrollMarginTop: 110 }}>
          <MapView 
            rentals={rentals} 
            activeBedType={activeBedType} 
            search={debouncedMapSearch} 
            onBedTypeChange={setActiveBedType}
            mapSearchValue={debouncedMapSearch}
            onMapSearchChange={setMapSearch}
          />
        </section>

        {/* summary cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 32,
        }}>
          <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #eee" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Most Expensive</p>
            <strong style={{ fontSize: 18, color: "#222" }}>{stats.highest?.Suburb || "—"}</strong>
            <p style={{ margin: "4px 0 0", fontSize: 18, color: "#667eea", fontWeight: 600 }}>{formatPrice(stats.highest?.[activeBedType])}</p>
          </div>
          <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #eee" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Cheapest</p>
            <strong style={{ fontSize: 18, color: "#222" }}>{stats.lowest?.Suburb || "—"}</strong>
            <p style={{ margin: "4px 0 0", fontSize: 18, color: "#667eea", fontWeight: 600 }}>{formatPrice(stats.lowest?.[activeBedType])}</p>
          </div>
          <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #eee" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Avg {activeLabel}</p>
            <strong style={{ fontSize: 24, color: "#222" }}>{stats.avg != null ? `$${stats.avg.toFixed(0)}` : "—"}</strong>
          </div>
        </div>

        <section id="insights" style={{ marginBottom: 40, scrollMarginTop: 110 }}>
          <DataInsights rentals={rentals} />
        </section>

        <section id="region-analytics" style={{ marginBottom: 40, scrollMarginTop: 110 }}>
          <RegionAnalytics rentals={rentals} />
        </section>

        <section id="additional-charts" style={{ marginBottom: 40, scrollMarginTop: 110 }}>
          <AdditionalCharts rentals={rentals} />
        </section>

        <section id="rankings" style={{ marginBottom: 40, scrollMarginTop: 110 }}>
          <Top10Tables rentals={filteredRentals} />
        </section>

        {/* search and filters chart - wrap in section with id */}
        <section id="filters" style={{ marginBottom: 40, scrollMarginTop: 110 }}>
          <SearchFilters 
            search={search}
            setSearch={setSearch}
            region={region}
            setRegion={setRegion}
            regions={regions}
            sortKey={sortKey}
            setSortKey={setSortKey}
            sortDir={sortDir}
            setSortDir={setSortDir}
            chartBedTypes={chartBedTypes}
            toggleChartBedType={toggleChartBedType}
            handleSelectAllChartTypes={handleSelectAllChartTypes}
            filteredRentals={filteredRentals}
          />
        </section>

        {/* listings */}
        <section id="listings" style={{ scrollMarginTop: 110 }}>
          <h2 style={{ margin: "0 0 16px 0", fontSize: isMobile ? 18 : 20, fontWeight: 600, color: "#222" }}>
            📋 Detailed Listings ({filteredRentals.length} suburbs)
          </h2>
          {filteredRentals.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666" }}>No suburbs found.</p>
          ) : (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", 
              gap: 12 
            }}>
              {filteredRentals.map((rental) => (
                <div key={rental.Suburb} style={{ background: "white", borderRadius: 12, padding: 16, border: "1px solid #eee" }}>
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
            bottom: isMobile ? 16 : 24,
            right: isMobile ? 16 : 24,
            width: isMobile ? 50 : 80,
            height: isMobile ? 50 : 80,
            borderRadius: "50%",
            background: "#1a1a2e",
            color: "white",
            border: "none",
            fontSize: isMobile ? 24 : 40,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            zIndex: 999,
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}