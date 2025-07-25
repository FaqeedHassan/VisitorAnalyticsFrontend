import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  CartesianGrid,
} from "recharts";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#14b8a6", "#3b82f6"];

function AnalyticsDashboard() {
  const [data, setData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const formatDate = (d) => d.toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(formatDate(sevenDaysAgo));
  const [endDate, setEndDate] = useState(formatDate(today));

  useEffect(() => {
    if (!startDate || !endDate) return;
    setLoading(true);

    axios
      .get(`https://visitoranalyticsbackend-production.up.railway.app/api/data?start=${startDate}&end=${endDate}`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, [startDate, endDate]);

  const exportCSV = () => {
    if (data.length === 0) return;

    const rows = data.map((row) => ({
      ip: row.ip,
      browser: row.browser,
      device: row.device,
      country: row.country,
      timestamp: new Date(row.timestamp).toLocaleString(),
    }));

    const header = Object.keys(rows[0]).join(",");
    const csv = rows.map((row) => Object.values(row).join(",")).join("\n");
    const blob = new Blob([header + "\n" + csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "analytics.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const normalize = (str) => (str || "Unknown").trim().toLowerCase();

  const browserStats = data.reduce((acc, cur) => {
    const name = normalize(cur.browser);
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const browserChartData = Object.entries(browserStats).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count,
  }));

  const deviceStats = data.reduce((acc, cur) => {
    const name = normalize(cur.device);
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const deviceChartData = Object.entries(deviceStats).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const countryStats = data.reduce((acc, cur) => {
    const name = normalize(cur.country);
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const countryChartData = Object.entries(countryStats).map(([name, value]) => ({
    name: name.toUpperCase(),
    value,
  }));

  const timeStats = {};
  data.forEach((item) => {
    const hour = new Date(item.timestamp).getHours();
    timeStats[hour] = (timeStats[hour] || 0) + 1;
  });
  const timeChartData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: timeStats[hour] || 0,
  }));

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 text-white p-2 rounded shadow text-sm">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, i) => (
            <p key={i}>{`${entry.name || entry.dataKey}: ${entry.value}`}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-8 text-white bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">📊 Analytics Dashboard</h1>

      {/* Filters */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-md mb-10 flex flex-col md:flex-row md:items-end gap-6">
        <div className="flex-1">
          <label className="block mb-1 text-gray-300">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 rounded-lg text-black"
          />
        </div>
        <div className="flex-1">
          <label className="block mb-1 text-gray-300">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 rounded-lg text-black"
          />
        </div>
        <button
          onClick={exportCSV}
          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-white"
        >
          ⬇️ Export CSV
        </button>
      </div>

      {loading ? (
        <p className="text-center text-lg text-gray-300">Loading charts...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Browser Chart */}
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-center">🌐 Browser Usage</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={browserChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip content={customTooltip} />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                  animationDuration={500}
                  onMouseOver={(e) => setActiveIndex(e.index)}
                  onMouseOut={() => setActiveIndex(null)}
                >
                  {browserChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === activeIndex ? "#818cf8" : "#6366f1"}
                      style={{ transition: "all 0.3s ease" }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Device Chart */}
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-center">💻 Device Breakdown</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={deviceChartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label
                  isAnimationActive
                  onMouseEnter={(_, i) => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {deviceChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke={index === activeIndex ? "#fff" : "none"}
                      strokeWidth={index === activeIndex ? 2 : 0}
                      style={{ transition: "all 0.3s ease" }}
                    />
                  ))}
                </Pie>
                <Tooltip content={customTooltip} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Country Chart */}
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-center">🌍 Visitor Countries</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={countryChartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label
                  isAnimationActive
                  onMouseEnter={(_, i) => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {countryChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke={index === activeIndex ? "#fff" : "none"}
                      strokeWidth={index === activeIndex ? 2 : 0}
                      style={{ transition: "all 0.3s ease" }}
                    />
                  ))}
                </Pie>
                <Tooltip content={customTooltip} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Time Chart */}
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-center">⏱ Time-based Traffic</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip content={customTooltip} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsDashboard;
