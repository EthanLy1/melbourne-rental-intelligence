import { useState, useEffect } from "react";

export default function LoadingScreen() {
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
          width: 40,
          height: 40,
          border: "3px solid rgba(255,255,255,0.1)",
          borderTop: "3px solid #764ba2",
          borderRight: "3px solid #667eea",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}