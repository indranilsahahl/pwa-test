//✅  AdminDashboard.jsx 
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPending, approveAttendance, rejectAttendance } from "./api.js";
import AdminVerification from "./AdminVerification";
import "./custom.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);


export default function AdminDashboard({reloadTrigger}) {
  // --- State hooks ---
  const [claiming, setClaiming] = useState(false);
  const [pendingStatus, setPendingStatus] = useState([]);
  const [error, setError] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const navigate = useNavigate();
  
  // --- logout handler ---
  const onLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  // Fetch Pending Logs 
  useEffect(() => {
    if (!otpVerified) return; // skip until verified
    
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
  }, [reloadTrigger, otpVerified]);
  // DateFormat From DD-MM-YYYY to ISO
  function formatDateForBackend( ddmmyyyy ) {
  	const [dd, mm, yyyy] = ddmmyyyy.split("/");
  	return `${yyyy}-${mm}-${dd}`; // "yyyy-mm-dd"
  };
  
  
  
// Generic confirm action for approve/reject (or future actions)
const confirmAction = (empid, which_date, actionType) => {
  const actionText = actionType === "approve" ? "Approve" : "Reject";
  const actionIcon = actionType === "approve" ? "question" : "warning";
  const backendFunc = actionType === "approve" ? approveAttendance : rejectAttendance;

  showConfirmDialog({
    title: `${actionText} Attendance?`,
    text: `Do you want to ${actionText.toLowerCase()} attendance for ${empid} on ${which_date}?`,
    confirmText: `Yes, ${actionText}`,
    icon: actionIcon,
    onConfirm: async () => {
      try {
        const backendDate = formatDateForBackend(which_date);
        await backendFunc(empid, backendDate);
        setPendingStatus((prev) =>
          prev.filter((r) => !(r.empid === empid && r.which_date === which_date))
        );
        await MySwal.fire({
          icon: "success",
          title: `${actionText}d!`,
          text: `Attendance has been ${actionText.toLowerCase()}d.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error(`${actionText} failed`, err);
        await MySwal.fire({
          icon: "error",
          title: "Failed!",
          text: `${actionText} failed. Try again.`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    },
  });
};

// Generic SweetAlert2 confirm dialog
const showConfirmDialog = async ({ title, text, confirmText, icon = "question", onConfirm }) => {
  const res = await MySwal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Cancel",
    customClass: {
      popup: "rounded-2xl shadow-xl p-6 bg-white",
      title: "text-xl font-semibold text-gray-800",
      htmlContainer: "text-gray-600 text-base",
      confirmButton:
        "bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-md",
      cancelButton:
        "bg-gray-300 hover:bg-gray-400 text-black font-medium px-4 py-2 rounded-lg shadow-md ml-2",
    },
    buttonsStyling: false,
  });

  if (res.isConfirmed && typeof onConfirm === "function") {
    await onConfirm();
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
                <button className="gb_btn_red" onClick={onLogout}>
                  Logout
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
       <AdminVerification onVerified={() => setOtpVerified(true)} />     
      {otpVerified && (
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
          <button className="gb_btn_mediumseagreen" 
          	onClick={() => confirmAction(empid, which_date, "approve")}> Approve </button>
          <button className="gb_btn_red" 
          	onClick={() => confirmAction(empid, which_date, "reject")}>  Reject </button>
        </td>
        </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </section>
    )}
    </div>
  );
}
