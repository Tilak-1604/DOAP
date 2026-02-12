import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { screenAPI } from '../services/api';
import ScreenCard from './ScreenCard';
import MapModal from './MapModal';
import { Search, Filter, SlidersHorizontal, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ScreenList = () => {
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStartTime, setFilterStartTime] = useState('');
  const [filterEndTime, setFilterEndTime] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Map Modal State
  const [selectedMapScreen, setSelectedMapScreen] = useState(null);

  useEffect(() => {
    loadScreens();
  }, [filterStartTime, filterEndTime]);

  const loadScreens = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filterStartTime) params.startTime = filterStartTime;
      if (filterEndTime) params.endTime = filterEndTime;

      const data = await screenAPI.getAllScreens(params);
      setScreens(data);
    } catch (err) {
      console.error("Failed to load screens", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        // optionally redirect or show message
      } else {
        setError('Failed to load screens. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (screenId, newStatus) => {
    try {
      await screenAPI.updateScreenStatus(screenId, newStatus);
      loadScreens(); // Refresh
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const filteredScreens = screens.filter(screen => {
    const query = searchQuery.toLowerCase();
    return (
      (screen.city && screen.city.toLowerCase().includes(query)) ||
      (screen.screenName && screen.screenName.toLowerCase().includes(query)) ||
      (screen.pincode && screen.pincode.includes(query))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-4 justify-between items-center sticky-header z-30">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by City, Screen Name, PIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-xl border transition-colors ${showFilters ? 'bg-brand-50 border-brand-200 text-brand-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {(hasRole('ADMIN') || hasRole('SCREEN_OWNER')) && (
            <button
              onClick={() => navigate('/owner/add-screen')} // Assuming route alias or use conditional
              className="btn-primary whitespace-nowrap"
            >
              + Add Screen
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel (Collapsible) */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white rounded-xl border border-slate-200 p-4 overflow-hidden"
          >
            <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Filter size={16} /> Filters
            </h4>
            <div className="flex flex-wrap gap-4">
              {hasRole('ADVERTISER') && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-500">Available From</label>
                    <input
                      type="time"
                      value={filterStartTime}
                      onChange={(e) => setFilterStartTime(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-500 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-500">Available To</label>
                    <input
                      type="time"
                      value={filterEndTime}
                      onChange={(e) => setFilterEndTime(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-500 outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : filteredScreens.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
          <Map size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700">No screens found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredScreens.map(screen => (
            <ScreenCard
              key={screen.id}
              screen={screen}
              onMapClick={setSelectedMapScreen}
              onStatusChange={handleStatusChange}
              onApprovalSuccess={loadScreens}
            />
          ))}
        </div>
      )}

      {/* Map Modal */}
      {selectedMapScreen && (
        <MapModal
          latitude={selectedMapScreen.latitude}
          longitude={selectedMapScreen.longitude}
          address={selectedMapScreen.address + ", " + selectedMapScreen.city}
          onClose={() => setSelectedMapScreen(null)}
        />
      )}
    </div>
  );
};

export default ScreenList;
