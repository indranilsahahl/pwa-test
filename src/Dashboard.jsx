import React, { useEffect, useMemo, useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { claimDevice } from "./api.js";
import "./custom.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState("");
  const [geo, setGeo] = useState({ lat: null, long: null, accuracy: null, error: null });
  const [distance, setDistance] = useState(null);

  const sessionData = useMemo(() => {
    const keys = ["Stat", "token", "Claim_stat", "Emp_name", "empl_id", "home_branch", "br_lat", "br_long"];
    const labels = { Stat: "Status", token: "Auth Token", Claim_stat: "Claim Status", Emp_name: "Employee Name", empl_id: "Employee ID", home_branch: "Home Branch", br_lat: "Branch Latitude", br_long: "Branch Longitude" };
    return keys.reduce((arr, key) => {
      const val = sessionStorage.getItem(key);
      if (val != null) arr.push([labels[key] || key, val]);
      return arr;
    }, []);
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGeo((g) => ({ ...g, error: "Geolocation not supported" }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const brLat = Number(sessionStorage.getItem("br_lat"));
        const brLong = Number(sessionStorage.getItem("br_long"));
        const d = (isFinite(brLat) && isFinite(brLong))
          ? haversineMeters(coords.latitude, coords.longitude, brLat, brLong)
          : null;
        setGeo({ lat: coords.latitude, long: coords.longitude, accuracy: coords.accuracy, error: null });
        setDistance(d);
      },
      (err) => setGeo((g) => ({ ...g, error: err.message || "Unable to fetch location" })),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  }, []);

  const onLogout = () => { sessionStorage.clear(); navigate("/"); };

  const claimStatus = sessionData.find(([lbl]) => lbl === "Claim Status")?.[1];
  const empId = sessionData.find(([lbl]) => lbl === "Employee ID")?.[1];
  const validForAttendance =
    localStorage.getItem("token") === sessionStorage.getItem("token") ? 1 : 0;
  const now = new Date();
	now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
	const today = now.toISOString().slice(0, 10);
 
  const getAttendanceStat = async () => {
     try {
      const res = await attendanceCheck(empId, today);
      console.log(res);
      console.log(typeof(res));
      console.log(res.keys);
      }
      catch (err) {
      	console.log("Error: " + err.message);
    } finally {
       console.log("done Calling");
    }
    return "done";
      	
  }; 
  	
  const handleRegister = async () => {
    if (!empId) { setClaimResult("Employee ID not found."); return; }
    setClaiming(true); setClaimResult("");
    try {
      const res = await claimDevice(empId);
      console.log(res);
      console.log(typeof(res));
      console.log(res.keys);
      let pdata;
      if (typeof res === "string") {
  	try {
    		pdata = JSON.parse(res);
  		} catch (err) {
    			console.error("Failed to parse JSON:", err, res);
    		// Optionally handle invalid JSON cases here
    			pdata = { success: false, message: "Failed to parse server response" };
  		}
	} else {
  		pdata = res;
	}
	
	console.log(pdata);               // Shows parsed object
	console.log(typeof pdata);        // Should now be "object"
	console.log(pdata.success, pdata.message);
	
      if (pdata.success) {
        setClaimResult("Device registered successfully!");
        sessionStorage.setItem("Claim_stat", "Y");
        localStorage.setItem("token", sessionStorage.getItem("token"));
      } else {
        setClaimResult(res?.message || "Registration failed.");
      }
    } catch (err) {
      setClaimResult("Error: " + err.message);
    } finally {
      setClaiming(false);
    }
    window.location.reload();
  };

  return (
    <div className="dashboard-container">
      <section className="gb-card">
        <table className="logo_txt">
          <tbody>
            <tr>
              <td><img id="u_logo" src="https://eyespace.co.in/gberp/images/sysimages/eyespace_logo_36x32.png" alt="Logo" /></td>
              <td>
                <h1 className="gb-title gb_crimson">Dashboard</h1>
                <button className="gb-btn danger" onClick={onLogout}>Logout</button>
              </td>
            </tr>
          </tbody>
        </table>
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
                  <td><span className="gb-kv">{value}</span></td>
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
            <tr><th>Current Lat</th><td>{geo.lat?.toFixed(6) || "—"}</td></tr>
            <tr><th>Current Lon</th><td>{geo.long?.toFixed(6) || "—"}</td></tr>
            <tr><th>Accuracy (m)</th><td>{geo.accuracy != null ? Math.round(geo.accuracy) : "—"}</td></tr>
            <tr><th>Branch Lat</th><td>{sessionStorage.getItem("br_lat") ?? "—"}</td></tr>
            <tr><th>Branch Lon</th><td>{sessionStorage.getItem("br_long") ?? "—"}</td></tr>
            <tr><th>Distance to Branch (m)</th><td>{distance ?? "—"}</td></tr>
            {geo.error && <tr><th>Location Error</th><td>{geo.error}</td></tr>}
          </tbody>
        </table>
        <div className="gb-footer">Distance uses the Haversine formula.</div>
      </section>

      <section className="gb-card">
        <h2>Device Claim Status</h2>
        {claimStatus === "N" ? (
          <>
            <button className="gb-btn" disabled={claiming} onClick={handleRegister}>
              {claiming ? "Registering…" : "Register This Device"}
            </button>
            {claimResult && <div className="gb-footer">{claimResult}</div>}
          </>
        ) : (
          <div className="gb-footer">User is already registered</div>
        )}
      </section>
      <section className="gb-card">
        <h2>Attendance Entry</h2>
        {validForAttendance === 1 ? (
          <>
		This device can be used. {today} {getAttendanceStat}
          </>
        ) : (
          <div className="gb-footer">Device Token Does not match. </div>
        )}
      </section>
    </div>
  );
}

// Haversine function (same as you provided)
function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000, toRad = (d) => (d * Math.PI) / 180;
  const φ1 = toRad(lat1), φ2 = toRad(lat2),
        Δφ = toRad(lat2 - lat1), Δλ = toRad(lon2 - lon1);
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
