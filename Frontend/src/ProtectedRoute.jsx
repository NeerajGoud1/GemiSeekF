// // // ProtectedRoute.jsx
// // import { Navigate } from "react-router-dom";

// // export default function ProtectedRoute({ children }) {
// //   const token = localStorage.getItem("token");

// //   // If no token, redirect to landing page (or /login)
// //   if (!token) {
// //     return <Navigate to="/" replace />;
// //   }

// //   // Otherwise, render the protected children
// //   return children;
// // }

// import { useEffect, useState } from "react";
// import { Navigate, useNavigate } from "react-router-dom";

// const ProtectedRoute = ({ children }) => {
//   const [authenticated, setAuthenticated] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     async function get() {
//       try {
//         let token = localStorage.getItem("token");

//         const res = await fetch(`${ProLink}/api/verify`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (res.status === 200) {
//           setAuthenticated(true);
//         } else {
//           setAuthenticated(false);
//         }
//       } catch (e) {
//         console.log(e.message);
//       }
//     }
//     get();
//   }, []);

//   if (authenticated === null) return <div>Loading...</div>;
//   if (authenticated === false) {
//     window.location.href = "http://localhost:5173/";
//     return null;
//   }
//   return children;
// };

// export default ProtectedRoute;

// ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * ProtectedRoute
 * Props:
 *  - children: React node to render when authenticated
 *  - loginPath: path to redirect when not authenticated (default "/")
 *  - verifyUrl: backend verify endpoint (default "/api/verify")
 */
export default function ProtectedRoute({ children, loginPath = "/" }) {
  const location = useLocation();
  const [status, setStatus] = useState("loading"); // "loading" | "ok" | "unauth"
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const token = localStorage.getItem("token");

    if (!token) {
      setStatus("unauth");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/verify", {
          method: "GET", // or POST if your route expects POST
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!mounted) return; // bail if unmounted

        if (res.ok) {
          const body = await res.json();
          setUser(body.user ?? null);
          setStatus("ok");
        } else {
          // invalid token or other error
          console.warn("Token verify failed", res.status);
          // remove token (so future attempts don't retry with bad token)
          localStorage.removeItem("token");
          setStatus("unauth");
        }
      } catch (err) {
        if (err.name === "AbortError") {
          // fetch was aborted — ignore
          return;
        }
        console.error("Token verify error:", err);
        localStorage.removeItem("token");
        setStatus("unauth");
      }
    };

    verify();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  if (status === "loading") {
    return (
      <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className="loader" aria-hidden />
          <div style={{ marginTop: 8, color: "#cbd5e1" }}>
            Checking authentication…
          </div>
        </div>
        <style>{`
          .loader {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 4px solid rgba(255,255,255,0.12);
            border-top-color: rgba(255,255,255,0.9);
            animation: spin 0.9s linear infinite;
            margin: 0 auto;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (status === "unauth") {
    // redirect to login/landing; include the intended URL in state so you can redirect back after login
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  // status === "ok" -> render children
  // optionally provide auth user info via location.state if child wants it
  return React.cloneElement(children, { authUser: user });
}
