import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cek user saat pertama kali load
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      const id = localStorage.getItem("user_id");

      if (!token || !id) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`https://brewokode.space/api/profile/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        setUser(response.data.user);
      } catch (err) {
        console.error("Gagal fetch profile:", err);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return <AuthContext.Provider value={{ user, setUser, loading }}>{children}</AuthContext.Provider>;
};
