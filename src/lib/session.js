// src/lib/session.js
export function writeUserToLocalStorage(u) {
  if (!u) {
    localStorage.removeItem("auramatch:isLoggedIn");
    localStorage.removeItem("auramatch:user");
    localStorage.removeItem("auramatch:token");
    localStorage.removeItem("auramatch:isAdmin");
    return;
  }
  localStorage.setItem("auramatch:isLoggedIn", "true");
  localStorage.setItem("auramatch:user", JSON.stringify({
    uid: u.uid, email: u.email,
    name: u.displayName || u.email?.split("@")[0],
    photoURL: u.photoURL || "", provider: u.providerData?.[0]?.providerId || "password",
  }));
}
