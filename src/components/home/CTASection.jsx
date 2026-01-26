import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 md:py-32 px-4 overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-x"></div>
      
      {/* Overlay Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-float">🚂</div>
        <div className="absolute top-40 right-20 text-6xl opacity-20 animate-float animation-delay-2000">🎫</div>
        <div className="absolute bottom-32 left-1/4 text-6xl opacity-20 animate-float animation-delay-4000">✨</div>
        <div className="absolute bottom-20 right-1/4 text-6xl opacity-20 animate-float animation-delay-3000">🌟</div>
      </div>

      <div className="relative max-w-5xl mx-auto text-center z-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
          Ready to Start Your Journey?
        </h2>
        <p className="text-lg md:text-xl lg:text-2xl mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
          Join thousands of travelers who trust Rail IRCTC for their railway bookings
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center perspective-container">
          <Button
            size="lg"
            onClick={() => navigate("/login")}
            className="btn-3d w-full sm:w-auto bg-white text-purple-600 hover:bg-gray-100 text-base md:text-lg lg:text-xl px-8 py-6 md:px-10 md:py-8 font-bold transform hover:scale-110 transition-all duration-500"
            style={{
              boxShadow: '0 8px 0 rgba(147, 51, 234, 0.3), 0 15px 30px rgba(147, 51, 234, 0.4)'
            }}
          >
            🎫 Book Your Ticket Now
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/login")}
            className="hover-lift-3d w-full sm:w-auto border-4 border-white text-white bg-white/10 backdrop-blur-sm hover:bg-white hover:text-purple-600 text-base md:text-lg lg:text-xl px-8 py-6 md:px-10 md:py-8 font-bold transform hover:scale-110 transition-all duration-500"
          >
            🚀 Explore Features
          </Button>
        </div>

        {/* Trust Indicators with 3D Effect */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 text-white/90">
          <div className="flex items-center gap-2 hover-lift-3d p-4 rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-300 cursor-pointer">
            <span className="text-2xl float-3d">⭐</span>
            <span className="text-sm md:text-base font-semibold">4.8/5 Rating</span>
          </div>
          <div className="flex items-center gap-2 hover-lift-3d p-4 rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-300 cursor-pointer">
            <span className="text-2xl float-3d">✅</span>
            <span className="text-sm md:text-base font-semibold">Verified Platform</span>
          </div>
          <div className="flex items-center gap-2 hover-lift-3d p-4 rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-300 cursor-pointer">
            <span className="text-2xl float-3d">🔒</span>
            <span className="text-sm md:text-base font-semibold">100% Secure</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-3000 {
          animation-delay: 3s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};

export default CTASection;
