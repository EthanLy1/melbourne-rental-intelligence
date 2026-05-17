import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { BED_TYPES } from "../config/constants";
import { parseValue, formatPrice } from "../utils/helpers";
import { styles } from "../styles";

export default function RegionAnalytics({ rentals }) {
  const [activeBed, setActiveBed] = useState("twoBedFlat");
  const [isMobile, setIsMobile] = useState(false);
  const [chartDims, setChartDims] = useState({ width: 0, height: 0 });
  const chartRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const measureChart = useCallback(() => {
    if (chartRef.current) {
      const rect = chartRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setChartDims({ width: rect.width, height: rect.height });
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(measureChart, 50);
    window.addEventListener("resize", measureChart);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measureChart);
    };
  }, [measureChart, activeBed]);

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
    return regionAverages.map((region) => ({
      name: region.region,
      ...BED_TYPES.reduce((acc, { key }) => ({ ...acc, [key]: region[key] || 0 }), {}),
    }));
  }, [regionAverages]);

  const getTopRegions = (bedKey, limit = 5) =>
    regionAverages.filter(r => r[bedKey] != null).sort((a, b) => b[bedKey] - a[bedKey]).slice(0, limit);

  const getBottomRegions = (bedKey, limit = 5) =>
    regionAverages.filter(r => r[bedKey] != null).sort((a, b) => a[bedKey] - b[bedKey]).slice(0, limit);

  const label = BED_TYPES.find((b) => b.key === activeBed)?.label || "";
  const hasValidDims = chartDims.width > 0 && chartDims.height > 0;

  const RegionTable = ({ title, color, data }) => (
    <div style={styles.card}>
      <h3 style={{ margin: "0 0 12px", fontSize: 14, color }}>{title} — {label}</h3>
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", margin: "-8px", padding: "8px" }}>
        <table style={{ width: "100%", minWidth: isMobile ? 400 : "100%", borderCollapse: "collapse", fontSize: 13 }}>
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
                <td style={{ padding: "10px 12px", fontWeight: 500 }}>{region.region}</td>
                <td style={{ padding: "10px 12px", textAlign: "right", color, fontWeight: 500 }}>
                  ${region[activeBed]?.toLocaleString()}
                </td>
                <td style={{ padding: "10px 12px", textAlign: "right", color: "#666" }}>
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

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        <div style={styles.card}>
          <h3>🏙️ Total Regions</h3>
          <strong style={{ fontSize: 32, color: "#8884d8" }}>{regionAverages.length}</strong>
        </div>
        <div style={styles.card}>
          <h3>📈 Most Expensive Region</h3>
          <p style={{ fontSize: 14, margin: "4px 0" }}>{getTopRegions(activeBed, 1)[0]?.region || "N/A"}</p>
          <strong>{formatPrice(getTopRegions(activeBed, 1)[0]?.[activeBed])}</strong>
        </div>
        <div style={styles.card}>
          <h3>📉 Most Affordable Region</h3>
          <p style={{ fontSize: 14, margin: "4px 0" }}>{getBottomRegions(activeBed, 1)[0]?.region || "N/A"}</p>
          <strong>{formatPrice(getBottomRegions(activeBed, 1)[0]?.[activeBed])}</strong>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 }}>
        <span style={{ ...styles.label, marginRight: 8 }}>View by:</span>
        {BED_TYPES.map(({ key, label: lbl }) => (
          <button key={key} onClick={() => setActiveBed(key)}
            style={{ ...styles.button, ...(activeBed === key ? styles.activeButton : {}), minHeight: 40 }}>
            {lbl}
          </button>
        ))}
      </div>

      <div style={{ ...styles.card, marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>Average Weekly Rent by Region — {label}</h3>
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div 
            ref={chartRef}
            style={{ height: 400, minHeight: 300, width: "100%" }}
          >
            {hasValidDims && chartData.length > 0 ? (
              <BarChart 
                width={chartDims.width}
                height={chartDims.height}
                data={chartData} 
                margin={{ top: 20, right: 20, left: 10, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={100} tick={{ fontSize: isMobile ? 10 : 12 }} />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => value != null && value !== 0 ? `$${value}` : "No data"} />
                <Bar dataKey={activeBed} name={label} fill="#8884d8" radius={[4, 4, 0, 0]}
                  label={{ position: 'top', formatter: (value) => `$${value}`, fontSize: isMobile ? 9 : 11, fill: '#333' }} />
              </BarChart>
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
                Loading chart...
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
        <RegionTable title="🏆 Most Expensive Regions" color="#c0392b" data={getTopRegions(activeBed)} />
        <RegionTable title="💰 Most Affordable Regions" color="#27ae60" data={getBottomRegions(activeBed)} />
      </div>
    </div>
  );
}