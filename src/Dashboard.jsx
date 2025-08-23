function Dashboard() {
  const empId = localStorage.getItem("empId");
  const token = localStorage.getItem("token");

  if (!empId || !token) {
    return <p>You are not logged in</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {empId} 🎉</h1>
      <p>Your token: {token}</p>
    </div>
  );
}

export default Dashboard;
