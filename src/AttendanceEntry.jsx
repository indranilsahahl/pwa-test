// ✅ AttendanceEntry.jsx
import React from "react";

export default function AttendanceEntry({
  validForAttendance, todayDisplay,  attendanceStat, claiming,  
  	handleAttendanceLogin, handleAttendanceLogout,
}) {
 	// Wrapper functions for confirm dialogs
 	 const confirmLogin = () => {
 	   if (window.confirm("Are you sure you want to Login?")) {
 	     handleAttendanceLogin();
 	   }
 	 };

 	 const confirmLogout = () => {
 	   if (window.confirm("Are you sure you want to Logout?")) {
 	     handleAttendanceLogout();
 	   }
 	 };
  return (
    <section className="gb-card">
      <h2>Attendance Entry</h2>

      {validForAttendance === 1 ? (
        <>
          This device can be used — For {todayDisplay}
          <br />

          {/* Login button */}
          {(attendanceStat === "" || attendanceStat === "none" ) && (
            <button
              className="gb-btn"
              disabled={claiming}
              onClick={confirmLogin}
            >
              {claiming ? "Updating…" : "Login Now"}
            </button>
          )}

          {/* Logout button */}
          {attendanceStat === "login" && (
            <button
              className="gb-btn"
              disabled={claiming}
              onClick={confirmLogout}
            >
              {claiming ? "Updating…" : "Logout Now"}
            </button>
          )}

          {/* Done state */}
          {attendanceStat === "done" || attendanceStat === "logout" && (
            <span>All attendance marked for today</span>
          )}

          {/* Error display */}
          {attendanceStat?.startsWith?.("Error") && (
            <div className="gb-footer">{attendanceStat}</div>
          )}

          <br />
          <span>{attendanceStat}</span>
        </>
      ) : (
        <div className="gb-footer">Device Token does not match.</div>
      )}
    </section>
  );
}
