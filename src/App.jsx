import { useState } from "react";

export default function App() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setError(null);
      },
      (err) => {
        setError(`Error: ${err.message}`);
        setLocation(null);
      }
    );
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>📍 My Location PWA</h1>
      <button
        onClick={getLocation}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      >
        Get My Location
      </button>

      {location && (
        <p>
          Latitude: {location.lat} <br />
          Longitude: {location.lon}
        </p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
