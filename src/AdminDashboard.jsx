// ✅ Daashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./custom.css";

export default function AdminDashboard() {
  // --- session data snapshot ---
  const sessionData = useMemo(() => {
   // --- derived values ---
  const onLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };
  const empId = sessionData.find(([lbl]) => lbl === "Employee ID")?.[1];

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
                <h1 className="gb-title gb_blue .gb_hover_blue">Admin Dashboard</h1>
                <button className="gb-btn danger" onClick={onLogout}>
                  Logout
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}

