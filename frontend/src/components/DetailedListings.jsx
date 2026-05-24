import { useState, useMemo } from "react";
import { BED_TYPES, STACKED_COLORS } from "../config/constants";
import { formatPrice } from "../utils/helpers";
import { styles } from "../styles";

// Same order & colour mapping as the stacked bar chart
const TIER_ORDER = ["Budget", "Affordable", "Mid-Range", "Premium", "Luxury"];
const CATEGORY_COLORS = Object.fromEntries(
  TIER_ORDER.map((tier, i) => [tier, STACKED_COLORS[i]])
);

export default function DetailedListings({ listings, isMobile }) {
  const [search, setSearch] = useState("");
  const [pinnedSuburbs, setPinnedSuburbs] = useState([]);
  const [hoveredSuburb, setHoveredSuburb] = useState(null);

  // Pre-compute thresholds once per bed type so cards don't recalculate repeatedly
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

  // Classify a price using pre-computed thresholds
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

  const filteredListings = useMemo(() => {
    const sorted = [...listings].sort((a, b) => {
      const aPinned = pinnedSuburbs.includes(a.Suburb);
      const bPinned = pinnedSuburbs.includes(b.Suburb);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });

    if (!search.trim()) return sorted;

    const searchLower = search.toLowerCase();
    return sorted.filter((rental) => {
      if (pinnedSuburbs.includes(rental.Suburb)) return true;
      return (
        rental.Suburb?.toLowerCase().includes(searchLower) ||
        rental.Region?.toLowerCase().includes(searchLower)
      );
    });
  }, [listings, search, pinnedSuburbs]);

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
        {/* Search bar */}
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
                const isHovered = hoveredSuburb === rental.Suburb;
                return (
                  <div
                    key={rental.Suburb}
                    style={{
                      background: "white",
                      borderRadius: 12,
                      padding: 16,
                      border: isPinned ? "2px solid #667eea" : "1px solid #eee",
                      position: "relative",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                      boxShadow: isHovered
                        ? "0 8px 25px rgba(0,0,0,0.1)"
                        : "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                    onClick={() => togglePin(rental.Suburb)}
                    onMouseEnter={() => setHoveredSuburb(rental.Suburb)}
                    onMouseLeave={() => setHoveredSuburb(null)}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        fontSize: 18,
                        opacity: isPinned ? 1 : isHovered ? 0.6 : 0.25,
                        filter: isPinned ? "none" : "grayscale(1)",
                        transition: "all 0.2s ease",
                        transform: isHovered && !isPinned ? "scale(1.2)" : "scale(1)",
                      }}
                    >
                      📌
                    </span>

                    <h3
                      style={{
                        margin: 0,
                        fontSize: 16,
                        color: isHovered ? "#667eea" : "#222",
                        paddingRight: 30,
                        transition: "color 0.2s ease",
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
                            <strong
                              style={{
                                color: isHovered ? "#667eea" : "#222",
                                transition: "color 0.2s ease",
                              }}
                            >
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
                                  display: "inline-block",
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