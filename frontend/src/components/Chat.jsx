import React, { useState, useEffect } from 'react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import icon from '../assets/icon.png';
import API_BASE_URL from '../apiConfig'; // Adjust path as needed

const Chat = ({ response, latexPreview, messages, setMessages }) => {
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationContext, setConversationContext] = useState({
        topic: null,
        lastQuestion: null,
        lastResponse: null,
        currentHintNumber: 1
    });

    const renderResponseWithLatex = (text) => {
        const sections = text.split(/###|(?=\*\*Step)/).filter(section => section.trim());
        
        return sections.map((section, index) => {
            if (!section.trim()) return null;
    
            let headerText;
            let content = section.trim();
    
            if (content.startsWith('Step')) {
                const stepNumber = content.match(/Step (\d+)/)?.[1];
                const stepTitle = content.split('\n')[0].replace(/^Step \d+:?\s*/, '').trim();
                headerText = `Step ${stepNumber}: ${stepTitle}`;
                content = content.split('\n').slice(1).join('\n').trim();
            } else if (content.toLowerCase().includes('encouragement')) {
                headerText = '💡 Note';
                content = content.replace(/Encouragement/, '').trim();
            } else if (content.includes('Conclusion')) {
                headerText = 'Conclusion';
                content = content.replace(/Conclusion/, '').trim();
            } else {
                headerText = 'Explanation';
                content = content.replace(/Explanation:/, '').trim();
            }
    
            return (
                <div key={index} style={{ marginBottom: '20px', padding: '5px', display: 'block' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                        {headerText}
                    </div>
                    <div style={{ marginLeft: '20px', whiteSpace: 'pre-line' }}>
                        <MathJax>{content}</MathJax>
                    </div>
                </div>
            );
        }).filter(Boolean);
    };

    const handleSendMessage = async (message, type = 'regular') => {
        console.log("handleSendMessage called with:", {message, type});
        const messageToSend = message || userInput;
        if (!messageToSend.trim()) return;
    
        // Only add user message if it's coming from input field, not from buttons
        if (!message) {
            setMessages(prev => [...prev, { sender: 'user', text: messageToSend }]);
        }
        setLoading(true);
    
        try {
            const response = await fetch(`${API_BASE_URL}/api/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input: messageToSend,
                    submissionType: 'chat',
                    context: {
                        previousMessages: messages,
                        messageType: type,
                        hintNumber: type === 'hint' ? conversationContext.currentHintNumber : 1,
                        lastQuestion: conversationContext.lastQuestion,
                        lastResponse: conversationContext.lastResponse
                    }
                }),
            });
    
            const data = await response.json();
            
            // For hint type, maintain existing hint functionality
            if (type === 'hint') {
                setMessages(prev => [...prev, 
                    { sender: 'ai', text: data.response },
                    { 
                        sender: 'ai', 
                        text: conversationContext.currentHintNumber < 4 ? 
                            'Would you like another hint? Click the hint button again.' : 
                            'You\'ve seen all the hints! Try solving it now or click "Don\'t Know?" for the full solution.',
                        isPrompt: true 
                    }
                ]);
    
                setConversationContext(prev => ({
                    ...prev,
                    currentHintNumber: Math.min(prev.currentHintNumber + 1, 4),
                    lastQuestion: messageToSend,
                    lastResponse: data.response
                }));
            } else {
                // For regular messages, just add one single response
                setMessages(prev => [...prev, { sender: 'ai', text: data.response }]);
                
                setConversationContext(prev => ({
                    ...prev,
                    currentHintNumber: 1,
                    lastQuestion: messageToSend,
                    lastResponse: data.response
                }));
            }
    
        } catch (err) {
            console.error('Failed to fetch AI response:', err);
            setMessages(prev => [...prev, { 
                sender: 'ai', 
                text: 'Unable to get response from AI.' 
            }]);
        } finally {
            setLoading(false);
            setUserInput('');
        }
    };

    useEffect(() => {
        if (messages.length > 0 && messages[messages.length - 1].sender === 'user' && 
            messages[messages.length - 1].type) {  // Only trigger for messages with a type (hint/don't know)
            handleSendMessage(messages[messages.length - 1].text, messages[messages.length - 1].type);
        }
    }, [messages]);

    return (
        <MathJaxContext>
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 bg-gray-800 rounded-lg">
                    {messages.map((message, index) => (
                        <div key={index} className={`flex ${message.sender === 'ai' ? 'items-start' : 'items-end justify-end'} mb-2`}>
                            {message.sender === 'ai' ? (
                                <>
                                    <img
                                        src={icon}
                                        alt="AI Icon"
                                        className="w-10 h-8"
                                    />
                                    <div className="ml-3 bg-gray-100 p-3 rounded-lg">
                                        <p className="text-sm text-gray-800">{renderResponseWithLatex(message.text)}</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="bg-blue-500 p-3 rounded-lg">
                                        <p className="text-sm text-white">
                                            <MathJax>{message.text}</MathJax>
                                        </p>
                                    </div>
                                    <img
                                        src="https://s3.amazonaws.com/37assets/svn/765-default-avatar.png"
                                        alt="User Avatar"
                                        className="w-8 h-8 rounded-full ml-3"
                                    />
                                </>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="flex items-center mb-2">
                            <svg
                                className="animate-spin h-5 w-5 text-blue-500 mr-3"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex items-center">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSendMessage();
                            }
                        }}
                        className="flex-1 py-2 px-3 rounded-full bg-gray-100 focus:outline-none text-black"
                    />
                    <button 
                        onClick={() => handleSendMessage()}
                        className="bg-blue-500 text-white px-4 py-2 rounded-full ml-3 hover:bg-blue-600"
                    >
                        Send
                    </button>
                </div>
            </div>
        </MathJaxContext>
    );
};

export default Chat;
