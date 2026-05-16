import { useState, useEffect } from "react";
import { BED_TYPES } from "../config/constants";
import { styles } from "../styles";

export default function Top10Tables({ rentals }) {
  const [activeBed, setActiveBed] = useState("twoBedFlat");
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

  const valid = rentals
    .filter((r) => r[activeBed] != null && r[activeBed] !== 0)
    .sort((a, b) => b[activeBed] - a[activeBed]);

  const top10Exp = valid.slice(0, 10);
  const top10Cheap = [...valid].reverse().slice(0, 10);
  const label = BED_TYPES.find((b) => b.key === activeBed)?.label || "";

  const TableBody = ({ rows, priceColor }) => (
    <>
      {rows.length === 0 ? (
        <tr>
          <td colSpan={3} style={{ padding: "12px 16px", color: "#999", textAlign: "center" }}>No data</td>
        </tr>
      ) : (
        rows.map((r, i) => (
          <tr key={r.Suburb} style={{ borderBottom: "1px solid #f0f0f0" }}>
            <td style={{ ...styles.top10Rank, padding: isMobile ? "8px 8px" : "10px 16px" }}>{i + 1}</td>
            <td style={{ padding: isMobile ? "8px 8px" : "10px 16px" }}>
              <div style={{ fontWeight: 500, fontSize: isMobile ? 13 : 14 }}>{r.Suburb}</div>
              <div style={{ fontSize: isMobile ? 10 : 11, color: "#999" }}>{r.Region}</div>
            </td>
            <td style={{ padding: isMobile ? "8px 8px" : "10px 16px", textAlign: "right", color: priceColor, fontWeight: 500, fontSize: isMobile ? 13 : 14 }}>
              ${Math.round(r[activeBed]).toLocaleString()}
            </td>
          </tr>
        ))
      )}
    </>
  );

  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ ...styles.subheading, fontSize: isMobile ? 18 : 22 }}>Suburb Rental Rankings</h2>
      
      {/* property type buttons */}
      <div style={{ 
        display: "flex", 
        gap: 8, 
        flexWrap: "wrap", 
        justifyContent: "center", 
        marginBottom: 20,
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        padding: isMobile ? "4px 0" : 0,
      }}>
        {BED_TYPES.map(({ key, label: lbl }) => (
          <button 
            key={key} 
            onClick={() => setActiveBed(key)} 
            style={{ 
              ...styles.button, 
              ...(activeBed === key ? styles.activeButton : {}),
              minHeight: 40,
              fontSize: isMobile ? 12 : 13,
              padding: isMobile ? "6px 12px" : "6px 12px",
              whiteSpace: "nowrap",
            }}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* tables grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", 
        gap: 16 
      }}>
        {/* most expensive table */}
        <div style={styles.card}>
          <h3 style={{ margin: "0 0 12px", fontSize: isMobile ? 13 : 14, color: "#c0392b" }}>
            📈 Most Expensive — {label}
          </h3>
          <div style={{ 
            overflowX: "auto", 
            WebkitOverflowScrolling: "touch",
            margin: isMobile ? "-4px" : 0,
            padding: isMobile ? "4px" : 0,
          }}>
            <table style={{ 
              width: "100%", 
              minWidth: isMobile ? 280 : "100%",
              borderCollapse: "collapse", 
              fontSize: isMobile ? 12 : 13 
            }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <th style={{ ...styles.th, padding: isMobile ? "6px 8px" : "8px 16px" }}>#</th>
                  <th style={{ ...styles.th, padding: isMobile ? "6px 8px" : "8px 16px" }}>Suburb</th>
                  <th style={{ ...styles.th, padding: isMobile ? "6px 8px" : "8px 16px", textAlign: "right" }}>Median Rent</th>
                </tr>
              </thead>
              <tbody><TableBody rows={top10Exp} priceColor="#c0392b" /></tbody>
            </table>
          </div>
        </div>

        {/* most affordable table */}
        <div style={styles.card}>
          <h3 style={{ margin: "0 0 12px", fontSize: isMobile ? 13 : 14, color: "#27ae60" }}>
            📉 Cheapest — {label}
          </h3>
          <div style={{ 
            overflowX: "auto", 
            WebkitOverflowScrolling: "touch",
            margin: isMobile ? "-4px" : 0,
            padding: isMobile ? "4px" : 0,
          }}>
            <table style={{ 
              width: "100%", 
              minWidth: isMobile ? 280 : "100%",
              borderCollapse: "collapse", 
              fontSize: isMobile ? 12 : 13 
            }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <th style={{ ...styles.th, padding: isMobile ? "6px 8px" : "8px 16px" }}>#</th>
                  <th style={{ ...styles.th, padding: isMobile ? "6px 8px" : "8px 16px" }}>Suburb</th>
                  <th style={{ ...styles.th, padding: isMobile ? "6px 8px" : "8px 16px", textAlign: "right" }}>Median Rent</th>
                </tr>
              </thead>
              <tbody><TableBody rows={top10Cheap} priceColor="#27ae60" /></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}