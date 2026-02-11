import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin } from 'lucide-react';

const MapModal = ({ latitude, longitude, address, onClose }) => {
    // If lat/long are available, prefer them. 
    // If not, fallback to address.
    let mapSrc = '';

    if (latitude && longitude) {
        mapSrc = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
    } else if (address) {
        const encodedAddress = encodeURIComponent(address);
        mapSrc = `https://maps.google.com/maps?q=${encodedAddress}&z=15&output=embed`;
    } else {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[600px] max-h-[90vh]"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-white z-10">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <MapPin className="text-brand-600" size={20} />
                            Location View
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 relative bg-slate-100">
                        <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            style={{ border: 0 }}
                            src={mapSrc}
                            allowFullScreen
                            title="Screen Location Map"
                            className="absolute inset-0"
                        ></iframe>
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-slate-50 text-sm text-slate-600">
                        <strong className="text-slate-800">Address:</strong> {address || "Coordinates provided"}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MapModal;
