const HomeFooter = () => {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 px-4 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto text-center z-10">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <span className="text-4xl md:text-5xl animate-pulse">🚂</span>
          <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Rail IRCTC
          </span>
        </div>
        
        <p className="text-gray-400 mb-8 text-base md:text-lg max-w-2xl mx-auto">
          Your trusted partner for railway ticket booking and live train tracking. 
          Making travel easier, safer, and smarter.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm md:text-base text-gray-400 mb-8">
          <a href="#" className="hover:text-white transition-colors hover:underline">About Us</a>
          <a href="#" className="hover:text-white transition-colors hover:underline">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors hover:underline">Terms of Service</a>
          <a href="/contact" className="hover:text-white transition-colors hover:underline">Contact</a>
          <a href="#" className="hover:text-white transition-colors hover:underline">FAQs</a>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-6 mb-8">
          {['📘', '🐦', '📸', '💼'].map((icon, index) => (
            <a 
              key={index}
              href="#" 
              className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 text-2xl transform hover:scale-110 transition-all duration-300"
            >
              {icon}
            </a>
          ))}
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <p className="text-gray-500 text-sm md:text-base">
            © 2026 Rail IRCTC. All rights reserved. Made with ❤️ for travelers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
