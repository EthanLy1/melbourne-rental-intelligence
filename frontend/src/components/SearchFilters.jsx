import { useMemo } from "react";
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
  return (
    <section id="filters" style={{ marginBottom: 40, scrollMarginTop: 110 }}>
      <h2 style={styles.subheading}>🔍 Search &amp; Filter</h2>
      
      <div style={styles.card}>
        {/* controls */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
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
              onClick={handleSelectAllChartTypes}
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

        <h3 style={{ margin: "0 0 16px", fontSize: 16, textAlign: "center" }}>
          Weekly Rent Prices by Suburb — {chartBedTypes.length === BED_TYPES.length 
            ? "All Property Types" 
            : BED_TYPES.filter(({ key }) => chartBedTypes.includes(key)).map(({ label }) => label).join(", ")}
        </h3>
        
        {/* only chart container can scroll horizontally */}
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: Math.max(filteredRentals.length * 55, 800), height: 500 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredRentals} margin={{ top: 20, right: 20, left: 30, bottom: 120 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="Suburb" angle={-45} textAnchor="end" interval={0} height={110} tick={{ fontSize: 11, fill: "#555" }} />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => value != null && value !== 0 ? `$${value}` : "No data"} contentStyle={{ backgroundColor: "white", color: "#333", border: "1px solid #ddd" }} />

                {BED_TYPES.filter(({ key }) => chartBedTypes.includes(key)).map(({ key, label }, index) => (
                  <Bar key={key} dataKey={key} name={label} fill={BAR_COLORS[index]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* legend */}
        <div style={{ marginTop: 16, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 16 }}>
          {BED_TYPES.filter(({ key }) => chartBedTypes.includes(key)).map(({ key, label }, index) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 16, height: 16, backgroundColor: BAR_COLORS[index], borderRadius: 2 }} />
              <span style={{ fontSize: 12, color: "#555" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}