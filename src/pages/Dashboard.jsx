import { useContext, useEffect, useState } from "react";
import images from "../assets/img/assets";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { TbRefresh } from "react-icons/tb";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const [summary, setSummary] = useState({});
  const [grade, setGrade] = useState("");

  // filter
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  //   chart
  const [chartData, setChartData] = useState([]);
  const [chartType, setChartType] = useState("line");

  const token = localStorage.getItem("token");
  const userId = user?.id;

  // Generate daftar tahun
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i <= currentYear + 6; i++) {
      years.push(i);
    }
    return years;
  };

  // generate bulan
  const monthNames = {
    1: "Januari",
    2: "Februari",
    3: "Maret",
    4: "April",
    5: "Mei",
    6: "Juni",
    7: "Juli",
    8: "Agustus",
    9: "September",
    10: "Oktober",
    11: "November",
    12: "Desember",
  };

  // emoticon
  const gradeMap = {
    "Keuangan Anda Sangat Mengesankan": images[8],
    "Keuangan Anda Mengesankan": images[9],
    "Keuangan Anda Seimbang": images[4],
    "Keuangan Anda Payah": images[5],
  };

  const gradeImage = gradeMap[grade];

  // fetch summary
  const fetchSummary = async (selectedMonth = "", selectedYear = year) => {
    try {
      const url = `https://brewokode.space/api/transaction/${userId}/summary-by-input?month=${selectedMonth}&year=${selectedYear}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (selectedMonth) {
        setSummary(response.data?.monthly_summary);
        setGrade(response.data?.monthly_summary.grade || "");
      } else if (selectedYear) {
        setSummary(response.data?.yearly_summary);
        setGrade(response.data?.yearly_summary.grade || "");
      } else {
        setSummary(response.data?.total_summary);
        setGrade(response.data?.total_summary.grade || "");
      }
    } catch (err) {
      console.error("Gagal fetch transactions:", err);
    }
  };

  // fetch chart
  const fetchChart = async (selectedMonth = "", selectedYear = year) => {
    try {
      const url = `https://brewokode.space/api/transaction/${userId}/chart?month=${selectedMonth}&year=${selectedYear}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      setChartData(response.data?.chart || []);
    } catch (err) {
      console.error("Gagal fetch chart:", err);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchChart();
  }, []);
  return (
    <div className="lg:p-6 space-y-6 mb-3">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h1>
      <div className="flex flex-col gap-3 gap-1 bg-white shadow-md px-4 pt-6 pb-10 rounded">
        {/* Kartu Statistik */}
        <div>
          <div className="flex flex-row gap-2 lg:gap-4">
            <div>
              <select
                value={month}
                onChange={(e) => {
                  const m = e.target.value;
                  setMonth(m);
                  fetchSummary(m, year);
                  fetchChart(m, year);
                }}
                className="w-full bg-gray-200 border cursor-pointer border-gray-300 rounded p-1 focus:outline-none focus:ring-1 focus:ring-green-600"
              >
                <option value="" className="bg-gray-400">
                  Bulan
                </option>
                {Object.entries(monthNames).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={year}
                onChange={(e) => {
                  const y = e.target.value;
                  setYear(y);
                  fetchSummary(month, y);
                  fetchChart(month, y);
                }}
                className="w-full bg-gray-200 border cursor-pointer border-gray-300 rounded p-1 focus:outline-none focus:ring-1 focus:ring-green-600"
              >
                <option value="" className="bg-gray-400">
                  Tahun
                </option>
                {generateYears().map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <button
                onClick={() => {
                  setMonth("");
                  setYear("");
                  fetchSummary("", "");
                  fetchChart("", "");
                }}
                className="flex  justify-center items-center gap-1 w-full bg-gray-200 border cursor-pointer border-gray-300 rounded py-1 px-2 focus:outline-none focus:ring-1 focus:ring-green-600"
              >
                <TbRefresh />
                Reset
              </button>
            </div>
          </div>
          <div className="mt-3">
            {month === "" && year === "" ? (
              <h3 className="font-semibold text-gray-800 text-lg">Semua Ringkasan Keuangan Anda</h3>
            ) : month === "" && year !== "" ? (
              <h3 className="font-semibold text-gray-800 text-lg">Ringkasan Keuangan Anda Tahun {year}</h3>
            ) : (
              <h3 className="font-semibold text-gray-800 text-lg">
                Ringkasan Keuangan Anda Bulan {monthNames[month]} {new Date().getFullYear()}
              </h3>
            )}
          </div>
          <div className="grid lg:grid-cols-4 grid-cols-2 lg:gap-5 gap-3 mb-2">
            <div className="bg-yellow-600 text-slate-50 shadow-ku rounded-lg p-4 flex flex-col items-center justify-center hover:shadow-xl transition duration-300 cursor-pointer">
              <img src={images[1]} className="lg:w-24 w-22 lg:h-24 h-22" alt="" />
              <h2 className="text-sm mt-2">Total Pemasukan</h2>
              <p className="lg:text-2xl text-lg font-bold ">Rp {Number(summary?.income || 0).toLocaleString("id-ID")}</p>
            </div>
            <div className="bg-red-700 text-slate-50 shadow-ku rounded-lg p-4 flex flex-col items-center justify-center hover:shadow-xl transition duration-300 cursor-pointer">
              <img src={images[2]} className="lg:w-24 w-22 lg:h-24 h-22" alt="" />
              <h2 className="text-sm mt-2">Total Pengeluaran</h2>
              <p className="lg:text-2xl text-lg font-bold ">Rp {Number(summary?.expense || 0).toLocaleString("id-ID")}</p>
            </div>
            <div className="bg-green-600 text-slate-50 shadow-ku rounded-lg p-4 flex flex-col items-center justify-center hover:shadow-xl transition duration-300 cursor-pointer">
              <img src={images[3]} className="lg:w-22 w-22 lg:h-22  h-22" alt="" />
              <h2 className="text-sm mt-2">Balance</h2>
              <p className="lg:text-2xl text-lg font-bold ">Rp {Number(summary?.balance || 0).toLocaleString("id-ID")}</p>
            </div>
            <div
              className={`${
                summary?.income === 0 && summary?.expense === 0 ? "bg-slate-800" : grade === "Keuangan Anda Payah" ? "bg-red-600" : grade === "Keuangan Anda Seimbang" ? "bg-yellow-600" : "bg-green-500"
              } text-slate-50 shadow-ku rounded-lg p-4 flex flex-col items-center justify-center hover:shadow-xl transition duration-300 cursor-pointer`}
            >
              <img src={summary?.income === 0 && summary?.expense === 0 ? images[10] : gradeImage} className="lg:w-20 w-16 lg:h-20 h-16" alt="grade emoticon" />
              <h2 className="text-sm mt-2">Status</h2>
              <p className="text-lg font-bold text-center">{summary?.income === 0 && summary?.expense === 0 ? "Tidak Ada Transaksi" : grade}</p>
            </div>
          </div>
        </div>
        <div className="my-4 w-full h-0.5 rounded-full  bg-gray-300"></div>
        {/* Grafik */}
        <div>
          <div className=" w-31 mb-6">
            <select value={chartType} onChange={(e) => setChartType(e.target.value)} className="w-full bg-gray-200 border cursor-pointer border-gray-300 rounded p-1 focus:outline-none focus:ring-1 focus:ring-green-600">
              <option value="bar">Grafik Bar</option>
              <option value="line">Grafik Line</option>
            </select>
          </div>
          <div className="text-gray-700 font-semibold mb-3">
            {month === "" && year === "" ? (
              <p className="font-semibold text-gray-800 text-lg">Grafik Semua Keuangan Anda</p>
            ) : month === "" && year !== "" ? (
              <p className="font-semibold text-gray-800 text-lg">Grafik Keuangan Anda Tahun {year}</p>
            ) : (
              <p className="font-semibold text-gray-800 text-lg">
                Grafik Keuangan Anda Bulan {monthNames[month]} {new Date().getFullYear()}
              </p>
            )}
          </div>
          <div className="mb-5 bg-gray-50 lg:py-8 py-4 rounded-lg shadow-lg lg:px-2 px-0">
            {chartType === "line" ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={month ? "day" : "month"} tickFormatter={(val) => (month ? val : monthNames[val])} />
                  <YAxis domain={[0, "dataMax"]} tickFormatter={(value) => (value / 1_000_000).toFixed(1) + " Jt"} />
                  <Tooltip formatter={(value) => `Rp ${Number(value).toLocaleString("id-ID")}`} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#16a34a" name="Pemasukan" strokeWidth={2} />
                  <Line type="monotone" dataKey="expense" stroke="#dc2626" name="Pengeluaran" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={month ? "day" : "month"} tickFormatter={(val) => (month ? val : monthNames[val])} />
                  <YAxis domain={[0, "dataMax"]} tickFormatter={(value) => (value / 1_000_000).toFixed(1) + " Jt"} />
                  <Tooltip formatter={(value) => `Rp ${Number(value).toLocaleString("id-ID")}`} labelFormatter={(label) => (month ? `Hari ${label}` : `Bulan ${monthNames[label]}`)} />
                  <Legend />
                  <Bar dataKey="income" fill="#16a34a" name="Pemasukan" />
                  <Bar dataKey="expense" fill="#dc2626" name="Pengeluaran" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
