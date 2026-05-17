import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { BED_TYPES, PIE_COLORS, REGION_LINE_COLORS, STACKED_COLORS } from "../config/constants";
import { styles } from "../styles";

export default function AdditionalCharts({ rentals }) {
  const [selectedRegions, setSelectedRegions] = useState(() => {
    const allRegions = [...new Set(rentals.map((r) => r.Region).filter(Boolean))];
    const initialState = {};
    allRegions.forEach(region => { initialState[region] = true; });
    return initialState;
  });
  const [stackedBedType, setStackedBedType] = useState("twoBedFlat");
  const [isMobile, setIsMobile] = useState(false);

  // chart dimension refs
  const pieRef = useRef(null);
  const lineRef = useRef(null);
  const stackedRef = useRef(null);
  const [pieDims, setPieDims] = useState({ width: 0, height: 0 });
  const [lineDims, setLineDims] = useState({ width: 0, height: 0 });
  const [stackedDims, setStackedDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const measureAll = useCallback(() => {
    [pieRef, lineRef, stackedRef].forEach((ref, i) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const setters = [setPieDims, setLineDims, setStackedDims];
          setters[i]({ width: rect.width, height: rect.height });
        }
      }
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(measureAll, 50);
    window.addEventListener("resize", measureAll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measureAll);
    };
  }, [measureAll, selectedRegions, stackedBedType]);

  const regions = useMemo(() => {
    return [...new Set(rentals.map((r) => r.Region).filter(Boolean))].sort();
  }, [rentals]);

  const pieData = useMemo(() => {
    const regionCount = {};
    rentals.forEach((rental) => {
      if (rental.Region) regionCount[rental.Region] = (regionCount[rental.Region] || 0) + 1;
    });
    return Object.entries(regionCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [rentals]);

  const lineChartData = useMemo(() => {
    const activeRegions = Object.entries(selectedRegions)
      .filter(([, isSelected]) => isSelected)
      .map(([region]) => region);
    return BED_TYPES.map(({ key, label }) => {
      const dataPoint = { bedType: label };
      activeRegions.forEach(region => {
        const regionRentals = rentals.filter(r => r.Region === region && r[key] != null && r[key] !== 0);
        if (regionRentals.length > 0) {
          const sorted = regionRentals.map(r => r[key]).sort((a, b) => a - b);
          dataPoint[region] = sorted[Math.floor(sorted.length / 2)];
        } else {
          dataPoint[region] = null;
        }
      });
      return dataPoint;
    });
  }, [rentals, selectedRegions]);

  const stackedBarData = useMemo(() => {
    const validPrices = rentals
      .filter(r => r[stackedBedType] != null && r[stackedBedType] !== 0)
      .map(r => r[stackedBedType])
      .sort((a, b) => a - b);
    if (validPrices.length === 0) return [];

    const p25 = validPrices[Math.floor(validPrices.length * 0.25)];
    const p50 = validPrices[Math.floor(validPrices.length * 0.5)];
    const p75 = validPrices[Math.floor(validPrices.length * 0.75)];
    const p90 = validPrices[Math.floor(validPrices.length * 0.9)];

    const priceRanges = [
      { key: "budget",     label: `Budget (≤$${p25})`,                min: 0,       max: p25      },
      { key: "affordable", label: `Affordable ($${p25 + 1}–$${p50})`, min: p25 + 1, max: p50      },
      { key: "mid-range",  label: `Mid-Range ($${p50 + 1}–$${p75})`,  min: p50 + 1, max: p75      },
      { key: "premium",    label: `Premium ($${p75 + 1}–$${p90})`,    min: p75 + 1, max: p90      },
      { key: "luxury",     label: `Luxury ($${p90 + 1}+)`,            min: p90 + 1, max: Infinity },
    ];

    const regionData = {};
    rentals.forEach((rental) => {
      if (!rental.Region) return;
      if (!regionData[rental.Region]) {
        regionData[rental.Region] = {};
        priceRanges.forEach(range => { regionData[rental.Region][range.key] = 0; });
        regionData[rental.Region].total = 0;
      }
      const value = rental[stackedBedType];
      if (value != null && value !== 0) {
        const range = priceRanges.find(r => value >= r.min && value <= r.max);
        if (range) { regionData[rental.Region][range.key]++; regionData[rental.Region].total++; }
      }
    });

    return Object.entries(regionData)
      .map(([region, data]) => ({
        name: region,
        ...priceRanges.reduce((acc, range) => ({
          ...acc,
          [range.label]: data.total > 0 ? Math.round((data[range.key] / data.total) * 100) : 0,
        }), {}),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rentals, stackedBedType]);

  const stackedBedLabel = BED_TYPES.find(b => b.key === stackedBedType)?.label || "";

  const priceStats = useMemo(() => {
    const validPrices = rentals
      .filter(r => r[stackedBedType] != null && r[stackedBedType] !== 0)
      .map(r => r[stackedBedType])
      .sort((a, b) => a - b);
    if (validPrices.length === 0) return null;
    return {
      median: validPrices[Math.floor(validPrices.length * 0.5)],
      count: validPrices.length,
    };
  }, [rentals, stackedBedType]);

  const activeRegions = Object.entries(selectedRegions)
    .filter(([, isSelected]) => isSelected)
    .map(([region]) => region);

  const areAllSelected = regions.length > 0 && regions.every(region => selectedRegions[region]);

  const toggleRegion = (region) =>
    setSelectedRegions(prev => ({ ...prev, [region]: !prev[region] }));

  const toggleAllRegions = () => {
    const newState = {};
    regions.forEach(region => { newState[region] = !areAllSelected; });
    setSelectedRegions(newState);
  };

  const stackedKeys = stackedBarData[0]
    ? [...new Set(Object.keys(stackedBarData[0]).filter(k => k !== "name" && k.toLowerCase() !== "total"))]
    : [];

  const pieValid = pieDims.width > 0 && pieDims.height > 0 && pieData.length > 0;
  const lineValid = lineDims.width > 0 && lineDims.height > 0 && lineChartData.length > 0;
  const stackedValid = stackedDims.width > 0 && stackedDims.height > 0 && stackedBarData.length > 0;

  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={styles.subheading}>📈 Additional Analytics</h2>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 20 }}>

        {/* donut chart */}
        <div style={styles.card}>
          <h3 style={{ margin: "0 0 16px", fontSize: isMobile ? 14 : 16 }}>Suburb Distribution by Region</h3>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div ref={pieRef} style={{ width: "100%", height: isMobile ? 280 : 350, minHeight: 280 }}>
              {pieValid ? (
                <PieChart width={pieDims.width} height={pieDims.height}>
                  <Pie
                    data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={isMobile ? 90 : 120}
                    innerRadius={isMobile ? 35 : 50} fill="#8884d8" dataKey="value"
                    label={({ percent, x, y }) => {
                      const pct = (percent * 100).toFixed(1);
                      if (parseFloat(pct) <= 5) return null;
                      return (
                        <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
                          style={{ fontSize: isMobile ? 9 : 11, fontWeight: 600, fill: "black" }}>
                          {pct}%
                        </text>
                      );
                    }}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => {
                    const total = pieData.reduce((sum, d) => sum + d.value, 0);
                    return [`${value} suburbs (${((value / total) * 100).toFixed(1)}%)`, name];
                  }} />
                </PieChart>
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
                  Loading chart...
                </div>
              )}
            </div>
            <div style={{
              maxHeight: isMobile ? 120 : 100, overflowY: "auto", marginTop: 8,
              display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center",
              padding: "6px 8px", background: "#f8f9fa", borderRadius: 8, border: "1px solid #eee",
              WebkitOverflowScrolling: "touch",
            }}>
              {pieData.map((item, index) => {
                const total = pieData.reduce((sum, d) => sum + d.value, 0);
                const percentage = (item.value / total) * 100;
                return (
                  <div key={item.name} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: isMobile ? 10 : 12, padding: "2px 6px", borderRadius: 4, background: "white" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: PIE_COLORS[index % PIE_COLORS.length], flexShrink: 0 }} />
                    <span>{isMobile && item.name.length > 15 ? item.name.substring(0, 12) + "..." : item.name}</span>
                    <span style={{ color: "#667" }}>({percentage.toFixed(0)}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* line chart */}
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: isMobile ? 14 : 16 }}>Median Weekly Rent by Region</h3>
            <button onClick={toggleAllRegions}
              style={{ ...styles.button, ...(areAllSelected ? styles.activeButton : {}), minHeight: 40, padding: isMobile ? "6px 12px" : "8px 16px" }}>
              {areAllSelected ? "✓ All" : "All"}
            </button>
          </div>

          <div style={{
            display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16,
            padding: "8px 12px", background: "#f8f9fa", borderRadius: 8, border: "1px solid #eee",
            ...(isMobile && { maxHeight: 100, overflowY: "auto", WebkitOverflowScrolling: "touch" })
          }}>
            {regions.map((region, index) => (
              <label key={region} style={{
                display: "flex", alignItems: "center", gap: 6, fontSize: isMobile ? 11 : 12,
                cursor: "pointer", padding: "4px 8px", borderRadius: 4, minHeight: 32,
                background: selectedRegions[region] ? `${REGION_LINE_COLORS[index % REGION_LINE_COLORS.length]}20` : "transparent",
              }}>
                <input type="checkbox" checked={selectedRegions[region] || false} onChange={() => toggleRegion(region)} style={{ cursor: "pointer" }} />
                <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: REGION_LINE_COLORS[index % REGION_LINE_COLORS.length], marginRight: 2 }} />
                {isMobile && region.length > 18 ? region.substring(0, 15) + "..." : region}
              </label>
            ))}
          </div>

          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <div ref={lineRef} style={{ height: 350, minHeight: 300, width: "100%" }}>
              {lineValid ? (
                <LineChart width={lineDims.width} height={lineDims.height} data={lineChartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bedType" tick={{ fontSize: isMobile ? 10 : 12 }} angle={isMobile ? -30 : -15} textAnchor="end" height={50} />
                  <YAxis tickFormatter={(value) => `$${value}`} tick={{ fontSize: isMobile ? 10 : 12 }} />
                  <Tooltip formatter={(value) => value ? `$${value}` : "No data"} />
                  <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 11, maxHeight: 80, overflowY: "auto" }} />
                  {activeRegions.map((region, index) => (
                    <Line key={region} type="monotone" dataKey={region}
                      name={isMobile && region.length > 15 ? region.substring(0, 12) + "..." : region}
                      stroke={REGION_LINE_COLORS?.[index % REGION_LINE_COLORS?.length] || `hsl(${index * 360 / activeRegions.length}, 70%, 50%)`}
                      strokeWidth={2} dot={{ r: isMobile ? 3 : 4 }} activeDot={{ r: isMobile ? 5 : 6 }} connectNulls={false} />
                  ))}
                </LineChart>
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
                  Loading chart...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* stacked bar chart */}
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: isMobile ? 14 : 16 }}>
            📊 Melbourne Metro Price Distribution by Region for {stackedBedLabel}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: isMobile ? 11 : 13, color: "#666" }}>Type:</span>
            <select value={stackedBedType} onChange={(e) => setStackedBedType(e.target.value)}
              style={{ ...styles.input, width: "auto", fontSize: isMobile ? 12 : 13, minHeight: 40 }}>
              {BED_TYPES.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 12, fontSize: isMobile ? 10 : 12, color: "#666", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <span>🟢 = More affordable</span>
          <span>🔴 = More expensive</span>
          {priceStats && (
            <span style={{ marginLeft: "auto", fontStyle: "italic" }}>
              {stackedBedLabel} — {priceStats.count} suburbs | Median: ${priceStats.median}/wk
            </span>
          )}
        </div>

        {stackedBarData.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999", padding: 40 }}>No data available for {stackedBedLabel}</p>
        ) : (
          <>
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <div ref={stackedRef} style={{ height: 500, minHeight: 400, width: "100%" }}>
                {stackedValid ? (
                  <BarChart width={stackedDims.width} height={stackedDims.height} data={stackedBarData} margin={{ top: 20, right: 20, left: 10, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={100} tick={{ fontSize: isMobile ? 9 : 12 }} />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: isMobile ? 10 : 12 }} ticks={[0, 20, 40, 60, 80, 100]} />
                    <Tooltip formatter={(value, name) => [`${value}%`, name]} labelFormatter={(label) => `📍 ${label}`}
                      contentStyle={{ backgroundColor: "white", border: "1px solid #ddd", borderRadius: 6 }} />
                    {stackedKeys.map((key, index) => (
                      <Bar key={`bar-${index}`} dataKey={key} stackId="a" fill={STACKED_COLORS[index % STACKED_COLORS.length]} name={key} />
                    ))}
                  </BarChart>
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
                    Loading chart...
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: isMobile ? 8 : 16, justifyContent: "center", alignItems: "center" }}>
              {stackedKeys.map((key, index) => (
                <div key={`legend-${index}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 12, height: 12, background: STACKED_COLORS[index % STACKED_COLORS.length], borderRadius: 3 }} />
                  <span style={{ fontSize: isMobile ? 9 : 11, color: "#333" }}>
                    {isMobile && key.length > 20 ? key.substring(0, 18) + "..." : key}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}