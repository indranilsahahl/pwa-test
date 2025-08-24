const API_BASE = "https://eyespace.co.in/gberp/hr/attendance.php";

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

  const text = await response.text();
  console.log("Raw body:", text);

  try {
    const json = JSON.parse(text);
    console.log("Parsed JSON:", json);
    return json;
  } catch (err) {
    console.error("JSON parse error:", err);
    throw new Error("Invalid JSON from server");
  }
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

  const text = await response.text();
  console.log("Claim Raw body:", text);

  try {
    const json = JSON.parse(text);
    console.log("Claim Parsed JSON:", json);
    return json;  // expected { Stat: "OK", token: "xxxxx" }
  } catch (err) {
    console.error("JSON parse error:", err);
    throw new Error("Invalid JSON from server");
  }
}
