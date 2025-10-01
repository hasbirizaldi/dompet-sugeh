import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import images from "../assets/img/assets";
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import axios from "axios";
import { alertError, alertSuccess } from "../lib/alert";

const Login = () => {
  const [mode, setMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // input
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State error & loading
  const [loading, setLoading] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const togglemode = () => {
    setMode(!mode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi sederhana
    if (!/\S+@\S+\.\S+/.test(email)) {
      await alertError("Format email tidak valid!");
      return;
    }

    if (password.length < 6) {
      await alertError("Password minimal 6 karakter!");
      return;
    }

    if (!mode && password !== confirmPassword) {
      await alertError("Konfirmasi password tidak cocok!");
      return;
    }

    setLoading(true);

    try {
      const url = mode ? "https://brewokode.space/api/login" : "https://brewokode.space/api/register";
      const body = mode ? { email, password } : { name, email, password, password_confirmation: confirmPassword };
      const response = await axios.post(url, body, {
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      });

      const data = response.data;

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_id", data.user.id);

        // tampilkan alert **sebelum navigate**
        if (mode) {
          await alertSuccess("Anda berhasil masuk");
        } else {
          await alertSuccess("Pendaftaran anda berhasil");
        }

        // kemudian baru navigate
        navigate("/", { replace: true });
      } else {
        await alertError("Terjadi kesalahan");
      }
    } catch (err) {
      await alertError(err.response ? "Email atau password anda tidak valid!" : "Mumet");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");
    if (token && userId) {
      navigate("/", { replace: true }); // replace biar tidak bikin stack navigation
    }
  }, [navigate]);
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="bg-white rounded-xl shadow-ku w-[95%] max-w-lg py-8 px-10">
        {/* Logo */}
        <div className="flex justify-center">
          <img src={images[0]} alt="Logo" className="w-30 h-30" />
        </div>

        <h1 className="text-base text-center mb-4 mt-2 text-gray-500 font-semibold">{mode ? "Silahkan masuk dengan akun yang sudah didaftarkan" : "Silahkan daftarkan akun anda"}</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!mode && (
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Lengkap" className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-600" required />
          )}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-600" required />

          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              required
            />
            {showPassword ? (
              <IoMdEye className="text-gray-500 text-lg absolute right-4 top-3 cursor-pointer" onClick={togglePassword} />
            ) : (
              <IoMdEyeOff className="text-gray-500 text-lg absolute right-4 top-3 cursor-pointer" onClick={togglePassword} />
            )}
          </div>

          {!mode && (
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi Password"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              />
              {showPassword ? (
                <IoMdEye className="text-gray-500 text-lg absolute right-4 top-3 cursor-pointer" onClick={togglePassword} />
              ) : (
                <IoMdEyeOff className="text-gray-500 text-lg absolute right-4 top-3 cursor-pointer" onClick={togglePassword} />
              )}
            </div>
          )}

          <button type="submit" disabled={loading} className="bg-green-600 text-white text-lg rounded-lg p-2 hover:bg-green-700 transition font-semibold cursor-pointer">
            {mode ? "Masuk" : "Daftar"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          {mode ? "Belum punya akun?" : "Sudah punya akun?"}

          <span onClick={togglemode} className="ml-1 text-green-700 font-semibold cursor-pointer hover:underline">
            {mode ? "Daftar Sekarang" : "Masuk"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
