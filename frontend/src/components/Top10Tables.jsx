import { useState } from "react";
import { BED_TYPES } from "../config/constants";
import { styles } from "../styles";

export default function Top10Tables({ rentals }) {
  const [activeBed, setActiveBed] = useState("threeBedHouse");

  const valid = rentals
    .filter((r) => r[activeBed] != null && r[activeBed] !== 0)
    .sort((a, b) => b[activeBed] - a[activeBed]);

  const top10Exp = valid.slice(0, 10);
  const top10Cheap = [...valid].reverse().slice(0, 10);
  const label = BED_TYPES.find((b) => b.key === activeBed)?.label || "";

  const TableBody = ({ rows, priceColor }) => (
    <>
      {rows.length === 0 ? (
        <tr><td colSpan={3} style={{ padding: "12px 16px", color: "#999" }}>No data</td></tr>
      ) : (
        rows.map((r, i) => (
          <tr key={r.Suburb} style={{ borderBottom: "1px solid #f0f0f0" }}>
            <td style={styles.top10Rank}>{i + 1}</td>
            <td style={{ padding: "10px 16px" }}>
              <div style={{ fontWeight: 500 }}>{r.Suburb}</div>
              <div style={{ fontSize: 11, color: "#999" }}>{r.Region}</div>
            </td>
            <td style={{ padding: "10px 16px", textAlign: "right", color: priceColor, fontWeight: 500 }}>${Math.round(r[activeBed]).toLocaleString()}</td>
          </tr>
        ))
      )}
    </>
  );

  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={styles.subheading}>Suburb Rental Rankings</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 }}>
        {BED_TYPES.map(({ key, label: lbl }) => (
          <button key={key} onClick={() => setActiveBed(key)} style={{ ...styles.button, ...(activeBed === key ? styles.activeButton : {}) }}>{lbl}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={styles.card}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14 }}>📈 Most Expensive — {label}</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Suburb</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Median Rent</th>
              </tr>
            </thead>
            <tbody><TableBody rows={top10Exp} priceColor="#c0392b" /></tbody>
          </table>
        </div>
        <div style={styles.card}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14 }}>📉 Cheapest — {label}</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Suburb</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Median Rent</th>
              </tr>
            </thead>
            <tbody><TableBody rows={top10Cheap} priceColor="#27ae60" /></tbody>
          </table>
        </div>
      </div>
    </div>
  );
}