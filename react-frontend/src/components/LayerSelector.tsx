import React, {useState} from 'react';
import './LayerSelector.css';

type LayerSelectorProps = {
    layer: number;
    setLayer: (layer: number) => void;
}

const LayerSelector: React.FC<LayerSelectorProps> = ({layer, setLayer}) => {

    const handleSelectedLayerChange = (layer: number) => () => {
        setLayer(layer);
    };

    return (
        <div className="layer-selector">
        <span>Layer:</span>
        <div className="layer-boxes">
            {Array.from({ length: 12 }, (_, i) => (
            <button key={i} 
                className={`layer-box ${layer === i + 1 ? 'selected' : ''}`}
                onClick={handleSelectedLayerChange(i+1)}>{i + 1}
            </button>
            ))}
        </div>
        </div>
    );
};

export default LayerSelector;
