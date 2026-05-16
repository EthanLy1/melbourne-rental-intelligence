import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { BED_TYPES, PIE_COLORS, REGION_LINE_COLORS, STACKED_COLORS } from "../config/constants";
import { styles } from "../styles";



export default function AdditionalCharts({ rentals }) {
  const [selectedRegions, setSelectedRegions] = useState(() => {
    const allRegions = [...new Set(rentals.map((r) => r.Region).filter(Boolean))];
    const initialState = {};
    allRegions.forEach(region => {
      initialState[region] = true;
    });
    return initialState;
  });
  const [stackedBedType, setStackedBedType] = useState("twoBedFlat");

  const regions = useMemo(() => {
    return [...new Set(rentals.map((r) => r.Region).filter(Boolean))].sort();
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
    const activeRegions = Object.entries(selectedRegions)
      .filter(([, isSelected]) => isSelected)
      .map(([region]) => region);
    
    // for each property type, calculate median rent for each selected region
    return BED_TYPES.map(({ key, label }) => {
      const dataPoint = { bedType: label };
      
      activeRegions.forEach(region => {
        const regionRentals = rentals.filter(r => r.Region === region && r[key] != null && r[key] !== 0);
        if (regionRentals.length > 0) {
          const sorted = regionRentals.map(r => r[key]).sort((a, b) => a - b);
          const median = sorted[Math.floor(sorted.length / 2)];
          dataPoint[region] = median;
        } else {
          dataPoint[region] = null;
        }
      });
      
      return dataPoint;
    });
  }, [rentals, selectedRegions]);

  const stackedBarData = useMemo(() => {
    // get all valid prices for the selected property type
    const validPrices = rentals
      .filter(r => r[stackedBedType] != null && r[stackedBedType] !== 0)
      .map(r => r[stackedBedType])
      .sort((a, b) => a - b);

    if (validPrices.length === 0) return [];

    // calculate percentiles for market-based segmentation
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

  // get price stats for display
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

  // get active regions for the line chart
  const activeRegions = Object.entries(selectedRegions)
    .filter(([, isSelected]) => isSelected)
    .map(([region]) => region);


  // check if all regions are currently selected
  const areAllSelected = regions.length > 0 && regions.every(region => selectedRegions[region]);

  // toggle region selection
  const toggleRegion = (region) => {
    setSelectedRegions(prev => ({
      ...prev,
      [region]: !prev[region]
    }));
  };

  // toggle all regions on/off
  const toggleAllRegions = () => {
    if (areAllSelected) {
      // if all are selected, deselect all
      const newState = {};
      regions.forEach(region => {
        newState[region] = false;
      });
      setSelectedRegions(newState);
    } else {
      // if not all are selected, select all
      const newState = {};
      regions.forEach(region => {
        newState[region] = true;
      });
      setSelectedRegions(newState);
    }
  };

  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={styles.subheading}>📈 Additional Analytics</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* pie Chart */}
        <div style={styles.card}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>🥧 Suburb Distribution by Region</h3>
          <div style={{ width: "100%", height: 400, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
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
        </div>

        {/* line chart */}
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>📉 Median Weekly Rent by Region</h3>
            <button 
              onClick={toggleAllRegions}
              style={{
                ...styles.button,
                ...(areAllSelected ? styles.activeButton : {}),
              }}
            >
              {areAllSelected ? "✓ All" : "All"}
            </button>
          </div>
          
          {/* region checkboxes */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
            padding: "8px 12px",
            background: "#f8f9fa",
            borderRadius: 8,
            border: "1px solid #eee",
            maxHeight: 100,
            overflowY: "auto",
          }}>
            {regions.map((region, index) => (
              <label
                key={region}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  cursor: "pointer",
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: selectedRegions[region] ? `${REGION_LINE_COLORS[index % REGION_LINE_COLORS.length]}20` : "transparent",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedRegions[region] || false}
                  onChange={() => toggleRegion(region)}
                  style={{ cursor: "pointer" }}
                />
                <span
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: REGION_LINE_COLORS[index % REGION_LINE_COLORS.length],
                    marginRight: 2,
                  }}
                />
                {region}
              </label>
            ))}
          </div>

          <div style={{ width: "100%", height: 350, minHeight: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="bedType" 
                  tick={{ fontSize: 12 }} 
                  angle={-15} 
                  textAnchor="end" 
                  height={50} 
                />
                <YAxis 
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value) => value ? `$${value}` : "No data"} 
                  labelFormatter={(label) => `${label}`}
                />
                <Legend 
                  wrapperStyle={{ fontSize: 11, maxHeight: 80, overflowY: "auto" }}
                />
                {activeRegions.map((region, index) => (
                  <Line
                    key={region}
                    type="monotone"
                    dataKey={region}
                    name={region}
                    stroke={REGION_LINE_COLORS?.[index % REGION_LINE_COLORS?.length] || `hsl(${index * 360 / activeRegions.length}, 70%, 50%)`}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          
        </div>
      </div>

      {/* stacked bar chart */}
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
          <span>🟢 = More affordable</span>
          <span>🔴 = More expensive</span>
          {priceStats && (
            <span style={{ marginLeft: "auto", fontStyle: "italic" }}>
              {stackedBedLabel} — {priceStats.count} suburbs | 
              Median: ${priceStats.median}/wk | 
              Range: ${priceStats.min}–${priceStats.max}/wk
            </span>
          )}
        </div>

        {/* percentile reference card */}
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
          <div style={{ width: "100%", height: 500 }}>
            <ResponsiveContainer width="100%" height="100%">
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
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {stackedBarData[0] && Object.keys(stackedBarData[0])
                  .filter(key => key !== "name" && key !== "total" && !key.toLowerCase().includes("total"))
                  .map((key, index) => (
                    <Bar 
                      key={key} 
                      dataKey={key} 
                      stackId="a" 
                      fill={STACKED_COLORS[index % STACKED_COLORS.length]} 
                      name={key}
                    />
                  ))
                }
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}