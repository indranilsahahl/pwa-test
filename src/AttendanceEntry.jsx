// ✅ AttendanceEntry.jsx
import React from "react";

export default function AttendanceEntry({
  validForAttendance,
  todayDisplay,
  attendanceStat,
  claiming,
  handleAttendanceLogin,
  handleAttendanceLogout,
}) {
  return (
    <section className="gb-card">
      <h2>Attendance Entry</h2>

      {validForAttendance === 1 ? (
        <>
          This device can be used — For {todayDisplay}
          <br />

          {/* Login button */}
          {(attendanceStat === "" || attendanceStat === "none" || attendanceStat === "logout") && (
            <button
              className="gb-btn"
              disabled={claiming}
              onClick={handleAttendanceLogin}
            >
              {claiming ? "Updating…" : "Login Now"}
            </button>
          )}

          {/* Logout button */}
          {attendanceStat === "login" && (
            <button
              className="gb-btn"
              disabled={claiming}
              onClick={handleAttendanceLogout}
            >
              {claiming ? "Updating…" : "Logout Now"}
            </button>
          )}

          {/* Done state */}
          {attendanceStat === "done" && (
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
