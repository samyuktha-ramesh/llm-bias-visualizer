import React, {useState} from 'react';
import './SidePanel.css';

type SidePanelProps = {
    onSelectedTopicsChange: (selectedTopics: number[]) => void;
    topics: string[];
};

const SidePanel: React.FC<SidePanelProps> = ({onSelectedTopicsChange, topics}) => {
    const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(true);

    const handleCheckboxChange = (index: number) => {
        const updatedSelectedTopics = selectedTopics.includes(index)
            ? selectedTopics.filter((i) => i !== index)
            : [...selectedTopics, index];

        setSelectedTopics(updatedSelectedTopics);
        onSelectedTopicsChange(updatedSelectedTopics); // notify parent component
    };

    const toggleSidePanel = () => {
        setIsOpen(!isOpen);
    }

    return (
        <div>
            <div className={`side-panel ${isOpen ? 'open': 'closed'}`}>
                {isOpen && <span className="material-symbols-outlined" onClick={toggleSidePanel}>close</span>}
                <ul className="topic-filter-list">
                    {isOpen && topics.map((topic, index) => (
                        <li key={index}>
                            <input 
                            type="checkbox"
                            checked={selectedTopics.includes(index)}
                            onChange={() => handleCheckboxChange(index)}
                            />
                        {topic}</li>
                    ))}
                </ul>

            </div>
            {!isOpen && (
                    <button className="side-panel-banner" onClick={toggleSidePanel}>
                        Topics
                    </button>
            )}
        </div>
    )
}

export default SidePanel;