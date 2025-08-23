const API_BASE = "https://eyespace.co.in/gberp/hr/attendance.php";

export async function fetchUserById(empId) {
  const formData = new FormData();
  formData.append("action", "getUser");
  formData.append("emp_id", empId);

  const response = await fetch(API_BASE, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

export async function login(empId, password) {
  const formData = new FormData();
  formData.append("action", "login");
  formData.append("emp_id", empId);
  formData.append("password", password);

  const response = await fetch(API_BASE, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Network error");
  }
  
  // ✅ Add this return
  const data = await response.json();
  return data;
  }
