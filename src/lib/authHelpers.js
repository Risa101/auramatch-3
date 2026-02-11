// src/lib/authHelpers.js
import { auth } from "../firebase";
export async function doLogout() {
  try { await auth.signOut(); } finally {
    localStorage.removeItem("auramatch:isLoggedIn");
    localStorage.removeItem("auramatch:user");
    localStorage.removeItem("auramatch:token");
    localStorage.removeItem("auramatch:isAdmin");
  }
}
