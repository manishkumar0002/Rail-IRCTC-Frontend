import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

const HomeNavbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-2xl md:text-3xl">🚂</span>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Rail IRCTC
            </span>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/login")}
              className="text-sm md:text-base"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm md:text-base"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HomeNavbar;
