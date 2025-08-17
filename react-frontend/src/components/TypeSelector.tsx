import React, { useState } from 'react';

type TypeSelectorProps = {
    type: string;
    setType: (type: string) => void;
};

const TypeSelector: React.FC<TypeSelectorProps> = ({ type, setType }) => {

    return (
        <div className="type-selector">
            <label className="radio-label">
                <input
                    type="radio"
                    value="context-0"
                    checked={type === "context-0"}
                    onChange={() => setType("context-0")}
                />
                Context-0
            </label>
            <label className="radio-label">
                <input
                    type="radio"
                    value="contextualized"
                    checked={type === "contextualized"}
                    onChange={() => setType("contextualized")}
                />
                Contextualized
            </label>
        </div>
    );
};

export default TypeSelector;