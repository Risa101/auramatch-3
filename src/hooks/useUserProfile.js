// src/hooks/useUserProfile.js
import { useEffect, useMemo, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, getFirestore } from "firebase/firestore";

const db = getFirestore();

/* -------- helpers -------- */
function readLocal() {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("auramatch:user") || "null");
  } catch {}
  const lastSeason = localStorage.getItem("auramatch:lastSeason") || null;
  const lastFaceShape = localStorage.getItem("auramatch:lastFaceShape") || null;
  return { user, lastSeason, lastFaceShape };
}

function mergeUser({ localUser, fsUser, authUser }) {
  // ลำดับความสำคัญ: local > firestore > auth
  const base = {
    uid: authUser?.uid || fsUser?.uid || localUser?.uid || null,
    email: localUser?.email ?? fsUser?.email ?? authUser?.email ?? null,
    name:
      localUser?.name ??
      fsUser?.name ??
      authUser?.displayName ??
      (authUser?.email ? authUser.email.split("@")[0] : null),
    avatar:
      localUser?.avatar ??
      fsUser?.avatar ??
      authUser?.photoURL ??
      null,
  };
  // รวม field อื่นที่อาจมีใน fsUser/localUser
  return { ...fsUser, ...localUser, ...base };
}

export default function useUserProfile() {
  const [state, setState] = useState(() => readLocal());

  useEffect(() => {
    // 1) ติดตามสถานะ Auth
    let unsubFS = null;
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      // เมื่อเปลี่ยนผู้ใช้: reset state ให้เร็วด้วยค่า local
      setState((prev) => ({ ...prev, ...readLocal(), user: mergeUser({
        localUser: readLocal().user,
        fsUser: null,
        authUser: u,
      })}));

      // 2) ติดตาม Firestore ของผู้ใช้ (ถ้ามี uid)
      unsubFS?.();
      if (!u) return;
      const ref = doc(db, "users", u.uid);
      unsubFS = onSnapshot(ref, (snap) => {
        const fs = snap.data() || {};
        const localUser = readLocal().user;
        setState((prev) => ({
          ...prev,
          user: mergeUser({ localUser, fsUser: { uid: u.uid, ...fs }, authUser: u }),
          lastSeason: fs.lastSeason ?? prev.lastSeason ?? null,
          lastFaceShape: fs.lastFaceShape ?? prev.lastFaceShape ?? null,
        }));
      });
    });

    // 3) sync แบบทันทีจากภายในหน้า/ข้ามแท็บ
    const onStorage = (e) => {
      // ถ้าเป็น StorageEvent ปกติและ key ไม่ใช่ของเรา ให้ผ่าน
      if (e?.type === "storage" && e?.key && !e.key.startsWith("auramatch:")) return;
      const { user, lastSeason, lastFaceShape } = readLocal();
      setState((prev) => ({
        ...prev,
        user: mergeUser({ localUser: user, fsUser: prev.user, authUser: auth.currentUser }),
        lastSeason: lastSeason ?? prev.lastSeason,
        lastFaceShape: lastFaceShape ?? prev.lastFaceShape,
      }));
    };
    const onAnalysis = (e) => {
      const d = e?.detail || {};
      setState((prev) => ({
        ...prev,
        lastSeason: d.lastSeason ?? prev.lastSeason ?? readLocal().lastSeason,
        lastFaceShape: d.lastFaceShape ?? prev.lastFaceShape ?? readLocal().lastFaceShape,
      }));
    };
    const onUserUpdated = () => onStorage({ type: "storage" }); // รีเฟรชเหมือนกัน

    window.addEventListener("storage", onStorage);
    window.addEventListener("analysis:updated", onAnalysis);
    window.addEventListener("user:updated", onUserUpdated);

    return () => {
      unsubFS?.();
      unsubAuth?.();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("analysis:updated", onAnalysis);
      window.removeEventListener("user:updated", onUserUpdated);
    };
  }, []);

  const profile = useMemo(
    () => ({
      user: state.user,
      lastSeason: state.lastSeason,
      lastFaceShape: state.lastFaceShape,
    }),
    [state.user, state.lastSeason, state.lastFaceShape]
  );

  return profile;
}
