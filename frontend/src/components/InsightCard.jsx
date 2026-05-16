import { useState, useEffect } from "react";
import { styles } from "../styles";
import { formatPrice } from "../utils/helpers";

export default function InsightCard({ title, suburb, value }) {
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
    <div style={{ 
      ...styles.card, 
      textAlign: "center",
      padding: isMobile ? "16px 12px" : "20px",
      minWidth: isMobile ? "auto" : "160px",
    }}>
      <h3 style={{ 
        margin: "0 0 8px", 
        fontSize: isMobile ? 13 : 14, 
        color: "#666",
        fontWeight: 500,
      }}>
        {title}
      </h3>
      <p style={{ 
        margin: "0 0 8px", 
        fontSize: isMobile ? 15 : 16, 
        fontWeight: 600, 
        color: "#222",
        wordBreak: "break-word",
      }}>
        {suburb || "N/A"}
      </p>
      <strong style={{ 
        fontSize: isMobile ? 20 : 24, 
        color: "#667eea",
        fontWeight: 700,
        display: "inline-block",
      }}>
        {formatPrice(value)}
      </strong>
    </div>
  );
}