// ✅ AttendanceLog.jsx
import React, { useEffect, useState } from "react";
import { fetchLogs } from "./api.js"; // ✅ use curly braces as it is a function

export default function AttendanceLog({ empId }) {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");


  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await fetchLogs(empId); // pass empId
        setLogs(data);
      } catch (err) {
        console.error("Failed to load logs:", err);
        setError("Unable to load attendance logs.");
      }
    };

    if (empId) loadLogs(); // only fetch if empId is available
  }, [empId]);

  return (
    <section className="gb-card">
      <h2>Attendance Log</h2>
      {logs.length === 0 ? (
        <div>No logs found</div>
      ) : (
        <table className="gb-table">
          <thead>
   		 <tr>  <th>Time</th>  <th>Error</th> </tr>
  	  </thead> 	
          <tbody>
  		{logs.map((row, index) => (
	    <React.Fragment key={row.which_date}>
      		{/* Date row as a section header */}
      		<tr>
        	<th colSpan={2} className="bg-gray-200 text-left font-bold">
          		{row.which_date}
        	</th>
      		</tr>

     	 {/* Entry rows */}
      	{row.entries.map((entry, i) => (
        <tr key={entry.login_time || entry.logout_time}>
          <td className="pl-6">{entry.login_time || entry.logout_time}</td>
          <td>{entry.login_error || entry.logout_error}</td>
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
