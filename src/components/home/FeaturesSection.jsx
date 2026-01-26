import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useNavigate } from "react-router-dom";

const FeaturesSection = ({ searchSectionRef }) => {
  const navigate = useNavigate();

  const features = [
    {
      icon: "🚆",
      title: "Live Train Status",
      description: "Track real-time train locations and running status instantly",
      action: "scroll-search",
      gradient: "from-blue-400 to-blue-600",
    },
    {
      icon: "🎫",
      title: "Book Tickets",
      description: "Easy and secure online railway ticket booking system",
      path: "/trains",
      gradient: "from-purple-400 to-purple-600",
    },
    {
      icon: "📋",
      title: "PNR Status",
      description: "Check your PNR status and booking confirmation details",
      path: "/login",
      gradient: "from-pink-400 to-pink-600",
    },
    {
      icon: "🗺️",
      title: "Train Schedule",
      description: "View complete train schedules and station timetables",
      path: "/trains",
      gradient: "from-green-400 to-green-600",
    },
    {
      icon: "💺",
      title: "Seat Availability",
      description: "Real-time seat availability checker for all trains",
      path: "/trains",
      gradient: "from-orange-400 to-orange-600",
    },
    {
      icon: "🔔",
      title: "Alerts & Updates",
      description: "Get instant notifications about delays and cancellations",
      path: "/login",
      gradient: "from-red-400 to-red-600",
    },
  ];

  const handleFeatureClick = (feature) => {
    if (feature.action === "scroll-search") {
      searchSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (feature.path) {
      navigate(feature.path);
      return;
    }

    navigate("/login");
  };

  return (
    <section className="py-16 md:py-24 px-4 relative overflow-hidden bg-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Rail IRCTC
            </span>
            ?
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Complete railway solution with modern features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 perspective-container">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="card-3d group relative overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500 bg-white border-2 border-gray-100"
              onClick={() => handleFeatureClick(feature)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleFeatureClick(feature);
                }
              }}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              {/* 3D Layer Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 transform translate-z-[-10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <CardHeader className="relative z-10 transform-style-preserve-3d">
                <div className="text-5xl md:text-6xl mb-4 float-3d transform group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl md:text-2xl mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300 font-bold">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-base md:text-lg text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </CardDescription>
              </CardHeader>

              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
