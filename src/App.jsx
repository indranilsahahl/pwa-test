import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { login } from "./api.js";
import Dashboard from "./Dashboard";
import "./index.css";

// Login Page Component
function LoginPage() {
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await login(empId, password);

      if (result.success) {
        localStorage.setItem("empId", result.empId);
        localStorage.setItem("token", result.token);
        navigate("/dashboard");
      } else {
        setError(result.message || "Invalid login credentials");
        setShowError(true);
      }
    } catch (err) {
      setError("Server error. Please try again.");
      setShowError(true);
    }
  };

  return (
    <div className="gb_body_2 gb_font_1">
      {showError && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-[301] flex justify-center items-center">
          <div className="w-[400px] relative p-5 rounded-lg bg-gradient-to-b from-white to-gray-400">
            <button
              onClick={() => setShowError(false)}
              className="absolute -top-3 -right-3 bg-gray-600 text-white w-6 h-6 rounded-full shadow"
            >
              X
            </button>
            <div>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center items-center h-screen">
        <div className="p-6 border rounded shadow bg-white w-[350px]">
          <div
            className="mb-4 flex items-center border-b border-gray-400 bg-no-repeat bg-left bg-transparent"
            style={{
              backgroundImage:
                'url("https://eyespace.co.in/gberp/images/sysimages/eyespace_logo_36x32.png")',
            }}
          >
            <span className="ml-12 text-2xl font-semibold text-[#45C0AE] select-none">
              Eye Space
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
            <input
              type="text"
              placeholder="Employee ID"
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              required
              className="border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            />
            <button
              type="submit"
              className="bg-[#45C0AE] text-white py-2 rounded hover:bg-[#3aa595] transition"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Wrapper to check auth before rendering Routes
function AuthWrapper({ children }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const empId = localStorage.getItem("empId");
    const token = localStorage.getItem("token");

    if (empId && token) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
    setLoading(false);
  }, [navigate]);

  if (loading) return <p>Loading...</p>;
  return children;
}

// Root App Component
function App() {
  return (
    <BrowserRouter>
      <AuthWrapper>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </AuthWrapper>
    </BrowserRouter>
  );
}

export default App;
