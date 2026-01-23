import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { trainAPI, adminAPI } from "../services/api";
import {
  Train,
  Search,
  MapPin,
  Calendar,
  ArrowRight,
  Ticket,
  Users,
  CreditCard,
  Settings,
} from "lucide-react";
import Loader from "../components/Loader";
import TrainCard from "../components/TrainCard";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [stations, setStations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [searchForm, setSearchForm] = useState({
    source: "",
    destination: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setIsLoading(true);
      const response = await trainAPI.getStations();
      const data = Array.isArray(response.data) ? response.data : [];
      setStations(data);
    } catch (error) {
      console.error("Failed to fetch stations:", error);
      // If public endpoint fails, the stations will remain empty
      setStations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchForm.source || !searchForm.destination) return;

    try {
      setIsSearching(true);
      setHasSearched(true);
      const response = await trainAPI.searchTrains(
        searchForm.source,
        searchForm.destination
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("Failed to search trains:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTrainSelect = (train) => {
    navigate("/trains", {
      state: {
        selectedTrain: train,
        source: searchForm.source,
        destination: searchForm.destination,
        date: searchForm.date,
      },
    });
  };

  const quickActions = [
    { icon: Train, label: "Search Trains", path: "/trains", color: "#E87722" },
    { icon: Ticket, label: "My Bookings", path: "/my-bookings", color: "#003366" },
    { icon: CreditCard, label: "Payments", path: "/payments", color: "#28a745" },
  ];

  if (isAdmin) {
    quickActions.push({
      icon: Settings,
      label: "Admin Panel",
      path: "/admin",
      color: "#6c757d",
    });
  }

  return (
    <div className="dashboard-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content animate-fadeIn">
          <h1 className="hero-title">
            Welcome, {user?.name?.split(" ")[0] || "Traveler"}! 🚂
          </h1>
          <p className="hero-subtitle">
            Book your train tickets with ease and comfort
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="search-form glass-card">
            <div className="search-inputs">
              <div className="search-input-group">
                <label>
                  <MapPin size={18} /> From
                </label>
                <select
                  value={searchForm.source}
                  onChange={(e) =>
                    setSearchForm({ ...searchForm, source: e.target.value })
                  }
                  required
                >
                  <option value="">Select Source</option>
                  {stations.map((station) => (
                    <option key={station.id} value={station.code}>
                      {station.name} ({station.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="swap-icon">
                <ArrowRight size={24} />
              </div>

              <div className="search-input-group">
                <label>
                  <MapPin size={18} /> To
                </label>
                <select
                  value={searchForm.destination}
                  onChange={(e) =>
                    setSearchForm({
                      ...searchForm,
                      destination: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select Destination</option>
                  {stations
                    .filter((s) => s.code !== searchForm.source)
                    .map((station) => (
                      <option key={station.id} value={station.code}>
                        {station.name} ({station.code})
                      </option>
                    ))}
                </select>
              </div>

              <div className="search-input-group">
                <label>
                  <Calendar size={18} /> Date
                </label>
                <input
                  type="date"
                  value={searchForm.date}
                  onChange={(e) =>
                    setSearchForm({ ...searchForm, date: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="search-btn btn btn-primary"
              disabled={isSearching}
            >
              <Search size={20} />
              {isSearching ? "Searching..." : "Search Trains"}
            </button>
          </form>
        </div>
      </section>

      {/* Search Results */}
      {hasSearched && (
        <section className="search-results container animate-fadeIn">
          <h2 className="section-title">
            <Train size={24} />
            {isSearching
              ? "Searching..."
              : `Found ${searchResults.length} Trains`}
          </h2>

          {isSearching ? (
            <Loader text="Searching for trains..." />
          ) : searchResults.length > 0 ? (
            <div className="trains-grid">
              {searchResults.map((train) => (
                <TrainCard
                  key={train.id}
                  train={train}
                  source={searchForm.source}
                  destination={searchForm.destination}
                  onSelect={handleTrainSelect}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🚂</div>
              <h3 className="empty-state-title">No trains found</h3>
              <p>Try different stations or dates</p>
            </div>
          )}
        </section>
      )}

      {/* Quick Actions */}
      <section className="quick-actions container">
        <h2 className="section-title">
          <Users size={24} /> Quick Actions
        </h2>

        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="action-card"
              onClick={() => navigate(action.path)}
              style={{ "--accent-color": action.color }}
            >
              <div className="action-icon-wrapper">
                <action.icon size={28} />
              </div>
              <span className="action-label">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      <style>{`
        /* Dashboard Page Styles */
        .dashboard-page {
          min-height: calc(100vh - 70px);
          padding-bottom: 2rem;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        /* Hero Section */
        .hero-section {
          background: rgba(0, 47, 108, 0.85);
          padding: 3rem 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }

        .hero-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          text-align: center;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .hero-subtitle {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.95);
          text-align: center;
          margin-bottom: 2rem;
          font-weight: 400;
        }

        /* Search Form */
        .search-form {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        }

        .search-inputs {
          display: grid;
          grid-template-columns: 2fr auto 2fr 1.5fr;
          gap: 1.5rem;
          align-items: end;
          margin-bottom: 1.5rem;
        }

        .search-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .search-input-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #000000;
          margin-bottom: 0.25rem;
        }

        .search-input-group select,
        .search-input-group input {
          padding: 0.875rem 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 0.95rem;
          font-family: 'Poppins', sans-serif;
          transition: all 0.3s ease;
          background: white;
          color: #000000;
          font-weight: 500;
        }

        .search-input-group select:focus,
        .search-input-group input:focus {
          outline: none;
          border-color: #f57c00;
          box-shadow: 0 0 0 3px rgba(245, 124, 0, 0.1);
        }

        .search-input-group option {
          color: #000000;
          background: white;
          padding: 0.5rem;
        }

        .swap-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f57c00;
          padding-bottom: 0.5rem;
        }

        .search-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #f57c00 0%, #e65100 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(245, 124, 0, 0.3);
        }

        .search-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(245, 124, 0, 0.4);
        }

        .search-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Search Results */
        .search-results {
          margin-top: 2rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.75rem;
          font-weight: 700;
          color: #000000;
          margin-bottom: 1.5rem;
        }

        .trains-grid {
          display: grid;
          gap: 1.5rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .empty-state-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-state-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #000000;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          font-size: 1rem;
          color: #000000;
        }

        /* Quick Actions */
        .quick-actions {
          margin-top: 3rem;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .action-card {
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid transparent;
          border-radius: 16px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .action-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
          border-color: var(--accent-color);
        }

        .action-icon-wrapper {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--accent-color), color-mix(in srgb, var(--accent-color) 80%, black));
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px color-mix(in srgb, var(--accent-color) 40%, transparent);
        }

        .action-card:hover .action-icon-wrapper {
          transform: scale(1.1);
        }

        .action-label {
          font-size: 1.1rem;
          font-weight: 600;
          color: #000000;
          text-align: center;
        }

        /* Animations */
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
          animation: fadeIn 0.6s ease;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .search-inputs {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .swap-icon {
            transform: rotate(90deg);
            padding: 0;
          }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 1.75rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .search-form {
            padding: 1.5rem;
          }

          .section-title {
            font-size: 1.5rem;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
