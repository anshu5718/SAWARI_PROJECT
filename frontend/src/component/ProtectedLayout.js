import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export default function ProtectedLayout() {
  const navigate = useNavigate();

  const isAuthenticated = () => {
    try {
      const user = localStorage.getItem("user");
      return !!user && user !== "null";
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", { replace: true }); // replace: true blocks the back button
    }
  }, [navigate]);

  if (!isAuthenticated()) return null; // prevent flash of protected content

  return <Outlet />;
}
