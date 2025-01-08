import React, { useState } from 'react';
import { FaComments, FaTimes } from 'react-icons/fa';
import ChatMenu from '../pages/ChatMenu';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {isOpen ? (
                <div className="bg-white rounded-lg shadow-xl" style={{ width: '380px', height: '600px' }}>
                    <div className="flex justify-between items-center p-4 bg-indigo-600 text-white rounded-t-lg">
                        <h3 className="font-semibold">Student Portal Chatbot</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-200"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>
                    <div className="h-[calc(600px-64px)]">
                        <ChatMenu />
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                    <FaComments size={24} />
                </button>
            )}
        </div>
    );
};

export default ChatbotWidget; 