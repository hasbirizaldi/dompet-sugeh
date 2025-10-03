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
  const [data, setData] = useState([]);
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
      setData(response.data || []);
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
      <h1 className="lg:text-2xl text-lg font-bold text-gray-800 dark:text-slate-100 mb-2 transition-all duration-500">Dashboard</h1>
      <div className="flex flex-col gap-3 bg-white dark:bg-slate-900 transition-all duration-500 shadow-md px-3 lg:px-4 pt-6 pb-10 rounded lg:rounded-xl border-1 border-white dark:border-slate-300">
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
                className="w-full h-8 bg-gray-200 dark:bg-slate-950 text-slate-950 dark:text-slate-200 border cursor-pointer border-gray-300 rounded p-1 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all duration-500"
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
                className="w-24 h-8 bg-gray-200 dark:bg-slate-950 text-slate-950 dark:text-slate-200 border cursor-pointer border-gray-300 rounded p-1 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all duration-500"
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
                className="flex justify-center items-center gap-1 w-20 h-8 bg-gray-200 dark:bg-slate-950 text-slate-950 dark:text-slate-200 border cursor-pointer border-gray-300 rounded p-1 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all duration-500"
              >
                <TbRefresh />
                Reset
              </button>
            </div>
          </div>
          <div className="mt-3 mb-1 transition-all duration-500">
            {month === "" && year === "" ? (
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 lg:text-lg text-[15px]">Semua Ringkasan Keuangan Anda</h3>
            ) : month === "" && year !== "" ? (
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 lg:text-lg text-[15px]">Ringkasan Keuangan Anda Tahun {year}</h3>
            ) : (
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 lg:text-lg text-[15px]">
                Ringkasan Keuangan Anda Bulan {monthNames[month]} {new Date().getFullYear()}
              </h3>
            )}
          </div>
          <div className="grid lg:grid-cols-4 grid-cols-2 lg:gap-5 gap-3 mb-2 transition-all duration-500">
            <div className="bg-green-700 dark:bg-green-900 text-slate-50 shadow-ku rounded-lg lg:p-4 p-2 flex flex-col items-center justify-center hover:shadow-xl transition duration-300 cursor-pointer">
              <img src={images[1]} className="lg:w-24 w-22 lg:h-24 h-22" alt="" />
              <h2 className="lg:text-sm text-[12px] mt-2">Total Pemasukan</h2>
              <p className="lg:text-2xl text-base font-bold ">Rp {Number(summary?.income || 0).toLocaleString("id-ID")}</p>
            </div>
            <div className="bg-red-700 dark:bg-red-900 text-slate-50 shadow-ku rounded-lg lg:p-4 p-2 flex flex-col items-center justify-center hover:shadow-xl transition duration-300 cursor-pointer">
              <img src={images[2]} className="lg:w-24 w-22 lg:h-24 h-22" alt="" />
              <h2 className="lg:text-sm text-[12px] mt-2">Total Pengeluaran</h2>
              <p className="lg:text-2xl text-base font-bold ">Rp {Number(summary?.expense || 0).toLocaleString("id-ID")}</p>
            </div>
            <div className="bg-blue-800 dark:bg-blue-900 text-slate-50 shadow-ku rounded-lg lg:p-4 p-2 flex flex-col items-center justify-center hover:shadow-xl transition duration-300 cursor-pointer">
              <img src={images[3]} className="lg:w-22 w-22 lg:h-22  h-22" alt="" />
              <h2 className="lg:text-sm text-[12px] mt-2">Balance</h2>
              <p className="lg:text-2xl text-base font-bold ">Rp {Number(summary?.balance || 0).toLocaleString("id-ID")}</p>
            </div>
            <div
              className={`${
                summary?.income === 0 && summary?.expense === 0
                  ? "bg-slate-800 dark:bg-slate-950"
                  : grade === "Keuangan Anda Payah"
                  ? "bg-red-600 dark:bg-red-700/90"
                  : grade === "Keuangan Anda Seimbang"
                  ? "bg-yellow-600 dark:bg-yellow-800"
                  : "bg-green-500 dark:bg-green-900"
              } text-slate-50 shadow-ku rounded-lg lg:p-4 p-2 flex flex-col items-center justify-center hover:shadow-xl transition duration-300 cursor-pointer`}
            >
              <img src={summary?.income === 0 && summary?.expense === 0 ? images[10] : gradeImage} className="lg:w-20 w-16 lg:h-20 h-16" alt="grade emoticon" />
              <h2 className="lg:text-sm text-[12px] mt-2">Status</h2>
              <p className="lg:text-lg font-bold text-center text-[14px]">{summary?.income === 0 && summary?.expense === 0 ? "Tidak Ada Transaksi" : grade}</p>
            </div>
          </div>
        </div>
        <div className="my-5 w-full h-0.5 rounded-full  bg-gray-300 dark:bg-gray-600 transition-all duration-500"></div>
        {/* Grafik */}
        <div>
          <div className="flex gap-4">
            <div className=" w-31 mb-6">
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="w-full h-8 bg-gray-200 dark:bg-gray-950 border cursor-pointer border-gray-300 text-slate-950 dark:text-slate-200 rounded p-1 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all duration-500"
              >
                <option value="bar">Grafik Bar</option>
                <option value="line">Grafik Line</option>
              </select>
            </div>
          </div>
          <div className="text-gray-800 dark:text-slate-100 font-semibold mb-3">
            {month === "" && year === "" ? (
              <p className="font-semibold lg:text-lg text-[15px]">Grafik Keuangan Anda Tahun {data.year}</p>
            ) : month === "" && year !== "" ? (
              <p className="font-semibold lg:text-lg text-[15px]">Grafik Keuangan Anda Tahun {year}</p>
            ) : (
              <p className="font-semibold lg:text-lg text-[15px]">
                Grafik Keuangan Anda Bulan {monthNames[month]} {new Date().getFullYear()}
              </p>
            )}
          </div>
          <div className="mb-5 bg-gray-50 dark:bg-slate-950 lg:py-8 py-4 rounded-lg shadow-lg lg:px-2 px-0 transition-all duration-500">
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
            <div className="grid grid-cols-2 w-[250px] lg:mt-0 mt-2 text-sm lg:text-base transition-all duration-500">
              <div>
                <div className="flex items-center gap-1">
                  <div className={`h-3 w-3 bg-green-600 ${chartType === "line" ? "rounded-full" : ""}`}></div>
                  <span className="text-slate-950 dark:text-slate-100">Pemasukan</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`h-3 w-3 bg-red-600 ${chartType === "line" ? "rounded-full" : ""}`}></div>
                  <span className="text-slate-950 dark:text-slate-100">Pengeluaran</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 bg-transparent"></div>
                  <span className="text-slate-950 dark:text-slate-100">Balance</span>
                </div>
              </div>
              <div className="text-slate-950 dark:text-slate-100">
                <div className="flex items-center gap-1">: Rp {Number(data?.total_income || 0).toLocaleString("id-ID")}</div>
                <div className="flex items-center gap-1">: Rp {Number(data?.total_expense || 0).toLocaleString("id-ID")}</div>
                <div className="flex items-center gap-1">: Rp {Number(data?.balance || 0).toLocaleString("id-ID")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
