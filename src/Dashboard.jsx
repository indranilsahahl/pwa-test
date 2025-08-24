import { useEffect, useState } from "react";
import { fetchUserById } from "./api.js";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState({ lat: null, long: null });
  const [distance, setDistance] = useState(null);

  // Fetch user data from empId in localStorage
  useEffect(() => {
    const empId = localStorage.getItem("empId");
    if (empId) {
      fetchUserById(empId).then(setUser).catch(console.error);
    }
  }, []);

  // Get user geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            long: pos.coords.longitude,
          });
        },
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Calculate distance when user data and location are available
  useEffect(() => {
    if (!user || !location.lat || !location.long) return;

    const R = 6371000; // meters
    const toRad = (deg) => (deg * Math.PI) / 180;

    const φ1 = toRad(location.lat);
    const φ2 = toRad(user.loc_lat);
    const Δφ = toRad(user.loc_lat - location.lat);
    const Δλ = toRad(user.loc_long - location.long);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    setDistance(Math.round(R * c));
  }, [user, location]);

  if (!user) return <p className="p-4">Loading user data...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* Show current location */}
      {location.lat && location.long ? (
        <p className="mb-2">
          Current Location: {location.lat.toFixed(6)}, {location.long.toFixed(6)}
        </p>
      ) : (
        <p className="mb-2 text-gray-500">Fetching location...</p>
      )}

      {/* User data table */}
      <div className="overflow-x-auto">
        <table className="border-collapse border border-gray-400 w-full text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 px-2 py-1">Emp ID</th>
              <th className="border border-gray-400 px-2 py-1">Name</th>
              <th className="border border-gray-400 px-2 py-1">Branch</th>
              <th className="border border-gray-400 px-2 py-1">Device ID</th>
              <th className="border border-gray-400 px-2 py-1">DB Latitude</th>
              <th className="border border-gray-400 px-2 py-1">DB Longitude</th>
              <th className="border border-gray-400 px-2 py-1">Distance (m)</th>
            </tr>
          </thead>
          <tbody>
            <tr
              className={
                distance !== null
                  ? distance < 100
                    ? "bg-green-100"
                    : "bg-red-100"
                  : ""
              }
            >
              <td className="border border-gray-400 px-2 py-1">{user.emp_id}</td>
              <td className="border border-gray-400 px-2 py-1">{user.emp_name}</td>
              <td className="border border-gray-400 px-2 py-1">{user.branch_name}</td>
              <td className="border border-gray-400 px-2 py-1">{user.device_id}</td>
              <td className="border border-gray-400 px-2 py-1">{user.loc_lat}</td>
              <td className="border border-gray-400 px-2 py-1">{user.loc_long}</td>
              <td className="border border-gray-400 px-2 py-1">
                {distance !== null ? `${distance} m` : "N/A"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
