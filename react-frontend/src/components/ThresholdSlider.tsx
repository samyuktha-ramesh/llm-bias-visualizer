import React, { useState } from 'react';

type ThresholdSliderProps = {
    threshold: number;
    setThreshold: (threshold: number) => void;
};

const ThresholdSlider: React.FC<ThresholdSliderProps> = ({ threshold, setThreshold }) => {
    const [tempThreshold, setTempThreshold] = useState<number>(threshold);

    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTempThreshold(parseFloat(event.target.value));
    };

    const handleSliderRelease = () => {
        setThreshold(tempThreshold); // Update the actual threshold only when released
    };

    return (
        <div>
        <label>
            Effect Size: {tempThreshold.toFixed(2)}
            <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={tempThreshold}
            onChange={handleSliderChange}
            onMouseUp={handleSliderRelease}
            onTouchEnd={handleSliderRelease}
            />
        </label>
        </div>
    );
    };

export default ThresholdSlider;
