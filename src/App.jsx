import { useState, useContext, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { AuthProvider, AuthContext } from "./context/AuthContext";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile
  const { loading } = useContext(AuthContext);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    setSidebarOpen(isDesktop);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="custom-loader"></div>
      </div>
    );
  }

  return (
    <div className="font-alan min-h-screen relative">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Konten utama */}
      <div className={`flex flex-col pt-12 `}>
        <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className={`min-h-screen flex-1 overflow-y-auto lg:px-4 px-2 lg:py-1 py-3 bg-slate-50 transition-all duration-300 ${sidebarOpen ? "lg:pl-64 sm:pl-40" : "lg:pl-5"}`}>
          <Outlet />
        </main>
      </div>
      <footer className="absolute bottom-0 lg:right-5 right-1 bg-transparent lg:text-sm text-[12px] text-gray-500">
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
