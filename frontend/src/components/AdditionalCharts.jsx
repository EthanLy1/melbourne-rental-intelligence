import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { BED_TYPES, PIE_COLORS } from "../config/constants";
import { styles } from "../styles";

// Melbourne-specific stacked bar colors: Budget → Luxury (green to red)
const STACKED_COLORS = [
  "#27ae60", // Green = Budget (bottom 25%)
  "#82ca9d", // Light green = Affordable (25-50%)
  "#f1c40f", // Yellow = Mid-range (50-75%)
  "#e67e22", // Orange = Premium (75-90%)
  "#e74c3c", // Red = Luxury (top 10%)
];

export default function AdditionalCharts({ rentals }) {
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [stackedBedType, setStackedBedType] = useState("threeBedHouse");

  const regions = useMemo(() => {
    return ["All", ...new Set(rentals.map((r) => r.Region).filter(Boolean))].sort();
  }, [rentals]);

  const pieData = useMemo(() => {
    const regionCount = {};
    rentals.forEach((rental) => {
      if (rental.Region) {
        regionCount[rental.Region] = (regionCount[rental.Region] || 0) + 1;
      }
    });
    return Object.entries(regionCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [rentals]);

  const lineChartData = useMemo(() => {
    const targetRentals = selectedRegion === "All" ? rentals : rentals.filter(r => r.Region === selectedRegion);
    return BED_TYPES.map(({ key, label }) => {
      const validRentals = targetRentals.filter(r => r[key] != null && r[key] !== 0);
      const average = validRentals.length > 0 ? Math.round(validRentals.reduce((sum, r) => sum + r[key], 0) / validRentals.length) : 0;
      const sorted = validRentals.map(r => r[key]).sort((a, b) => a - b);
      const median = sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 0;
      return { bedType: label, average, median, count: validRentals.length };
    });
  }, [rentals, selectedRegion]);

  const stackedBarData = useMemo(() => {
    // Get all valid prices for the selected bed type
    const validPrices = rentals
      .filter(r => r[stackedBedType] != null && r[stackedBedType] !== 0)
      .map(r => r[stackedBedType])
      .sort((a, b) => a - b);

    if (validPrices.length === 0) return [];

    // Calculate percentiles for market-based segmentation
    const p25 = validPrices[Math.floor(validPrices.length * 0.25)];
    const p50 = validPrices[Math.floor(validPrices.length * 0.5)];
    const p75 = validPrices[Math.floor(validPrices.length * 0.75)];
    const p90 = validPrices[Math.floor(validPrices.length * 0.9)];

    const priceRanges = [
      { 
        key: "budget", 
        label: `Budget (≤$${p25})`, 
        min: 0, 
        max: p25,
        description: "Bottom 25%"
      },
      { 
        key: "affordable", 
        label: `Affordable ($${p25 + 1}–$${p50})`, 
        min: p25 + 1, 
        max: p50,
        description: "25th–50th percentile"
      },
      { 
        key: "mid-range", 
        label: `Mid-Range ($${p50 + 1}–$${p75})`, 
        min: p50 + 1, 
        max: p75,
        description: "50th–75th percentile"
      },
      { 
        key: "premium", 
        label: `Premium ($${p75 + 1}–$${p90})`, 
        min: p75 + 1, 
        max: p90,
        description: "75th–90th percentile"
      },
      { 
        key: "luxury", 
        label: `Luxury ($${p90 + 1}+)`, 
        min: p90 + 1, 
        max: Infinity,
        description: "Top 10%"
      },
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
        if (range) {
          regionData[rental.Region][range.key]++;
          regionData[rental.Region].total++;
        }
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

  // Get price stats for display
  const priceStats = useMemo(() => {
    const validPrices = rentals
      .filter(r => r[stackedBedType] != null && r[stackedBedType] !== 0)
      .map(r => r[stackedBedType])
      .sort((a, b) => a - b);
    
    if (validPrices.length === 0) return null;
    
    return {
      min: validPrices[0],
      p25: validPrices[Math.floor(validPrices.length * 0.25)],
      median: validPrices[Math.floor(validPrices.length * 0.5)],
      p75: validPrices[Math.floor(validPrices.length * 0.75)],
      p90: validPrices[Math.floor(validPrices.length * 0.9)],
      max: validPrices[validPrices.length - 1],
      avg: Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length),
      count: validPrices.length,
    };
  }, [rentals, stackedBedType]);

  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={styles.subheading}>📈 Additional Analytics</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Pie Chart */}
        <div style={styles.card}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>🥧 Suburb Distribution by Region</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie 
                data={pieData} 
                cx="50%" 
                cy="50%" 
                labelLine={true} 
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`} 
                outerRadius={130} 
                fill="#8884d8" 
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} suburbs`, "Count"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>📉 Rent Trends by Property Type</h3>
            <select 
              value={selectedRegion} 
              onChange={(e) => setSelectedRegion(e.target.value)} 
              style={{ ...styles.input, width: "auto" }}
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r === "All" ? "All Regions" : r}
                </option>
              ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={lineChartData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="bedType" 
                tick={{ fontSize: 12 }} 
                angle={-15} 
                textAnchor="end" 
                height={50} 
              />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, undefined]} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="average" 
                name="Average Rent" 
                stroke="#8884d8" 
                strokeWidth={2} 
                dot={{ r: 6 }} 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="median" 
                name="Median Rent" 
                stroke="#82ca9d" 
                strokeWidth={2} 
                dot={{ r: 6 }} 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stacked Bar Chart with Percentile-Based Price Ranges */}
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>
            📊 Melbourne Metro Price Distribution by Region
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#666" }}>Property Type:</span>
            <select
              value={stackedBedType}
              onChange={(e) => setStackedBedType(e.target.value)}
              style={{ ...styles.input, width: "auto", fontSize: 13 }}
            >
              {BED_TYPES.map(({ key, label }) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div style={{ marginBottom: 12, fontSize: 12, color: "#666", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <span>🟢 Green = More affordable</span>
          <span>🔴 Red = More expensive</span>
          {priceStats && (
            <span style={{ marginLeft: "auto", fontStyle: "italic" }}>
              {stackedBedLabel} — {priceStats.count} suburbs | 
              Median: ${priceStats.median}/wk | 
              Range: ${priceStats.min}–${priceStats.max}/wk
            </span>
          )}
        </div>

        {/* Percentile reference card */}
        {priceStats && (
          <div style={{ 
            marginBottom: 16, 
            padding: "12px 16px", 
            background: "#f8f9fa", 
            borderRadius: 8,
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            fontSize: 12,
            border: "1px solid #e0e0e0"
          }}>
            <div><strong>25th percentile:</strong> ${priceStats.p25}</div>
            <div><strong>Median (50th):</strong> ${priceStats.median}</div>
            <div><strong>75th percentile:</strong> ${priceStats.p75}</div>
            <div><strong>90th percentile:</strong> ${priceStats.p90}</div>
            <div style={{ color: "#888" }}>
              (Based on {priceStats.count} suburbs)
            </div>
          </div>
        )}
        
        {stackedBarData.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999", padding: 40 }}>
            No data available for {stackedBedLabel}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={stackedBarData} margin={{ top: 20, right: 20, left: 10, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                interval={0} 
                height={100} 
                tick={{ fontSize: 12 }} 
              />
              <YAxis 
                label={{ 
                  value: "Percentage (%)", 
                  angle: -90, 
                  position: "insideLeft", 
                  style: { fontSize: 12 } 
                }} 
              />
              <Tooltip formatter={(value) => [`${value}%`, undefined]} />
              <Legend 
                wrapperStyle={{ fontSize: 11 }}
              />
              {stackedBarData[0] && Object.keys(stackedBarData[0])
                .filter(key => key !== "name")
                .map((key, index) => (
                  <Bar 
                    key={key} 
                    dataKey={key} 
                    stackId="a" 
                    fill={STACKED_COLORS[index]} 
                    name={key}
                  />
                ))
              }
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}