import React, { useState, useEffect } from "react";
import { useNavigate, BrowserRouter, Routes, Route } from "react-router-dom";
import { login } from "./api.js";
import Dashboard from "./Dashboard";

// ---------------- LOGIN PAGE ----------------
function LoginPage() {
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tokenStatus, setTokenStatus] = useState("Not Logged In");
  const [location, setLocation] = useState(null);

  const navigate = useNavigate();
    
  // ✅ Get location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }),
        (err) => setLocation({ error: err.message })
      );
    } else {
      setLocation({ error: "Geolocation not supported" });
    }
    // Get the tokenStatus from localStorage
    setTokenStatus(localStorage.getItem("token") || "No Token");

  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(""); // reset any previous error

  try {
    const data = await login(empId, password); // Already an object
    
	// Save to sessionStorage directly
	sessionStorage.setItem("Stat", data.Stat);
	sessionStorage.setItem("empl_id", data.empl_id);
	sessionStorage.setItem("br_lat", data.br_lat);
	sessionStorage.setItem("br_long", data.br_long);
	sessionStorage.setItem("token", data.token);
	sessionStorage.setItem("Claim_stat", data.Claim_Stat);
	sessionStorage.setItem("Emp_name", data.Name);
	sessionStorage.setItem("home_branch", data.home_branch);

	if (data.Stat === "OK") {
  		navigate("/dashboard");
	} else {
  		setError("Login failed: " + (data.message || "Invalid credentials"));
	}

  } catch (err) {
    console.error("Login error:", err);
    setError("Network or server error. Please try again.");
  }
};



  return (
    <div id="top_level">
      {/* Logo */}
      <table className="logo_txt">
        <tbody>
          <tr>
            <td>
              <img
                id="u_logo"
                src="https://eyespace.co.in/gberp/images/sysimages/eyespace_logo_36x32.png"
                alt="Eye Space Logo"
              />
            </td>
            <td>
              <span className="gb-title gb_crimson">
                EYE SPACE <br />
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Welcome text */}
      <div className="gb_font_1 gb_center">
        Welcome to Attendance System. <br />
        <ul>
          <li>Eye Space employees only! </li>
          <li>Your employee ID is userid</li>
          <li>Password hint - contact HO</li>
          <li>You can register your device for attendance.</li>
          <li>Only 1 device for an employee Can be registered</li>
          <li>For Re-registration/Update device, contact HO</li>
        </ul>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="gb_center login_card">
        <table className="gb_table_1 gb_tb_border_all gb_center">
          <tbody>
            <tr className="gb_tb_border_all">
              <th className="gb_tb_border_all gb-black">Employee login</th>
            </tr>
            <tr className="gb_box_1 gb_tb_border_all">
              <th className="gb_box_1 gb_tb_border_all">
                <input
                  name="emp_id"
                  type="number"
                  placeholder="Employee ID"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  required
                  className="gb_box_1"
                />
              </th>
            </tr>
            <tr className="gb_tb_border_all">
              <th className="gb_tb_border_all">
                <input
                  name="pass"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="gb_box_1"
                />
              </th>
            </tr>
            <tr className="gb_box_1 gb_tb_border_all">
              <th className="gb_box_1 gb_tb_border_all">
                <button type="submit" className="gb_btn_1 gb_btn_menu_blue">
                  Sign In
                </button>
              </th>
            </tr>
          </tbody>
        </table>
      </form>

      {/* ✅ Device Status */}
      <div className="gb_center login_card" style={{ marginTop: "20px" }}>
        <table className="gb_table_1 gb_tb_border_all gb_center">
          <thead>
            <tr>
              <th colSpan="2">
                Device Status
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="gb_tb_border_all gb-black">Registration status</td>
              <td className="gb_tb_border_all gb-black">{tokenStatus}</td>
            </tr>
            <tr>
              <td className="gb_tb_border_all gb-black">Latitude</td>
              <td className="gb_tb_border_all gb-black">
                {location?.lat || location?.error || "Loading..."}
              </td>
            </tr>
            <tr>
              <td className="gb_tb_border_all gb-black">Longitude</td>
              <td className="gb_tb_border_all gb-black">
                {location?.lon || location?.error || "Loading..."}
              </td>
            </tr>
            <tr>
              <td className="gb_tb_border_all gb-black">Accuracy (m)</td>
              <td className="gb_tb_border_all gb-black">
                {location?.accuracy || location?.error || "Loading..."}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

// ---------------- APP ROUTER ----------------
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

// ✅ Export the right component
export default App;
