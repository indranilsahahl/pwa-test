import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPending } from "./api.js";

import "./custom.css";

export default function AdminDashboard(reloadTrigger) {
  const navigate = useNavigate();

  // --- State hooks ---
  const [claiming, setClaiming] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");
  const [error, setError] = useState("");

  // --- logout handler ---
  const onLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  // --- API helper ---
  useEffect(() => {
    const pendingLogs = async () => {
      try {
        const data = await fetchPending();
        console.log("Data = " + data);
        setPendingStatus(data);
      } catch (err) {
        console.error("Failed to load Pending logs:", err);
        setError("Unable to load pending logs.");
      }
    };
  }, [reloadTrigger]);
  const [logTick, setLogTick] = useState(0);
  
  // --- render ---
  return (
    <div className="dashboard-container">
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
                <h1 className="gb-title gb_blue gb_hover_blue">
                  Admin Dashboard
                </h1>
                <button className="gb-btn danger" onClick={onLogout}>
                  Logout
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
      
      <section className="gb-card">
      <h2>Pending Log</h2>

      {error && <div className="text-red-600">{error}</div>}

      {pendingStatus.length === 0 ? (
        <div>No logs found</div>
      ) : (
        <table className="gb-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Error</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {pendingStatus.map((row) => (
              <React.Fragment key={row.which_date}>
                {/* Date row */}
                <tr>
                  <th colSpan={3} className="bg-gray-200 text-left font-bold">
                    {row.dt} - {row.empid} - {row.e_name} 
                  </th>
                </tr>

                {/* Entry rows */}
                {row.entries.map((entry, i) => (
                  <tr key={i}>
                    <td className="pl-6">{entry.time || "-"}</td>
                    <td>{entry.error || "-"}</td>
                    <td className="italic text-gray-600">{entry.type}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </section>
    </div>
  );
}
