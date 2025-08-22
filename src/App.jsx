import { useState, useEffect } from "react";
import { fetchUserById } from "./api";

function haversineDistance(lat1, lon1, lat2, lon2) {
  function toRad(x) {
    return (x * Math.PI) / 180;
  }

  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function App() {
  const [empId, setEmpId] = useState("");
  const [userData, setUserData] = useState([]);
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // capture user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        (err) => {
          console.error(err);
          setError("Unable to fetch location");
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError("Geolocation not supported");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await fetchUserById(empId);
      setUserData(data);

      if (data.length > 0 && location.lat && location.lon) {
        const userLoc = data[0];
        if (userLoc.loc_lat && userLoc.loc_long) {
          const dist = haversineDistance(
            location.lat,
            location.lon,
            parseFloat(userLoc.loc_lat),
            parseFloat(userLoc.loc_long)
          );
          setDistance(dist);
        } else {
          setDistance(null);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  const getRowClass = (dist) => {
    if (dist === null) return "bg-white";
    if (dist <= 100) return "bg-green-100";
    if (dist <= 500) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Employee Attendance Lookup</h1>

      {/* Current location display */}
      <div className="mb-4">
        <p className="text-gray-700">
          <strong>Current Location:</strong>{" "}
          {location.lat && location.lon
            ? `${location.lat}, ${location.lon}`
            : "Fetching..."}
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mb-6 flex space-x-2">
        <input
          type="text"
          value={empId}
          onChange={(e) => setEmpId(e.target.value)}
          placeholder="Enter Employee ID"
          className="border p-2 flex-1 rounded-lg"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          {loading ? "Loading..." : "Fetch"}
        </button>
      </form>

      {/* Error */}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Results Table */}
      {userData.length > 0 && (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Emp ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Branch</th>
              <th className="border p-2">Device ID</th>
              <th className="border p-2">DB Latitude</th>
              <th className="border p-2">DB Longitude</th>
              <th className="border p-2">Distance (m)</th>
            </tr>
          </thead>
          <tbody>
            {userData.map((user, index) => (
              <tr key={index} className={`${getRowClass(distance)} border`}>
                <td className="p-2 border">{user.emp_id}</td>
                <td className="p-2 border">{user.emp_name}</td>
                <td className="p-2 border">{user.branch_name}</td>
                <td className="p-2 border">{user.device_id}</td>
                <td className="p-2 border">{user.loc_lat}</td>
                <td className="p-2 border">{user.loc_long}</td>
                <td className="p-2 border font-semibold">
                  {distance !== null ? `${distance} m` : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
