import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./custom.css";

// Haversine distance in meters
function haversineMeters(lat1, lon1, lat2, lon2) {
  function toRad(d) { return (d * Math.PI) / 180; }
  const R = 6371000; // meters
  const φ1 = toRad(Number(lat1));
  const φ2 = toRad(Number(lat2));
  const Δφ = toRad(Number(lat2) - Number(lat1));
  const Δλ = toRad(Number(lon2) - Number(lon1));
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [geo, setGeo] = useState({ lat: null, long: null, accuracy: null, error: null });
  const [distance, setDistance] = useState(null);

  // Read session values captured on successful login
  const sessionData = useMemo(() => {
    const keys = [
      "Stat",
      "token",
      "Claim_stat",
      "Emp_name",
      "empl_id",
      "home_branch",
      "br_lat",
      "br_long"
    ];
    const labels = {
      Stat: "Status",
      token: "Auth Token",
      Claim_stat: "Claim Status",
      Emp_name: "Employee Name",
      empl_id: "Employee ID",
      home_branch: "Home Branch",
      br_lat: "Branch Latitude",
      br_long: "Branch Longitude",
    };
    const rows = [];
    keys.forEach((k) => {
      const v = sessionStorage.getItem(k);
      if (v !== null && v !== undefined) {
        rows.push([labels[k] || k, v]);
      }
    });
    return rows;
  }, []);

  // Geolocation for current location + compute distance from branch lat/long
  useEffect(() => {
    let cancelled = false;
    if (!("geolocation" in navigator)) {
      setGeo((g) => ({ ...g, error: "Geolocation not supported" }));
      return;
    }
    const opts = { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 };
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        const { latitude, longitude, accuracy } = pos.coords;
        const brLat = Number(sessionStorage.getItem("br_lat"));
        const brLong = Number(sessionStorage.getItem("br_long"));
        const d = (Number.isFinite(brLat) && Number.isFinite(brLong))
          ? haversineMeters(latitude, longitude, brLat, brLong)
          : null;
        setGeo({ lat: latitude, long: longitude, accuracy: accuracy ?? null, error: null });
        setDistance(d);
      },
      (err) => {
        if (cancelled) return;
        setGeo((g) => ({ ...g, error: err.message || "Unable to fetch location" }));
      },
      opts
    );
    return () => { cancelled = true; };
  }, []);

  const onLogout = () => {
    try {
      sessionStorage.clear();
    } catch {}
    navigate("/");
  };

  return (
    <div className="gb-grid">
      <section className="gb-card">
        <h1 className="gb-title">Dashboard</h1>
        <button className="gb-btn danger" onClick={onLogout}>Logout</button>
      </section>
      <section className="gb-card">
          <h2>Login Session Data</h2>
          {sessionData.length === 0 ? (
            <div className="gb-footer">No session data found. Please login again.</div>
          ) : (
            <table className="gb-table">
              <tbody>
                {sessionData.map(([label, value]) => (
                  <tr key={label}>
                    <th>{label}</th>
                    <td><span className="gb-kv">{String(value)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="gb-footer">These values are read live from <span className="gb-badge">sessionStorage</span>.</div>
        </section>

        <section className="gb-card">
          <h2>Location & Branch Distance</h2>
          <table className="gb-table">
            <tbody>
              <tr>
                <th>Current Latitude</th>
                <td><span className="gb-kv">{geo.lat != null ? geo.lat.toFixed(6) : "—"}</span></td>
              </tr>
              <tr>
                <th>Current Longitude</th>
                <td><span className="gb-kv">{geo.long != null ? geo.long.toFixed(6) : "—"}</span></td>
              </tr>
              <tr>
                <th>Accuracy (m)</th>
                <td><span className="gb-kv">{geo.accuracy != null ? Math.round(geo.accuracy) : "—"}</span></td>
              </tr>
              <tr>
                <th>Branch Latitude</th>
                <td><span className="gb-kv">{sessionStorage.getItem("br_lat") ?? "—"}</span></td>
              </tr>
              <tr>
                <th>Branch Longitude</th>
                <td><span className="gb-kv">{sessionStorage.getItem("br_long") ?? "—"}</span></td>
              </tr>
              <tr>
                <th>Distance to Branch (m)</th>
                <td><span className="gb-kv">{distance != null ? distance : "—"}</span></td>
              </tr>
              {geo.error && (
                <tr>
                  <th>Location Error</th>
                  <td><span className="gb-kv">{geo.error}</span></td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="gb-footer">Distance uses the Haversine formula.</div>
        </section>
     </div>
  );
}
