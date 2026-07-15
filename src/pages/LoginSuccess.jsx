import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logger from "../utils/logger";

const LoginSuccess = () => {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const handleLogin = async () => {
      try {
        await loginWithToken(token);
        navigate("/dashboard", { replace: true });
      } catch (error) {
        logger.error("OAuth login failed", error);
        navigate("/login", { replace: true });
      }
    };

    handleLogin();
  }, [loginWithToken, navigate]);

  return <h2>Signing you in...</h2>;
};

export default LoginSuccess;
