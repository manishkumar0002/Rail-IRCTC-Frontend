const StatsSection = () => {
  const stats = [
    { 
      number: "10K+", 
      label: "Daily Bookings", 
      icon: "🎫",
      gradient: "from-blue-500 to-blue-700"
    },
    { 
      number: "5000+", 
      label: "Trains Tracked", 
      icon: "🚂",
      gradient: "from-purple-500 to-purple-700"
    },
    { 
      number: "99.9%", 
      label: "Uptime", 
      icon: "⚡",
      gradient: "from-pink-500 to-pink-700"
    },
    { 
      number: "24/7", 
      label: "Support", 
      icon: "💬",
      gradient: "from-green-500 to-green-700"
    },
  ];

  return (
    <section className="py-16 md:py-20 px-4 bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto perspective-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="hover-lift-3d text-center group cursor-pointer transition-all duration-500 bg-white rounded-2xl p-8 border-2 border-gray-100 relative overflow-hidden"
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              {/* 3D Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              {/* Icon with Float Effect */}
              <div className="mb-4 text-5xl md:text-6xl float-3d relative z-10">
                {stat.icon}
              </div>
              
              {/* Number with 3D Text Effect */}
              <div className={`text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-3 group-hover:scale-125 transition-all duration-500 relative z-10`}>
                {stat.number}
              </div>
              
              {/* Label */}
              <div className="text-base md:text-lg text-gray-600 font-medium group-hover:text-gray-900 transition-colors duration-300 relative z-10">
                {stat.label}
              </div>
              
              {/* Depth Shadow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
              }}></div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default StatsSection;
