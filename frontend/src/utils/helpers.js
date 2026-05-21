import L from "leaflet";

export const parseValue = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

export const formatPrice = (value) => {
  return value != null && value !== 0 ? `$${value}` : "No data available";
};

export const createColoredIcon = (price, percentileRanges) => {
  let colorIndex = 2; 
  
  if (price <= percentileRanges.p25) {
    colorIndex = 0; 
  } else if (price <= percentileRanges.p50) {
    colorIndex = 1; 
  } else if (price <= percentileRanges.p75) {
    colorIndex = 2; 
  } else if (price <= percentileRanges.p90) {
    colorIndex = 3; 
  } else {
    colorIndex = 4; 
  }
  
  const colors = [
    "#27ae60", 
    "#82ca9d", 
    "#f1c40f", 
    "#e67e22", 
    "#e74c3c", 
  ];
  
  const color = colors[colorIndex];
  const labels = ["Budget", "Affordable", "Mid-Range", "Premium", "Luxury"];
  
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 24px;
      height: 24px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: transform 0.2s;
    " title="${labels[colorIndex]}: $${price}/wk"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// helper to calculate percentiles for the map
export const calculatePercentiles = (prices) => {
  if (prices.length === 0) return { p25: 0, p50: 0, p75: 0, p90: 0 };
  
  const sorted = [...prices].sort((a, b) => a - b);
  return {
    p25: sorted[Math.floor(sorted.length * 0.25)],
    p50: sorted[Math.floor(sorted.length * 0.5)],
    p75: sorted[Math.floor(sorted.length * 0.75)],
    p90: sorted[Math.floor(sorted.length * 0.9)],
  };
};