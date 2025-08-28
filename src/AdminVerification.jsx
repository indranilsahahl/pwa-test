//✅  AdminVerification.jsx

import React, { useEffect, useState } from "react";
import { getAdmins, sendOtp, verifyOtp } from "./api.js";

export default function AdminVerification({ onVerified }) {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchAdmins() {
      try {
        const data = await getAdmins();
        setAdmins(data);
      } catch (err) {
        setMessage("Failed to load admins");
      }
    }
    fetchAdmins();
  }, []);

  const handleDone = async () => {
    if (!selectedAdmin) {
      alert("Please select an admin first");
      return;
    }
    try {
      const id = await sendOtp(selectedAdmin);
      setSessionId(id);
      setMessage(`OTP sent to ${selectedAdmin}`);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleVerify = async () => {
    if (!otp || !sessionId) {
      alert("Enter OTP first");
      return;
    }
    try {
      await verifyOtp(sessionId, otp);
      setMessage("OTP Verified ✅");
      
      if (onVerified) onVerified();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <section className="gb-card p-4 space-y-4">
      <h2 className="font-bold text-lg">Admin Verification</h2>

      <select
        className="gb-custom-select"
        value={selectedAdmin}
        onChange={(e) => setSelectedAdmin(e.target.value)}
      >
        <option value="">-- Select Admin --</option>
        {admins.map((admin, i) => (
          <option key={i} value={admin.mobile}>
            {admin.name} ({admin.mobile})
          </option>
        ))}
      </select>
       &nbsp;&nbsp;
      <button
        onClick={handleDone}
        className="gb_btn_1 gb_btn_menu_blue"
      >
        Done
      </button>

      {sessionId && (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Enter OTP"
            className="gb_box_1"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            onClick={handleVerify}
            className="gb_lightslategray"
          >
            Verify OTP
          </button>
        </div>
      )}

      {message && <p className="text-sm text-gray-700">{message}</p>}
    </section>
  );
}
