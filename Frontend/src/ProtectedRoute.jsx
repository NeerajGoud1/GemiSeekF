import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase"; 


export default function ProtectedRoute({ children, loginPath = "/" }) {
  const location = useLocation();
  const [status, setStatus] = useState("loading"); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setStatus("unauth");
      } else {
        setStatus("ok");
      }
    });

    return () => unsubscribe();
  }, []);

  if (status === "loading") {
    return (
      <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <div>Checking authentication…</div>
      </div>
    );
  }

  if (status === "unauth") {

    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

 
  return children;
}
