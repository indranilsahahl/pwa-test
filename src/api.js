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
