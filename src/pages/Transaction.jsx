import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { alertConfirm, alertError, alertSuccess } from "../lib/alert";
import { AuthContext } from "../context/AuthContext";
import { MdEdit, MdDelete, MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from "react-icons/md";
import { FaFileExcel, FaPlusCircle } from "react-icons/fa";
import { BiDetail } from "react-icons/bi";
import { Link } from "react-router-dom";
import { IoSearch } from "react-icons/io5";
import * as XLSX from "xlsx";
import { TbRefresh } from "react-icons/tb";

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({});
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [trxId, setTrxId] = useState(null);

  // filter
  const [filterType, setFilterType] = useState("all");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");
  const userId = user?.id;

  const [form, setForm] = useState({
    category_id: "",
    transaction_date: "",
    payment_method: "",
    amount: "",
    notes: "",
  });

  const handleChangeInput = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token || !userId) return;

    try {
      if (isEditing && trxId) {
        // Update
        const response = await axios.patch(`https://brewokode.space/api/transaction/${userId}/${trxId}`, form, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        setTransactions((prev) => prev.map((trx) => (trx.id === trxId ? response.data.transaction : trx)));
        alertSuccess("Transaksi berhasil diupdate");
      } else {
        // Create
        const response = await axios.post(`https://brewokode.space/api/transaction/${userId}`, form, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        setTransactions((prev) => [response.data.transaction, ...prev]);
        alertSuccess("Transaksi berhasil ditambahkan");
      }
      resetForm();
      fetchTransactions();
    } catch (err) {
      if (err.response) {
        console.error("Validation errors:", err.response.data);
        alertError(JSON.stringify(err.response.data.errors));
      }
      console.error("Terjadi Kesalahan!:", err);
      alertError("Terjadi Kesalahan!");
    }
  };

  // export
  // === Export ke Excel ===
  const exportToExcel = async () => {
    try {
      // panggil endpoint export backend (tanpa paginate)
      const response = await axios.get(`https://brewokode.space/api/transaction/${user.id}/export`, {
        params: {
          month: filterMonth,
          year: filterYear,
          type: filterType !== "all" ? filterType : null,
          search: search,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
      });

      const data = response.data.data;

      if (!data || data.length === 0) {
        alertError("Tidak ada data untuk diexport");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(
        data.map((trx, index) => ({
          No: index + 1,
          Tanggal: new Date(trx.transaction_date).toLocaleDateString("id-ID"),
          Catatan: trx.notes || "-",
          Nominal: `Rp ${Number(trx.amount || 0).toLocaleString("id-ID")}`,
          Jenis: trx.category.type === "income" ? "Pemasukan" : "Pengeluaran",
          Pembayaran: trx.payment_method === "cash" ? "Cash" : trx.payment_method === "bank_transfer" ? "Transfer Bank" : trx.payment_method === "e_wallet" ? "E-Walet" : trx.payment_method === "credit_card" ? "Credit Card" : "Debid Card",
        }))
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");
      XLSX.writeFile(workbook, "transaksi.xlsx");

      alertSuccess("Data berhasil diexport ke Excel");
    } catch (err) {
      console.error(err);
      alertError("Gagal export data");
    }
  };

  // fetch transaksi
  const fetchTransactions = async (url = null) => {
    if (!token || !userId) {
      setLoading(false);
      return;
    }

    try {
      let baseUrl = url || `https://brewokode.space/api/transaction/${userId}`;
      const params = new URLSearchParams();

      // kalau URL sudah ada query (misal ?page=2), merge
      if (filterType !== "all") params.append("type", filterType);
      if (filterMonth) params.append("month", filterMonth);
      if (filterYear) params.append("year", filterYear);
      if (search) params.append("search", search);

      if (baseUrl.includes("?")) {
        baseUrl += `&${params.toString()}`;
      } else if (params.toString()) {
        baseUrl += `?${params.toString()}`;
      }

      const response = await axios.get(baseUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      setTransactions(response.data.transactions.data);
      setMeta(response.data.transactions);
      setLinks(response.data.transactions.links);
    } catch (err) {
      console.error("Gagal fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (trxId) => {
    if (!token || !userId) return;

    const result = await alertConfirm("Apakah anda yakin akan menghapus data transaksi ini?");
    if (!result) return;

    try {
      await axios.delete(`https://brewokode.space/api/transaction/${userId}/${trxId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      // Hapus dari state tanpa fetch ulang
      setTransactions((prev) => prev.filter((trx) => trx.id !== trxId));
      await alertSuccess("Transaksi berhasil dihapus");
    } catch (err) {
      console.error("Gagal menghapus transaksi:", err);
      alertError("Terjadi kesalahan saat menghapus transaksi");
    }
  };

  // open edit modal
  const handleEditClick = (trx) => {
    setIsEditing(true);
    setTrxId(trx.id);
    setForm({
      category_id: trx.category_id,
      transaction_date: trx.transaction_date,
      payment_method: trx.payment_method,
      amount: trx.amount,
      notes: trx.notes,
    });
    setShowModal(true);
  };
  // fetch categories
  const fetchCategories = async (url = `https://brewokode.space/api/category/${userId}`) => {
    if (!token || !userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      setCategories(response.data.categories);
    } catch (err) {
      console.error("Gagal fetch transactions:", err);
      alertError("terjadi Kesahahan!");
    } finally {
      setLoading(false);
    }
  };
  // Reset form
  const resetForm = () => {
    setForm({
      category_id: "",
      transaction_date: "",
      payment_method: "",
      amount: "",
      notes: "",
    });
    setTrxId(null);
    setShowModal(false);
    setIsEditing(false);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchTransactions();
    }, 500); // delay 500ms

    return () => clearTimeout(delay);
  }, [filterType, filterMonth, filterYear, search]);

  useEffect(() => {
    fetchCategories();
  }, []);
  return (
    <div className="lg:p-6 space-y-6 mb-3">
      <h1 className="lg:text-2xl text-lg font-bold text-gray-800 dark:text-slate-50 mb-2 transition-all duration-500">Transaksi</h1>

      {/* Tabel Transaksi Terbaru */}
      <div className="bg-white dark:bg-slate-900 border-1 border-white dark:border-slate-300 shadow-nav rounded-lg lg:p-6 p-2 transition-all duration-500">
        <div className="flex gap-5 flex-col justify-between">
          <div className="flex lg:flex-row flex-col lg:gap-2 gap-3 lg:mb-0 mb-4">
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full h-8  bg-gray-300 dark:bg-slate-950 text-slate-950 dark:text-slate-100  border cursor-pointer border-gray-300 rounded p-1 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all duration-500"
              >
                <option value="all" className="">
                  Semua Transaksi
                </option>
                <option value="income" className="">
                  Pemasukan
                </option>
                <option value="expense" className="">
                  Pengeluaran
                </option>
              </select>
            </div>
            <div>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full h-8 bg-gray-200 border cursor-pointer border-gray-300 dark:bg-slate-950 text-slate-950 dark:text-slate-100 rounded p-1 focus:outline-none focus:ring-1 focus:ring-ray-400 transition-all duration-500"
              >
                <option value="">Bulan</option>
                <option value="1">Januari</option>
                <option value="2">Februari</option>
                <option value="3">Maret</option>
                <option value="4">April</option>
                <option value="5">Mei</option>
                <option value="6">Juni</option>
                <option value="7">Juli</option>
                <option value="8">Agustus</option>
                <option value="9">September </option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
              </select>
            </div>
            <div>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full h-8 bg-gray-200 border cursor-pointer border-gray-300 rounded p-1 dark:bg-slate-950 text-slate-950 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all duration-500"
              >
                <option value="">Tahun</option>
                {Array.from({ length: 6 }, (_, i) => {
                  const year = new Date().getFullYear() + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <button
                onClick={() => {
                  setFilterMonth("");
                  setFilterYear("");
                  setFilterType("all");
                  setSearch("");
                }}
                className="flex  justify-center items-center gap-1 w-full h-8 dark:bg-slate-950 text-slate-950 dark:text-slate-100 bg-gray-200 border cursor-pointer border-gray-300 rounded p-1 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all duration-500"
              >
                <TbRefresh />
                Reset
              </button>
            </div>
            <div className="relative lg:absolute lg:right-15">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pencarian (Catatan/Nominal)"
                className="lg:w-73 w-full border text-slate-950 dark:text-slate-100 border-gray-300 rounded-lg p-1 h-8 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all duration-500"
              />
              <IoSearch className="absolute right-4 top-2 text-lg text-gray-500" />
            </div>
          </div>
          <div className="flex items-center lg:gap-4 gap-2 mb-4">
            <button
              onClick={() => setShowModal(true)}
              className="flex justify-center items-center h-8 gap-1 bg-blue-600 dark:bg-blue-900 text-white dark:text-slate-100 py-1.5 lg:px-4 px-2 cursor-pointer hover:bg-blue-800 transition rounded font-semibold lg:text-sm text-[14px] transition-all duration-500"
            >
              <FaPlusCircle />
              <span>Tambah Transaksi</span>
            </button>
            <div className="relative inline-block text-left">
              {/* Button */}
              <button
                onClick={exportToExcel}
                className="flex items-center gap-1 h-8 bg-slate-700 text-white dark:text-slate-100 py-1.5 lg:px-4 px-2 rounded font-semibold hover:bg-slate-500 transition cursor-pointer lg:text-sm text-[14px] transition-all duration-500"
              >
                <FaFileExcel className="text-white" /> Export Excel
              </button>
            </div>
          </div>
        </div>
        <div className="lg:block hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 transition-all duration-500">
                <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Catatan</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nominal</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Jenis Transaksi</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"> Pembayaran</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-600 transition-all duration-500">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-100">
                    Memuat data...
                  </td>
                </tr>
              ) : transactions && transactions.length > 0 ? (
                transactions.map((trx, index) => (
                  <tr key={trx.id || index} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                    <td className="px-2 py-4 whitespace-nowrap text-slate-950 dark:text-slate-100"> {(meta.current_page - 1) * meta.per_page + (index + 1)}</td>

                    <td className="px-6 py-4 whitespace-nowrap text-slate-950 dark:text-slate-100">
                      {new Date(trx.transaction_date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-950 dark:text-slate-100"> {trx?.notes ? (trx.notes && trx.notes.length > 20 ? trx.notes.slice(0, 20) + "..." : trx.notes) : "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-950 dark:text-slate-100"> Rp {Number(trx.amount || 0).toLocaleString("id-ID")}</td>
                    <td className={`px-6 py-4 whitespace-nowrap font-semibold capitalize ${trx?.category_type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {trx?.category_type === "income" ? "Pemasukan" : "Pengeluaran"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize text-slate-950 dark:text-slate-100">
                      {trx.payment_method === "cash"
                        ? "Cash"
                        : trx.payment_method === "bank_transfer"
                        ? "Transfer Bank"
                        : trx.payment_method === "e_wallet"
                        ? "E-Wallet"
                        : trx.payment_method === "credit_card"
                        ? "Kartu Kredit"
                        : "Kartu Debit"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex gap-2 justify-center">
                      <Link to={`/transaction-detail/${trx.id}`} className="font-semibold flex justify-center items-center gap-0.5 bg-gray-600 text-white px-2 py-1 cursor-pointer shadow-nav rounded hover:bg-gray-800 transition text-sm">
                        <BiDetail className="text-base" />
                        Detail
                      </Link>
                      <button
                        onClick={() => handleEditClick(trx)}
                        type="button"
                        className="font-semibold flex justify-center items-center gap-0.5 bg-green-600 dark:bg-green-700 text-white px-2 py-1 cursor-pointer shadow-nav rounded hover:bg-green-700 dark:hover:bg-green-800 transition text-sm"
                      >
                        <MdEdit className="text-base" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTransaction(trx.id)}
                        type="button"
                        className="font-semibold flex justify-center items-center gap-0.5 bg-red-600 dark:bg-red-700 text-white px-2 py-1 cursor-pointer shadow-nav rounded hover:bg-red-700 dark:hover:bg-red-800 transition text-sm"
                      >
                        <MdDelete className="text-base" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    Tidak ada data transaksi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {!loading && meta && links.length > 0 && (
            <div className="justify-between items-center mt-4 lg:flex hidden">
              <span className="text-sm text-gray-600">
                Halaman {meta.current_page} dari {meta.last_page}
              </span>
              <div className="flex gap-2 mt-3">
                {links.map((link, i) => {
                  // ambil nomor halaman dari label
                  const pageNum = Number(link.label);

                  // render tombol Previous / Next tetap tampil
                  const isPrevNext = link.label.includes("Previous") || link.label.includes("Next");

                  // filter: tampilkan hanya halaman aktif ± 2
                  if (!isPrevNext && (isNaN(pageNum) || pageNum < meta.current_page - 2 || pageNum > meta.current_page + 2)) {
                    return null;
                  }

                  let renderLabel = link.label;
                  if (link.label.includes("Previous")) renderLabel = <MdKeyboardDoubleArrowLeft className="text-base" />;
                  if (link.label.includes("Next")) renderLabel = <MdKeyboardDoubleArrowRight className="text-base" />;

                  return (
                    <button
                      key={i}
                      disabled={!link.url}
                      onClick={() => fetchTransactions(link.url)}
                      className={`px-3 py-1 rounded text-sm transition cursor-pointer
              ${link.active ? "bg-blue-700 dark:bg-blue-900 text-white font-semibold" : "bg-gray-200 dark:bg-gray-400 hover:bg-gray-300"}
              ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {renderLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {/* Mobile version */}
        {loading ? (
          <div className="lg:hidden block">
            <div className="text-center py-4 text-gray-500">Memuat data...</div>
          </div>
        ) : transactions && transactions.length > 0 ? (
          transactions.map((trx, index) => (
            <div
              key={index}
              className={`${trx?.category_type === "income" ? "border-green-700 bg-green-50/80 dark:bg-green-900/20" : "border-red-700 bg-red-50/80 dark:bg-red-900/20"} lg:hidden w-full border-dashed border-2 shadow-lg rounded-lg p-4 mb-9`}
            >
              <div className="grid grid-cols-2 gap-x-0 gap-y-3">
                <div>
                  <div className="font-bold text-gray-700 dark:text-slate-300">Tanggal Transaksi</div>
                  <div className="text-gray-900 dark:text-slate-100">
                    {new Date(trx.transaction_date).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-gray-700 dark:text-slate-300">Metode Pembayaran</div>
                  <div className="text-gray-900 dark:text-slate-100">
                    {trx.payment_method === "cash" ? "Cash" : trx.payment_method === "bank_transfer" ? "Transfer Bank" : trx.payment_method === "e_wallet" ? "E-Wallet" : trx.payment_method === "credit_card" ? "Kartu Kredit" : "Kartu Debit"}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-gray-700 dark:text-slate-300">Kategori</div>
                  <dd className="text-gray-900 dark:text-slate-100">{trx?.category_name}</dd>
                </div>
                <div>
                  <div className="font-bold text-gray-700 dark:text-slate-300">Jenis Transaksi</div>
                  <div className="text-gray-900 dark:text-slate-100">{trx?.category_type === "income" ? "Pemasukan" : "Pengeluaran"}</div>
                </div>
                <div>
                  <div className="font-bold text-gray-700 dark:text-slate-300">Nominal</div>
                  <div className="text-gray-900 dark:text-slate-100">Rp {Number(trx.amount || 0).toLocaleString("id-ID")}</div>
                </div>
              </div>
              <div className="my-4">
                <div className="font-bold text-gray-700 dark:text-slate-300">Catatan</div>
                <div className="text-gray-900 dark:text-slate-100">{trx?.notes}</div>
              </div>

              <div className="flex gap-2 justify-end">
                <Link
                  to={`/transaction-detail/${trx.id}`}
                  className="font-semibold flex justify-center items-center gap-0.5 bg-gray-600 dark:bg-gray-800 text-white px-2 py-1 cursor-pointer shadow-nav rounded hover:bg-gray-800 dark:hover:bg-gray-700 transition text-sm"
                >
                  <BiDetail className="text-base" />
                  Detail
                </Link>
                <button
                  onClick={() => handleEditClick(trx)}
                  type="button"
                  className="font-semibold flex justify-center items-center gap-0.5 bg-green-600 dark:bg-green-900 text-white px-2 py-1 cursor-pointer shadow-nav rounded hover:bg-green-700 transition text-sm"
                >
                  <MdEdit className="text-base" />
                  Edit
                </button>
                <button
                  onClick={() => deleteTransaction(trx.id)}
                  type="button"
                  className="font-semibold flex justify-center items-center gap-0.5 bg-red-600 dark:bg-red-800 text-white px-2 py-1 cursor-pointer shadow-nav rounded hover:bg-red-700 dark:hover:bg-red-700 transition text-sm"
                >
                  <MdDelete className="text-base" />
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div>
            <div className="text-center py-4 text-gray-500 lg:hidden block">Tidak ada data transaksi.</div>
          </div>
        )}

        {!loading && meta && links.length > 0 && (
          <div className="justify-between items-center mt-4 lg:hidden flex">
            <span className="text-[12px] text-gray-600 mt-5">
              Halaman {meta.current_page} dari {meta.last_page}
            </span>
            <div className="flex gap-2 mt-3">
              {links.map((link, i) => {
                // Ambil nomor halaman dari label
                const pageNum = Number(link.label);

                // Tetap tampilkan Previous / Next
                const isPrevNext = link.label.includes("Previous") || link.label.includes("Next");

                // Filter: hanya current_page - 1, current_page, current_page + 1
                if (!isPrevNext && (isNaN(pageNum) || pageNum < meta.current_page - 1 || pageNum > meta.current_page + 1)) {
                  return null;
                }

                let renderLabel = link.label;
                if (link.label.includes("Previous")) renderLabel = <MdKeyboardDoubleArrowLeft className="text-base" />;
                if (link.label.includes("Next")) renderLabel = <MdKeyboardDoubleArrowRight className="text-base" />;

                return (
                  <button
                    key={i}
                    disabled={!link.url}
                    onClick={() => fetchTransactions(link.url)}
                    className={`px-2 py-0.5 rounded text-[12px] transition cursor-pointer
              ${link.active ? "bg-blue-700 dark:bg-blue-900 text-white font-semibold" : "bg-gray-200 dark:bg-gray-400 hover:bg-gray-300"}
              ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {renderLabel}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Transaksi */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 ">
          <div className="bg-white dark:bg-slate-900 border-1 border-white dark:border-slate-300 rounded-2xl shadow-lg lg:p-8 p-4 w-[95%] max-w-sm lg:max-w-xl">
            <h3 className="text-2xl font-semibold mb-4 text-slate-950 dark:text-slate-100">{isEditing ? "Edit Transaksi" : "Transaksi Baru"}</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-gray-700 dark:text-slate-100 text-base mb-1">Kategori</label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChangeInput}
                  className="w-full h-10 border border-gray-300 text-gray-700 dark:text-slate-100 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-700"
                  required
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((category, index) => (
                    <option key={category.id || index} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-slate-100 text-base mb-1">Tanggal</label>
                <input
                  type="date"
                  name="transaction_date"
                  value={form.transaction_date}
                  onChange={handleChangeInput}
                  required
                  className="w-full h-10 border border-gray-300 text-gray-700 dark:text-slate-100 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-700"
                  placeholder="Masukan Tanggal Transaksi"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-slate-100 text-base mb-1">Nominal</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChangeInput}
                  required
                  className="w-full h-10 border text-gray-700 dark:text-slate-100 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-700"
                  placeholder="Masukkan nominal (Rp) "
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-slate-100 text-base mb-1">Metode Pembayaran</label>
                <select
                  name="payment_method"
                  value={form.payment_method}
                  onChange={handleChangeInput}
                  className="w-full h-10 border text-gray-700 dark:text-slate-100 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-700"
                  required
                >
                  <option value="">-- Pilih Jenis Pembayaran --</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Transfer Bank</option>
                  <option value="e_wallet">E-Wallet</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-slate-100 text-base mb-1">Catatan</label>
                <textarea
                  rows={4}
                  type="text"
                  name="notes"
                  value={form.notes}
                  onChange={handleChangeInput}
                  className="w-full border text-gray-700 dark:text-slate-100 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-700"
                  placeholder="Masukkan Catatan"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={resetForm} className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-slate-100 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-500 transition">
                  Batal
                </button>
                <button type="submit" className="bg-blue-600 dark:bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition cursor-pointer">
                  {isEditing ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transaction;
