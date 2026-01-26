import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

const PopularRoutes = () => {
  const popularRoutes = [
    { from: "New Delhi", to: "Mumbai", trains: "45+", color: "blue" },
    { from: "Bangalore", to: "Chennai", trains: "30+", color: "purple" },
    { from: "Kolkata", to: "Delhi", trains: "25+", color: "pink" },
    { from: "Hyderabad", to: "Pune", trains: "20+", color: "green" },
  ];

  const colorClasses = {
    blue: "from-blue-400 to-blue-600",
    purple: "from-purple-400 to-purple-600",
    pink: "from-pink-400 to-pink-600",
    green: "from-green-400 to-green-600",
  };

  return (
    <section className="py-16 md:py-24 px-4 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Popular{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Routes
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Most traveled railway routes in India
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 perspective-container">
          {popularRoutes.map((route, index) => (
            <Card 
              key={index} 
              className="card-3d depth-shadow-3d group relative overflow-hidden transition-all duration-500 cursor-pointer bg-white border-2 border-gray-100"
              style={{
                animationDelay: `${index * 0.15}s`
              }}
            >
              {/* 3D Background Layer */}
              <div className="layer-3d absolute inset-0"></div>
              
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[route.color]} opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:scale-105`}></div>
              
              <CardContent className="relative z-10 pt-8 group-hover:text-white transition-all duration-500 transform group-hover:translateZ-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg md:text-xl font-bold transform group-hover:scale-110 transition-transform duration-300">{route.from}</span>
                  <span className="text-3xl transform group-hover:scale-150 group-hover:rotate-12 transition-all duration-500">→</span>
                  <span className="text-lg md:text-xl font-bold transform group-hover:scale-110 transition-transform duration-300">{route.to}</span>
                </div>
                <Badge className={`w-full justify-center py-2 text-sm md:text-base bg-gradient-to-r ${colorClasses[route.color]} text-white border-0 group-hover:bg-white group-hover:text-gray-900 transform group-hover:scale-105 transition-all duration-300`}>
                  🚂 {route.trains} Trains Available
                </Badge>
              </CardContent>

              {/* Animated Border with Glow */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-white rounded-lg transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]"></div>
              
              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularRoutes;
