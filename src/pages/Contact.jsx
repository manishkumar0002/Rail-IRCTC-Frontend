import { useState } from "react";
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone",
      details: "+91 8962****37 (24x7 Helpline)",
      gradient: "from-blue-500 to-blue-700"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      details: "support@irctc.co.in",
      gradient: "from-purple-500 to-purple-700"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Address",
      details: "IRCTC Corporate Office, New Delhi",
      gradient: "from-pink-500 to-pink-700"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Working Hours",
      details: "24/7 Support Available",
      gradient: "from-green-500 to-green-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Get In Touch
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 perspective-container">
          {contactInfo.map((info, index) => (
            <Card 
              key={index}
              className="card-3d hover-lift-3d text-center border-2 border-gray-100 bg-white"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="pt-8">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${info.gradient} flex items-center justify-center text-white float-3d`}>
                  {info.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{info.title}</h3>
                <p className="text-sm text-gray-600">{info.details}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card className="card-3d glass-3d border-2 border-blue-100 bg-white shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                <MessageCircle className="w-7 h-7 text-blue-600" />
                Send Us a Message
              </CardTitle>
              <CardDescription className="text-base">
                Fill out the form below and we'll get back to you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="border-2 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      className="border-2 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="border-2 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <Input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Booking inquiry"
                      required
                      className="border-2 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    rows={6}
                    required
                    className="border-2 focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                {submitStatus === "success" && (
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg text-green-700 animate-fadeIn">
                    <span className="font-semibold">✅ Message sent successfully!</span>
                    <p className="text-sm mt-1">We'll get back to you soon.</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-3d w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg py-6 font-bold"
                  style={{
                    boxShadow: isSubmitting ? 'none' : '0 6px 0 #4338ca, 0 10px 20px rgba(79, 70, 229, 0.4)'
                  }}
                >
                  <Send className="w-5 h-5 mr-2" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Map & Additional Info */}
          <div className="space-y-6">
            {/* Map Card */}
            <Card className="card-3d depth-shadow-3d border-2 border-gray-100 bg-white overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  📍 Find Us
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                  {/* Placeholder for map */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-blue-500 mx-auto mb-2 animate-bounce" />
                      <p className="text-gray-600 font-medium">IRCTC Corporate Office</p>
                      <p className="text-sm text-gray-500">New Delhi, India</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Card */}
            <Card className="card-3d border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-blue-50">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  💡 Quick Help
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-900 mb-1">Booking Issues?</h4>
                    <p className="text-sm text-gray-600">Check our FAQ section or call helpline</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-900 mb-1">Refund Queries?</h4>
                    <p className="text-sm text-gray-600">Refunds processed within 7-10 days</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-900 mb-1">Technical Support?</h4>
                    <p className="text-sm text-gray-600">Email us with screenshots</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Need Immediate Assistance?
          </h3>
          <p className="text-white/90 mb-6 text-lg">
            Our 24/7 customer support team is always ready to help
          </p>
          <Button 
            size="lg"
            className="btn-3d bg-white text-purple-600 hover:bg-gray-100 font-bold text-lg px-8 py-6"
            style={{
              boxShadow: '0 6px 0 rgba(147, 51, 234, 0.3), 0 10px 20px rgba(147, 51, 234, 0.4)'
            }}
          >
            <Phone className="w-5 h-5 mr-2" />
            Call +91 8962****37 Now
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Contact;
