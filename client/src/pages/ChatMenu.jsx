import React, { useState, useEffect, useRef } from "react";

const ChatMenu = () => {

const [userInfo, setUserInfo] = useState({
rollNumber: "",
program: "",
});
const [isUserVerified, setIsUserVerified] = useState(false);
const [menuItems, setMenuItems] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [currentKey, setCurrentKey] = useState(null);
const [navigationHistory, setNavigationHistory] = useState([]);
const [chatHistory, setChatHistory] = useState([
{
type: "bot",
title: "Welcome to Student Portal",
options: ["Student", "News", "Event"],
},
]);
const [selectedOption, setSelectedOption] = useState(null);
const [disabledOptions, setDisabledOptions] = useState([]);
const [inputEnabled, setInputEnabled] = useState(false);

const messagesEndRef = useRef(null);

const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
};

useEffect(() => {
    scrollToBottom();
}, [chatHistory]);

const handleUserInput = (field, value) => {
setUserInfo((prev) => ({
...prev,
[field]: value,
}));
};

const handleSubmitUserInfo = async () => {
if (!userInfo.rollNumber || !userInfo.program) {
return;
}

try {
console.log('Submitting with:', userInfo);

const response = await fetch(
`http://localhost:8080/api/v1/student/getall?Rollno=${userInfo.rollNumber}&program=${userInfo.program}`,
{
method: "GET",
headers: {
"Content-Type": "application/json",
}
});

const data = await response.json();
console.log('API Response:', data);

if (data.success) {
setInputEnabled(false);
setChatHistory((prev) => [
...prev,
{
type: "user",
text: `Roll No: ${userInfo.rollNumber}`,
},
{
type: "bot",
title: "Student Verified",
text: `Welcome ${data.data[0].name}!`,
},
{
type: "bot",
title: "Select an option",
options: ["Results", "Fee Details", "Student Details"],
},
]);
setIsUserVerified(true);
} else {
setChatHistory((prev) => [
...prev,
{
type: "bot",
title: "Error",
text: `Invalid combination. Please ensure you're entering a valid ${userInfo.program} roll number.`,
},
]);
// Reset roll number but keep the program
setUserInfo(prev => ({
...prev,
rollNumber: ""
}));
}
} catch (error) {
console.error("Error verifying student:", error);
setChatHistory((prev) => [
...prev,
{
type: "bot",
title: "Error",
text: "Failed to verify student. Please try again.",
},
]);
}
};

const handleOptionClick = async (optionText) => {
if (!optionText) return;

setSelectedOption(optionText);

// Handle program selection (B.Tech, M.Tech, Others)
if (["B.Tech", "M.Tech", "Others"].includes(optionText)) {
setUserInfo(prev => ({
...prev,
program: optionText
}));
setInputEnabled(true);
setChatHistory((prev) => [
...prev,
{
type: "user",
text: `Selected Program: ${optionText}`,
},
{
type: "bot",
title: "Please provide your Application Number",
text: `Enter your ${optionText} roll number`,
},
]);
return;
}

// If one of the main options is clicked, disable all three
if (["Results", "Fee Details", "Student Details"].includes(optionText)) {
setDisabledOptions((prev) => [
...prev,
"Results",
"Fee Details",
"Student Details",
]);
}
// If one of the program options is clicked, disable all program options
else if (["B.Tech", "M.Tech", "Others"].includes(optionText)) {
setDisabledOptions((prev) => [...prev, "B.Tech", "M.Tech", "Others"]);
setUserInfo(prev => ({
...prev,
program: optionText
}));
setInputEnabled(true);
setChatHistory((prev) => [
...prev,
{
type: "bot",
title: "Please provide your Application Number",
},
]);
return;
}
// For other non-semester options, just disable the clicked one
else if (!optionText.startsWith("Semester")) {
setDisabledOptions((prev) => [...prev, optionText]);
}

// Add user's selection to chat
setChatHistory((prev) => [
...prev,
{
type: "user",
text: optionText,
},
]);

// Handle main menu options
switch (optionText) {
case "Student":
setChatHistory((prev) => [
...prev,
{
type: "bot",
title: "Select your program",
options: ["B.Tech", "M.Tech", "Others"],
},
]);
return;
case "B.Tech":
case "M.Tech":
case "Others":
setInputEnabled(true);
setChatHistory((prev) => [
...prev,
{
type: "bot",
title: "Please provide your Application Number",
},
]);
return;
case "News":
setChatHistory((prev) => [
...prev,
{
type: "bot",
title: "News",
text: "Latest news will be displayed here.",
},
]);
return;
case "Event":
setChatHistory((prev) => [
...prev,
{
type: "bot",
title: "Events",
text: "Upcoming events will be displayed here.",
},
]);
return;
}

// If Results is clicked, show semester options
if (optionText === "Results") {
setChatHistory((prev) => [
...prev,
{
type: "bot",
title: "Select Semester",
options: [
"Semester 1",
"Semester 2",
"Semester 3",
"Semester 4",
"Semester 5",
"Semester 6",
"Semester 7",
"Semester 8",
],
},
]);
return;
}

// Handle semester selection
if (optionText.startsWith("Semester")) {
    const semesterNumber = optionText.split(" ")[1];
    try {
        const response = await fetch(
            `http://localhost:8080/api/v1/student/getresults?Rollno=${userInfo.rollNumber}&program=${userInfo.program}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        const data = await response.json();
        console.log('Results API Response:', data);

        if (!data.success) {
            throw new Error(data.message);
        }

        // Find the specific semester result
        const semesterResult = data.data.find(
            (result) => result.semester === parseInt(semesterNumber)
        );

        if (!semesterResult) {
            setChatHistory((prev) => [
                ...prev,
                {
                    type: "bot",
                    title: "No Results Found",
                    text: `No results available for Semester ${semesterNumber}`,
                },
            ]);
            return;
        }

        const resultDisplay = `
Semester ${semesterNumber} Results
----------------------------------------
Total Marks: ${semesterResult.totalMarks || 'N/A'}
Percentage: ${semesterResult.percentage || 'N/A'}%
Result: ${semesterResult.result || 'N/A'}
`;

        setChatHistory((prev) => [
            ...prev,
            {
                type: "bot",
                title: `Semester ${semesterNumber} Results`,
                text: resultDisplay,
            },
        ]);
    } catch (error) {
        console.error("Error fetching results:", error);
        setChatHistory((prev) => [
            ...prev,
            {
                type: "bot",
                title: "Error",
                text: `Failed to fetch results: ${error.message}`,
            },
        ]);
    }
    return;
}

// Handle other options (Fee Details, Student Details)
try {
    let endpoint;
    switch (optionText) {
        case "Fee Details":
            endpoint = "getfees";
            break;
        case "Student Details":
            endpoint = "getall";
            break;
        default:
            return;
    }

    const response = await fetch(
        `http://localhost:8080/api/v1/student/${endpoint}?Rollno=${userInfo.rollNumber}&program=${userInfo.program}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    const data = await response.json();
    console.log('API Response:', data);

    if (!data.success) {
        throw new Error(data.message);
    }

    if (optionText === "Fee Details") {
        // Format the fees display with number checks
        const feesDisplay = `
Fees Details
----------------------------------------
Due Amount: ₹${Number(data.data.dueAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
Paid Amount: ₹${Number(data.data.paidAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
Balance: ₹${Number(data.data.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
Status: ${data.data.status}
`;

        setChatHistory((prev) => [
            ...prev,
            {
                type: "bot",
                title: "Fees Information",
                text: feesDisplay,
            },
        ]);
    } else {
        // Handle Student Details
        setChatHistory((prev) => [
            ...prev,
            {
                type: "bot",
                title: `${optionText} Information`,
                text: JSON.stringify(data.data, null, 2),
            },
        ]);
    }
} catch (error) {
    console.error("Error fetching data:", error);
    setChatHistory((prev) => [
        ...prev,
        {
            type: "bot",
            title: "Error",
            text: `Failed to fetch data: ${error.message}`,
        },
    ]);
}
};

const handleClearChat = () => {
setSelectedOption(null);
setDisabledOptions([]); // Reset disabled options
setChatHistory([
{
type: "bot",
title: "Welcome to Student Portal",
options: ["Student", "News", "Event"],
},
]);
setUserInfo({
rollNumber: "",
program: "",
});
setIsUserVerified(false);
};

return (
    <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-1 bg-indigo-50">
            <div className="w-full h-full bg-white relative flex flex-col">
                {/* Chat history container with auto-scroll */}
                <div 
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                    style={{ maxHeight: 'calc(100vh - 180px)' }}
                    ref={(el) => {
                        // Auto-scroll to bottom when new messages are added
                        if (el) {
                            el.scrollTop = el.scrollHeight;
                        }
                    }}
                >
                    {chatHistory.map((chat, index) => (
                        <div key={index} className="flex flex-col space-y-3">
                            {chat.type === "bot" && (
                                <>
                                    <div className="bg-emerald-600 text-white px-6 py-3 rounded-full w-fit">
                                        {chat.title}
                                    </div>
                                    {chat.options ? (
                                        <div className={`grid ${
                                            chat.options.length === 8
                                                ? "grid-cols-2 gap-3"
                                                : "flex flex-col space-y-2"
                                        }`}>
                                            {chat.options.map((option, optIndex) => (
                                                <button
                                                    key={optIndex}
                                                    onClick={() => handleOptionClick(option)}
                                                    disabled={disabledOptions.includes(option)}
                                                    className={`px-4 py-2 rounded-full text-sm ${
                                                        chat.options.length === 8 ? "w-full" : "w-fit"
                                                    } ${
                                                        disabledOptions.includes(option)
                                                            ? "bg-gray-400 cursor-not-allowed"
                                                            : "bg-indigo-600 hover:bg-indigo-700"
                                                    } text-white`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded font-mono text-sm">
                                            {chat.text}
                                        </pre>
                                    )}
                                </>
                            )}
                            {chat.type === "user" && (
                                <div className="flex justify-end">
                                    <div className="bg-violet-600 text-white px-6 py-3 rounded-full w-fit">
                                        {chat.text}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div ref={messagesEndRef} />

                {/* Input container */}
                <div className="p-4 bg-white border-t">
                    <div className="flex space-x-3">
                        <input
                            type="text"
                            placeholder="Enter Here"
                            value={userInfo.rollNumber}
                            onChange={(e) => handleUserInput('rollNumber', e.target.value)}
                            disabled={!inputEnabled}
                            className={`border p-2 rounded-lg flex-grow ${
                                !inputEnabled ? 'bg-gray-100' : 'bg-white'
                            }`}
                        />
                        <button
                            onClick={handleSubmitUserInfo}
                            disabled={!inputEnabled}
                            className={`px-6 py-2 rounded-full ${
                                !inputEnabled
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                            } text-white`}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
};

export default ChatMenu;