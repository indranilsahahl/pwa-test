import { useEffect, useState } from "react";
import { claimDevice } from "./api";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState({ lat: null, long: null });
  const [distance, setDistance] = useState(null);
  const [message, setMessage] = useState("");

  // Load user from sessionStorage
  useEffect(() => {
    const empId = sessionStorage.getItem("empl_id");
    const stat = sessionStorage.getItem("Stat");
    const br_lat = sessionStorage.getItem("br_lat");
    const br_long = sessionStorage.getItem("br_long");
    const token = sessionStorage.getItem("token"); // might be null
    const claim_stat = sessionStorage.getItem("Claim_stat");
    const e_name = sessionStorage.getItem("Emp_name");
    const home_branch = sessionStorage.getItem("home_branch");

    if (empId && stat === "OK") {
      setUser({
        empId,
        e_name,
        home_branch,
        br_lat: parseFloat(br_lat),
        br_long: parseFloat(br_long),
        token,
        claim_stat,
      });
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
            accuracy: pos.coords.accuracy,
          });
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Calculate distance when user & location available
  useEffect(() => {
    if (!user || !location.lat || !location.long) return;

    const R = 6371000; // meters
    const toRad = (deg) => (deg * Math.PI) / 180;

    const φ1 = toRad(location.lat);
    const φ2 = toRad(user.br_lat);
    const Δφ = toRad(user.br_lat - location.lat);
    const Δλ = toRad(user.br_long - location.long);

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    setDistance(Math.round(R * c));
  }, [user, location]);

  async function handleClaim() {
    if (!user) return;

    try {
      const result = await claimDevice(user.empId);
      if (result.Stat === "OK") {
        localStorage.setItem("token", result.token); // ✅ only store on success
        setUser((prev) => ({ ...prev, token: result.token, claim_stat: "Y" }));
        setMessage("Device claimed successfully!");
      } else {
        setMessage("Device claim failed. Try again.");
      }
    } catch (err) {
      console.error("Claim error:", err);
      setMessage("Error claiming device.");
    }
  }

  if (!user) return <p className="p-4">Loading user data...</p>;

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Show current location */}
      {location.lat && location.long ? (
        <p>
          Current Location: <br /> Lat: {location.lat.toFixed(6)} <br />
          Long: {location.long.toFixed(6)} <br />
          Accuracy: &plusmn; {location?.accuracy || "Loading..."} meters
        </p>
      ) : (
        <p>Fetching location...</p>
      )}

      {/* User data table */}
      <div>
        <table>
          <thead>
            <tr>
              <th>Emp ID</th>
              <td>{user.empId}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{user.e_name}</td>
            </tr>
            <tr>
              <th>Home Branch</th>
              <td>{user.home_branch}</td>
            </tr>
            <tr>
              <th>Device Token</th>
              <td>{user.token || "Not Claimed"}</td>
            </tr>
            <tr>
              <th>Branch Latitude</th>
              <td>{user.br_lat}</td>
            </tr>
            <tr>
              <th>Branch Longitude</th>
              <td>{user.br_long}</td>
            </tr>
            <tr
              className={
                distance !== null
                  ? distance < 100
                    ? "green-100"
                    : "red-100"
                  : ""
              }
            >
              <th>Distance (m)</th>
              <td>{distance !== null ? `${distance} m` : "N/A"}</td>
            </tr>
            <tr>
              <th>Claim Stat</th>
              <td>{user.claim_stat}</td>
            </tr>
          </thead>
        </table>
      </div>

      {/* Claim Section */}
      <div className="mt-4">
        {user.claim_stat === "N" ? (
          <button onClick={handleClaim}>Claim This Device</button>
        ) : (
          <p>User Already Registered</p>
        )}
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}
