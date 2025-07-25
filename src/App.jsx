import { useEffect, useState } from "react";
import axios from "axios";
import AnalyticsDashboard from "./AnalyticsDashboard";
import { getDeviceInfo, hasBeenTracked, markVisitorTracked } from "./utils";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!hasBeenTracked()) {
      const { device, browser } = getDeviceInfo();
      axios
        .post(
          "https://visitoranalyticsbackend-production.up.railway.app/api/track",
          {
            browser:
              browser.charAt(0).toUpperCase() + browser.slice(1).toLowerCase(),
            device:
              device.charAt(0).toUpperCase() + device.slice(1).toLowerCase(),
          }
        )
        .then(() => {
          markVisitorTracked(); // Mark as tracked after success
        })
        .catch((err) => {
          console.error("Tracking failed:", err);
        });
    }
  }, []);

  const handleLogin = () => {
    if (password === "admin123") {
      setLoggedIn(true);
    } else {
      alert("Wrong password!");
    }
  };

  return (
    <div className="bg-gray-900 text-white min-w-screen min-h-screen flex flex-col items-center justify-start p-4 md:p-6 overflow-x-hidden">
      <h1 className="text-3xl font-bold mb-6 text-center">
        📈 Website Visitor Analytics
      </h1>

      {!loggedIn ? (
        <div className="bg-gray-800 p-6 rounded-xl w-full max-w-sm mx-auto space-y-4 shadow-lg">
          <h2 className="text-xl font-semibold text-center">🔐 Admin Login</h2>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded text-white"
          />
         <button
  onClick={handleLogin}
  className="w-full p-2 rounded font-semibold shadow-md"
  style={{
    backgroundColor: "#2563eb", // Tailwind blue-600
    color: "#fff",
    border: "none",
  }}
  onMouseOver={(e) => {
    e.target.style.backgroundColor = "#1d4ed8"; // Tailwind blue-700
  }}
  onMouseOut={(e) => {
    e.target.style.backgroundColor = "#2563eb"; // Reset to blue-600
  }}
>
  Login
</button>

        </div>
      ) : (
        <div className="w-full">
          <AnalyticsDashboard />
        </div>
      )}
    </div>
  );
}

export default App;
