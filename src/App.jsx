import { useEffect, useState } from 'react';
import axios from 'axios';
import AnalyticsDashboard from './AnalyticsDashboard';
import { getDeviceInfo } from './utils';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const { device, browser } = getDeviceInfo();
    axios.post('https://visitoranalyticsbackend-production.up.railway.app/api/track', {
      browser,
      device,
    });
  }, []);

  const handleLogin = () => {
    if (password === 'admin123') {
      setLoggedIn(true);
    } else {
      alert('Wrong password!');
    }
  };

  return (
    <div className="bg-gray-900 text-white min-w-screen min-h-screen flex flex-col items-center justify-start p-4 md:p-6 overflow-x-hidden">
      <h1 className="text-3xl font-bold mb-6 text-center">📈 Website Visitor Analytics</h1>

      {!loggedIn ? (
        <div className="bg-gray-800 p-6 rounded-xl w-full max-w-sm mx-auto space-y-4 shadow-lg">
          <h2 className="text-xl font-semibold text-center">🔐 Admin Login</h2>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded text-black"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold"
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
