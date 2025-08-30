//✅ App.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, BrowserRouter, Routes, Route } from "react-router-dom";
import { login } from "./api.js";
import Dashboard from "./Dashboard";
import AdminDashboard from "./AdminDashboard";
import { registerSW } from 'virtual:pwa-register';

function LoginPage() {
  const navigate = useNavigate();
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tokenStatus, setTokenStatus] = useState(localStorage.getItem("token") ?? "None");
  const [version, setVersion] = useState("");
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [location, setLocation] = useState(null);

  // --- Single useEffect for version, SW, storage, and geolocation ---
  useEffect(() => {
    // --- Fetch manifest version ---
    const fetchManifestVersion = async () => {
      try {
        const res = await fetch("/manifest.webmanifest");
        if (!res.ok) return;
        const manifest = await res.json();
        if (manifest.version) setVersion(manifest.version);
      } catch (err) {
        console.error("Failed to fetch manifest version:", err);
      }
    };
    fetchManifestVersion();

    // --- Register service worker ---
    const updateSW = registerSW({
      onNeedRefresh() { setUpdateAvailable(true); },
      onOfflineReady() { console.log("App ready for offline use."); }
    });

    // --- Listen for storage changes ---
    const syncToken = () => setTokenStatus(localStorage.getItem("token") ?? "None");
    window.addEventListener("storage", syncToken);

    // --- Geolocation tracking ---
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) =>
          setLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
          }),
        (err) => setLocation({ error: err.message }),
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
      );
    } else {
      setLocation({ error: "Geolocation not supported" });
    }

    // --- Cleanup ---
    return () => {
      window.removeEventListener("storage", syncToken);
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // --- Handle PWA update ---
  const handleUpdate = () => window.location.reload();

  // --- Handle login submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await login(empId, password);
      sessionStorage.setItem("Stat", data.Stat);
      sessionStorage.setItem("empl_id", data.empl_id);
      sessionStorage.setItem("br_lat", data.br_lat);
      sessionStorage.setItem("br_long", data.br_long);
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("Claim_Stat", data.Claim_Stat);
      sessionStorage.setItem("Emp_name", data.Name);
      sessionStorage.setItem("home_branch", data.home_branch);

      if (data.Stat === "OK") {
        if (empId === "2025") navigate("/AdminDashboard");
        else navigate("/dashboard");
      } else {
        setError("Login failed: " + (data.message || "Invalid credentials"));
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network or server error. Please try again.");
    }
  };

  return (
    <div className="mt-8 rounded-lg shadow-lg flex flex-col items-center justify-start min-h-screen gap-2">
      {/* Logo */}
      <table className="logo_txt">
        <tbody>
          <tr>
            <td>
              <img
                className="mr-2 w-8 h-8 object-contain rounded-lg"
                src="https://eyespace.co.in/gberp/images/sysimages/eyespace_logo_36x32.png"
                alt="Eye Space Logo"
              />
            </td>
            <td>
              <span className="gb-title gb_crimson">EYE SPACE <br /></span>
            </td>
          </tr>
          <tr>
            <td colSpan="2">
              {version && <p className="mb-2">App Version: {version}</p>}
              {updateAvailable && (
                <div className="p-2 bg-yellow-100 border border-yellow-400 rounded">
                  <p>New version available!</p>
                  <button
                    onClick={handleUpdate}
                    className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Refresh to Update
                  </button>
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Welcome text */}
      <div className="text-sm font-sans bg-yellow-100 w-[90%] rounded-xl text-black flex flex-wrap">
        Welcome to Attendance System. <br />
        <ul className="list-disc pl-5">
          <li className="marker:text-blue-500">Eye Space employees only!</li>
          <li className="marker:text-blue-500">Your employee ID is userid</li>
          <li className="marker:text-blue-500">Password hint - contact HO</li>
          <li className="marker:text-blue-500">You can register your device for attendance.</li>
          <li className="marker:text-blue-500">Only 1 device for an employee can be registered</li>
          <li className="marker:text-blue-500">For Re-registration/Update device, contact HO</li>
        </ul>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="gb_center login_card">
        <table className="gb_table_1 border border-solid gb_center">
          <tbody>
            <tr className="border border-solid">
              <th className="border border-solid gb_blue">Employee login</th>
            </tr>
            <tr className="gb_box_1 border border-solid">
              <th className="gb_box_1 border border-solid">
                <input
			  name="emp_id"
			  type="number"
			  placeholder="Employee ID"
  			  value={empId}
  			  onChange={(e) => setEmpId(e.target.value)}
  			  required
  			  className="gb_box_1"
  			  autoComplete="username"     // ✅ added
			/>

              </th>
            </tr>
            <tr className="border border-solid">
              <th className="border border-solid">
                <input
		  name="pass"
		  type="password"
		  placeholder="Password"
		  value={password}
		  onChange={(e) => setPassword(e.target.value)}
		  required
		  className="gb_box_1"
		  autoComplete="current-password"   // ✅ added
		/>

              </th>
            </tr>
            <tr className="gb_box_1 border border-solid">
              <th className="gb_box_1 border border-solid">
                <button type="submit" className="gb_btn_1 gb_btn_menu_blue">Sign In</button>
              </th>
            </tr>
          </tbody>
        </table>
      </form>

      {/* Device Status */}
      <div className="gb_center login_card w-11/12 mt-5">
        <table className="gb_table_1 border border-solid border-blue-500">
          <thead>
            <tr className="gb_btn_goldenrod border border-solid border-blue-500">
              <th className="gb_btn_goldenrod border border-solid border-blue-500" colSpan="2">Device Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-solid text-black border-blue-500">Device Token</td>
              <td className="border border-solid text-black border-blue-500">{tokenStatus}</td>
            </tr>
            <tr>
              <td className="border border-solid border-blue-500 text-black">Latitude</td>
              <td className="border border-solid border-blue-500 text-black">{location?.lat ?? location?.error ?? "Loading..."}</td>
            </tr>
            <tr>
              <td className="border border-solid text-black border-blue-500">Longitude</td>
              <td className="border border-solid text-black border-blue-500">{location?.lon ?? location?.error ?? "Loading..."}</td>
            </tr>
            <tr className="border border-solid text-black border-blue-500">
              <td className="border border-solid text-black border-blue-500">Accuracy (m)</td>
              <td className="border border-solid text-black border-blue-500">{location?.accuracy ?? location?.error ?? "Loading..."}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

// --- APP Router ---
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
