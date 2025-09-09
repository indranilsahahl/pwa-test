//✅ Daashboard.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { claimDevice, attendanceCheck, attendanceLogin, attendanceLogout } from "./api.js";
import AttendanceEntry from "./AttendanceEntry";
import AttendanceLog from "./AttendanceLog";
import "./custom.css";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);


export default function Dashboard() {
  const navigate = useNavigate();

  // --- local state ---
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState("");
  const [geo, setGeo] = useState({ lat: null, long: null, accuracy: null, error: null });
  const [distance, setDistance] = useState(null);
  // Create a ref to track the latest distance value
  const distanceRef = useRef(null);
  const timeRef =useRef(null);
  
  // Update both state and ref when distance changes
  const updateDistance = (d) => {
    setDistance(d);
    distanceRef.current = d;
    timeRef.current = new Date(); 
  }; 
	
  // bump this to force re-read of sessionStorage-backed memo
  const [storageTick, setStorageTick] = useState(0);

  // --- session data snapshot ---
  const sessionData = useMemo(() => {
    const keys = ["Stat", "token", "Claim_Stat", "Emp_name", "empl_id", "home_branch", "br_lat", "br_long"];
    const labels = {
      Stat: "Status",
      token: "Auth Token",
      Claim_Stat: "Claim Status",
      Emp_name: "Employee Name",
      empl_id: "Employee ID",
      home_branch: "Home Branch",
      br_lat: "Branch Latitude",
      br_long: "Branch Longitude",
    };
    return keys.reduce((arr, key) => {
      const val = sessionStorage.getItem(key);
      if (val != null) arr.push([labels[key] || key, val]);
      return arr;
    }, []);
  }, [storageTick]);

  // optional: react to cross-tab storage changes
  useEffect(() => {
    const onStorage = (e) => {
      if (["Claim_Stat", "token", "br_lat", "br_long"].includes(e.key)) {
        setStorageTick((t) => t + 1);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  // --- Handle Android / browser back button ---
  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      sessionStorage.clear();
      navigate("/", { replace: true });
    };

    window.addEventListener("popstate", handleBackButton);
    return () => window.removeEventListener("popstate", handleBackButton);
  }, [navigate]);
  	
  // --- geolocation watch with cleanup ---
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGeo((g) => ({ ...g, error: "Geolocation not supported" }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const brLat = Number(sessionStorage.getItem("br_lat"));
        const brLong = Number(sessionStorage.getItem("br_long"));
        const d =
          isFinite(brLat) && isFinite(brLong)
            ? haversineMeters(latitude, longitude, brLat, brLong)
            : null;

        setGeo({ lat: latitude, long: longitude, accuracy, error: null });
        updateDistance(d);
      },
      (err) => setGeo((g) => ({ ...g, error: err.message || "Unable to fetch location" })),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // --- derived values ---
  const onLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const claimStatusFromSession = sessionData.find(([lbl]) => lbl === "Claim Status")?.[1];
  const empId = sessionData.find(([lbl]) => lbl === "Employee ID")?.[1];

  const validForAttendance = localStorage.getItem("token") === sessionStorage.getItem("token") ? 1 : 0;

  const now = new Date();
  const today = now.toLocaleDateString("en-CA"); // ISO style but local tz
  const todayDisplay = now.toLocaleDateString("en-GB");

  const [attendanceStat, setAttendanceStatus] = useState("");

  // --- API helper ---
  const callApi = async (fn, ...args) => {
  setClaiming(true);
  try {
    const res = await fn(...args);
    setAttendanceStatus(res?.now_stat ?? "");
    } catch (err) {
    		setAttendanceStatus("Error: " + err.message);
        } finally {
    	setClaiming(false);
  	}
  };
  // --- fetch current attendance state ---
   const getAttendanceStat = async () => {
  	try {
    		const res = await attendanceCheck(empId, today);
    		setAttendanceStatus(res?.now_stat ?? "");
  	} catch (err) {
    		setAttendanceStatus("Error: " + err.message);
  	}
   };
  const handleAttendanceLogin = async () => {
  	const currentTime = new Date();
  	// Check if we have any distance data at all
  	if (distanceRef.current === null) {
    		alert('No GPS');
        	return {"success": false, "error": 'No GPS'};
        }
  
  	// Check if we have a timestamp (should exist if distance exists)
 	 if (!timeRef.current) {
 	   alert("Distance Can not be neasured. Please enable GPS and refresh");
    
    return {"success": false, "error": 'No GPS'};
  }
  
  	// Calculate age in seconds for better error message
  	const ageInSeconds = Math.floor((currentTime - timeRef.current) / 1000);
  	const ageInMinutes = Math.floor(ageInSeconds / 60);
  
	if (ageInSeconds > 300) { // 300 seconds = 5 minutes
		alert(`Last distance calculation was ${ageInMinutes} minute(s) ago (${ageInSeconds} seconds). Please wait for fresh GPS update.`);
		   return {"success": false, "error": 'No GPS'};
	}  	
  	/* After all checks for null */
  	await callApi(attendanceLogin, empId, today, distanceRef.current);
  	await getAttendanceStat();
  	setLogTick((t) => t + 1); // trigger AttendanceLog to reload
  	return {"success": true, "error": 'None'};
  };
  const handleAttendanceLogout = async () => {
  	const currentTime = new Date();
  
  	// Check if we have any distance data at all
  	if (distanceRef.current === null) {
    		alert("No distance measurement available. Please wait for GPS signal.");
    		return {"success": false, "error": 'No Distance Can be Calculated, GPS Problem' };
  	}
  
  	// Check if we have a timestamp (should exist if distance exists)
  	if (!timeRef.current) {
    		alert("Distance data is incomplete. Please wait for GPS update.");
    		return {"success": false, "error": 'No GPS timeRef'};
  	}
  
  	// Calculate age in seconds for better error message
  	const ageInSeconds = Math.floor((currentTime - timeRef.current) / 1000);
  	const ageInMinutes = Math.floor(ageInSeconds / 60);
  
	if (ageInSeconds > 300) { // 300 seconds = 5 minutes
		alert(`Last distance calculation was ${ageInMinutes} minute(s) ago (${ageInSeconds} seconds). Please wait for fresh GPS update.`);
		return {"success": false, "error": 'No GPS For Last 5 min'};
	}
  	/* After All null checkings */
  	await callApi(attendanceLogout, empId, today, distanceRef.current);
  	await getAttendanceStat();
  	setLogTick((t) => t + 1); // trigger AttendanceLog to reload
  	return {"success": true, "error": 'None'};
  };
  const [logTick, setLogTick] = useState(0);
	
  useEffect(() => {
    if (validForAttendance === 1 && empId) {
      getAttendanceStat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validForAttendance, empId, today]); // re-check if emp changes or new day

  // --- claim device ---
  const handleRegister = async () => {
    if (!empId) {
      setClaimResult("Employee ID not found.");
      return;
    }

    setClaiming(true);
    setClaimResult("");

    try {
      const pdata = await claimDevice(empId);
      console.log("claimDevice response:", pdata);

      if (pdata?.success) {
        setClaimResult("Device registered successfully!");
        sessionStorage.setItem("Claim_Stat", "Y");
        localStorage.setItem("token", sessionStorage.getItem("token") || "");
        setStorageTick((t) => t + 1); // refresh sessionData-based memo
      } else {
        setClaimResult(pdata?.message || "Registration failed.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setClaimResult("Error: " + err.message);
    } finally {
      setClaiming(false);
    }
  };
  

  // --- claim status section ---
  const renderClaimStatus = () => {
    if (claimStatusFromSession === "N") {
      return (
        <section className="gb-card">
          <h2>Device Claim Status</h2>
          <button className="gb-btn" disabled={claiming} onClick={handleRegister}>
            {claiming ? "Registering…" : "Register This Device"}
          </button>
          {claimResult && <div className="gb-footer">{claimResult}</div>}
        </section>
      );
    }
    if (claimStatusFromSession === "Y") {
      return (
        <section className="gb-card">
          <h2>Device Claim Status</h2>
          <div className="gb-footer">User is already registered in some device</div>
        </section>
      );
    }
    return null; // unknown/not loaded
  };

  // --- render ---
  return (
    <div className="absolute top-0 left-0 w-full p-4 rounded-xl flex flex-col gap-2 bg-[linear-gradient(to_top,rgba(69,192,174,1),rgba(69,192,174,0.2))]">
      <section className="gb-card">
        <table className="logo_txt">
          <tbody>
            <tr>
              <td>
                <img
                  id="u_logo"
                  src="https://eyespace.co.in/gberp/images/sysimages/eyespace_logo_36x32.png"
                  alt="Logo"
                />
              </td>
              <td>
                <h1 className="gb-title gb_crimson">Dashboard</h1>
                <button className="gb-btn danger" onClick={onLogout}>
                  Sign Out
                </button>
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
                  <td>
                    <span className="gb-kv">{value}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="gb-footer">
          These values are from last <span className="gb-badge">Login</span>.
        </div>
      </section>

      <section className="gb-card">
        <h2>Location & Branch Distance</h2>
        <table className="gb-table">
          <tbody>
            <tr>
              <th>Current Lat</th>
              <td>{geo.lat != null ? geo.lat.toFixed(6) : "—"}</td>
            </tr>
            <tr>
              <th>Current Lon</th>
              <td>{geo.long != null ? geo.long.toFixed(6) : "—"}</td>
            </tr>
            <tr>
              <th>Accuracy (m)</th>
              <td>{geo.accuracy != null ? Math.round(geo.accuracy) : "—"}</td>
            </tr>
            <tr>
              <th>Branch Lat</th>
              <td>{sessionStorage.getItem("br_lat") ?? "—"}</td>
            </tr>
            <tr>
              <th>Branch Lon</th>
              <td>{sessionStorage.getItem("br_long") ?? "—"}</td>
            </tr>
            <tr>
              <th>Distance to Branch (m)</th>
              <td>{distance ?? "—"}</td>
            </tr>
            {geo.error && (
              <tr>
                <th>Location Error</th>
                <td>{geo.error}</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="gb-footer">Distance uses the Haversine formula.</div>
      </section>

      {renderClaimStatus()}

     <AttendanceEntry
	  validForAttendance={validForAttendance}
	  todayDisplay={todayDisplay}
	  attendanceStat={attendanceStat}
	  claiming={claiming}
	  handleAttendanceLogin={handleAttendanceLogin}
	  handleAttendanceLogout={handleAttendanceLogout}
      />

    {/* Attendance Log Section */}
      <AttendanceLog empId={empId} reloadTrigger={logTick} />

    </div>
  );
}

// Haversine function
function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const φ1 = toRad(lat1),
    φ2 = toRad(lat2),
    Δφ = toRad(lat2 - lat1),
    Δλ = toRad(lon2 - lon1);
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
