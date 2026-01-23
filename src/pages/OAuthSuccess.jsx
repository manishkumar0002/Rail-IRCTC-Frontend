import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      loginWithToken(token)
        .then(() => navigate("/dashboard", { replace: true }))
        .catch(() => navigate("/login", { replace: true }));
    } else {
      navigate("/login", { replace: true });
    }
  }, [loginWithToken, navigate]);

  return <p>Logging you in...</p>;
}