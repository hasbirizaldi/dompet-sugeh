import { useState, useContext, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { alertError } from "../src/lib/alert";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    setSidebarOpen(isDesktop);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!loading && (!user || !token)) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="custom-loader"></div>
      </div>
    );
  }

  if (!user && !loading) {
    alertError("User tidak ditemukan");
  }
  return (
    <div className="font-alan min-h-screen relative">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Konten utama */}
      <div className={`flex flex-col pt-12 `}>
        <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className={`min-h-screen flex-1 overflow-y-auto lg:px-4 px-3 lg:py-1 py-6 bg-slate-50 transition-all duration-300 ${sidebarOpen ? "lg:pl-64 sm:pl-40" : "lg:pl-5"}`}>
          <Outlet />
        </main>
      </div>
      <footer className="absolute bottom-0 right-5 bg-transparent text-sm text-gray-500">
        © 2025 <Link to="/">Hasbi Rizaldi</Link>. All rights reserved.
      </footer>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <AppLayout />
  </AuthProvider>
);

export default App;
