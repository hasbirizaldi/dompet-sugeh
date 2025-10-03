import { FaUser, FaEnvelope, FaCalendarAlt, FaUpload } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useState } from "react";
import assets from "../assets/img/assets";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { alertError, alertSuccess } from "../lib/alert";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import axios from "axios";

const Profile = () => {
  const { user, loading } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const toggleEdit = () => {
    setEditMode(!editMode);
  };
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(f.type)) {
        return alertError("Format harus JPG/JPEG/PNG");
      }
      if (f.size > 2 * 1024 * 1024) {
        return alertError("Ukuran maksimal 2MB");
      }
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    const formData = new FormData(e.target);
    if (file) {
      formData.append("image", file);
    }

    try {
      await axios.post(`https://brewokode.space/api/profile/${userId}?_method=PATCH`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alertSuccess("Profil berhasil diperbarui");
      setEditMode(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alertError(err.response?.data?.message || "Terjadi kesalahan server");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="custom-loader"></div>
      </div>
    );
  }

  return (
    <div className="lg:p-6 mb-3">
      {/* Header */}
      <h1 className="lg:text-2xl text-lg font-bold text-gray-700 dark:text-slate-50 mb-2 transition-all duration-500">Profil Saya</h1>

      <div className="bg-white dark:bg-slate-900 border-1 border-white dark:border-slate-300 shadow-nav rounded-xl p-6 flex flex-col md:flex-row gap-6 transition-all duration-500">
        {/* Avatar */}
        <div className="flex flex-col items-center md:w-1/3">
          <img src={user?.image ? `https://brewokode.space/storage/${user?.image}` : assets[11]} alt="avatar" className="w-70 h-70 rounded-lg bg-slate-200 border-1 border-slate-700 object-cover shadow-nav transition-all duration-500" />
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col gap-4 mx-auto transition-all duration-500">
          <div className="flex items-center gap-3">
            <FaUser className="text-blue-900 dark:text-yellow-500 text-lg" />
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-50">Nama Lengkap</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-slate-400">{user?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FaEnvelope className="text-blue-900 dark:text-yellow-500 text-lg" />
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-50">Email</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FaCalendarAlt className="text-blue-900 dark:text-yellow-500 text-lg" />
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-50">Tanggal Bergabung</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-slate-400">
                {new Date(user?.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {!editMode ? (
            <button
              onClick={toggleEdit}
              className="mt-6 font-semibold w-fit flex items-center gap-2 border border-green-600 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg hover:bg-green-600 dark:hover:bg-green-900 hover:text-white transition shadow-nav cursor-pointer"
            >
              <MdEdit className="text-lg" /> Edit Profil
            </button>
          ) : (
            <button
              onClick={toggleEdit}
              className="mt-6 font-semibold w-fit flex items-center gap-2 border border-red-600 dark:border-red-900 text-red-600 px-4 dark:text-red-600 py-2 rounded-lg hover:bg-red-600 dark:hover:bg-red-900 hover:text-white transition shadow-nav cursor-pointer"
            >
              <IoClose className="text-lg" /> Batal
            </button>
          )}
        </div>
      </div>
      {editMode && (
        <div className="fade-in bg-white dark:bg-slate-900 border-1 border-white dark:border-slate-300 shadow-ku rounded-xl py-6 px-10  flex-col mt-6 transition-all duration-500">
          <h1 className="text-gray-700 dark:text-slate-50 mb-4 font-semibold text-lg">Edit Profile</h1>
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 grid-cols-1 gap-5">
            <div>
              <div className="mb-4">
                <input
                  type="text"
                  name="name"
                  defaultValue={user?.name}
                  placeholder="Nama Lengkap"
                  className="w-full border border-gray-300 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all duration-500"
                  required
                />
              </div>

              <div className="mb-4">
                <input
                  type="email"
                  name="email"
                  defaultValue={user?.email}
                  placeholder="Email"
                  className="w-full border border-gray-300 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all duration-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-3">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 dark:text-slate-50 hover:border-blue-600 dark:hover:border-blue-400 hover:text-blue-600  dark:hover:text-blue-200  transition-all duration-500"
                >
                  <FaUpload className="text-2xl mb-2" />
                  <span className="font-medium">Upload Foto Profil</span>
                  <span className="text-sm text-gray-400 dark:text-slate-300 mt-1">PNG, JPG, JPEG maksimal 2MB</span>
                </label>

                <input id="file-upload" type="file" name="image" accept="image/*" className="hidden" onChange={handleFileChange} />

                {preview && (
                  <div className="flex flex-col items-center">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img src={preview} alt="preview" className="w-40 h-40 rounded-md object-cover border-3 border-blue-600 shadow-md" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="relative mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="w-full border border-gray-300 rounded-lg p-2 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all duration-500"
                />
                {showPassword ? (
                  <IoMdEye className="text-gray-500 text-lg absolute right-4 top-3 cursor-pointer" onClick={togglePassword} />
                ) : (
                  <IoMdEyeOff className="text-gray-500 text-lg absolute right-4 top-3 cursor-pointer" onClick={togglePassword} />
                )}
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password_confirmation"
                  placeholder="Konfirmasi Password"
                  className="w-full border border-gray-300 rounded-lg bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 p-2 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all duration-500"
                />
                {showPassword ? (
                  <IoMdEye className="text-gray-500 text-lg absolute right-4 top-3 cursor-pointer" onClick={togglePassword} />
                ) : (
                  <IoMdEyeOff className="text-gray-500 text-lg absolute right-4 top-3 cursor-pointer" onClick={togglePassword} />
                )}
              </div>
            </div>

            <button type="submit" className="w-40 font-semibold flex justify-center items-center gap-2 bg-blue-700 dark:bg-blue-900 text-white px-4 py-2 cursor-pointer shadow-nav rounded-lg hover:bg-blue-800 transition-all duration-500">
              Update Profile
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
