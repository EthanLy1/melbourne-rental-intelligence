import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { BED_TYPES, MELBOURNE_SUBURB_COORDINATES } from "../config/constants";
import { formatPrice, createColoredIcon, calculatePercentiles } from "../utils/helpers";
import { styles } from "../styles";


function MapController({ showAll }) {
  const map = useMap();
  
  useEffect(() => {
    if (showAll) {
      map.fitBounds([
        [-38.5, 144.5],
        [-37.5, 145.5]
      ], { padding: [50, 50] });
    }
  }, [showAll, map]);

  return null;
}

export default function MapView({ rentals, activeBedType, search, region, mapSearchValue, onMapSearchChange, onBedTypeChange }) {
  const [hoveredSuburb, setHoveredSuburb] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showAllSuburbs, setShowAllSuburbs] = useState(false);

  // calculate percentile ranges for the active property type
  const percentileRanges = useMemo(() => {
    const validPrices = rentals
      .filter(r => r[activeBedType] != null && r[activeBedType] !== 0)
      .map(r => r[activeBedType]);
    return calculatePercentiles(validPrices);
  }, [rentals, activeBedType]);

  const suburbsWithCoords = useMemo(() => {
    const searchLower = search.toLowerCase();
    
    return rentals
      .filter(rental => {
        const hasCoords = MELBOURNE_SUBURB_COORDINATES[rental.Suburb];
        const hasData = rental[activeBedType] != null && rental[activeBedType] !== 0;
        const matchesSearch = !search || (rental.Suburb || "").toLowerCase().includes(searchLower);
        const matchesRegion = region === "All" || rental.Region === region;
        return hasCoords && hasData && matchesSearch && matchesRegion;
      })
      .map(rental => ({
        ...rental,
        ...MELBOURNE_SUBURB_COORDINATES[rental.Suburb],
      }));
  }, [rentals, activeBedType, search, region]);

  const activeLabel = BED_TYPES.find((b) => b.key === activeBedType)?.label || "";
  
  const totalWithCoords = useMemo(() => {
    return rentals.filter(r => MELBOURNE_SUBURB_COORDINATES[r.Suburb]).length;
  }, [rentals]);

  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={styles.subheading}>🗺️ Melbourne Rental Map</h2>

      

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>

  {/* map search bar */}
  <div style={{ flex: 1, minWidth: 250 }}>
    <input 
      type="text" 
      placeholder="🔍 Search suburbs on map..." 
      value={mapSearchValue} 
      onChange={(e) => onMapSearchChange?.(e.target.value)} 
      style={{ 
        width: "100%", 
        padding: "10px 12px", 
        border: "1px solid #ddd", 
        borderRadius: 8, 
        fontSize: 14,
        background: "white"
      }}
    />
  </div>

  {/* property type filter */}
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
    <span style={styles.label}>View prices for:</span>
    {BED_TYPES.map(({ key, label }) => (
      <button 
        key={key} 
        onClick={() => onBedTypeChange?.(key)} 
        style={{ 
          ...styles.button, 
          ...(activeBedType === key ? styles.activeButton : {}) 
        }}
      >
        {label}
      </button>
    ))}
  </div>
</div>
      
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16 }}>{activeLabel} Rent Prices — Melbourne Metropolitan Area</h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>
              Showing {suburbsWithCoords.length} of {totalWithCoords} suburbs with map data
              {(search || region !== "All") && " (filtered)"}
            </p>
          </div>
          
          <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 16, height: 16, background: "#27ae60", borderRadius: "50%", border: "2px solid white", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}></div>
                <span>Budget (≤${percentileRanges.p25})</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 16, height: 16, background: "#82ca9d", borderRadius: "50%", border: "2px solid white", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}></div>
                <span>Affordable</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 16, height: 16, background: "#f1c40f", borderRadius: "50%", border: "2px solid white", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}></div>
                <span>Mid-Range</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 16, height: 16, background: "#e67e22", borderRadius: "50%", border: "2px solid white", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}></div>
                <span>Premium</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 16, height: 16, background: "#e74c3c", borderRadius: "50%", border: "2px solid white", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}></div>
                <span>Luxury (≥${percentileRanges.p90 + 1})</span>
              </div>
            </div>
            
            <button
              onClick={() => setShowAllSuburbs(!showAllSuburbs)}
              style={{ ...styles.button, fontSize: 12, padding: "4px 12px", background: showAllSuburbs ? "#8884d8" : "white", color: showAllSuburbs ? "white" : "#333" }}
            >
              {showAllSuburbs ? "Zoom to Filtered" : "Show All Melbourne"}
            </button>
          </div>
        </div>

        <div style={{ height: 600, borderRadius: 8, overflow: "hidden", border: "1px solid #e0e0e0", position: "relative" }}>
          <MapContainer center={[-37.8, 145.0]} zoom={10} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapController showAll={showAllSuburbs} />
            
            {suburbsWithCoords.map((suburb) => (
              <Marker
                key={suburb.Suburb}
                position={[suburb.lat, suburb.lng]}
                icon={createColoredIcon(suburb[activeBedType], percentileRanges)}
                eventHandlers={{
                  mouseover: () => setHoveredSuburb(suburb.Suburb),
                  mouseout: () => setHoveredSuburb(null),
                  click: () => setSelectedMarker(suburb.Suburb),
                }}
              >
                <Popup maxWidth={300}>
                  <div style={{ minWidth: 220 }}>
                    <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600 }}>{suburb.Suburb}</h3>
                    <p style={{ margin: "0 0 8px", color: "#666", fontSize: 13 }}>{suburb.Region}</p>
                    <div style={{ background: "#f5f5f5", padding: "8px 12px", borderRadius: 6, marginBottom: 8 }}>
                      <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>{activeLabel} Median Rent</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: "#333" }}>${suburb[activeBedType]?.toLocaleString()}</div>
                    </div>
                    <div style={{ fontSize: 12, borderTop: "1px solid #e0e0e0", paddingTop: 8 }}>
                      {BED_TYPES.filter(b => b.key !== activeBedType).map(({ key, label }) => (
                        <div key={key} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ color: "#666" }}>{label}:</span>
                          <span style={{ fontWeight: 500 }}>{formatPrice(suburb[key])}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          {hoveredSuburb && (
            <div style={{
              position: "absolute", top: 10, right: 10,
              background: "rgba(255, 255, 255, 0.95)", padding: "8px 12px", borderRadius: 6,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)", zIndex: 1000, fontSize: 13, fontWeight: 500
            }}>
              {hoveredSuburb}
            </div>
          )}
        </div>

        {selectedMarker && (
          <div style={{ marginTop: 16, padding: 16, background: "#f8f9fa", borderRadius: 8, border: "1px solid #e0e0e0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h4 style={{ margin: 0, fontSize: 16 }}>📍 {selectedMarker}</h4>
              <button onClick={() => setSelectedMarker(null)} style={{ ...styles.button, fontSize: 12, padding: "4px 12px", background: "white" }}>Close</button>
            </div>
            {(() => {
              const suburb = suburbsWithCoords.find(s => s.Suburb === selectedMarker);
              if (!suburb) return null;
              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
                  {BED_TYPES.map(({ key, label }) => (
                    <div key={key} style={{ padding: "8px 12px", background: "white", borderRadius: 6, border: "1px solid #e0e0e0", ...(key === activeBedType ? { borderColor: "#8884d8", boxShadow: "0 0 0 2px rgba(136, 132, 216, 0.2)" } : {}) }}>
                      <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{formatPrice(suburb[key])}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}