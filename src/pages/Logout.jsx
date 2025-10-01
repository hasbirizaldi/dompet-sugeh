import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { alertSuccess } from "../lib/alert";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      axios
        .post(
          "https://brewokode.space/api/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        )
        .then(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("expires_at");
          alertSuccess("Anda berhasil keluar");
          navigate("/login");
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("expires_at");
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="custom-loader"></div>
    </div>
  );
}
