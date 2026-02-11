import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Monitor, Maximize, Clock, MoreVertical, Edit, ShieldCheck } from 'lucide-react';
import ApprovalButtons from './ApprovalButtons';
import { useAuth } from '../context/AuthContext';

const ScreenCard = ({ screen, onMapClick, onStatusChange, onApprovalSuccess }) => {
    const navigate = useNavigate();
    const { hasRole } = useAuth();

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700 border-green-200';
            case 'INACTIVE': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'UNDER_MAINTENANCE': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const isOwner = hasRole('SCREEN_OWNER') || (hasRole('ADMIN') && screen.ownerRole === 'ADMIN');
    const isAdmin = hasRole('ADMIN');

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
        >
            {/* Thumbnail / Map Placeholder */}
            <div className="h-48 bg-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-400">
                    <Monitor size={48} opacity={0.5} />
                </div>
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                    {isOwner ? (
                        <div onClick={(e) => e.stopPropagation()} className="relative">
                            <select
                                value={screen.status}
                                onChange={(e) => onStatusChange(screen.id, e.target.value)}
                                className={`text-xs font-bold px-2 py-1 rounded-full border shadow-sm outline-none cursor-pointer appearance-none ${getStatusColor(screen.status)}`}
                            >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                                <option value="UNDER_MAINTENANCE">MAINTENANCE</option>
                                {screen.status === 'REJECTED' && <option value="REJECTED" disabled>REJECTED</option>}
                            </select>
                        </div>
                    ) : (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(screen.status)}`}>
                            {screen.status.replace('_', ' ')}
                        </span>
                    )}
                </div>

                {/* Actions Menu (if needed) */}
                {isOwner && (
                    <button
                        onClick={() => navigate(`/screens/edit/${screen.id}`)}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white text-slate-600 transition-colors"
                    >
                        <Edit size={16} />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                    <h3 className="font-bold text-lg text-slate-800 line-clamp-1 group-hover:text-brand-600 transition-colors">
                        {screen.screenName}
                    </h3>
                    <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                        <MapPin size={14} className="flex-shrink-0" />
                        <span className="truncate">{screen.city}, {screen.country}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <Maximize size={16} className="text-slate-400" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Res</span>
                            <span className="text-xs font-medium text-slate-700">{screen.resolutionWidth}x{screen.resolutionHeight}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <Clock size={16} className="text-slate-400" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Hours</span>
                            <span className="text-xs font-medium text-slate-700">{screen.activeFrom}-{screen.activeTo}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2">
                    <button
                        onClick={() => onMapClick(screen)}
                        className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 ml-auto"
                    >
                        View on Map
                    </button>

                    {hasRole('ADVERTISER') && (
                        <button
                            onClick={() => navigate(`/screens/${screen.id}`)}
                            className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium shadow-lg shadow-slate-900/20 hover:bg-brand-600 hover:shadow-brand-500/30 transition-all active:scale-95"
                        >
                            View Details & Book
                        </button>
                    )}

                    {isOwner && (
                        <button
                            onClick={() => navigate(`/screens/${screen.id}`)}
                            className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Manage Screen
                        </button>
                    )}

                    {/* Admin Approvals */}
                    {isAdmin && screen.status === 'INACTIVE' && screen.ownerRole !== 'ADMIN' && (
                        <div className="mt-2">
                            <ApprovalButtons screenId={screen.id} onSuccess={onApprovalSuccess} />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ScreenCard;
