// ✅ AttendanceLog.jsx
import React, { useEffect, useState } from "react";
import { fetchLogs } from "./api.js";
import "./index.css"

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export default function AttendanceLog({ empId, reloadTrigger  }) {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await fetchLogs(empId);
        setLogs(data);
      } catch (err) {
        console.error("Failed to load logs:", err);
        setError("Unable to load attendance logs.");
      }
    };

    if (empId) loadLogs();
  }, [empId, reloadTrigger]);

  return (
    <section className="gb-card">
      <h2>Attendance Log</h2>

      {error && <div className="text-red-600">{error}</div>}

      {logs.length === 0 ? (
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
            {logs.map((row) => (
              <React.Fragment key={row.which_date}>
                {/* Date row */}
                <tr>
                  <th colSpan={3} className={`${row.attendance_stat} text-black`}>
                    {formatDate(row.which_date)} - {row.attendance_stat}
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
  );
}
