import { useMemo, useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { BED_TYPES, BAR_COLORS } from "../config/constants";
import { formatPrice } from "../utils/helpers";
import { styles } from "../styles";

export default function SearchFilters({ 
  search, 
  setSearch, 
  region, 
  setRegion, 
  regions, 
  sortKey, 
  setSortKey, 
  sortDir, 
  setSortDir, 
  chartBedTypes, 
  toggleChartBedType,
  handleSelectAllChartTypes,
  filteredRentals 
}) {
  const [isMobile, setIsMobile] = useState(false);

  // check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section id="filters" style={{ marginBottom: 40, scrollMarginTop: 110 }}>
      <h2 style={{ ...styles.subheading, fontSize: isMobile ? 18 : 22 }}>🔍 Search &amp; Filter</h2>
      
      <div style={styles.card}>
        {/* controls */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ 
            display: "flex", 
            flexDirection: isMobile ? "column" : "row", 
            flexWrap: "wrap", 
            gap: 12, 
            marginBottom: 16 
          }}>
            <input 
              type="text" 
              placeholder="Search suburb..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              style={{ 
                flex: 1, 
                minWidth: isMobile ? "auto" : 200, 
                padding: "10px 12px", 
                border: "1px solid #ddd", 
                borderRadius: 8, 
                fontSize: isMobile ? 13 : 14, 
                color: "#333", 
                background: "white",
                minHeight: 44,
              }}
            />
            <select 
              value={region} 
              onChange={(e) => setRegion(e.target.value)} 
              style={{ 
                padding: "10px 12px", 
                border: "1px solid #ddd", 
                borderRadius: 8, 
                fontSize: isMobile ? 13 : 14, 
                background: "white", 
                color: "#333",
                minHeight: 44,
              }}
            >
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select 
              value={sortKey} 
              onChange={(e) => setSortKey(e.target.value)} 
              style={{ 
                padding: "10px 12px", 
                border: "1px solid #ddd", 
                borderRadius: 8, 
                fontSize: isMobile ? 13 : 14, 
                background: "white", 
                color: "#333",
                minHeight: 44,
              }}
            >
              <option value="Suburb">Suburb (A–Z)</option>
              {BED_TYPES.map(({ key, label }) => <option key={key} value={key}>{label} price</option>)}
            </select>
            <button 
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))} 
              style={{ 
                padding: "10px 20px", 
                background: "#667eea", 
                color: "white", 
                border: "none", 
                borderRadius: 8, 
                cursor: "pointer",
                minHeight: 44,
                fontSize: isMobile ? 13 : 14,
              }}
            >
              {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
            </button>
          </div>

          {/* chart filters */}
          <div style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: 12, 
            alignItems: "center",
            overflowX: isMobile ? "auto" : "visible",
            WebkitOverflowScrolling: "touch",
            paddingBottom: isMobile ? 4 : 0,
          }}>
            <span style={{ fontSize: isMobile ? 12 : 13, color: "#555", flexShrink: 0 }}>Chart Filters:</span>
            <button 
              onClick={handleSelectAllChartTypes}
              style={{ 
                padding: "6px 14px", 
                background: chartBedTypes.length === BED_TYPES.length ? "#667eea" : "#f0f0f0", 
                color: chartBedTypes.length === BED_TYPES.length ? "white" : "#333", 
                border: "none", 
                borderRadius: 6, 
                cursor: "pointer", 
                fontSize: isMobile ? 11 : 12,
                minHeight: 36,
                whiteSpace: "nowrap",
              }}
            >
              All
            </button>
            {BED_TYPES.map(({ key, label }) => (
              <label 
                key={key} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 6, 
                  fontSize: isMobile ? 11 : 13, 
                  cursor: "pointer", 
                  color: "#333",
                  whiteSpace: "nowrap",
                  padding: "4px 0",
                }}
              >
                <input type="checkbox" checked={chartBedTypes.includes(key)} onChange={() => toggleChartBedType(key)} />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* dynamic title */}
        <h3 style={{ 
          margin: "0 0 16px", 
          fontSize: isMobile ? 13 : 16, 
          textAlign: "center",
          fontWeight: 500,
        }}>
          Weekly Rent Prices by Suburb — {chartBedTypes.length === BED_TYPES.length 
            ? "All Property Types" 
            : BED_TYPES.filter(({ key }) => chartBedTypes.includes(key)).map(({ label }) => label).join(", ")}
        </h3>
        
        {/* chart container */}
        <div style={{ 
          overflowX: "auto", 
          WebkitOverflowScrolling: "touch",
        }}>
          <div style={{ 
            minWidth: isMobile ? Math.max(filteredRentals.length * 45, 600) : Math.max(filteredRentals.length * 55, 800), 
            height: isMobile ? 400 : 500 
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredRentals} margin={{ top: 20, right: 20, left: isMobile ? 20 : 30, bottom: isMobile ? 100 : 120 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="Suburb" 
                  angle={isMobile ? -45 : -45} 
                  textAnchor="end" 
                  interval={0} 
                  height={isMobile ? 90 : 110} 
                  tick={{ fontSize: isMobile ? 9 : 11, fill: "#555" }} 
                />
                <YAxis 
                  tickFormatter={(value) => `$${value}`} 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  width={isMobile ? 50 : 60}
                />
                <Tooltip 
                  formatter={(value) => value != null && value !== 0 ? `$${value}` : "No data"} 
                  contentStyle={{ backgroundColor: "white", color: "#333", border: "1px solid #ddd", fontSize: isMobile ? 11 : 12 }} 
                />
                {BED_TYPES.filter(({ key }) => chartBedTypes.includes(key)).map(({ key, label }, index) => (
                  <Bar key={key} dataKey={key} name={label} fill={BAR_COLORS[index]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* legend */}
        <div style={{ 
          marginTop: 16, 
          display: "flex", 
          justifyContent: "center", 
          flexWrap: "wrap", 
          gap: isMobile ? 12 : 16,
          padding: isMobile ? "0 8px" : 0,
        }}>
          {BED_TYPES.filter(({ key }) => chartBedTypes.includes(key)).map(({ key, label }, index) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 14, height: 14, backgroundColor: BAR_COLORS[index], borderRadius: 2 }} />
              <span style={{ fontSize: isMobile ? 10 : 12, color: "#555" }}>{label}</span>
            </div>
          ))}
        </div>
        
        {/* results count */}
        <div style={{ 
          marginTop: 12, 
          textAlign: "center", 
          fontSize: isMobile ? 11 : 12, 
          color: "#667",
          borderTop: "1px solid #eee",
          paddingTop: 12,
        }}>
          Showing {filteredRentals.length} suburb{filteredRentals.length !== 1 ? "s" : ""}
        </div>
      </div>
    </section>
  );
}