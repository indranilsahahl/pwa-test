// ✅ AttendanceEntry.jsx
import React from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export default function AttendanceEntry({
  validForAttendance, todayDisplay,  attendanceStat, claiming,  
  	handleAttendanceLogin, handleAttendanceLogout,
}) {
 	// Wrapper functions for confirm dialogs
 	const MySwal = withReactContent(Swal);
const MySwal = withReactContent(Swal);

// ---- Default theme config ----
const baseOptions = {
  customClass: {
    popup: "rounded-2xl shadow-xl p-6 bg-white",
    title: "text-xl font-semibold text-gray-800",
    htmlContainer: "text-gray-600 text-base",
    confirmButton:
      "bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-md",
    cancelButton:
      "bg-gray-300 hover:bg-gray-400 text-black font-medium px-4 py-2 rounded-lg shadow-md ml-2",
  },
  buttonsStyling: false, // required for Tailwind styles to apply
};

// ---------------- Confirm Login ----------------
const confirmLogin = async () => {
  const res = await MySwal.fire({
    ...baseOptions,
    title: "Are you sure?",
    text: "Do you want to Login?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, Login",
    cancelButtonText: "Cancel",
  });

  if (res.isConfirmed) {
    handleAttendanceLogin();
    await MySwal.fire({
      ...baseOptions,
      icon: "success",
      title: "Logged in!",
      text: "You have successfully logged in.",
      timer: 2000,
      showConfirmButton: false,
    });
  } else if (res.isDismissed) {
    await MySwal.fire({
      ...baseOptions,
      icon: "info",
      title: "Cancelled",
      text: "Login cancelled.",
      timer: 1500,
      showConfirmButton: false,
    });
  }
};

// ---------------- Confirm Logout ----------------
const confirmLogout = async () => {
  const res = await MySwal.fire({
    ...baseOptions,
    title: "Are you sure?",
    text: "Do you want to Logout?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Logout",
    cancelButtonText: "Cancel",
    customClass: {
      ...baseOptions.customClass,
      confirmButton:
        "bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg shadow-md",
    },
  });

  if (res.isConfirmed) {
    handleAttendanceLogout();
    await MySwal.fire({
      ...baseOptions,
      icon: "success",
      title: "Logged out!",
      text: "You have successfully logged out.",
      timer: 2000,
      showConfirmButton: false,
    });
  } else if (res.isDismissed) {
    await MySwal.fire({
      ...baseOptions,
      icon: "info",
      title: "Cancelled",
      text: "Logout cancelled.",
      timer: 1500,
      showConfirmButton: false,
    });
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
