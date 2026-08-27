import { createContext, useContext, useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { userAPI } from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(true);
  const { callApi } = useApi();

  const login = (userData, authToken) => {
    if (authToken) {
      localStorage.setItem("authToken", authToken);
      setToken(authToken);
    }
    setUser(userData);
  };
  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
    window.location.reload();
  };

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem("authToken");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await callApi(userAPI.verifyUser(storedToken));
        setUser(res.data);
        setToken(storedToken);
      } catch (err) {
        console.error("Invalid token", err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
