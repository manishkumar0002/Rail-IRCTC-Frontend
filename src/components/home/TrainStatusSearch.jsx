import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { API_BASE_URL } from "../../config/api";
import Loader from "../Loader";

const TrainStatusSearch = () => {
  const [trainNumber, setTrainNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [trainStatus, setTrainStatus] = useState(null);
  const [error, setError] = useState("");

  const handleTrainStatusSearch = async (e) => {
    e.preventDefault();
    
    if (!trainNumber.trim()) {
      setError("Please enter a train number");
      return;
    }

    setLoading(true);
    setError("");
    setTrainStatus(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/public/railway/train-status/${trainNumber}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch train status");
      }

      const data = await response.json();
      setTrainStatus(data);
    } catch (err) {
      setError(err.message || "Failed to fetch train status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 px-4 relative perspective-container">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50"></div>
      
      <div className="relative max-w-4xl mx-auto">
        <Card className="card-3d glass-3d depth-shadow-3d border-2 border-blue-100 backdrop-blur-sm bg-white/95 overflow-hidden">
          {/* Decorative 3D Element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full filter blur-3xl transform translate-x-32 -translate-y-32"></div>
          
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl md:text-3xl text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-extrabold drop-shadow-sm">
              🔍 Check Live Train Status
            </CardTitle>
            <CardDescription className="text-center text-base md:text-lg font-medium">
              Enter train number to get real-time running status
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <form onSubmit={handleTrainStatusSearch} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                placeholder="Enter Train Number (e.g., 19484)"
                value={trainNumber}
                onChange={(e) => setTrainNumber(e.target.value)}
                className="flex-1 text-base md:text-lg py-6 border-2 focus:border-blue-500 transition-all duration-300 hover:shadow-lg"
                disabled={loading}
              />
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="btn-3d bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-base md:text-lg font-bold"
                style={{
                  boxShadow: loading ? 'none' : '0 6px 0 #4338ca, 0 10px 20px rgba(79, 70, 229, 0.4)'
                }}
              >
                {loading ? "Searching..." : "Search"}
              </Button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 animate-shake hover-lift-3d">
                <span className="font-semibold">❌ {error}</span>
              </div>
            )}

            {loading && (
              <div className="mt-6">
                <Loader />
              </div>
            )}

            {trainStatus && (
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg text-left animate-slideUp">
                <h3 className="font-semibold text-lg md:text-xl text-green-800 mb-3 flex items-center gap-2">
                  ✅ Train Status Retrieved Successfully
                </h3>
                <pre className="text-xs md:text-sm text-gray-700 overflow-auto max-h-96 bg-white p-4 rounded-lg shadow-inner">
                  {JSON.stringify(trainStatus, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-shake {
          animation: shake 0.5s;
        }

        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
      `}</style>
    </section>
  );
};

export default TrainStatusSearch;
