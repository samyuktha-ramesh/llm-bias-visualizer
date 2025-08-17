import React from 'react';
import './LoadingIndicator.css'; // For styling

const LoadingIndicator: React.FC = () => {
    return (
        <div className="loading-container">
            <div className="loading-ring"></div>
            <p>Loading Visualizations</p>
        </div>
    );
};

export default LoadingIndicator;
