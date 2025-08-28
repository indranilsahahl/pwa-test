//✅  AdminVerification.jsx

import React, { useEffect, useState } from "react";
import { getAdmins, sendOtp, verifyOtp } from "./api.js";

export default function AdminVerification() {
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
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <section className="gb-card p-4 space-y-4">
      <h2 className="font-bold text-lg">Admin Verification</h2>

      <select
        className="border p-2 rounded w-full"
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

      <button
        onClick={handleDone}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Done
      </button>

      {sessionId && (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Enter OTP"
            className="border p-2 rounded w-full"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            onClick={handleVerify}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Verify OTP
          </button>
        </div>
      )}

      {message && <p className="text-sm text-gray-700">{message}</p>}
    </section>
  );
}
