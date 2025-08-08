'use client';

import { useState, useRef, useEffect } from 'react';
import { Flower2, Sun, Moon, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CompanyLogo } from '@/components/ui/company-logo';
import { extractCompanyNames } from '@/lib/company-resolver';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  companies?: string[];
}

export default function ChatInterface() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error getting AI response:', error);
      return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Check for /logo command
    const logoMatch = message.match(/^\/logo\s+(.+)$/i);
    if (logoMatch) {
      const companyInput = logoMatch[1].trim();
      
      const logoMessage: Message = {
        id: Date.now().toString(),
        content: `Fetching logo for: ${companyInput}`,
        sender: 'ai',
        timestamp: new Date(),
        companies: [companyInput],
      };
      
      setMessages(prev => [...prev, logoMessage]);
      setMessage('');
      return;
    }

    // Extract companies from user message
    const detectedCompanies = extractCompanyNames(message);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
      companies: detectedCompanies.length > 0 ? detectedCompanies : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    // Get AI response
    try {
      let aiResponse = await generateAIResponse(message);
      
      // If companies were detected, enhance the response
      if (detectedCompanies.length > 0) {
        const companyList = detectedCompanies.join(', ');
        aiResponse = `*Detected companies: ${companyList}*\n\n${aiResponse}`;
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        companies: detectedCompanies.length > 0 ? detectedCompanies : undefined,
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const showWelcomeScreen = messages.length === 0;

  return (
    <div className={`h-screen flex flex-col transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50'
    }`}>
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-white/10 backdrop-blur-md z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Flower2 
              className={`w-8 h-8 transition-colors duration-300 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} 
            />
          </div>
          <h1 className={`text-xl font-semibold transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Brand Studio AI
          </h1>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className={`rounded-full transition-colors duration-300 ${
            isDarkMode 
              ? 'hover:bg-white/10 text-yellow-400' 
              : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex flex-col flex-1 overflow-hidden">
        {showWelcomeScreen ? (
          /* Welcome Screen */
          <div className="flex flex-col items-center justify-center flex-1 px-6 py-12">
            <div className="text-center space-y-8 max-w-2xl mx-auto">
              {/* Logo */}
              <div className="relative">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-blue-500/20 backdrop-blur-sm border border-blue-400/20' 
                    : 'bg-blue-100 border border-blue-200'
                }`}>
                  <Flower2 
                    className={`w-12 h-12 transition-colors duration-300 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`} 
                  />
                </div>
                
                {/* Animated rings */}
                <div className={`absolute inset-0 rounded-full border-2 transition-colors duration-300 ${
                  isDarkMode ? 'border-blue-400/20' : 'border-blue-200'
                } animate-ping`}></div>
                <div className={`absolute inset-2 rounded-full border transition-colors duration-300 ${
                  isDarkMode ? 'border-blue-400/10' : 'border-blue-100'
                } animate-pulse`}></div>
              </div>

              {/* Title and Description */}
              <div className="space-y-4">
                <h1 className={`text-4xl md:text-5xl font-bold tracking-tight transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Brand Studio AI
                </h1>
                <p className={`text-lg md:text-xl transition-colors duration-300 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Analyze any brand and create stunning logo animations
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
                {[
                  'Brand Analysis',
                  'Logo Animation',
                  'Creative Design'
                ].map((feature, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg transition-all duration-300 hover:scale-105 ${
                      isDarkMode 
                        ? 'bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10' 
                        : 'bg-white/50 backdrop-blur-sm border border-white/20 hover:bg-white/80'
                    }`}
                  >
                    <span className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] md:max-w-[60%] rounded-2xl px-4 py-3 ${
                      msg.sender === 'user'
                        ? 'bg-blue-500 text-white ml-auto'
                        : isDarkMode
                        ? 'bg-slate-700/50 text-white border border-slate-600/50'
                        : 'bg-white/80 text-slate-900 border border-slate-200'
                    }`}
                  >
                    {/* Company logos */}
                    {msg.companies && msg.companies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {msg.companies.slice(0, 3).map((company, index) => (
                          <CompanyLogo
                            key={`${msg.id}-${index}`}
                            company={company}
                            size="sm"
                            className="border border-white/20"
                          />
                        ))}
                        {msg.companies.length > 3 && (
                          <div className="w-8 h-8 rounded-lg bg-slate-600/50 flex items-center justify-center text-xs text-slate-300">
                            +{msg.companies.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className={`max-w-[80%] md:max-w-[60%] rounded-2xl px-4 py-3 ${
                    isDarkMode
                      ? 'bg-slate-700/50 border border-slate-600/50'
                      : 'bg-white/80 border border-slate-200'
                  }`}>
                    <div className="flex space-x-1">
                      <div className={`w-2 h-2 rounded-full animate-bounce ${
                        isDarkMode ? 'bg-slate-400' : 'bg-slate-500'
                      }`} style={{ animationDelay: '0ms' }}></div>
                      <div className={`w-2 h-2 rounded-full animate-bounce ${
                        isDarkMode ? 'bg-slate-400' : 'bg-slate-500'
                      }`} style={{ animationDelay: '150ms' }}></div>
                      <div className={`w-2 h-2 rounded-full animate-bounce ${
                        isDarkMode ? 'bg-slate-400' : 'bg-slate-500'
                      }`} style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </main>

      {/* Message Input */}
      <div className="flex-shrink-0 p-6 border-t border-white/10 backdrop-blur-md">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className={`relative rounded-3xl transition-all duration-300 shadow-lg ${
              isDarkMode 
                ? 'bg-slate-800/60 backdrop-blur-xl border border-slate-700/50' 
                : 'bg-white/90 backdrop-blur-xl border border-slate-200/50'
            }`}>
              <Input
                type="text"
                placeholder={showWelcomeScreen ? "Message Brand Studio AI..." : "Type your message..."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isTyping}
                className={`w-full pr-16 py-4 px-6 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base rounded-3xl transition-colors duration-300 ${
                  isDarkMode 
                    ? 'text-white placeholder:text-slate-400' 
                    : 'text-slate-900 placeholder:text-slate-500'
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Button
                  type="submit"
                  size="icon"
                  disabled={!message.trim() || isTyping}
                  className={`w-10 h-10 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                    message.trim() && !isTyping
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0' 
                      : isDarkMode 
                        ? 'bg-slate-700/50 text-slate-500 border border-slate-600/30 hover:bg-slate-600/50' 
                        : 'bg-slate-200/50 text-slate-400 border border-slate-300/30 hover:bg-slate-300/50'
                  }`}
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </form>
          
          <p className={`text-xs text-center mt-4 transition-colors duration-300 ${
            isDarkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Brand Studio AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
}