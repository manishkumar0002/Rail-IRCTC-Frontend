import { forwardRef, useState, useEffect } from "react";
import bannerImg from "../../assets/banner.jpeg";
import trainHeroImg from "../../assets/train-hero.jpg";
import trainImg from "../../assets/train.jpeg";

const HeroSection = forwardRef((props, ref) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    { image: bannerImg, alt: "Railway Banner" },
    { image: trainHeroImg, alt: "Train Hero" },
    { image: trainImg, alt: "Train Journey" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section 
      ref={ref}
      className="relative pt-20 pb-20 px-4 overflow-hidden min-h-screen flex items-center"
    >
      {/* Image Carousel Background */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
          </div>
        ))}
        
        {/* Animated Particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 text-4xl animate-float opacity-30">🚂</div>
          <div className="absolute top-1/2 right-1/4 text-4xl animate-float animation-delay-2000 opacity-30">🚃</div>
          <div className="absolute bottom-1/4 left-1/3 text-4xl animate-float animation-delay-4000 opacity-30">🚄</div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto text-center z-10 py-12 md:py-20">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-2xl">
          Book Train Tickets
          <br />
          <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent animate-gradient">
            Anytime, Anywhere
          </span>
        </h1>
        
        <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
          Experience seamless railway booking with live train tracking, PNR status, 
          and instant ticket confirmation. Your journey starts here.
        </p>

        {/* Carousel Indicators */}
        <div className="flex justify-center gap-3 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? "w-12 h-3 bg-white"
                  : "w-3 h-3 bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="mt-8 animate-bounce">
          <div className="inline-block p-2 bg-white/20 backdrop-blur-sm rounded-full shadow-lg border-2 border-white/40">
            <svg 
              className="w-6 h-6 text-white" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s linear infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
});

HeroSection.displayName = "HeroSection";

export default HeroSection;
