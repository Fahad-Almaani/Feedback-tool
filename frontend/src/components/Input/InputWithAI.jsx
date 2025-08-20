import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * A modular input field component with an integrated AI button.
 * The AI button is positioned in the bottom-right corner of the input container.
 *
 * This component demonstrates state management for the input value and a basic
 * click handler for the AI button.
 *
 * @returns {JSX.Element} The InputWithAI component.
 */
const InputWithAI = () => {
    // State to manage the value of the input field
    const [inputValue, setInputValue] = useState('');

    // Function to handle changes in the input field
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    // Function to handle the AI button click
    const handleAIClick = () => {
        // This is where you would integrate your AI logic.
        // For now, it just logs the current input value.
        console.log('AI button clicked! Current input:', inputValue);
        alert('AI function triggered!'); // Use a custom modal for production.
    };

    return (
        // The main container for the input component.
        // We use `relative` to allow absolute positioning of the AI button.
        <div className="relative w-full max-w-lg mx-auto">
            <div className="relative rounded-xl shadow-lg border border-gray-200 bg-white overflow-hidden p-2">
                {/* The text input field */}
                <textarea
                    className="w-full min-h-[60px] p-2 pr-10 text-gray-800 text-sm focus:outline-none resize-none placeholder-gray-400"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Type your message here..."
                />

                {/* The AI button container.
            We use `absolute` and position it in the bottom-right.
            The `translate-y-1/2` and `translate-x-1/2` adjustments
            help to center it perfectly on the corner.
            We use `bottom-0 right-0` to position it in the corner.
        */}
                <div className="absolute bottom-2 right-2">
                    <button
                        onClick={handleAIClick}
                        className="flex items-center justify-center p-2 rounded-full text-white bg-blue-600 shadow-md transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        aria-label="Activate AI assistant"
                    >
                        {/* The Lucide AI icon */}
                        <Sparkles size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main App component to demonstrate the InputWithAI component
const App = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">AI Input Field</h1>
            <InputWithAI />
        </div>
    );
};

export default App;
