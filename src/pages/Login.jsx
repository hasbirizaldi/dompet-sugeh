import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import images from "../assets/img/assets";
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import axios from "axios";
import { alertError, alertSuccess } from "../lib/alert";
import { AuthContext } from "../context/AuthContext";

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
  const { setUser } = useContext(AuthContext);

  // useEffect(() => {
  //   if (user) {
  //     navigate("/", { replace: true });
  //   }
  // }, [user, navigate]);
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

        setUser(data.user); // <-- ini penting supaya useEffect di Login.jsx jalan

        await alertSuccess(mode ? "Anda berhasil masuk" : "Pendaftaran anda berhasil");

        navigate("/", { replace: true });
      }
    } catch (err) {
      await alertError(err.response ? "Email atau password anda tidak valid!" : "Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-800">
      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-ku w-[95%] max-w-lg py-8 px-10">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={images[0]} alt="Logo" className="lg:w-40 w-30 lg:h-10 h-7" />
        </div>

        <h1 className=" text-sm text-center mb-4 mt-2 text-gray-500 dark:text-gray-200 font-semibold">{mode ? "Silahkan masuk dengan akun yang sudah didaftarkan" : "Silahkan daftarkan akun anda"}</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!mode && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Lengkap"
              className="w-full border border-gray-300 dark:border-gray-500 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
              required
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border border-gray-300 dark:border-gray-500 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
            required
          />

          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full border border-gray-300 dark:border-gray-500 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
              required
            />
            {showPassword ? (
              <IoMdEye className="text-gray-500 dark:text-gray-200 text-lg absolute right-4 top-3 cursor-pointer" onClick={togglePassword} />
            ) : (
              <IoMdEyeOff className="text-gray-500 dark:text-gray-200 text-lg absolute right-4 top-3 cursor-pointer" onClick={togglePassword} />
            )}
          </div>

          {!mode && (
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi Password"
                className="w-full border border-gray-300 dark:border-gray-500 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
                required
              />
              {showPassword ? (
                <IoMdEye className="text-gray-500 dark:text-gray-200 text-lg absolute right-4 top-3 cursor-pointer" onClick={togglePassword} />
              ) : (
                <IoMdEyeOff className="text-gray-500 dark:text-gray-200 text-lg absolute right-4 top-3 cursor-pointer" onClick={togglePassword} />
              )}
            </div>
          )}

          <button type="submit" disabled={loading} className="bg-blue-600 dark:bg-blue-900 text-white text-lg rounded-lg p-2 hover:bg-blue-950 dark:hover:bg-blue-800 transition font-semibold cursor-pointer">
            {mode ? "Masuk" : "Daftar"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-200">
          {mode ? "Belum punya akun?" : "Sudah punya akun?"}

          <span onClick={togglemode} className="ml-1 text-blue-700 dark:text-blue-500 font-semibold cursor-pointer hover:underline">
            {mode ? "Daftar Sekarang" : "Masuk"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
