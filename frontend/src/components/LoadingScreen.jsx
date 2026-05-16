export default function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#1a1a2e",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 32,
    }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, color: "white", letterSpacing: "-0.5px" }}>
          Melbourne Rental Intelligence
        </h1>
        <p style={{ margin: "8px 0 0", fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
          Loading suburb data...
        </p>
      </div>
    </div>
  );
}