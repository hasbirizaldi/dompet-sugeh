// Header.jsx
import { FaUser } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { TiThMenu } from "react-icons/ti";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import { alertConfirm } from "../lib/alert";
import { useContext } from "react";
import assets from "../assets/img/assets";
import { AuthContext } from "../context/AuthContext";

const Header = ({ toggleSidebar }) => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const confirmLogout = async () => {
    const result = await alertConfirm("Apakah anda yakin akan keluar?");
    if (!result) return;
    navigate("/logout");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="custom-loader"></div>
      </div>
    );
  }

  return (
    <header className={`bg-slate-100 h-12 flex items-center justify-end px-4 shadow fixed top-0 w-full z-10 `}>
      <div className="flex gap-3 items-center cursor-pointer">
        {/* Tombol buka sidebar (mobile) */}
        <div className="absolute left-2 hover:scale-105 w-10 " onClick={toggleSidebar}>
          <TiThMenu className="text-4xl w-10 border-4 rounded border-green-800 text-green-800" />
        </div>

        <div className="relative group flex items-center gap-2 lg:right-14 right-2">
          <div className="p-1.5">
            <img src={user?.image ? `https://brewokode.space/storage/${user?.image}` : assets[11]} alt="avatar" className="w-9 h-9 rounded-full bg-slate-200 border-2 border-green-600 object-cover" />
          </div>
          <span className="font-semibold md:block truncate lg:w-25 w-17 text-slate-600">{user?.name}</span>

          <div className="absolute top-9 right-0 bg-white shadow-md rounded-md py-2 w-40 min-w-[160px] hidden group-hover:block z-30">
            <Link to="/profile" className="flex gap-2 items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <FaUser className="text-[16px]" /> Profile
            </Link>
            <Link to="/settings" className="flex gap-2 items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <FaGear className="text-[16px]" /> Settings
            </Link>
            <div onClick={confirmLogout} className="flex gap-2 items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
              <RiLogoutCircleRLine className="text-[16px]" /> Logout
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
