import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * A modular input field component with an integrated AI button.
 * The AI button is positioned in the bottom-right corner of the input container.
 *
 * This component is a controlled component, accepting its value and change handler
 * as props, making it highly reusable across your application.
 *
 * @param {Object} props - Component props
 * @param {string} props.value - Current input value
 * @param {function} props.onChange - Function to handle input changes
 * @param {string} props.placeholder - Input placeholder text
 * @param {string} props.type - Input type ('input' or 'textarea')
 * @param {function} props.onAIClick - Function to handle AI button click
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.error - Error state
 * @param {number} props.rows - Number of rows for textarea
 * @returns {JSX.Element} The InputWithAI component.
 */
const InputWithAI = ({
    value = '',
    onChange,
    placeholder = 'Type your message here...',
    type = 'textarea',
    onAIClick,
    className = '',
    error = false,
    rows = 3
}) => {
    // Function to handle the AI button click
    const handleAIClick = () => {
        // If an onAIClick handler is provided as a prop, use it.
        // Otherwise, fall back to a default log message.
        if (onAIClick) {
            onAIClick(value);
        } else {
            // Default AI logic if no prop is provided
            console.log('AI button clicked! Current input:', value);
            alert('AI function triggered!'); // Use a custom modal in production.
        }
    };

    return (
        // The main container for the input component.
        // We use `relative` to allow absolute positioning of the AI button.
        // The className prop allows for custom sizing and styling from the parent.
        <div className={`relative w-full ${className}`}>
            <div className={`relative border ${error ? 'border-red-300 focus-within:border-red-500' : 'border-gray-300 focus-within:border-blue-500'} rounded-lg bg-white transition-colors duration-200`}>
                {/* Conditional rendering based on the 'type' prop */}
                {type === 'input' ? (
                    <input
                        type="text"
                        className="w-full !px-6 !py-4 pr-16 !text-gray-900 !text-base !focus:outline-none !placeholder-gray-500 !bg-transparent !rounded-lg !border-0 !box-shadow-none"
                        style={{
                            padding: '16px 64px 16px 24px',
                            fontSize: '16px',
                            lineHeight: '1.5',
                            color: '#111827',
                            backgroundColor: 'transparent',
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            borderRadius: '8px'
                        }}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                    />
                ) : (
                    <textarea
                        className="w-full !px-6 !py-4 pr-16 !text-gray-900 !text-base !focus:outline-none resize-y !placeholder-gray-500 !bg-transparent !rounded-lg !border-0 !box-shadow-none"
                        style={{
                            padding: '16px 64px 16px 24px',
                            fontSize: '16px',
                            lineHeight: '1.5',
                            color: '#111827',
                            backgroundColor: 'transparent',
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            borderRadius: '8px',
                            minHeight: `${Math.max(rows * 24 + 32, 100)}px`
                        }}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        rows={rows}
                    />
                )}

                {/* The AI button container */}
                <div className="absolute bottom-3 right-3">
                    <button
                        onClick={handleAIClick}
                        className="flex items-center justify-center w-8 h-8 rounded-full text-white bg-blue-600 shadow-lg transition-all duration-200 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        aria-label="Activate AI assistant"
                        type="button"
                    >
                        {/* The Lucide AI icon */}
                        <Sparkles size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputWithAI;