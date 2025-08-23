import { useEffect, useState } from "react";

function App() {
  const [empId, setEmpId] = useState("");
  const [userData, setUserData] = useState(null);
  const [location, setLocation] = useState({ lat: null, long: null });
  const [installPrompt, setInstallPrompt] = useState(null);

  // ✅ Capture user's location
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

  // ✅ Listen for beforeinstallprompt event
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e); // save the event for later use
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // ✅ Fetch employee data
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!empId) return;

    try {
      const formData = new FormData();
      formData.append("action", "getUser");
      formData.append("emp_id", empId);

      const response = await fetch("https://eyespace.co.in/gberp/hr/attendance.php", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setUserData(data[0]);
      } else {
        setUserData({ error: "No user found" });
      }
    } catch (err) {
      console.error(err);
      setUserData({ error: err.message });
    }
  };

  // ✅ Calculate distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371000; // metres
    const toRad = (deg) => (deg * Math.PI) / 180;
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c); // distance in meters
  };

  const distance =
    userData && !userData.error
      ? calculateDistance(location.lat, location.long, userData.loc_lat, userData.loc_long)
      : null;

  // ✅ Handle install click
  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log("User choice:", outcome);
    setInstallPrompt(null);
  };

  return (
    <div className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">EsAttendance</h1>

      {/* Location display */}
      {location.lat && location.long ? (
        <p className="mb-2">
          Current Location: {location.lat.toFixed(6)}, {location.long.toFixed(6)}
        </p>
      ) : (
        <p className="mb-2 text-gray-500">Fetching location...</p>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={empId}
          onChange={(e) => setEmpId(e.target.value)}
          placeholder="Enter Employee ID"
          className="border p-2 mr-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </form>

      {/* Install button (only shows if available) */}
      {installPrompt && (
        <button
          onClick={handleInstallClick}
          className="bg-green-600 text-white px-4 py-2 rounded mb-4"
        >
          📲 Install App
        </button>
      )}

      {/* User Data Table */}
      {userData && (
        <div className="overflow-x-auto">
          {userData.error ? (
            <p className="text-red-600">{userData.error}</p>
          ) : (
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
                  <td className="border border-gray-400 px-2 py-1">{userData.emp_id}</td>
                  <td className="border border-gray-400 px-2 py-1">{userData.emp_name}</td>
                  <td className="border border-gray-400 px-2 py-1">{userData.branch_name}</td>
                  <td className="border border-gray-400 px-2 py-1">{userData.device_id}</td>
                  <td className="border border-gray-400 px-2 py-1">{userData.loc_lat}</td>
                  <td className="border border-gray-400 px-2 py-1">{userData.loc_long}</td>
                  <td className="border border-gray-400 px-2 py-1">
                    {distance !== null ? `${distance} m` : "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
