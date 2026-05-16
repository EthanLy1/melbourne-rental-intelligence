import { useMemo } from "react";
import { BED_TYPES } from "../config/constants";
import { parseValue } from "../utils/helpers";
import { styles } from "../styles";

export default function DataInsights({ rentals }) {
  const insights = useMemo(() => {
    const allInsights = [];

    // Calculate region aggregates
    const regionAgg = {};
    rentals.forEach((rental) => {
      if (!rental.Region) return;
      if (!regionAgg[rental.Region]) {
        regionAgg[rental.Region] = { count: 0, beds: {} };
        BED_TYPES.forEach(({ key }) => {
          regionAgg[rental.Region].beds[key] = { total: 0, count: 0 };
        });
      }
      regionAgg[rental.Region].count++;
      BED_TYPES.forEach(({ key }) => {
        const val = parseValue(rental[key]);
        if (val != null && val !== 0) {
          regionAgg[rental.Region].beds[key].total += val;
          regionAgg[rental.Region].beds[key].count++;
        }
      });
    });

    // Calculate overall averages
    const overallAvgs = {};
    BED_TYPES.forEach(({ key }) => {
      let total = 0, count = 0;
      Object.values(regionAgg).forEach(region => {
        total += region.beds[key].total;
        count += region.beds[key].count;
      });
      overallAvgs[key] = count > 0 ? total / count : 0;
    });

    // 1. Find suburbs significantly above/below average
    BED_TYPES.forEach(({ key, label }) => {
      const avg = overallAvgs[key];
      if (avg === 0) return;
      
      const suburbs = rentals
        .filter(r => r[key] != null && r[key] !== 0)
        .map(r => ({ suburb: r.Suburb, region: r.Region, value: r[key], diff: ((r[key] - avg) / avg) * 100 }))
        .sort((a, b) => b.diff - a.diff);

      if (suburbs.length > 0) {
        const topAbove = suburbs[0];
        if (topAbove.diff > 20) {
          allInsights.push({
            type: "above-average",
            icon: "📈",
            color: "#c0392b",
            text: `${topAbove.suburb} ${label.toLowerCase()} rents are ${Math.round(topAbove.diff)}% above the state average`,
            detail: `$${topAbove.value} vs $${Math.round(avg)} average`,
          });
        }

        const topBelow = suburbs[suburbs.length - 1];
        if (topBelow.diff < -30) {
          allInsights.push({
            type: "below-average",
            icon: "📉",
            color: "#27ae60",
            text: `${topBelow.suburb} ${label.toLowerCase()} rents are ${Math.round(Math.abs(topBelow.diff))}% below the state average`,
            detail: `$${topBelow.value} vs $${Math.round(avg)} average`,
          });
        }
      }
    });

    // 2. Region dominance insights
    const regionAverages = Object.entries(regionAgg).map(([region, data]) => {
      const avgs = {};
      BED_TYPES.forEach(({ key }) => {
        avgs[key] = data.beds[key].count > 0 ? data.beds[key].total / data.beds[key].count : 0;
      });
      return { region, count: data.count, ...avgs };
    });

    const sortedByExpensive = [...regionAverages].sort((a, b) => b.threeBedHouse - a.threeBedHouse);
    if (sortedByExpensive.length >= 2) {
      const mostExp = sortedByExpensive[0];
      const secondExp = sortedByExpensive[1];
      const premium = ((mostExp.threeBedHouse - secondExp.threeBedHouse) / secondExp.threeBedHouse) * 100;
      
      if (premium > 15) {
        allInsights.push({
          type: "region-premium",
          icon: "💎",
          color: "#8e44ad",
          text: `${mostExp.region} commands a ${Math.round(premium)}% premium over ${secondExp.region} for 3-bed houses`,
          detail: `$${Math.round(mostExp.threeBedHouse)} vs $${Math.round(secondExp.threeBedHouse)}`,
        });
      }
    }

    const sortedByAffordable = [...regionAverages].filter(r => r.threeBedHouse > 0).sort((a, b) => a.threeBedHouse - b.threeBedHouse);
    if (sortedByAffordable.length >= 2 && sortedByExpensive.length >= 2) {
      const cheapest = sortedByAffordable[0];
      const mostExp = sortedByExpensive[0];
      const savings = ((mostExp.threeBedHouse - cheapest.threeBedHouse) / mostExp.threeBedHouse) * 100;
      
      if (savings > 40) {
        allInsights.push({
          type: "affordability",
          icon: "💰",
          color: "#27ae60",
          text: `${cheapest.region} is ${Math.round(savings)}% cheaper than ${mostExp.region} for 3-bed houses`,
          detail: `Save $${Math.round(mostExp.threeBedHouse - cheapest.threeBedHouse)}/week`,
        });
      }
    }

    // 3. Property type variance
    const variances = BED_TYPES.map(({ key, label }) => {
      const values = rentals
        .filter(r => r[key] != null && r[key] !== 0)
        .map(r => r[key]);
      if (values.length < 2) return { key, label, variance: 0, min: 0, max: 0 };
      const min = Math.min(...values);
      const max = Math.max(...values);
      return { key, label, variance: max - min, min, max };
    });

    const highestVariance = variances.reduce((a, b) => a.variance > b.variance ? a : b);
    if (highestVariance.variance > 0) {
      allInsights.push({
        type: "variance",
        icon: "📊",
        color: "#e67e22",
        text: `${highestVariance.label} shows the widest price range across Victoria`,
        detail: `From $${highestVariance.min} to $${highestVariance.max}`,
      });
    }

    // 4. Concentration insights
    const totalSuburbs = rentals.length;
    Object.entries(regionAgg)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 1)
      .forEach(([region, data]) => {
        const percentage = (data.count / totalSuburbs) * 100;
        if (percentage > 15) {
          allInsights.push({
            type: "concentration",
            icon: "🏘️",
            color: "#3498db",
            text: `${region} accounts for ${Math.round(percentage)}% of all suburbs tracked`,
            detail: `${data.count} out of ${totalSuburbs} suburbs`,
          });
        }
      });

    // 5. Price jump insights
    const avgByBed = BED_TYPES.map(({ key, label }) => ({
      key, label, avg: overallAvgs[key],
    })).filter(b => b.avg > 0);

    for (let i = 1; i < avgByBed.length; i++) {
      const jump = ((avgByBed[i].avg - avgByBed[i-1].avg) / avgByBed[i-1].avg) * 100;
      if (jump > 30) {
        allInsights.push({
          type: "price-jump",
          icon: "⬆️",
          color: "#e74c3c",
          text: `Upgrading from ${avgByBed[i-1].label.toLowerCase()} to ${avgByBed[i].label.toLowerCase()} costs ${Math.round(jump)}% more`,
          detail: `$${Math.round(avgByBed[i-1].avg)} → $${Math.round(avgByBed[i].avg)}`,
        });
      }
    }

    // 6. Regional value insights
    regionAverages.forEach(region => {
      if (region.oneBedFlat > 0 && region.fourBedHouse > 0) {
        const ratio = region.fourBedHouse / region.oneBedFlat;
        if (ratio < 1.5) {
          allInsights.push({
            type: "value",
            icon: "💡",
            color: "#2ecc71",
            text: `${region.region}: 4-bed houses are only ${Math.round(ratio * 100 - 100)}% more than 1-bed flats`,
            detail: `Great value for families in ${region.region}`,
          });
        }
      }
    });

    const priorityOrder = ["above-average", "region-premium", "affordability", "variance", "price-jump", "below-average", "concentration", "value"];
    allInsights.sort((a, b) => priorityOrder.indexOf(a.type) - priorityOrder.indexOf(b.type));
    
    return allInsights.slice(0, 8);
  }, [rentals]);

  if (insights.length === 0) return null;

  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={styles.subheading}>💡 Smart Insights</h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 16 }}>
        {insights.map((insight, index) => (
          <div
            key={index}
            style={{
              ...styles.card,
              borderLeft: `4px solid ${insight.color}`,
              padding: "20px",
              background: "white",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ fontSize: 24 }}>{insight.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 500, lineHeight: 1.5, color: "#2c3e50" }}>
                  {insight.text}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "#7f8c8d", fontStyle: "italic" }}>
                  {insight.detail}
                </p>
                <div style={{ 
                  marginTop: 10, display: "inline-block", padding: "2px 8px", borderRadius: 4,
                  fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5,
                  background: `${insight.color}15`, color: insight.color,
                }}>
                  {insight.type.replace("-", " ")}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}