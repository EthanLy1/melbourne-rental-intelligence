import { useState, useEffect } from "react";
import axios from "axios";
import { BED_TYPES } from "../config/constants";
import { parseValue } from "../utils/helpers";

const API_URL = import.meta.env.VITE_API_URL;

export function useRentalData() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const response = await axios.get(`${API_URL}/rentals`);
        const cleanedData = response.data
          .filter((rental) => rental.Suburb && rental.Suburb.trim().toLowerCase() !== "total") //trim suburb = total from data cleaning
          .map((rental) => {
            const parsed = { ...rental };
            BED_TYPES.forEach(({ key, column }) => {
              parsed[key] = parseValue(rental[column]);
            });
            return parsed;
          });
        setRentals(cleanedData);
      } catch (err) {
        console.error("Error fetching rentals:", err);
        setError("Failed to load rental data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRentals();
  }, []);

  return { rentals, loading, error };
}