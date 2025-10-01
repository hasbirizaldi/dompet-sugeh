import { Link } from "react-router-dom";
import images from "../assets/img/assets";

const NotFound = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center bg-black font-dor">
      <img src={images[12]} alt="dor" className="h-160 w-110" />
      <h1 className="text-6xl font-extrabold text-red-600">404</h1>
      <p className="text-2xl mt-2 text-gray-700">Halaman tidak ditemukan</p>
      <Link to="/" className="mt-6 px-6 py-2 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-500 transition font-alan">
        Kembali ke Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
