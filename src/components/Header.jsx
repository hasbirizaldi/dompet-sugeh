// Header.jsx
import { FaUser } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { TiThMenu } from "react-icons/ti";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import { alertConfirm } from "../lib/alert";
import { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/img/assets";
import { AuthContext } from "../context/AuthContext";
import { BsMoonStarsFill } from "react-icons/bs";
import { MdWbSunny } from "react-icons/md";

const Header = ({ toggleSidebar, darkMode, setDarkMode }) => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef(null);

  const handleShowModal = () => {
    setShowModal(!showModal);
  };

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showModal && modalRef.current && !modalRef.current.contains(e.target)) {
        setShowModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showModal]);

  return (
    <header className={`bg-blue-50 dark:bg-slate-800 h-12 flex items-center justify-end px-4 shadow fixed top-0 transition-all duration-500 w-full z-10 `}>
      <div className="flex gap-3 items-center cursor-pointer">
        {/* Tombol buka sidebar (mobile) */}
        <div className="absolute left-2 hover:scale-105 w-10 " onClick={toggleSidebar}>
          <TiThMenu className="text-4xl w-10 border-3 rounded border-blue-950 dark:border-slate-50 text-blue-950 dark:text-slate-50" />
        </div>
        <div onClick={() => setDarkMode(!darkMode)} className="cursor-pointer absolute lg:right-70 right-40">
          {darkMode ? (
            <div className="flex items-center gap-3">
              <BsMoonStarsFill className="text-amber-400 text-xl" />
              <span className="text-slate-100 text-xs">Dark</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <MdWbSunny className="text-amber-400 text-3xl" />
              <span className="text-slate-600 text-xs">Light</span>
            </div>
          )}
        </div>
        <div className="relative flex items-center gap-2 lg:right-14 right-2" onClick={handleShowModal}>
          <div className="p-1.5">
            <img src={user?.image ? `https://brewokode.space/storage/${user?.image}` : assets[11]} alt="avatar" className="w-9 h-9 rounded-full border-2 border-gray-600 dark:border-gray-50 object-cover" />
          </div>
          <span className="font-semibold md:block truncate lg:w-25 w-17 text-slate-700 dark:text-slate-50">{user?.name}</span>
        </div>

        {/* modal */}
        {showModal && (
          <div className="fixed inset-0 z-20" onClick={() => setShowModal(false)}>
            <div ref={modalRef} className="absolute top-12 lg:right-20 right-3 bg-white dark:bg-slate-800 border-1 border-slate-500 dark:border-slate-300 shadow-nav rounded-md py-2 w-40 min-w-[160px]" onClick={(e) => e.stopPropagation()}>
              <Link to="/profile" className="flex gap-2 items-center px-4 py-2 text-sm text-gray-700 dark:text-slate-50 hover:bg-gray5 dark:hover:bg-gray-900">
                <FaUser className="text-[16px]" /> Profile
              </Link>
              <Link to="/settings" className="flex gap-2 items-center px-4 py-2 text-sm text-gray-700 dark:text-slate-50 hover:bg-gray-100 dark:hover:bg-gray-900">
                <FaGear className="text-[16px]" /> Settings
              </Link>
              <div onClick={confirmLogout} className="flex gap-2 items-center bg-white dark:bg-slate-200 px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                <RiLogoutCircleRLine className="text-[16px]" /> Logout
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
