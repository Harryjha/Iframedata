import React from 'react';
import ChatbotWidget from './components/ChatbotWidget';

function App() { 
    // Check if running in iframe
    const isIframe = window !== window.top;

    return (
        <div className="min-h-screen">
            {!isIframe && <ChatbotWidget />}
        </div>
    );
}

export default App; 
