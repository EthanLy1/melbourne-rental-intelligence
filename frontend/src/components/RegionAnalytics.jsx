import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { BED_TYPES } from "../config/constants";
import { parseValue, formatPrice } from "../utils/helpers";
import { styles } from "../styles";

export default function RegionAnalytics({ rentals }) {
  const [activeBed, setActiveBed] = useState("twoBedFlat");
  const [isMobile, setIsMobile] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const regionAverages = useMemo(() => {
    const regionMap = {};
    rentals.forEach((rental) => {
      if (!rental.Region) return;
      if (!regionMap[rental.Region]) {
        regionMap[rental.Region] = {};
        BED_TYPES.forEach(({ key }) => {
          regionMap[rental.Region][key] = { total: 0, count: 0 };
        });
      }
      BED_TYPES.forEach(({ key }) => {
        const value = parseValue(rental[key]);
        if (value != null && value !== 0) {
          regionMap[rental.Region][key].total += value;
          regionMap[rental.Region][key].count += 1;
        }
      });
    });
    return Object.entries(regionMap)
      .map(([region, bedData]) => {
        const averages = {};
        BED_TYPES.forEach(({ key }) => {
          const { total, count } = bedData[key];
          averages[key] = count > 0 ? Math.round(total / count) : null;
        });
        return { region, ...averages };
      })
      .sort((a, b) => a.region.localeCompare(b.region));
  }, [rentals]);

  const chartData = useMemo(() => {
    return [...regionAverages]
      .sort((a, b) => (b[activeBed] || 0) - (a[activeBed] || 0))
      .map((region) => ({
        name: region.region,
        ...BED_TYPES.reduce((acc, { key }) => ({ ...acc, [key]: region[key] || 0 }), {}),
      }));
  }, [regionAverages, activeBed]);

  const getTopRegions = (bedKey, limit = 5) =>
    regionAverages.filter(r => r[bedKey] != null).sort((a, b) => b[bedKey] - a[bedKey]).slice(0, limit);

  const getBottomRegions = (bedKey, limit = 5) =>
    regionAverages.filter(r => r[bedKey] != null).sort((a, b) => a[bedKey] - b[bedKey]).slice(0, limit);

  const overallAverage = useMemo(() => {
    let total = 0, count = 0;
    rentals.forEach(rental => {
      const value = parseValue(rental[activeBed]);
      if (value != null && value !== 0) {
        total += value;
        count++;
      }
    });
    return count > 0 ? Math.round(total / count) : null;
  }, [rentals, activeBed]);

  const label = BED_TYPES.find((b) => b.key === activeBed)?.label || "";

  const mostExpensive = getTopRegions(activeBed, 1)[0];
  const mostAffordable = getBottomRegions(activeBed, 1)[0];

  const RegionTable = ({ title, color, data }) => (
    <div style={styles.card}>
      <h3 style={{ margin: "0 0 12px", fontSize: 14, color }}>{title} — {label}</h3>
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table style={{ width: "100%", minWidth: 320, borderCollapse: "collapse", fontSize: isMobile ? 11 : 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Region</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Avg Rent</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Suburbs</th>
            </tr>
          </thead>
          <tbody>
            {data.map((region, index) => (
              <tr key={region.region} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={styles.top10Rank}>{index + 1}</td>
                <td style={{ padding: "8px 8px", fontWeight: 500 }}>{region.region}</td>
                <td style={{ padding: "8px 8px", textAlign: "right", color, fontWeight: 500 }}>
                  ${region[activeBed]?.toLocaleString()}
                </td>
                <td style={{ padding: "8px 8px", textAlign: "right", color: "#666" }}>
                  {rentals.filter(r => r.Region === region.region).length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={styles.subheading}>📊 Region Average Analytics</h2>

      <div style={{ 
        display: "flex", 
        gap: 6, 
        flexWrap: "wrap", 
        justifyContent: "center", 
        alignItems: "center", 
        marginBottom: 20,
        padding: "0 8px"
      }}>
        <span style={{ ...styles.label, marginRight: 4, display: "flex", alignItems: "center", fontSize: isMobile ? 12 : 14 }}>
          View by:
        </span>
        {BED_TYPES.map(({ key, label: lbl }) => (
          <button 
            key={key} 
            onClick={() => setActiveBed(key)}
            style={{
              ...styles.button,
              ...(activeBed === key ? styles.activeButton : {}),
              minHeight: 36,
              padding: isMobile ? "6px 12px" : "8px 16px",
              fontSize: isMobile ? 11 : 13,
            }}
          >
            {lbl}
          </button>
        ))}
      </div>

      <div style={{ ...styles.card, marginBottom: 20, position: "relative" }}>
        <h3 style={{ margin: isMobile ? "0 0 8px" : "0 0 16px", fontSize: isMobile ? 14 : 16, paddingRight: isMobile ? 0 : 220 }}>
          Average Weekly Rent by Region — {label}
        </h3>
        
        {/* Stats overlay - responsive layout */}
        <div style={{
          position: isMobile ? "relative" : "absolute",
          top: isMobile ? "auto" : 12,
          right: isMobile ? "auto" : 20,
          display: "flex",
          gap: isMobile ? 12 : 20,
          fontSize: isMobile ? 10 : 12,
          color: "#555",
          background: "rgba(255, 255, 255, 0.95)",
          padding: "8px 12px",
          borderRadius: 6,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          zIndex: 10,
          marginBottom: isMobile ? 12 : 0,
          flexWrap: "wrap",
          justifyContent: "space-around",
        }}>
          <div style={{ textAlign: "center", flex: isMobile ? "1 1 auto" : "none" }}>
            <div style={{ color: "#c0392b", fontWeight: 600, fontSize: isMobile ? 9 : 11, whiteSpace: "nowrap" }}>
              Most Expensive
            </div>
            <div style={{ fontWeight: 600, fontSize: isMobile ? 11 : 13, whiteSpace: "nowrap" }}>
              {mostExpensive?.region || "N/A"}
            </div>
            <div style={{ color: "#c0392b", fontWeight: 700, fontSize: isMobile ? 12 : 14, whiteSpace: "nowrap" }}>
              {formatPrice(mostExpensive?.[activeBed])}
            </div>
          </div>
          <div style={{ textAlign: "center", flex: isMobile ? "1 1 auto" : "none" }}>
            <div style={{ color: "#27ae60", fontWeight: 600, fontSize: isMobile ? 9 : 11, whiteSpace: "nowrap" }}>
              Most Affordable
            </div>
            <div style={{ fontWeight: 600, fontSize: isMobile ? 11 : 13, whiteSpace: "nowrap" }}>
              {mostAffordable?.region || "N/A"}
            </div>
            <div style={{ color: "#27ae60", fontWeight: 700, fontSize: isMobile ? 12 : 14, whiteSpace: "nowrap" }}>
              {formatPrice(mostAffordable?.[activeBed])}
            </div>
          </div>
          <div style={{ textAlign: "center", flex: isMobile ? "1 1 auto" : "none" }}>
            <div style={{ color: "#8884d8", fontWeight: 600, fontSize: isMobile ? 9 : 11, whiteSpace: "nowrap" }}>
              Melbourne Avg
            </div>
            <div style={{ fontWeight: 600, fontSize: isMobile ? 11 : 13, whiteSpace: "nowrap" }}>
              {label}
            </div>
            <div style={{ color: "#8884d8", fontWeight: 700, fontSize: isMobile ? 12 : 14, whiteSpace: "nowrap" }}>
              {overallAverage ? formatPrice(overallAverage) : "N/A"}
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div 
            ref={chartRef}
            style={{ height: isMobile ? 300 : 460, minHeight: 280, width: "100%" }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                margin={{ top: 20, right: isMobile ? 10 : 20, left: isMobile ? -25 : 10, bottom: isMobile ? 60 : 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={isMobile ? -60 : -45} 
                  textAnchor="end" 
                  interval={0} 
                  height={isMobile ? 80 : 100} 
                  tick={{ fontSize: isMobile ? 8 : 12 }}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value}`}
                  tick={{ fontSize: isMobile ? 9 : 12 }}
                  width={isMobile ? 58 : 60}
                />
                <Tooltip 
                  formatter={(value) => value != null && value !== 0 ? `$${value}` : "No data"}
                  contentStyle={{ fontSize: isMobile ? 11 : 13 }}
                />
                <Bar 
                  dataKey={activeBed} 
                  name={label} 
                  fill="#8884d8" 
                  radius={[4, 4, 0, 0]}
                  label={isMobile ? false : { 
                    position: 'top', 
                    formatter: (value) => `$${value}`, 
                    fontSize: 11, 
                    fill: '#333' 
                  }} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 12 : 16 }}>
        <RegionTable title="🏆 Most Expensive Regions" color="#c0392b" data={getTopRegions(activeBed)} />
        <RegionTable title="💰 Most Affordable Regions" color="#27ae60" data={getBottomRegions(activeBed)} />
      </div>
    </div>
  );
}