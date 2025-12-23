import React, { useState } from 'react';
import { Marker } from 'react-map-gl';

export default function CustomMarker({ longitude, latitude, imgSrc, color = '#3BAE8C', onClick }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Marker longitude={longitude} latitude={latitude} anchor="bottom" offset={[0, 0]}>
            <div 
                style={{
                    position: 'relative',
                    width: isHovered ? 50 : 40,
                    height: isHovered ? 75 : 60,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={onClick}
            >
                {/* Círculo con imagen */}
                <div style={{
                    width: isHovered ? 50 : 40,
                    height: isHovered ? 50 : 40,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: `5px solid ${color}`,
                    backgroundColor: 'white',
                    boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease-in-out',
                }}>
                    <img
                        src={imgSrc || 'https://via.placeholder.com/40'}
                        alt="marker"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                </div>
                {/* Piquito abajo */}
                <div style={{
                    position: 'absolute',
                    top: isHovered ? 30 : 24,
                    left: '63%',
                    transform: 'translateX(-50%) rotate(45deg)',
                    width: isHovered ? 37 : 30,
                    height: isHovered ? 37 : 30,
                    zIndex: -1,
                    backgroundColor: color,
                    borderRadius: '3px',
                    transition: 'all 0.2s ease-in-out',
                }} />
            </div>
        </Marker>
    );
}
