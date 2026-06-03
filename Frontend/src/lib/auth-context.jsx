import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (token) {

      // Optional: fetch user profile from backend
      fetch("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });

    } else {

      setLoading(false);

    }

  }, []);

  const signOut = async () => {

    localStorage.removeItem("token");
    setUser(null);

  };

  return (

    <AuthContext.Provider value={{ user, loading, signOut }}>

      {children}

    </AuthContext.Provider>

  );

}

export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;

}