import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { BED_TYPES, BAR_COLORS } from "../config/constants";
import { styles } from "../styles";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchFilters({
  rentals,
  regions: regionOptions,
  onFilteredChange,
}) {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All");
  const [sortKey, setSortKey] = useState("Suburb");
  const [sortDir, setSortDir] = useState("asc");
  const [chartBedTypes, setChartBedTypes] = useState(BED_TYPES.map((b) => b.key));
  const [isMobile, setIsMobile] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const chartContainerRef = useRef(null);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleChartBedType = useCallback((key) => {
    setChartBedTypes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const handleSelectAllChartTypes = useCallback(() => {
    setChartBedTypes((prev) =>
      prev.length === BED_TYPES.length ? [] : BED_TYPES.map((b) => b.key)
    );
  }, []);

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

  useEffect(() => {
    onFilteredChange?.(filteredRentals);
  }, [filteredRentals, onFilteredChange]);

  useEffect(() => {
    const measure = () => {
      if (chartContainerRef.current) {
        setContainerWidth(chartContainerRef.current.getBoundingClientRect().width);
      }
    };
    const timer = setTimeout(measure, 50);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measure);
    };
  }, [filteredRentals.length]);

  const chartMinWidth = Math.max(
    isMobile ? filteredRentals.length * 70 : filteredRentals.length * 90,
    containerWidth || (isMobile ? 600 : 800)
  );

  const hasData = filteredRentals.length > 0;

  const chart = useMemo(() => {
    if (!hasData) {
      return (
        <div style={{
          width: "100%", height: "100%", display: "flex", alignItems: "center",
          justifyContent: "center", color: "#999", background: "#fafafa", borderRadius: 8,
        }}>
          No suburbs match your filters
        </div>
      );
    }

    const activeTypes = BED_TYPES.filter(({ key }) => chartBedTypes.includes(key));

    return (
      <BarChart
        width={chartMinWidth}
        height={isMobile ? 400 : 500}
        data={filteredRentals}
        margin={{ top: 20, right: 20, left: isMobile ? 20 : 30, bottom: isMobile ? 100 : 120 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="Suburb" angle={-45} textAnchor="end" interval={0} height={isMobile ? 90 : 110} tick={{ fontSize: isMobile ? 9 : 11, fill: "#555" }} />
        <YAxis tickFormatter={(value) => `$${value}`} tick={{ fontSize: isMobile ? 10 : 12 }} width={isMobile ? 50 : 60} />
        <Tooltip formatter={(value) => value != null && value !== 0 ? `$${value}` : "No data"} contentStyle={{ backgroundColor: "white", color: "#333", border: "1px solid #ddd", fontSize: isMobile ? 11 : 12 }} isAnimationActive={false}/>
        {activeTypes.map(({ key, label }, index) => (
          <Bar key={key} dataKey={key} name={label} fill={BAR_COLORS[index]} isAnimationActive={false}/>
        ))}
      </BarChart>
    );
  }, [hasData, chartBedTypes, chartMinWidth, isMobile, filteredRentals]);

  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ ...styles.subheading, fontSize: isMobile ? 18 : 22 }}>🔍 Search &amp; Filter</h2>

      <div style={styles.card}>
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: "flex", flexDirection: isMobile ? "column" : "row",
            flexWrap: "wrap", gap: 12, marginBottom: 16,
          }}>
            <div style={{ flex: 1, minWidth: isMobile ? "auto" : 200, position: "relative" }}>
              <input
                type="text"
                placeholder="Search suburb..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 40px 10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  fontSize: isMobile ? 13 : 14,
                  color: "#333",
                  background: "white",
                  minHeight: 44,
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    fontSize: 18,
                    color: "#999",
                    cursor: "pointer",
                    padding: "4px 8px",
                    lineHeight: 1,
                  }}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: isMobile ? 13 : 14, background: "white", color: "#333", minHeight: 44 }}
            >
              {regionOptions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: isMobile ? 13 : 14, background: "white", color: "#333", minHeight: 44 }}
            >
              <option value="Suburb">Suburb (A–Z)</option>
              {BED_TYPES.map(({ key, label }) => <option key={key} value={key}>{label} price</option>)}
            </select>
            <button
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              style={{ padding: "10px 20px", background: "#667eea", color: "white", border: "none", borderRadius: 8, cursor: "pointer", minHeight: 44, fontSize: isMobile ? 13 : 14 }}
            >
              {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
            </button>
          </div>

          <div style={{
            display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center",
            overflowX: isMobile ? "auto" : "visible", WebkitOverflowScrolling: "touch", paddingBottom: isMobile ? 4 : 0,
          }}>
            <span style={{ fontSize: isMobile ? 12 : 13, color: "#555", flexShrink: 0 }}>View by:</span>
            <button
              onClick={handleSelectAllChartTypes}
              style={{
                padding: "6px 14px",
                background: chartBedTypes.length === BED_TYPES.length ? "#667eea" : "#f0f0f0",
                color: chartBedTypes.length === BED_TYPES.length ? "white" : "#333",
                border: "none", borderRadius: 6, cursor: "pointer", fontSize: isMobile ? 11 : 12, minHeight: 36, whiteSpace: "nowrap",
              }}
            >
              All
            </button>
            {BED_TYPES.map(({ key, label }) => (
              <label key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: isMobile ? 11 : 13, cursor: "pointer", color: "#333", whiteSpace: "nowrap", padding: "4px 0" }}>
                <input type="checkbox" checked={chartBedTypes.includes(key)} onChange={() => toggleChartBedType(key)} />
                {label}
              </label>
            ))}
          </div>
        </div>

        <h3 style={{ margin: "0 0 16px", fontSize: isMobile ? 13 : 16, textAlign: "center", fontWeight: 500 }}>
          Weekly Rent Prices by Suburb — {chartBedTypes.length === BED_TYPES.length
            ? "All Property Types"
            : BED_TYPES.filter(({ key }) => chartBedTypes.includes(key)).map(({ label }) => label).join(", ")}
        </h3>

        <div
          ref={chartContainerRef}
          style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", width: "100%" }}
        >
          <div style={{ height: isMobile ? 400 : 500, minHeight: 300, width: chartMinWidth }}>
            {chart}
          </div>
        </div>

        {chartBedTypes.length > 0 && (
          <div style={{ marginTop: 16, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: isMobile ? 12 : 16, padding: isMobile ? "0 8px" : 0 }}>
            {BED_TYPES.filter(({ key }) => chartBedTypes.includes(key)).map(({ key, label }, index) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 14, height: 14, backgroundColor: BAR_COLORS[index], borderRadius: 2 }} />
                <span style={{ fontSize: isMobile ? 10 : 12, color: "#555" }}>{label}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 12, textAlign: "center", fontSize: isMobile ? 11 : 12, color: "#667", borderTop: "1px solid #eee", paddingTop: 12 }}>
          Showing {filteredRentals.length} suburb{filteredRentals.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}