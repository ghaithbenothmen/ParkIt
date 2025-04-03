import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios"; // Import axios for API calls
import React from "react";
import {Parking} from "../parking.model";



const Parking2 = () => {
  const { id } = useParams(); // Get the parking ID from URL
  const [parking, setParking] = useState<Parking | null>(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Replace with your actual API endpoint
    axios
      .get(`http://localhost:4000/api/parking/${id}`)
      .then((response) => {
        setParking(response.data); // Store API response
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching parking details:", error);
 
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Parking Details</h2>
      <p><strong>Name:</strong> {parking?.nom}</p>
    
    </div>
  );
};

export default Parking2;
