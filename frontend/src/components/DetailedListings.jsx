import { useState, useMemo, useEffect } from "react";
import { BED_TYPES, STACKED_COLORS } from "../config/constants";
import { formatPrice } from "../utils/helpers";
import { styles } from "../styles";

const TIER_ORDER = ["Budget", "Affordable", "Mid-Range", "Premium", "Luxury"];
const CATEGORY_COLORS = Object.fromEntries(
  TIER_ORDER.map((tier, i) => [tier, STACKED_COLORS[i]])
);

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function DetailedListings({ listings, isMobile }) {
  const [search, setSearch] = useState("");
  const [pinnedSuburbs, setPinnedSuburbs] = useState([]);
  const [draggedPin, setDraggedPin] = useState(null);
  const [dragOverPin, setDragOverPin] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  const thresholds = useMemo(() => {
    const result = {};
    BED_TYPES.forEach(({ key }) => {
      const validPrices = listings
        .filter((r) => r[key] != null && r[key] !== 0)
        .map((r) => r[key])
        .sort((a, b) => a - b);

      if (validPrices.length === 0) {
        result[key] = null;
        return;
      }
      result[key] = {
        p25: validPrices[Math.floor(validPrices.length * 0.25)],
        p50: validPrices[Math.floor(validPrices.length * 0.5)],
        p75: validPrices[Math.floor(validPrices.length * 0.75)],
        p90: validPrices[Math.floor(validPrices.length * 0.9)],
      };
    });
    return result;
  }, [listings]);

  const classify = (price, bedKey) => {
    if (price == null || price === 0) return null;
    const t = thresholds[bedKey];
    if (!t) return null;
    if (price <= t.p25) return "Budget";
    if (price <= t.p50) return "Affordable";
    if (price <= t.p75) return "Mid-Range";
    if (price <= t.p90) return "Premium";
    return "Luxury";
  };

  const togglePin = (suburb) => {
    setPinnedSuburbs((prev) =>
      prev.includes(suburb)
        ? prev.filter((s) => s !== suburb)
        : [...prev, suburb]
    );
  };

  const clearAllPins = () => setPinnedSuburbs([]);

  const handleDragStart = (e, suburb) => {
    setDraggedPin(suburb);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", suburb);
  };

  const handleDragOver = (e, suburb) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (suburb !== draggedPin) {
      setDragOverPin(suburb);
    }
  };

  const handleDragLeave = () => {
    setDragOverPin(null);
  };

  const handleDrop = (e, targetSuburb) => {
    e.preventDefault();
    setDragOverPin(null);

    if (draggedPin === targetSuburb) {
      setDraggedPin(null);
      return;
    }

    setPinnedSuburbs((prev) => {
      const newPins = [...prev];
      const draggedIndex = newPins.indexOf(draggedPin);
      const targetIndex = newPins.indexOf(targetSuburb);

      if (draggedIndex === -1 || targetIndex === -1) return prev;

      newPins.splice(draggedIndex, 1);
      newPins.splice(targetIndex, 0, draggedPin);
      return newPins;
    });

    setDraggedPin(null);
  };

  const handleDragEnd = () => {
    setDraggedPin(null);
    setDragOverPin(null);
  };

  const filteredListings = useMemo(() => {
    const sorted = [...listings].sort((a, b) => {
      const aPinned = pinnedSuburbs.includes(a.Suburb);
      const bPinned = pinnedSuburbs.includes(b.Suburb);

      if (aPinned && bPinned) {
        return pinnedSuburbs.indexOf(a.Suburb) - pinnedSuburbs.indexOf(b.Suburb);
      }
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });

    if (!debouncedSearch.trim()) return sorted;

    const searchLower = debouncedSearch.toLowerCase();
    return sorted.filter((rental) => {
      if (pinnedSuburbs.includes(rental.Suburb)) return true;
      return (
        rental.Suburb?.toLowerCase().includes(searchLower) ||
        rental.Region?.toLowerCase().includes(searchLower)
      );
    });
  }, [listings, debouncedSearch, pinnedSuburbs]);

  const cardsPerRow = isMobile
    ? 1
    : Math.max(1, Math.floor((typeof window !== "undefined" ? window.innerWidth : 1024) / 312));
  const currentRows = Math.ceil(filteredListings.length / cardsPerRow);
  const placeholders = Array(Math.max(0, 4 - currentRows) * cardsPerRow).fill(null);

  return (
    <section id="listings" style={{ scrollMarginTop: 110 }}>
      <h2 style={{ ...styles.subheading, fontSize: isMobile ? 18 : 22 }}>
        📌 Detailed Listings ({filteredListings.length} suburbs)
      </h2>

      <div style={styles.card}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type="text"
              placeholder="Search suburbs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 40px 10px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                fontSize: isMobile ? 13 : 14,
                color: "#333",
                background: "white",
                minHeight: 44,
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  fontSize: 18,
                  color: "#999",
                  cursor: "pointer",
                  padding: "4px 8px",
                  lineHeight: 1,
                }}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          {pinnedSuburbs.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#667" }}>
                📌 {pinnedSuburbs.length} suburb{pinnedSuburbs.length !== 1 ? "s" : ""} pinned
              </span>
              <span style={{ fontSize: 11, color: "#999" }}>
                (drag to reorder)
              </span>
              <button
                onClick={clearAllPins}
                style={{
                  padding: "4px 10px",
                  background: "#fee2e2",
                  color: "#dc2626",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 11,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Clear all pins
              </button>
            </div>
          )}
        </div>

        {filteredListings.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#999", background: "#fafafa", borderRadius: 8 }}>
            No suburbs match your search
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 12,
              }}
            >
              {filteredListings.map((rental) => {
                const isPinned = pinnedSuburbs.includes(rental.Suburb);
                const isDragging = draggedPin === rental.Suburb;
                const isDragOver = dragOverPin === rental.Suburb;
                return (
                  <div
                    key={rental.Suburb}
                    draggable={isPinned}
                    style={{
                      background: "white",
                      borderRadius: 12,
                      padding: 16,
                      border: isDragOver ? "2px dashed #667eea" : isPinned ? "2px solid #667eea" : "1px solid #eee",
                      position: "relative",
                      cursor: isPinned ? "grab" : "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      opacity: isDragging ? 0.5 : 1,
                      boxShadow: isDragOver
                        ? "0 0 0 3px rgba(102,126,234,0.2)"
                        : "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                    onClick={() => togglePin(rental.Suburb)}
                    onMouseEnter={(e) => {
                      if (!isMobile && !isDragging) {
                        e.currentTarget.style.transform = "translateY(-7px)";
                        e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                      }
                    }}
                    onDragStart={(e) => handleDragStart(e, rental.Suburb)}
                    onDragOver={(e) => isPinned && handleDragOver(e, rental.Suburb)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => isPinned && handleDrop(e, rental.Suburb)}
                    onDragEnd={handleDragEnd}
                  >
                    {isPinned && (
                      <span
                        style={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          fontSize: 11,
                          color: "#999",
                        }}
                      >
                        ⠿
                      </span>
                    )}
                    <span
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        fontSize: 18,
                        opacity: isPinned ? 1 : 0.25,
                        filter: isPinned ? "none" : "grayscale(1)",
                      }}
                    >
                      📌
                    </span>

                    <h3
                      style={{
                        margin: 0,
                        fontSize: 16,
                        color: "#222",
                        paddingRight: 30,
                        paddingLeft: isPinned ? 20 : 0,
                      }}
                    >
                      {rental.Suburb}
                    </h3>
                    <p style={{ margin: "4px 0 12px", fontSize: 12, color: "grey" }}>
                      {rental.Region}
                    </p>

                    {BED_TYPES.map(({ key, label }) => {
                      const price = rental[key];
                      const category = classify(price, key);
                      const categoryColor = category ? CATEGORY_COLORS[category] : null;

                      return (
                        <p
                          key={key}
                          style={{
                            margin: 4,
                            fontSize: 13,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            color: "#333",
                          }}
                        >
                          <span style={{ color: "grey" }}>{label}:</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <strong style={{ color: "#222" }}>
                              {formatPrice(price)}
                            </strong>
                            {category && (
                              <span
                                style={{
                                  width: 7,
                                  height: 7,
                                  borderRadius: "50%",
                                  background: categoryColor,
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </span>
                        </p>
                      );
                    })}
                  </div>
                );
              })}

              {placeholders.map((_, index) => (
                <div key={`placeholder-${index}`} style={{ visibility: "hidden" }}>
                  <div style={{ padding: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 16 }}>&nbsp;</h3>
                    <p style={{ margin: "4px 0 12px", fontSize: 12 }}>&nbsp;</p>
                    {BED_TYPES.map(({ key }) => (
                      <p key={key} style={{ margin: 4, fontSize: 13 }}>&nbsp;</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 12,
                textAlign: "center",
                fontSize: isMobile ? 11 : 12,
                color: "#667",
                borderTop: "1px solid #eee",
                paddingTop: 12,
              }}
            >
              Showing {filteredListings.length} suburb{filteredListings.length !== 1 ? "s" : ""}
            </div>
          </>
        )}
      </div>
    </section>
  );
}