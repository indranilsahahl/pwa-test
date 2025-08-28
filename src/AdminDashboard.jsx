//✅  AdminDashboar.jsx 
import React, { useMemo, useState, useEffect } from "react";
import { fetchPending, approveAttendance, rejectAttendance } from "./api.js";

import "./custom.css";

export default function AdminDashboard({reloadTrigger}) {
  // --- State hooks ---
  const [claiming, setClaiming] = useState(false);
  const [pendingStatus, setPendingStatus] = useState([]);
  const [error, setError] = useState("");

  // --- logout handler ---
  const onLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  // Fetch Pending Logs 
  useEffect(() => {
    const pendingLogs = async () => {
      try {
        const data = await fetchPending();
        // console.log("Data = " + data);
        setPendingStatus(data);
      } catch (err) {
        console.error("Failed to load Pending logs:", err);
        setError("Unable to load pending logs.");
      }
    };
    
    pendingLogs(); // ✅ call it here
  }, [reloadTrigger]);
  // DateFormat From DD-MM-YYYY to ISO
  function formatDateForBackend( ddmmyyyy ) {
  	const [dd, mm, yyyy] = ddmmyyyy.split("/");
  	return `${yyyy}-${mm}-${dd}`; // "yyyy-mm-dd"
  };
  
  // Approve handler
  const handleApprove = async (empid, which_date) => {
    try {
      const backendDate = formatDateForBackend(which_date);
      await approveAttendance(empid, backendDate);
      setPendingStatus((prev) =>
        prev.filter(
          (r) => !(r.empid === empid && r.which_date === which_date)
        )
      );
    } catch (err) {
      console.error("Approve failed", err);
    }
  };
  
  // Reject handler
  const handleReject = async (empid, which_date) => {
    try {
      const backendDate = formatDateForBackend(which_date);
      await rejectAttendance(empid, backendDate);
      setPendingStatus((prev) =>
        prev.filter(
          (r) => !(r.empid === empid && r.which_date === which_date)
        )
      );
    } catch (err) {
      console.error("Reject failed", err);
    }
  };
  
  
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
              <React.Fragment key={`${row.which_date}-${row.empid}`}>
                {/* Date row */}
                <tr>
                  <th colSpan={3} className="bg-gray-200 text-left font-bold">
                    {row.which_date} - {row.empid} - {row.empname} 
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
                
           	{/* Approve / Reject row */}
      	<tr>
        <td colSpan={3} className="text-center">
          <button className="gb-btn success mr-2" onClick={() =>
                          handleApprove(row.empid, row.which_date)}> Approve </button>
          <button className="gb-btn danger" onClick={() =>
                          handleReject(row.empid, row.which_date)}>  Reject </button>
        </td>
        </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </section>
    </div>
  );
}
