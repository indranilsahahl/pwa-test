import React, { useState } from "react";
import { login, claimDevice } from "./api";

export default function Dashboard() {
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login(empId, password);
      console.log("Login Parsed JSON:", data);

      if (data.Stat === "OK") {
        setUser(data);
        setMessage(`Welcome ${data.Name}`);
      } else {
        setMessage("Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Login error occurred");
    }
  };

  const handleClaim = async () => {
    try {
      const result = await claimDevice(user.empl_id);
      console.log("Claim Parsed JSON:", result);

      if (result.Stat === "OK") {
        localStorage.setItem("token", result.token); // ✅ Save only if success
        setMessage("Device successfully claimed!");
        // Update local state to reflect claim
        setUser((prev) => ({ ...prev, Claim_Stat: "Y" }));
      } else {
        setMessage("Claim failed, try again later.");
      }
    } catch (err) {
      console.error("Claim error:", err);
      setMessage("Claim error occurred");
    }
  };

  return (
    <div className="p-6">
      {!user ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Employee ID"
            value={empId}
            onChange={(e) => setEmpId(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Login
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{message}</h2>

          {user.Claim_Stat === "N" ? (
            <button
              onClick={handleClaim}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Claim This Device
            </button>
          ) : (
            <p className="text-gray-700">User Already Registered</p>
          )}
        </div>
      )}
    </div>
  );
}
