//✅ api.js
const API_BASE = "https://eyespace.co.in/gberp/hr/attendance.php";


export async function safeJson(response) {
  const txt = await response.text();
  try { return JSON.parse(txt); } catch (e) { 
    throw new Error("Invalid JSON from server: " + txt.slice(0, 200));
  }
}

export async function login(empId, password) {
  const formData = new FormData();
  formData.append("action", "login");
  formData.append("emp_id", empId);
  formData.append("pass", password);

  const response = await fetch(API_BASE, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const json = await safeJson(response);
  return json;
}

export async function claimDevice(empId) {
  const formData = new FormData();
  formData.append("action", "claimDevice");
  formData.append("emp_id", empId);

  const response = await fetch(API_BASE, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const json = await safeJson(response);
  return json; // expected { Stat: "OK", token: "xxxxx" }
}

export async function attendanceCheck(empId, today) {
  const formData = new FormData();
  formData.append("action", "attendanceCheck");
  formData.append("emp_id", empId);
  formData.append("w_day", today);

  const response = await fetch(API_BASE, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const json = await safeJson(response);
  return json; // expected { now_stat: "done" }
}

export async function attendanceLogin(empId, today, distance) {
  const formData = new FormData();
  formData.append("action", "attendanceLogin");
  formData.append("emp_id", empId);
  formData.append("w_day", today);
  formData.append("distance", distance);

  const response = await fetch(API_BASE, {
    method: "POST",
    body: formData,
   });
   if (!response.ok) {
    throw new Error("Network response was not ok");
   }

   const json = await safeJson(response);
   return json; // expected { now_stat: "done" }
  }

export async function attendanceLogout(empId, today, distance) {
  const formData = new FormData();
  formData.append("action", "attendanceLogout");
  formData.append("emp_id", empId);
  formData.append("w_day", today);
  formData.append("distance", distance);

  const response = await fetch(API_BASE, {
    method: "POST",
    body: formData,
   });
   if (!response.ok) {
    throw new Error("Network response was not ok");
   }

   const json = await safeJson(response);
   return json; // expected { now_stat: "done" }
  }

export async function fetchLogs(empId) {
  const formData = new FormData();
  formData.append("action", "getAttendanceLog");
  formData.append("emp_id", empId);

  const response = await fetch(API_BASE, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Network error");
  }

  const json = await safeJson(response); // expected array of logs
  return json;
}

export async function fetchPending() {
  const formData = new FormData();
  formData.append("action", "getPendingAttendance");

  const response = await fetch(API_BASE, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Network error");
  }

  const json = await safeJson(response); // expected array of logs
  return json;
}

// Approve Reject here
// --- Approve pending attendance ---
export async function approveAttendance(empId, which_date) {
  const formData = new FormData();
  formData.append("action", "approve");
  formData.append("emp_id", empId);
  formData.append("which_date", which_date);

  const response = await fetch(API_BASE, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Network error: ${response.status}`);
  }

  return await safeJson(response); // expected { success: true, message: "Approved" }
}

// --- Reject pending attendance ---
export async function rejectAttendance(empId, which_date) {
  const formData = new FormData();
  formData.append("action", "reject");
  formData.append("emp_id", empId);
  formData.append("which_date", which_date);

  const response = await fetch(API_BASE, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Network error: ${response.status}`);
  }

  return await safeJson(response); // expected { success: true, message: "Rejected" }
}

// For getAdmins
// --- Fetch list of admins ---
export async function getAdmins() {
  const formData = new FormData();
  formData.append("action", "getAdmins");

  const response = await fetch(API_BASE, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Network error: ${response.status}`);
  }

  return await safeJson(response); // expected array of { name, mobile }
}

// OTP Calls 
// const API_KEY = process.env.VITE_SMS_API_KEY; // 2Factor API key
const API_KEY = import.meta.env.VITE_SMS_API_KEY;

const BASE_URL = "https://2factor.in/API/V1";

export async function sendOtp(mobile) {
  const url = `${BASE_URL}/${API_KEY}/SMS/${mobile}/AUTOGEN/OTP1`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Network error while sending OTP");

  const result = await response.json();
  if (result.Status !== "Success") {
    throw new Error(result.Details || "Failed to send OTP");
  }

  return result.Details; // ✅ sessionId
}

export async function verifyOtp(sessionId, otp) {
  const url = `${BASE_URL}/${API_KEY}/SMS/VERIFY/${sessionId}/${otp}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Network error while verifying OTP");

  const result = await response.json();
  if (result.Status !== "Success") {
    throw new Error(result.Details || "Invalid OTP");
  }

  return true; // ✅ OTP verified
}

