import { Navigate, useLocation } from "react-router-dom";

export default function RequireAdmin({ children }) {
  const { pathname } = useLocation();
  const isLoggedIn = localStorage.getItem("auramatch:isLoggedIn") === "true";
  const isAdmin = localStorage.getItem("auramatch:isAdmin") === "true";
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: pathname }} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}
