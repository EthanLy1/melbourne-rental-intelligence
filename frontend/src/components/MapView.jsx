import { useEffect, useMemo, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { BED_TYPES, MELBOURNE_SUBURB_COORDINATES } from "../config/constants";
import { formatPrice, createColoredIcon, calculatePercentiles } from "../utils/helpers";
import { styles } from "../styles";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function MapController({ showAll }) {
  const map = useMap();
  useEffect(() => {
    const centerLat = -37.8136;
    const centerLng = 144.9631;
    const range = 1.2;
    const southWest = L.latLng(centerLat - range, centerLng - range);
    const northEast = L.latLng(centerLat + range, centerLng + range);
    const bounds = L.latLngBounds(southWest, northEast);
    map.setMaxBounds(bounds);
    map.options.maxBoundsViscosity = 1.0;
    map.setMinZoom(9);
    map.setMaxZoom(16);
    if (showAll) {
      map.fitBounds([[-38.1, 144.7], [-37.6, 145.2]], { padding: [50, 50] });
    }
  }, [showAll, map]);
  return null;
}

export default function MapView({ rentals, activeBedType, onBedTypeChange }) {
  const [mapSearchValue, setMapSearchValue] = useState("");
  const [hoveredSuburb, setHoveredSuburb] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showAllSuburbs, setShowAllSuburbs] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const debouncedMapSearch = useDebounce(mapSearchValue, 300);
  const debouncedMinPrice = useDebounce(minPrice, 300);
  const debouncedMaxPrice = useDebounce(maxPrice, 300);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const percentileRanges = useMemo(() => {
    const validPrices = rentals
      .filter((r) => r[activeBedType] != null && r[activeBedType] !== 0)
      .map((r) => r[activeBedType]);
    return calculatePercentiles(validPrices);
  }, [rentals, activeBedType]);

  const iconCache = useMemo(() => {
    const cache = {};
    rentals.forEach((rental) => {
      if (MELBOURNE_SUBURB_COORDINATES[rental.Suburb] && rental[activeBedType] != null) {
        cache[rental.Suburb] = createColoredIcon(rental[activeBedType], percentileRanges);
      }
    });
    return cache;
  }, [rentals, activeBedType, percentileRanges]);

  const suburbsWithCoords = useMemo(() => {
    const searchLower = debouncedMapSearch.toLowerCase();
    const min = debouncedMinPrice !== "" ? Number(debouncedMinPrice) : null;
    const max = debouncedMaxPrice !== "" ? Number(debouncedMaxPrice) : null;
    return rentals
      .filter((rental) => {
        const hasCoords = MELBOURNE_SUBURB_COORDINATES[rental.Suburb];
        const hasData = rental[activeBedType] != null && rental[activeBedType] !== 0;
        const matchesSearch = !debouncedMapSearch || (rental.Suburb || "").toLowerCase().includes(searchLower);
        const price = rental[activeBedType];
        const aboveMin = min === null || price >= min;
        const belowMax = max === null || price <= max;
        return hasCoords && hasData && matchesSearch && aboveMin && belowMax;
      })
      .map((rental) => ({
        ...rental,
        ...MELBOURNE_SUBURB_COORDINATES[rental.Suburb],
      }));
  }, [rentals, activeBedType, debouncedMapSearch, debouncedMinPrice, debouncedMaxPrice]);

  const activeLabel = BED_TYPES.find((b) => b.key === activeBedType)?.label || "";

  const totalWithCoords = useMemo(() => {
    return rentals.filter((r) => MELBOURNE_SUBURB_COORDINATES[r.Suburb]).length;
  }, [rentals]);

  const handleHoverIn = useCallback((suburb) => setHoveredSuburb(suburb), []);
  const handleHoverOut = useCallback(() => setHoveredSuburb(null), []);
  const handleClick = useCallback((suburb) => setSelectedMarker(suburb), []);

  const priceFilterActive = minPrice !== "" || maxPrice !== "";

  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ ...styles.subheading, fontSize: isMobile ? 18 : 22 }}>🗺️ Melbourne Rental Map</h2>

      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search suburbs..."
              value={mapSearchValue}
              onChange={(e) => setMapSearchValue(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 36px 9px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                fontSize: 14,
                background: "white",
                boxSizing: "border-box",
              }}
            />
            {mapSearchValue && (
              <button
                onClick={() => setMapSearchValue("")}
                style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", fontSize: 16, color: "#999", cursor: "pointer", padding: "2px 6px" }}
                aria-label="Clear search"
              >✕</button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ ...styles.label, fontSize: 12, whiteSpace: "nowrap" }}>Price ($):</span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min={0}
              style={{ flex: 1, padding: "8px 8px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, background: "white", minWidth: 0, boxSizing: "border-box" }}
            />
            <span style={{ ...styles.label, fontSize: 12, whiteSpace: "nowrap"  }}>–</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min={0}
              style={{ flex: 1, padding: "8px 8px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, background: "white", minWidth: 0, boxSizing: "border-box" }}
            />
            {priceFilterActive && (
              <button
                onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                style={{ padding: "8px 10px", border: "1px solid #ddd", borderRadius: 8, fontSize: 12, background: "white", cursor: "pointer", color: "grey", whiteSpace: "nowrap" }}
              >Clear</button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 2 }}>
            <span style={{ ...styles.label, fontSize: 12, whiteSpace: "nowrap" }}>View:</span>
            {BED_TYPES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onBedTypeChange?.(key)}
                style={{
                  ...styles.button,
                  ...(activeBedType === key ? styles.activeButton : {}),
                  padding: "6px 12px",
                  fontSize: 12,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >{label}</button>
            ))}
          </div>
        </div>
      ) : (
    
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
    
          <div style={{ flex: "1 1 180px", position: "relative", minWidth: 0 }}>
            <input
              type="text"
              placeholder="Search suburbs..."
              value={mapSearchValue}
              onChange={(e) => setMapSearchValue(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 36px 9px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                fontSize: 14,
                background: "white",
                minHeight: 42,
                boxSizing: "border-box",
              }}
            />
            {mapSearchValue && (
              <button
                onClick={() => setMapSearchValue("")}
                style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", fontSize: 16, color: "#999", cursor: "pointer", padding: "2px 6px", lineHeight: 1 }}
                aria-label="Clear search"
              >✕</button>
            )}
          </div>

          <div style={{ width: 1, height: 28, background: "#e0e0e0", flexShrink: 0 }} />

          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <span style={{ ...styles.label, fontSize: 13, whiteSpace: "nowrap" }}>Price ($):</span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min={0}
              style={{ width: 76, padding: "9px 8px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, background: "white", minHeight: 42, boxSizing: "border-box" }}
            />
            <span style={{ ...styles.label, fontSize: 13, whiteSpace: "nowrap" }}>–</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min={0}
              style={{ width: 76, padding: "9px 8px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, background: "white", minHeight: 42, boxSizing: "border-box" }}
            />
            {priceFilterActive && (
              <button
                onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                style={{ padding: "9px 10px", border: "1px solid #ddd", borderRadius: 8, fontSize: 12, background: "white", cursor: "pointer", color: "grey", minHeight: 42 }}
              >Clear</button>
            )}
          </div>

          <div style={{ width: 1, height: 28, background: "#e0e0e0", flexShrink: 0 }} />

          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ ...styles.label, fontSize: 13, whiteSpace: "nowrap" }}>View:</span>
            {BED_TYPES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onBedTypeChange?.(key)}
                style={{
                  ...styles.button,
                  ...(activeBedType === key ? styles.activeButton : {}),
                  minHeight: 42,
                  padding: "6px 12px",
                  fontSize: 13,
                  whiteSpace: "nowrap",
                }}
              >{label}</button>
            ))}
          </div>
        </div>
      )}

      <div style={styles.card}>
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            marginBottom: 16,
            gap: 12,
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: isMobile ? 14 : 16 }}>{activeLabel} Rent Prices — Melbourne Metro</h3>
            <p style={{ margin: "4px 0 0", fontSize: isMobile ? 11 : 13, color: "#667" }}>
              Showing {suburbsWithCoords.length} of {totalWithCoords} suburbs with map data
              {(debouncedMapSearch || priceFilterActive) && " (filtered)"}
            </p>
          </div>

          <div style={{ display: "flex", gap: isMobile ? 8 : 16, alignItems: "center", fontSize: isMobile ? 10 : 12, flexWrap: "wrap", overflowX: isMobile ? "auto" : "visible", WebkitOverflowScrolling: "touch", maxWidth: "100%" }}>
            <div style={{ display: "flex", gap: isMobile ? 8 : 12, alignItems: "center", flexWrap: "wrap" }}>
              {[
                { color: "#27ae60", label: `Budget (≤$${percentileRanges.p25})` },
                { color: "#82ca9d", label: "Affordable" },
                { color: "#f1c40f", label: "Mid-Range" },
                { color: "#e67e22", label: "Premium" },
                { color: "#e74c3c", label: `Luxury (≥$${percentileRanges.p90 + 1})` },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 12, height: 12, background: color, borderRadius: "50%", border: "2px solid white", boxShadow: "0 1px 3px rgba(0,0,0,0.3)", flexShrink: 0 }} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setShowAllSuburbs(true); setTimeout(() => setShowAllSuburbs(false), 100); }}
              style={{ ...styles.button, fontSize: isMobile ? 10 : 12, padding: isMobile ? "6px 10px" : "4px 12px", minHeight: 36, whiteSpace: "nowrap" }}
            >Show All</button>
          </div>
        </div>

        <div style={{ height: isMobile ? 400 : 600, borderRadius: 8, overflow: "hidden", border: "1px solid #e0e0e0", position: "relative" }}>
          <MapContainer
            key="melbourne-map"
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
                icon={iconCache[suburb.Suburb]}
                eventHandlers={{
                  mouseover: () => handleHoverIn(suburb.Suburb),
                  mouseout: handleHoverOut,
                  click: () => handleClick(suburb.Suburb),
                }}
              >
                <Popup maxWidth={isMobile ? 250 : 300}>
                  <div style={{ minWidth: isMobile ? 180 : 220 }}>
                    <h3 style={{ margin: "0 0 8px", fontSize: isMobile ? 14 : 16, fontWeight: 600 }}>{suburb.Suburb}</h3>
                    <p style={{ margin: "0 0 8px", color: "grey", fontSize: isMobile ? 11 : 13 }}>{suburb.Region}</p>
                    <div style={{ background: "#f5f5f5", padding: "8px 12px", borderRadius: 6, marginBottom: 8 }}>
                      <div style={{ fontSize: isMobile ? 10 : 12, color: "grey", marginBottom: 4 }}>{activeLabel} Median Rent</div>
                      <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 700, color: "#333" }}>${suburb[activeBedType]?.toLocaleString()}</div>
                    </div>
                    <div style={{ fontSize: isMobile ? 10 : 12, borderTop: "1px solid #e0e0e0", paddingTop: 8 }}>
                      {BED_TYPES.filter((b) => b.key !== activeBedType).map(({ key, label }) => (
                        <div key={key} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ color: "grey" }}>{label}:</span>
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
            <div style={{ position: "absolute", top: isMobile ? 5 : 10, right: isMobile ? 5 : 10, left: isMobile ? 5 : "auto", background: "rgba(255,255,255,0.95)", padding: isMobile ? "6px 10px" : "8px 12px", borderRadius: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", zIndex: 1000, fontSize: isMobile ? 11 : 13, fontWeight: 500, textAlign: "center" }}>
              {hoveredSuburb}
            </div>
          )}
        </div>

        {selectedMarker && (
          <div style={{ marginTop: 16, padding: isMobile ? 12 : 16, background: "#f8f9fa", borderRadius: 8, border: "1px solid #e0e0e0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h4 style={{ margin: 0, fontSize: isMobile ? 14 : 16 }}>📍 {selectedMarker}</h4>
              <button onClick={() => setSelectedMarker(null)} style={{ ...styles.button, fontSize: isMobile ? 11 : 12, padding: isMobile ? "4px 10px" : "4px 12px", background: "white", minHeight: 36 }}>Close</button>
            </div>
            {(() => {
              const suburb = suburbsWithCoords.find((s) => s.Suburb === selectedMarker);
              if (!suburb) return null;
              return (
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
                  {BED_TYPES.map(({ key, label }) => (
                    <div key={key} style={{ padding: isMobile ? "6px 10px" : "8px 12px", background: "white", borderRadius: 6, border: "1px solid #e0e0e0", ...(key === activeBedType ? { borderColor: "#8884d8", boxShadow: "0 0 0 2px rgba(136,132,216,0.2)" } : {}) }}>
                      <div style={{ fontSize: isMobile ? 10 : 11, color: "grey", marginBottom: 4 }}>{label}</div>
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