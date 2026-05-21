import { useState, useEffect } from "react";

export default function LoadingScreen({ onLoadComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let startTime = Date.now();
    let animationFrame;
    let isMounted = true;
    
    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      let newProgress = Math.min(90, (elapsed / 3000) * 90);
      if (isMounted) {
        setProgress(newProgress);
      }
      
      if (newProgress < 90) {
        animationFrame = requestAnimationFrame(animateProgress);
      }
    };
    
    animationFrame = requestAnimationFrame(animateProgress);
    
    const loadData = async () => {
      try {
        const response = await fetch("http://localhost:8000/rentals");
        const data = await response.json();
        console.log("Data loaded:", data);
        
        if (isMounted) {
          setProgress(100);
          setTimeout(() => {
            if (isMounted) {
              onLoadComplete?.(data);
            }
          }, 300);
        }
      } catch (error) {
        console.error("Loading failed:", error);
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [onLoadComplete]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        padding: "0 24px",
      }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <h2 style={{ 
        color: "white", 
        fontSize: "clamp(20px, 5vw, 28px)", 
        fontWeight: 600, 
        margin: "0 0 12px 0",
        textAlign: "center",
        letterSpacing: "-0.3px"
      }}>
        Melbourne Rental Data
      </h2>
      
      <p style={{ 
        color: "rgba(255,255,255,0.7)", 
        fontSize: "clamp(12px, 4vw, 14px)", 
        margin: "0 0 48px 0",
        textAlign: "center"
      }}>
        Loading market insights
        <span style={{ animation: "pulse 1.4s infinite" }}>.</span>
        <span style={{ animation: "pulse 1.4s infinite 0.2s" }}>.</span>
        <span style={{ animation: "pulse 1.4s infinite 0.4s" }}>.</span>
      </p>
      
      <div
        style={{
          width: "100%",
          maxWidth: 320,
          height: 8,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 4,
          overflow: "hidden",
          marginBottom: 16,
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "linear-gradient(90deg, #667eea, #764ba2, #667eea)",
            backgroundSize: "200% 100%",
            borderRadius: 4,
            transition: "width 0.1s linear",
            animation: progress < 100 && progress > 0 ? "shimmer 1.5s infinite" : "none",
          }}
        />
      </div>
      
      <p style={{ 
        color: "rgba(255,255,255,0.5)", 
        fontSize: 13, 
        fontWeight: 500,
        margin: 0,
        fontVariantNumeric: "tabular-nums",
      }}>
        {Math.floor(progress)}%
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}