import React from "react";
import { Train, Mail, Phone, MapPin, Heart, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  console.log("✅ Footer component loaded"); // Debug log

  return (
    <footer className="app-footer">
      <div className="footer-content grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 px-4 md:px-8">
        {/* Brand Section */}
        <div className="footer-section footer-brand">
          <div className="footer-logo flex items-center gap-2">
            <Train size={28} className="md:w-[32px] md:h-[32px]" />
            <span className="text-xl md:text-2xl">IRCTC</span>
          </div>
          <p className="footer-tagline text-sm md:text-base mt-3">
            Your trusted partner for seamless railway bookings across India. Travel safe, travel smart.
          </p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook" className="social-link">
              <Facebook size={20} />
            </a>
            <a href="#" aria-label="Twitter" className="social-link">
              <Twitter size={20} />
            </a>
            <a href="#" aria-label="Instagram" className="social-link">
              <Instagram size={20} />
            </a>
            <a href="#" aria-label="LinkedIn" className="social-link">
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-links">
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/trains">Book Trains</a></li>
            <li><a href="/my-bookings">My Bookings</a></li>
            <li><a href="/payments">Payments</a></li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer-section">
          <h3 className="footer-heading">Support</h3>
          <ul className="footer-links">
            <li><a href="#">Help Center</a></li>
            <li><a href="#">FAQs</a></li>
            <li><a href="#">Terms & Conditions</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h3 className="footer-heading">Contact Us</h3>
          <ul className="footer-contact">
            <li>
              <Mail size={16} />
              <span>support@irctc.co.in</span>
            </li>
            <li>
              <Phone size={16} />
              <span>+91 8962******37</span>
            </li>
            <li>
              <MapPin size={16} />
              <span>New Delhi, India</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>
          © {currentYear} IRCTC Railway Booking. All rights reserved.
        </p>
        <p className="footer-credits">
          Made with <Heart size={14} className="heart-icon" /> for travelers
        </p>
      </div>

      <style>{`
        .app-footer {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 3rem 0 0;
          margin-top: auto;
          position: relative;
          overflow: hidden;
          width: 100%;
        }

        .app-footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem 2rem;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 3rem;
        }

        @media (max-width: 968px) {
          .footer-content {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 640px) {
          .footer-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        .footer-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .footer-brand {
          gap: 1.5rem;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .footer-tagline {
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .footer-social {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .social-link {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 50%;
          color: white;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .social-link:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .footer-heading {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .footer-links a {
          color: rgba(255, 255, 255, 0.85);
          text-decoration: none;
          transition: all 0.3s ease;
          display: inline-block;
          font-size: 0.95rem;
        }

        .footer-links a:hover {
          color: white;
          transform: translateX(5px);
        }

        .footer-contact {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .footer-contact li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.95rem;
        }

        .footer-contact svg {
          flex-shrink: 0;
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          background: rgba(0, 0, 0, 0.1);
          width: 100%;
        }

        @media (max-width: 640px) {
          .footer-bottom {
            flex-direction: column;
            text-align: center;
          }
        }

        .footer-bottom p {
          margin: 0;
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.9rem;
        }

        .footer-credits {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .heart-icon {
          color: #ff6b6b;
          animation: heartbeat 1.5s ease-in-out infinite;
        }

        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
