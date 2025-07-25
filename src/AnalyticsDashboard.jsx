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
} from "recharts";

// 🎨 Vibrant colors
const COLORS = [
  "#6366f1", "#ec4899", "#10b981", "#f59e0b", "#ef4444",
  "#0ea5e9", "#8b5cf6", "#22c55e", "#a855f7", "#f43f5e"
];

const tooltipStyle = {
  backgroundColor: "#000",
  border: "none",
  borderRadius: "10px",
  color: "#fff",
  padding: "10px",
};

function AnalyticsDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeBarIndex, setActiveBarIndex] = useState(null);
  const [activeDeviceIndex, setActiveDeviceIndex] = useState(null);
  const [activeCountryIndex, setActiveCountryIndex] = useState(null);

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const formatDate = (d) => d.toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(formatDate(sevenDaysAgo));
  const [endDate, setEndDate] = useState(formatDate(today));

  useEffect(() => {
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

  const browserStats = data.reduce((acc, cur) => {
    const name = cur.browser?.charAt(0).toUpperCase() + cur.browser?.slice(1) || "Unknown";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const browserChartData = Object.entries(browserStats).map(([name, count]) => ({ name, count }));

  const deviceStats = data.reduce((acc, cur) => {
    const name = cur.device?.charAt(0).toUpperCase() + cur.device?.slice(1) || "Unknown";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const deviceChartData = Object.entries(deviceStats).map(([name, value]) => ({ name, value }));

  const countryStats = data.reduce((acc, cur) => {
    const name = cur.country?.toUpperCase() || "Unknown";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const countryChartData = Object.entries(countryStats).map(([name, value]) => ({ name, value }));

  const timeStats = {};
  data.forEach((item) => {
    const hour = new Date(item.timestamp).getHours();
    timeStats[hour] = (timeStats[hour] || 0) + 1;
  });
  const timeChartData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: timeStats[hour] || 0,
  }));

  return (
    <div className="p-4 md:p-8 text-white bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">📊 Analytics Dashboard</h1>

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
          {/* Browser Usage */}
          <div className="bg-slate-800 p-6 rounded-2xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4">🌐 Browser Usage</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={browserChartData} onMouseLeave={() => setActiveBarIndex(null)}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="count"
                  onMouseOver={(_, index) => setActiveBarIndex(index)}
                >
                  {browserChartData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                      style={{
                        transform: activeBarIndex === index ? "scale(1.05)" : "scale(1)",
                        filter: activeBarIndex === index
                          ? `drop-shadow(0 0 10px ${COLORS[index % COLORS.length]})`
                          : "none",
                        transition: "all 0.3s ease",
                        transformOrigin: "bottom center",
                      }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Device Breakdown */}
          <div className="bg-slate-800 p-6 rounded-2xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4">💻 Device Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceChartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  activeIndex={activeDeviceIndex}
                  onMouseEnter={(_, index) => setActiveDeviceIndex(index)}
                  onMouseLeave={() => setActiveDeviceIndex(null)}
                  label
                >
                  {deviceChartData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                      style={{
                        transform: activeDeviceIndex === index ? "scale(1.07)" : "scale(1)",
                        filter: activeDeviceIndex === index
                          ? `drop-shadow(0 0 10px ${COLORS[index % COLORS.length]})`
                          : "none",
                        transition: "all 0.3s ease",
                        transformOrigin: "center",
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Visitor Countries */}
          <div className="bg-slate-800 p-6 rounded-2xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4">🌍 Visitor Countries</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={countryChartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  activeIndex={activeCountryIndex}
                  onMouseEnter={(_, index) => setActiveCountryIndex(index)}
                  onMouseLeave={() => setActiveCountryIndex(null)}
                  label
                >
                  {countryChartData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                      style={{
                        transform: activeCountryIndex === index ? "scale(1.07)" : "scale(1)",
                        filter: activeCountryIndex === index
                          ? `drop-shadow(0 0 10px ${COLORS[index % COLORS.length]})`
                          : "none",
                        transition: "all 0.3s ease",
                        transformOrigin: "center",
                      }}
                    />
                  ))}
                </Pie>
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Time-based Traffic */}
          <div className="bg-slate-800 p-6 rounded-2xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4">⏱ Time-based Traffic</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeChartData}>
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{
                    stroke: "#22c55e",
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                    fill: "#fff",
                    stroke: "#22c55e",
                    strokeWidth: 2,
                  }}
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
