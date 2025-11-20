// src/components/RouteGuards.jsx
import { Navigate, useLocation } from "react-router-dom";

const isLoggedIn = () => localStorage.getItem("auramatch:isLoggedIn") === "true";
const isAdmin = () => localStorage.getItem("auramatch:isAdmin") === "true";

export function RequireAuth({ children }) {
  const { pathname } = useLocation();
  return isLoggedIn() ? children : <Navigate to="/login" state={{ from: pathname }} replace />;
}

export function RequireAdmin({ children }) {
  const { pathname } = useLocation();
  return isAdmin() ? children : <Navigate to="/login" state={{ from: pathname }} replace />;
}
