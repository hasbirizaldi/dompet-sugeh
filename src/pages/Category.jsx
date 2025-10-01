import { useContext, useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { FaPlusCircle } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { alertConfirm, alertError, alertSuccess } from "../lib/alert";

const Category = () => {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem("token");
  const userId = user?.id;

  const [newCategory, setNewCategory] = useState({
    name: "",
    type: "income",
  });

  // Submit kategori
  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    if (!token || !userId) return;

    try {
      if (isEditing) {
        // Edit
        const response = await axios.patch(
          `https://brewokode.space/api/category/${userId}/${editId}`,
          {
            name: newCategory.name,
            type: newCategory.type,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        setIsEditing(false);
        setNewCategory({ name: "", type: "income" });
        setShowModal(false);
        setCategories((prev) => {
          return prev.map((cat) => (cat.id === editId ? response.data.category : cat));
        });
        await alertSuccess("Kategori berhasil diubah");
      } else {
        // Tambah
        const response = await axios.post(
          `https://brewokode.space/api/category/${userId}`,
          {
            name: newCategory.name,
            type: newCategory.type,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        setNewCategory({ name: "", type: "income" });
        setShowModal(false);
        setCategories([...categories, response.data.category]);
        await alertSuccess("Kategori berhasil ditambahkan");
      }
    } catch (err) {
      console.error("Terjadi Kesalahan!:", err);
      alertError("Terjadi Kesalahan!");
    }
  };

  // Open edit modal
  const handleEditClick = (category) => {
    setIsEditing(true);
    setEditId(category.id);
    setNewCategory({
      name: category.name,
      type: category.type,
    });
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditId(null);
    setNewCategory({ name: "", type: "income" });
  };
  // fetch categories
  const fetchcategories = async (url = `https://brewokode.space/api/category/${userId}`) => {
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

  // delete category
  const deleteCategory = async (categoryId) => {
    if (!token || !userId) return;

    const result = await alertConfirm("Menghapus kategori juga akan menghapus data transaksi dengan kategori sama?");
    if (!result) return;

    try {
      await axios.delete(`https://brewokode.space/api/category/${userId}/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      // Hapus dari state tanpa fetch ulang
      setCategories((prev) => prev.filter((trx) => trx.id !== categoryId));
      await alertSuccess("Kategori berhasil dihapus");
    } catch (err) {
      console.error("Gagal menghapus transaksi:", err);
      alertError("Terjadi kesalahan saat menghapus transaksi");
    }
  };

  useEffect(() => {
    fetchcategories();
  }, []);
  return (
    <div className="lg:p-6 space-y-6 mb-3">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Kategori</h1>

      {/* Tabel Transaksi Terbaru */}
      <div className="bg-white shadow-nav rounded-lg p-6 ">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-700 font-semibold ">Semua Kategory</h2>
          <button onClick={() => setShowModal(true)} className="flex justify-center items-center gap-1 bg-blue-600 text-white py-1.5 px-4 cursor-pointer hover:bg-blue-800 transition rounded-lg font-semibold">
            <FaPlusCircle />
            Tambah Kategori
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : categories && categories.length > 0 ? (
                categories.map((category, index) => (
                  <tr key={category?.id || index} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>

                    <td className="px-6 py-4 whitespace-nowrap">{category?.name}</td>
                    <td className={`px-6 py-4 whitespace-nowrap capitalize ${category?.type === "income" ? "text-green-600" : "text-red-600"}`}>{category?.type === "income" ? "Pemasukan" : "Pengeluaran"}</td>
                    <td className="px-6 py-4 whitespace-nowrap flex justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleEditClick(category)}
                        className="font-semibold flex justify-center items-center gap-1 bg-green-600 text-white px-2 py-1.5 cursor-pointer shadow-nav rounded-lg hover:bg-green-700 transition text-sm"
                      >
                        <MdEdit className="text-lg lg:block hidden" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCategory(category.id)}
                        className="font-semibold flex justify-center items-center gap-1 bg-red-600 text-white px-2 py-1.5 cursor-pointer shadow-nav rounded-lg hover:bg-red-700 transition text-sm"
                      >
                        <MdDelete className="text-lg lg:block hidden" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    Tidak ada transaksi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Kategori */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 ">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm lg:max-w-xl">
            <h3 className="text-2xl font-semibold mb-4">{isEditing ? "Edit kategory" : "Tambah Kategori"}</h3>
            <form onSubmit={handleSubmitCategory} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-base mb-1">Nama Kategori</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-green-600"
                  placeholder="Masukkan nama kategori"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-base mb-1">Tipe</label>
                <select value={newCategory.type} onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-green-600">
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={resetForm} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-400 transition">
                  Batal
                </button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer">
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

export default Category;
