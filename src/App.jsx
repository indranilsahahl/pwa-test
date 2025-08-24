import { useState, useEffect } from "react";

function LoginPage() {
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState(null);
  const [tokenStatus, setTokenStatus] = useState("Not Found");

  useEffect(() => {
    // ✅ Check token in localStorage
    const token = localStorage.getItem("token");
    setTokenStatus(token ? "Present" : "Not Found");

    // ✅ Get geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude.toFixed(6),
            lon: pos.coords.longitude.toFixed(6),
            accuracy: pos.coords.accuracy.toFixed(2),
          });
        },
        (err) => {
          setLocation({ error: err.message });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setLocation({ error: "Geolocation not supported" });
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted:", empId, password);
    // call your login API here
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
              <span className="gb_font_2">EYE SPACE <br /></span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Welcome text */}
      <div className="gb_font_1 gb_center">
        Welcome to Eye Space Attendance System. <br />
        Please use the following form to login. <br />
        <ul>
          <li>You should be an employee of Eye Space to use the system</li>
          <li>Your employee ID is userid</li>
          <li>Password hint - contact HO</li>
          <li>Once logged In, you can register your device for attendance.</li>
          <li>Only 1 device for an employee Can be registered</li>
          <li>For Re-registration/Update device, contact HO</li>
        </ul>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="gb_center login_card">
        <table className="gb_table_1 gb_tb_border_all gb_center">
          <tbody>
            <tr className="gb_tb_border_all">
              <th className="gb_tb_border_all">Employee login</th>
            </tr>
            <tr className="gb_box_1 gb_tb_border_all">
              <th className="gb_box_1 gb_tb_border_all">
                <input
                  type="text"
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
              <th colSpan="2" className="gb_tb_border_all">Device Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="gb_tb_border_all">Token</td>
              <td className="gb_tb_border_all">{tokenStatus}</td>
            </tr>
            <tr>
              <td className="gb_tb_border_all">Latitude</td>
              <td className="gb_tb_border_all">
                {location?.lat || location?.error || "Loading..."}
              </td>
            </tr>
            <tr>
              <td className="gb_tb_border_all">Longitude</td>
              <td className="gb_tb_border_all">
                {location?.lon || location?.error || "Loading..."}
              </td>
            </tr>
            <tr>
              <td className="gb_tb_border_all">Accuracy (m)</td>
              <td className="gb_tb_border_all">
                {location?.accuracy || location?.error || "Loading..."}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LoginPage;
