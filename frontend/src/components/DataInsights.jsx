import { useMemo, useState, useEffect } from "react";
import { BED_TYPES } from "../config/constants";
import { parseValue } from "../utils/helpers";
import { styles } from "../styles";

export default function DataInsights({ rentals }) {
  const [isMobile, setIsMobile] = useState(false);
  const [clickedInsights, setClickedInsights] = useState({});

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const insights = useMemo(() => {
    const allInsights = [];

    // calculate averages for each bed type
    const bedTypeAverages = {};
    BED_TYPES.forEach(({ key }) => {
      const values = rentals
        .filter(r => r[key] != null && r[key] !== 0)
        .map(r => r[key]);
      bedTypeAverages[key] = values.length > 0 
        ? values.reduce((sum, val) => sum + val, 0) / values.length 
        : 0;
    });

    // 1. above average 
    BED_TYPES.forEach(({ key, label }) => {
      const avg = bedTypeAverages[key];
      if (avg === 0) return;

      const aboveAverage = rentals
        .filter(r => r[key] != null && r[key] !== 0)
        .map(r => ({
          suburb: r.Suburb,
          value: r[key],
          percentAbove: ((r[key] - avg) / avg) * 100
        }))
        .sort((a, b) => b.percentAbove - a.percentAbove);

      if (aboveAverage.length > 0 && aboveAverage[0].percentAbove > 50) {
        const top = aboveAverage[0];
        allInsights.push({
          type: "above-average",
          icon: "📈",
          color: "#c0392b",
          text: `${top.suburb} ${label.toLowerCase()} rents are ${Math.round(top.percentAbove)}% above the Melbourne average`,
          detail: `$${top.value} vs $${Math.round(avg)} average`,
          insight: `Based on ${label.toLowerCase()} listings. At $${top.value}/week, ${top.suburb} commands a ${Math.round(top.percentAbove)}% premium over the Melbourne average — this signals strong demand, premium amenities, or limited supply in the area.`
        });
      }
    });

    // 2. below average
    BED_TYPES.forEach(({ key, label }) => {
      const avg = bedTypeAverages[key];
      if (avg === 0) return;

      const belowAverage = rentals
        .filter(r => r[key] != null && r[key] !== 0)
        .map(r => ({
          suburb: r.Suburb,
          value: r[key],
          percentBelow: ((avg - r[key]) / avg) * 100
        }))
        .sort((a, b) => b.percentBelow - a.percentBelow);

      if (belowAverage.length > 0 && belowAverage[0].percentBelow > 38) {
        const top = belowAverage[0];
        const weeklySaving = Math.round(avg - top.value);
        allInsights.push({
          type: "below-average",
          icon: "📉",
          color: "#27ae60",
          text: `${top.suburb} ${label.toLowerCase()} rents are ${Math.round(top.percentBelow)}% below the Melbourne average`,
          detail: `$${top.value} vs $${Math.round(avg)} average`,
          insight: `Based on ${label.toLowerCase()} listings, ${top.suburb} offers genuine affordability at $${top.value}/week. That's a saving of $${weeklySaving}/week — nearly $${(weeklySaving * 52).toLocaleString()}/year — making it an attractive option for budget-conscious renters.`
        });
      }
    });

    // 3. region premium
    const regionData = {};
    rentals.forEach(r => {
      if (!r.Region) return;
      if (!regionData[r.Region]) {
        regionData[r.Region] = { values: [] };
      }
      const val = parseValue(r.threeBedHouse);
      if (val != null && val !== 0) {
        regionData[r.Region].values.push(val);
      }
    });

    const regionAverages = Object.entries(regionData)
      .map(([region, data]) => ({
        region,
        avg: data.values.reduce((a, b) => a + b, 0) / data.values.length
      }))
      .filter(r => r.avg > 0)
      .sort((a, b) => b.avg - a.avg);

    if (regionAverages.length >= 2) {
      const premium = ((regionAverages[0].avg - regionAverages[1].avg) / regionAverages[1].avg) * 100;
      if (premium > 10) {
        allInsights.push({
          type: "region-premium",
          icon: "💎",
          color: "#8e44ad",
          text: `${regionAverages[0].region} commands a ${Math.round(premium)}% premium over ${regionAverages[1].region} for 3-bed houses`,
          detail: `$${Math.round(regionAverages[0].avg)} vs $${Math.round(regionAverages[1].avg)}`,
          insight: `Comparing 3-bedroom house medians across ${regionAverages.length} regions, ${regionAverages[0].region} stands out. Even against ${regionAverages[1].region} (the next most expensive), you'll pay $${Math.round(regionAverages[0].avg - regionAverages[1].avg)} more per week. That ${Math.round(premium)}% premium likely reflects superior amenities, schools, or location desirability.`
        });
      }
    }

    // 4. affordability
    if (regionAverages.length >= 2) {
      const cheapest = regionAverages[regionAverages.length - 1];
      const mostExpensive = regionAverages[0];
      const savings = ((mostExpensive.avg - cheapest.avg) / mostExpensive.avg) * 100;
      
      if (savings > 30) {
        allInsights.push({
          type: "affordability",
          icon: "💰",
          color: "#27ae60",
          text: `${cheapest.region} is ${Math.round(savings)}% cheaper than ${mostExpensive.region} for 3-bed houses`,
          detail: `Save $${Math.round(mostExpensive.avg - cheapest.avg)}/week`,
          insight: `The gap between Melbourne's most and least expensive regions is significant. Choosing ${cheapest.region} over ${mostExpensive.region} saves $${Math.round(mostExpensive.avg - cheapest.avg)}/week — that's $${Math.round((mostExpensive.avg - cheapest.avg) * 52).toLocaleString()}/year, enough to make a real difference to your budget.`
        });
      }
    }

    // 5. variance
    const bedTypeVariances = BED_TYPES.map(({ key, label }) => {
      const values = rentals
        .filter(r => r[key] != null && r[key] !== 0)
        .map(r => r[key]);
      
      if (values.length < 2) return null;
      
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      return {
        key,
        label,
        min,
        max,
        range: max - min
      };
    }).filter(Boolean);

    if (bedTypeVariances.length > 0) {
      const widestRange = bedTypeVariances.reduce((a, b) => a.range > b.range ? a : b);
      
      allInsights.push({
        type: "variance",
        icon: "📊",
        color: "#e67e22",
        text: `${widestRange.label} shows the widest price range across Melbourne`,
        detail: `From $${widestRange.min} to $${widestRange.max}`,
        insight: `Across ${widestRange.label.toLowerCase()} listings, prices span a $${widestRange.range}/week range. Prices at the top end are ${Math.round((widestRange.range / widestRange.min) * 100)}% higher than the cheapest listings — showing significant variation in quality and location, meaning smart shopping could save you thousands.`      });
    }

    // 6. price jump
    const bedTypeAvgs = BED_TYPES
      .map(({ key, label }) => ({
        key,
        label,
        avg: bedTypeAverages[key]
      }))
      .filter(b => b.avg > 0);

    let biggestJump = null;
    for (let i = 1; i < bedTypeAvgs.length; i++) {
      const jumpPercent = ((bedTypeAvgs[i].avg - bedTypeAvgs[i-1].avg) / bedTypeAvgs[i-1].avg) * 100;
      if (!biggestJump || jumpPercent > biggestJump.percent) {
        biggestJump = {
          from: bedTypeAvgs[i-1],
          to: bedTypeAvgs[i],
          percent: jumpPercent
        };
      }
    }

    if (biggestJump && biggestJump.percent > 20) {
      allInsights.push({
        type: "price-jump",
        icon: "⬆️",
        color: "#3498db",
        text: `Upgrading from ${biggestJump.from.label.toLowerCase()} to ${biggestJump.to.label.toLowerCase()} costs ${Math.round(biggestJump.percent)}% more`,
        detail: `$${Math.round(biggestJump.from.avg)} → $${Math.round(biggestJump.to.avg)}`,
        insight: `The biggest price leap in Melbourne's rental market is between ${biggestJump.from.label.toLowerCase()} and ${biggestJump.to.label.toLowerCase()} properties. That upgrade costs an extra $${Math.round(biggestJump.to.avg - biggestJump.from.avg)}/week — a ${Math.round(biggestJump.percent)}% jump. Over a year, that's $${Math.round((biggestJump.to.avg - biggestJump.from.avg) * 52).toLocaleString()}. Worth considering if the extra space truly justifies that cost.`
      });
    }

    const priorityOrder = ["variance", "price-jump", "affordability", "region-premium", "above-average", "below-average"];
    allInsights.sort((a, b) => priorityOrder.indexOf(a.type) - priorityOrder.indexOf(b.type));
    
    return allInsights;
  }, [rentals]);

  if (insights.length === 0) return null;

  const handleCardClick = (index) => {
    setClickedInsights(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ ...styles.subheading, fontSize: isMobile ? 18 : 22 }}>💡 Smart Insights</h2>
      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(380px, 1fr))", 
        gap: 16 
      }}>
        {insights.map((insight, index) => (
          <div
            key={index}
            onClick={() => handleCardClick(index)}
            style={{
              ...styles.card,
              borderLeft: `4px solid ${insight.color}`,
              padding: isMobile ? "16px" : "24px",
              background: "white",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "pointer",
              minHeight: isMobile ? "140px" : "160px",
              display: "flex",
              alignItems: "flex-start",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              position: "relative",
              overflow: "hidden",
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
            }}
            onMouseEnter={(e) => {
              if (!isMobile) {
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
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: isMobile ? 10 : 12, width: "100%" }}>
              <span style={{ fontSize: isMobile ? 22 : 28, flexShrink: 0, marginTop: 2 }}>{insight.icon}</span>
              <div style={{ flex: 1, minHeight: isMobile ? "110px" : "130px" }}>
                {!clickedInsights[index] ? (
                  <>
                    <p style={{ 
                      margin: "0 0 8px", 
                      fontSize: isMobile ? 14 : 15, 
                      fontWeight: 500, 
                      lineHeight: 1.5, 
                      color: "#2c3e50" 
                    }}>
                      {insight.text}
                    </p>
                    <p style={{ 
                      margin: 0, 
                      fontSize: isMobile ? 12 : 13, 
                      color: "#7f8c8d", 
                      fontStyle: "italic" 
                    }}>
                      {insight.detail}
                    </p>
                    <div style={{ 
                      marginTop: 10, 
                      display: "inline-block", 
                      padding: isMobile ? "3px 8px" : "4px 10px", 
                      borderRadius: 4,
                      fontSize: isMobile ? 10 : 11, 
                      fontWeight: 600, 
                      textTransform: "uppercase", 
                      letterSpacing: 0.5,
                      background: `${insight.color}15`, 
                      color: insight.color,
                    }}>
                      {insight.type.replace("-", " ")}
                    </div>
                  </>
                ) : (
                  <p style={{ 
                    margin: 0, 
                    fontSize: isMobile ? 13 : 14, 
                    lineHeight: 1.6, 
                    color: "#2c3e50",
                    fontStyle: "italic",
                  }}>
                    {insight.insight}
                  </p>
                )}
              </div>
            </div>
            <div style={{
              position: "absolute",
              bottom: isMobile ? 8 : 12,
              right: isMobile ? 8 : 12,
              fontSize: isMobile ? 10 : 11,
              color: "#7f8c8d",
              fontStyle: "italic",
            }}>
              Click to {clickedInsights[index] ? 'close' : 'learn more'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}