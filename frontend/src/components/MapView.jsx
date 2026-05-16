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

export default function MapView({ rentals, activeBedType, search, mapSearchValue, onMapSearchChange, onBedTypeChange }) {
  const [hoveredSuburb, setHoveredSuburb] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showAllSuburbs, setShowAllSuburbs] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
        return hasCoords && hasData && matchesSearch;
      })
      .map(rental => ({
        ...rental,
        ...MELBOURNE_SUBURB_COORDINATES[rental.Suburb],
      }));
  }, [rentals, activeBedType, search]);

  const activeLabel = BED_TYPES.find((b) => b.key === activeBedType)?.label || "";
  
  const totalWithCoords = useMemo(() => {
    return rentals.filter(r => MELBOURNE_SUBURB_COORDINATES[r.Suburb]).length;
  }, [rentals]);

  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ ...styles.subheading, fontSize: isMobile ? 18 : 22 }}>🗺️ Melbourne Rental Map</h2>

      {/* search and filter */}
      <div style={{ 
        display: "flex", 
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between", 
        alignItems: isMobile ? "stretch" : "center", 
        marginBottom: 20, 
        gap: 12 
      }}>
        {/* map search bar */}
        <div style={{ flex: 1 }}>
          <input 
            type="text" 
            placeholder="Search suburbs on map..." 
            value={mapSearchValue} 
            onChange={(e) => onMapSearchChange?.(e.target.value)} 
            style={{ 
              width: "100%", 
              padding: "10px 12px", 
              border: "1px solid #ddd", 
              borderRadius: 8, 
              fontSize: 14,
              background: "white",
              minHeight: 44,
            }}
          />
        </div>

        {/* property type filter */}
        <div style={{ 
          display: "flex", 
          gap: 8, 
          flexWrap: "wrap", 
          alignItems: "center",
          overflowX: isMobile ? "auto" : "visible",
          WebkitOverflowScrolling: "touch",
          paddingBottom: isMobile ? 4 : 0,
        }}>
          <span style={{ ...styles.label, fontSize: isMobile ? 12 : 13 }}>View prices for:</span>
          {BED_TYPES.map(({ key, label }) => (
            <button 
              key={key} 
              onClick={() => onBedTypeChange?.(key)} 
              style={{ 
                ...styles.button, 
                ...(activeBedType === key ? styles.activeButton : {}),
                minHeight: 40,
                padding: isMobile ? "6px 12px" : "6px 12px",
                fontSize: isMobile ? 12 : 13,
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      <div style={styles.card}>
        {/* header section */}
        <div style={{ 
          display: "flex", 
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between", 
          alignItems: isMobile ? "flex-start" : "center", 
          marginBottom: 16, 
          gap: 12 
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: isMobile ? 14 : 16 }}>{activeLabel} Rent Prices — Melbourne Metro</h3>
            <p style={{ margin: "4px 0 0", fontSize: isMobile ? 11 : 13, color: "#667" }}>
              Showing {suburbsWithCoords.length} of {totalWithCoords} suburbs with map data
              {search && " (filtered)"}
            </p>
          </div>
          
          {/* legend */}
          <div style={{ 
            display: "flex", 
            gap: isMobile ? 8 : 16, 
            alignItems: "center", 
            fontSize: isMobile ? 10 : 12, 
            flexWrap: "wrap",
            overflowX: isMobile ? "auto" : "visible",
            WebkitOverflowScrolling: "touch",
            maxWidth: "100%",
          }}>
            <div style={{ display: "flex", gap: isMobile ? 8 : 12, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 12, height: 12, background: "#27ae60", borderRadius: "50%", border: "2px solid white", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}></div>
                <span>Budget (≤${percentileRanges.p25})</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 12, height: 12, background: "#82ca9d", borderRadius: "50%", border: "2px solid white", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}></div>
                <span>Affordable</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 12, height: 12, background: "#f1c40f", borderRadius: "50%", border: "2px solid white", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}></div>
                <span>Mid-Range</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 12, height: 12, background: "#e67e22", borderRadius: "50%", border: "2px solid white", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}></div>
                <span>Premium</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 12, height: 12, background: "#e74c3c", borderRadius: "50%", border: "2px solid white", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}></div>
                <span>Luxury (≥${percentileRanges.p90 + 1})</span>
              </div>
            </div>
            
            <button
              onClick={() => setShowAllSuburbs(!showAllSuburbs)}
              style={{ 
                ...styles.button, 
                fontSize: isMobile ? 10 : 12, 
                padding: isMobile ? "6px 10px" : "4px 12px", 
                background: showAllSuburbs ? "#8884d8" : "white", 
                color: showAllSuburbs ? "white" : "#333",
                minHeight: 36,
                whiteSpace: "nowrap",
              }}
            >
              {showAllSuburbs ? "Zoom to Filtered" : "Show All"}
            </button>
          </div>
        </div>

        {/* map container */}
        <div style={{ 
          height: isMobile ? 400 : 600, 
          borderRadius: 8, 
          overflow: "hidden", 
          border: "1px solid #e0e0e0", 
          position: "relative" 
        }}>
          <MapContainer 
            center={[-37.8, 145.0]} 
            zoom={isMobile ? 9 : 10} 
            style={{ height: "100%", width: "100%" }} 
            scrollWheelZoom={true}
            zoomControl={!isMobile}
          >
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
                <Popup maxWidth={isMobile ? 250 : 300}>
                  <div style={{ minWidth: isMobile ? 180 : 220 }}>
                    <h3 style={{ margin: "0 0 8px", fontSize: isMobile ? 14 : 16, fontWeight: 600 }}>{suburb.Suburb}</h3>
                    <p style={{ margin: "0 0 8px", color: "#666", fontSize: isMobile ? 11 : 13 }}>{suburb.Region}</p>
                    <div style={{ background: "#f5f5f5", padding: "8px 12px", borderRadius: 6, marginBottom: 8 }}>
                      <div style={{ fontSize: isMobile ? 10 : 12, color: "#666", marginBottom: 4 }}>{activeLabel} Median Rent</div>
                      <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 700, color: "#333" }}>${suburb[activeBedType]?.toLocaleString()}</div>
                    </div>
                    <div style={{ fontSize: isMobile ? 10 : 12, borderTop: "1px solid #e0e0e0", paddingTop: 8 }}>
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
          
          {/* hover tooltip */}
          {hoveredSuburb && (
            <div style={{
              position: "absolute", 
              top: isMobile ? 5 : 10, 
              right: isMobile ? 5 : 10,
              left: isMobile ? 5 : "auto",
              background: "rgba(255, 255, 255, 0.95)", 
              padding: isMobile ? "6px 10px" : "8px 12px", 
              borderRadius: 6,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)", 
              zIndex: 1000, 
              fontSize: isMobile ? 11 : 13, 
              fontWeight: 500,
              textAlign: "center",
            }}>
              {hoveredSuburb}
            </div>
          )}
        </div>

        {/* selected marker details panel */}
        {selectedMarker && (
          <div style={{ marginTop: 16, padding: isMobile ? 12 : 16, background: "#f8f9fa", borderRadius: 8, border: "1px solid #e0e0e0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h4 style={{ margin: 0, fontSize: isMobile ? 14 : 16 }}>📍 {selectedMarker}</h4>
              <button 
                onClick={() => setSelectedMarker(null)} 
                style={{ 
                  ...styles.button, 
                  fontSize: isMobile ? 11 : 12, 
                  padding: isMobile ? "4px 10px" : "4px 12px", 
                  background: "white",
                  minHeight: 36,
                }}
              >
                Close
              </button>
            </div>
            {(() => {
              const suburb = suburbsWithCoords.find(s => s.Suburb === selectedMarker);
              if (!suburb) return null;
              return (
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(150px, 1fr))", 
                  gap: 8 
                }}>
                  {BED_TYPES.map(({ key, label }) => (
                    <div key={key} style={{ 
                      padding: isMobile ? "6px 10px" : "8px 12px", 
                      background: "white", 
                      borderRadius: 6, 
                      border: "1px solid #e0e0e0", 
                      ...(key === activeBedType ? { borderColor: "#8884d8", boxShadow: "0 0 0 2px rgba(136, 132, 216, 0.2)" } : {}) 
                    }}>
                      <div style={{ fontSize: isMobile ? 10 : 11, color: "#666", marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600 }}>{formatPrice(suburb[key])}</div>
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