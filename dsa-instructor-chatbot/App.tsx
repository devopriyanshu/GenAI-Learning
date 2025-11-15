
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chat } from '@google/genai';
import { startChat, sendMessage } from './services/geminiService';
import { ChatMessage, ChatRole } from './types';
import { BotIcon, UserIcon, SendIcon, CopyIcon } from './components/icons';

// CodeBlock component defined outside App to prevent re-creation on renders
interface CodeBlockProps {
  codeContent: string;
}
const CodeBlock: React.FC<CodeBlockProps> = ({ codeContent }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(codeContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-800 rounded-lg my-2 font-mono text-sm shadow-lg">
            <div className="bg-gray-700 text-gray-300 px-4 py-2 rounded-t-lg flex justify-between items-center">
                <span>Code Block</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    disabled={copied}
                >
                    <CopyIcon copied={copied} />
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-white">
                <code>{codeContent}</code>
            </pre>
        </div>
    );
};


// MessageRenderer component defined outside App to prevent re-creation on renders
interface MessageRendererProps {
  text: string;
}
const MessageRenderer: React.FC<MessageRendererProps> = ({ text }) => {
    const parts = text.split(/(```[\w\s-]*\n[\s\S]*?\n```)/g);
    
    return (
        <>
            {parts.map((part, index) => {
                if (part.startsWith('```')) {
                    const codeContent = part.substring(part.indexOf('\n') + 1, part.lastIndexOf('```')).trim();
                    return <CodeBlock key={index} codeContent={codeContent} />;
                }
                return (
                    <p key={index} className="whitespace-pre-wrap leading-relaxed">
                        {part}
                    </p>
                );
            })}
        </>
    );
};

const App: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeChat = () => {
      try {
        const chatSession = startChat();
        setChat(chatSession);
        setMessages([
          {
            role: ChatRole.MODEL,
            parts: [{ text: "Hello! I am your DSA Instructor. How can I help you with Data Structures and Algorithms today?" }],
          },
        ]);
      } catch (e) {
        setError("Failed to initialize chat. Please check your API key and refresh the page.");
        console.error(e);
      }
    };
    initializeChat();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chat) return;

    const userMessage: ChatMessage = {
      role: ChatRole.USER,
      parts: [{ text: userInput }],
    };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const responseText = await sendMessage(chat, userInput);
      const modelMessage: ChatMessage = {
        role: ChatRole.MODEL,
        parts: [{ text: responseText }],
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to get response: ${errorMessage}`);
      setMessages(prev => [...prev, {
        role: ChatRole.MODEL,
        parts: [{ text: `Sorry, I encountered an error. ${errorMessage}` }]
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, chat]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200 font-sans">
      <header className="bg-gray-800 shadow-md p-4 text-center border-b border-gray-700">
        <h1 className="text-2xl font-bold text-indigo-400">DSA Instructor AI</h1>
        <p className="text-sm text-gray-400">Your personal guide to Data Structures & Algorithms</p>
      </header>

      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-4 ${msg.role === ChatRole.USER ? 'justify-end' : 'justify-start'}`}>
            {msg.role === ChatRole.MODEL && (
              <div className="flex-shrink-0 bg-gray-700 rounded-full p-1">
                <BotIcon />
              </div>
            )}
            <div className={`max-w-xl lg:max-w-2xl px-5 py-3 rounded-2xl ${msg.role === ChatRole.USER
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-gray-700 text-gray-200 rounded-bl-none'
              }`}>
              <MessageRenderer text={msg.parts[0].text} />
            </div>
            {msg.role === ChatRole.USER && (
              <div className="flex-shrink-0 bg-gray-700 rounded-full p-1">
                <UserIcon />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-4 justify-start">
             <div className="flex-shrink-0 bg-gray-700 rounded-full p-1">
                <BotIcon />
              </div>
            <div className="max-w-xl lg:max-w-2xl px-5 py-3 rounded-2xl bg-gray-700 rounded-bl-none">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-150"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        )}
         {error && <div className="text-red-400 text-center p-2 bg-red-900/50 rounded-md">{error}</div>}
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 p-4 sticky bottom-0">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-center gap-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask about arrays, sorting, graphs..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-full py-3 px-5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            disabled={isLoading || !chat}
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim() || !chat}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full p-3 transition-colors flex-shrink-0"
          >
            <SendIcon />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default App;
