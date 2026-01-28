import React from 'react';
import './ScreenList.css'; // Reusing generic modal styles if available

const MapModal = ({ latitude, longitude, address, onClose }) => {
    // If lat/long are available, prefer them. 
    // If not, fallback to address.
    // Using Google Maps Embed API with 'place' mode for address or 'view' for coords

    let mapSrc = '';

    if (latitude && longitude) {
        mapSrc = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
    } else if (address) {
        // Encode address for URL
        const encodedAddress = encodeURIComponent(address);
        mapSrc = `https://maps.google.com/maps?q=${encodedAddress}&z=15&output=embed`;
    } else {
        return null; // Nothing to show
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '800px', width: '90%', height: '500px', padding: '0', display: 'flex', flexDirection: 'column' }}>
                <div className="modal-header" style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Location View</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <div className="modal-body" style={{ flex: 1, position: 'relative' }}>
                    <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
                        src={mapSrc}
                        allowFullScreen
                        title="Screen Location Map"
                    ></iframe>
                </div>

                <div className="modal-footer" style={{ padding: '15px', borderTop: '1px solid #eee' }}>
                    <strong>Address:</strong> {address || "Coordinates provided"}
                </div>
            </div>
        </div>
    );
};

export default MapModal;
