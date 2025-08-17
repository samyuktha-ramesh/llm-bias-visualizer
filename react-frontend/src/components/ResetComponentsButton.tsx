import React from 'react';
import './ResetComponentsButton.css';
import { Console } from 'console';

type ResetButtonProps = {
    activeComponents: Record<string, Set<string> | null>;
    setActiveComponents: (activeComponents: Record<string, Set<string> | null>) => void;
    };

const Button: React.FC<ResetButtonProps> = ({activeComponents, setActiveComponents}) => {
  const handleClick = () => {
    console.log("Button Clicked: Resetting active components");
    setActiveComponents({});
  };

  return (
    <button className="reset-button" onClick={handleClick}>
      Show All Components
    </button>
  );
};

export default Button;
