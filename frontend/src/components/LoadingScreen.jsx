import { useState, useEffect } from "react";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; 
        return prev + Math.random() * 15;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#1a1a2e",
        gap: 20,
      }}
    >
      <h2 style={{ color: "white", fontSize: 20, fontWeight: 500, margin: 0 }}>
        Loading Melbourne Rental Data
      </h2>
      <div
        style={{
          width: 280,
          height: 6,
          background: "rgba(255,255,255,0.15)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.min(progress, 100)}%`,
            height: "100%",
            background: "linear-gradient(90deg, #667eea, #764ba2)",
            borderRadius: 3,
            transition: "width 0.2s ease",
          }}
        />
      </div>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
        {Math.round(progress)}%
      </p>
    </div>
  );
}