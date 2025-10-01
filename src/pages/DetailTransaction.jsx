import { useContext, useEffect, useState } from "react";
import { MdArrowBack } from "react-icons/md";
import { Link, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { alertError } from "../lib/alert";
import axios from "axios";

const DetailTransaction = () => {
  const { trxId } = useParams();
  const { user } = useContext(AuthContext);

  const [transaction, setTransaction] = useState(null);

  const token = localStorage.getItem("token");
  const userId = user.id;

  useEffect(() => {
    const getTransactionById = async () => {
      try {
        const response = await axios.get(`https://brewokode.space/api/transaction-detail/${userId}/${trxId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        setTransaction(response.data.transaction);
      } catch (err) {
        console.error("Terjadi Kesalahan!: ", err);
        alertError("Gagal memuat detail transaksi!");
      }
    };

    if (user?.id && token) getTransactionById();
  }, [trxId]);

  return (
    <div className="lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Detail Transaksi</h1>
      </div>

      {/* Card Detail Transaksi */}
      <div className={`w-[100%] shadow-nav rounded-lg p-9 lg:py-10 mb-9 bg-white border-dashed border-3 ${transaction?.category?.type === "income" ? "border-green-600/60" : "border-red-600/60"}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-y-8 gap-y-4">
          <div>
            <div className="font-bold text-gray-700">Kategori</div>
            <div className="text-gray-900">{transaction?.category?.name || "Memuat data..."}</div>
          </div>

          <div>
            <div className="font-bold text-gray-700">Tanggal Transaksi</div>
            <div className="text-gray-900">
              {transaction !== null
                ? new Date(transaction?.transaction_date).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "Memuat data..."}
            </div>
          </div>

          <div>
            <div className="font-bold text-gray-700">Nominal</div>
            <div className="text-gray-900">Rp {Number(transaction?.amount || 0).toLocaleString("id-ID")}</div>
          </div>
          <div>
            <div className="font-bold text-gray-700">Jenis Transaksi</div>
            <div className={`text-gray-900 ${transaction?.category?.type === "income" ? "text-green-600" : "text-red-600"}`}>
              {transaction !== null ? (transaction?.category?.type === "income" ? "Pemasukan" : "Pengeluaran") : "Memuat data..."}
            </div>
          </div>
          <div>
            <div className="font-bold text-gray-700">Metode Pembayaran</div>
            <div className="text-gray-900">
              {transaction !== null
                ? transaction?.payment_method === "cash"
                  ? "Cash"
                  : transaction?.payment_method === "bank_transfer"
                  ? "Transfer Bank"
                  : transaction?.payment_method === "e_wallet"
                  ? "E-Wallet"
                  : transaction?.payment_method === "credit_card"
                  ? "Kartu Kredit"
                  : "Kartu Debit"
                : "Memuat data..."}
            </div>
          </div>

          <div>
            <div className="font-bold text-gray-700">Catatan</div>
            <div className="text-gray-900">{transaction?.notes || "Memuat data..."}</div>
          </div>
        </div>
      </div>

      <Link to="/transaction" className=" w-30 font-semibold px-4 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-1">
        <MdArrowBack className="text-lg " /> Kembali
      </Link>
    </div>
  );
};

export default DetailTransaction;
