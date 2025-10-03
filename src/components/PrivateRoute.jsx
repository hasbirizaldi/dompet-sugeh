import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white dark:bg-slate-800">
        <div className="lg:text-7xl text-4xl font-bold">
          <span className="text-blue-900">Butget</span>
          <span className="text-yellow-500">Ing</span>
        </div>
      </div>
    );
  }

  return !user ? <Navigate to="/login" replace /> : children;
};

export default PrivateRoute;
