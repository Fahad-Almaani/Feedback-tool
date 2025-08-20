import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { generateFromAI } from '../../utils/AIservice';

// Add custom styles for animations
const customStyles = `
  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
    }
    50% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.6);
    }
  }
  
  @keyframes spin-reverse {
    from {
      transform: rotate(360deg);
    }
    to {
      transform: rotate(0deg);
    }
  }
  
  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  .animate-spin-reverse {
    animation: spin-reverse 1s linear infinite;
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('input-ai-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'input-ai-styles';
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);
}

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
 * @param {string} props.systemPrompt - System prompt for AI generation
 * @param {Object} props.aiConfig - Additional AI configuration options
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
    rows = 3,
    systemPrompt = null,
    aiConfig = {}
}) => {
    const [isAILoading, setIsAILoading] = useState(false);

    // Function to handle the AI button click
    const handleAIClick = async () => {
        console.log("🎯 InputWithAI - AI button clicked with value:", {
            value: value?.substring(0, 100) + (value?.length > 100 ? "..." : ""),
            hasOnAIClick: !!onAIClick,
            valueLength: value?.length
        });

        if (!value.trim()) {
            console.warn("⚠️ InputWithAI - No text entered");
            alert('Please enter some text first to get AI assistance.');
            return;
        }

        console.log("🔄 InputWithAI - Setting loading state to true");
        setIsAILoading(true);

        try {
            // If an onAIClick handler is provided as a prop, use it.
            if (onAIClick) {
                console.log("🎨 InputWithAI - Using custom onAIClick handler");
                const result = await onAIClick(value);

                console.log("📤 InputWithAI - onAIClick result:", {
                    result: result?.substring(0, 200) + (result?.length > 200 ? "..." : ""),
                    type: typeof result,
                    hasResult: !!result
                });

                // If the handler returns a result, update the input value
                if (result && typeof result === 'string') {
                    console.log("✏️ InputWithAI - Updating input value with result");
                    if (onChange) {
                        const event = {
                            target: {
                                value: result
                            }
                        };
                        onChange(event);
                    } else {
                        console.warn("⚠️ InputWithAI - No onChange handler provided");
                    }
                } else {
                    console.warn("⚠️ InputWithAI - No valid result returned from onAIClick");
                }
                return;
            }

            // Default AI logic if no prop is provided
            console.log("🤖 InputWithAI - Using default AI logic");
            const aiResponse = await generateFromAI({
                prompt: value,
                systemPrompt: systemPrompt || "You are a helpful assistant that improves and enhances user input while maintaining the original intent.",
                ...aiConfig
            });

            console.log("📥 InputWithAI - Default AI response:", {
                response: aiResponse?.substring(0, 200) + (aiResponse?.length > 200 ? "..." : ""),
                length: aiResponse?.length
            });

            // Update the input value with AI-enhanced content
            if (onChange) {
                console.log("✏️ InputWithAI - Updating input with AI response");
                const event = {
                    target: {
                        value: aiResponse
                    }
                };
                onChange(event);
            } else {
                console.warn("⚠️ InputWithAI - No onChange handler for default AI");
            }
        } catch (error) {
            console.error('❌ InputWithAI - AI generation failed:', error);
            console.error('❌ InputWithAI - Error details:', {
                message: error.message,
                stack: error.stack
            });
            alert('Failed to generate AI content. Please try again.');
        } finally {
            console.log("🔄 InputWithAI - Setting loading state to false");
            setIsAILoading(false);
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
                        disabled={isAILoading}
                        className={`flex items-center justify-center w-10 h-10 rounded-full text-white shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform ${isAILoading
                            ? 'bg-gradient-to-r from-blue-400 to-purple-500 scale-95 cursor-not-allowed animate-pulse-glow'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-110 hover:shadow-xl active:scale-95'
                            }`}
                        aria-label="Activate AI assistant"
                        type="button"
                        style={{
                            background: isAILoading
                                ? 'linear-gradient(45deg, #60a5fa, #a855f7)'
                                : 'linear-gradient(45deg, #2563eb, #7c3aed)'
                        }}
                    >
                        {/* The Lucide AI icon with enhanced loading state */}
                        {isAILoading ? (
                            <div className="relative">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <div className="absolute inset-0 w-5 h-5 border-2 border-transparent border-t-white rounded-full animate-spin-reverse" style={{ animationDelay: '0.1s' }}></div>
                            </div>
                        ) : (
                            <Sparkles size={18} className="drop-shadow-sm" />
                        )}
                    </button>

                    {/* Tooltip */}
                    {!isAILoading && (
                        <div className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                            {value.trim() ? 'Improve with AI' : 'Enter text first'}
                        </div>
                    )}

                    {/* Loading tooltip */}
                    {isAILoading && (
                        <div className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs text-white bg-blue-900 rounded whitespace-nowrap pointer-events-none animate-bounce">
                            AI is thinking...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InputWithAI;