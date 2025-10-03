// Sidebar.jsx
import { Link, NavLink } from "react-router-dom";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { IoHome } from "react-icons/io5";
import { FaUser, FaMoneyCheckAlt, FaClipboardList } from "react-icons/fa";
import images from "../assets/img/assets";

const Sidebar = ({ sidebarOpen, toggleSidebar }) => {
  return (
    <>
      {/* Overlay khusus mobile */}
      <div
        className={`fixed inset-0 bg-black/40 z-20 lg:hidden transition-opacity duration-300
        ${sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-blue-900 dark:bg-slate-900 shadow-nav z-30
        transform transition-all duration-500 w-60 
        ${sidebarOpen ? "translate-x-0 " : "-translate-x-full hidden "} 
        lg:translate-x-0`}
      >
        {/* Tombol collapse desktop */}
        <div className="absolute right-0 top-[50%] bg-blue-50 dark:bg-slate-600 shadow-nav rounded-l-full cursor-pointer hover:bg-white dark:hover:bg-slate-500 dark:text-slate-200 hover:scale-105 p-1  lg:block" onClick={toggleSidebar}>
          <MdKeyboardDoubleArrowLeft className={`text-4xl text-blue-950 dark:text-slate-50 transition-transform duration-300 `} />
        </div>

        {/* Logo */}
        <Link to="/" className="flex justify-center bg-blue-50 p-3">
          <img src={images[0]} alt="logo" className={`transition-all duration-300 lg:w-45 w-30 lg:h-11 h-7 lg:mr-7 mr-23`} />
        </Link>

        {/* Menu */}
        <div className="flex flex-col gap-3 font-semibold mt-5 text-white px-3 pr-14 ">
          <NavLink className="flex items-center gap-2 lg:text-[18px] text-base p-2 rounded hover:bg-blue-700/50 dark:hover:bg-blue-700/20" to="/">
            <IoHome className="text-[20px]" />
            Dashboard
          </NavLink>
          <NavLink className="flex items-center gap-2 lg:text-[18px] text-base p-2 rounded hover:bg-blue-700/50 dark:hover:bg-blue-700/20" to="/profile">
            <FaUser className="text-[20px]" />
            Profile
          </NavLink>
          <NavLink className="flex items-center gap-2 lg:text-[18px] text-base p-2 rounded hover:bg-blue-700/50 dark:hover:bg-blue-700/20" to="/transaction">
            <FaMoneyCheckAlt className="text-[20px]" />
            Transaksi
          </NavLink>
          <NavLink className="flex items-center gap-2 lg:text-[18px] text-base p-2 rounded hover:bg-blue-700/50 dark:hover:bg-blue-700/20" to="/category">
            <FaClipboardList className="text-[20px]" />
            Kategori
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
