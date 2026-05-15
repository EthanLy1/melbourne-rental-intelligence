import { styles } from "../styles";
import { formatPrice } from "../utils/helpers";

export default function InsightCard({ title, suburb, value }) {
  return (
    <div style={styles.card}>
      <h3>{title}</h3>
      <p>{suburb || "N/A"}</p>
      <strong>{formatPrice(value)}</strong>
    </div>
  );
}