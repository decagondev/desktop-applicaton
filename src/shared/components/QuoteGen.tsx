import { useState } from 'react';

export function QuoteGen() {
  const quotes = [
    {
      text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
      author: "Nelson Mandela"
    },
    {
      text: "The way to get started is to quit talking and begin doing.",
      author: "Walt Disney"
    },
    {
      text: "Your time is limited, so don't waste it living someone else's life.",
      author: "Steve Jobs"
    },
    {
      text: "If life were predictable it would cease to be life, and be without flavor.",
      author: "Eleanor Roosevelt"
    },
    {
      text: "If you look at what you have in life, you'll always have more. If you look at what you don't have in life, you'll never have enough.",
      author: "Oprah Winfrey"
    },
    {
      text: "Life is what happens when you're busy making other plans.",
      author: "John Lennon"
    },
    {
      text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.",
      author: "Mother Teresa"
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt"
    }
  ];

  const [quote, setQuote] = useState(quotes[0]);

  const generateRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-lg mx-auto bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Quote Generator</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-sm w-full mb-6">
        <p className="text-lg italic text-gray-700 mb-4">"{quote.text}"</p>
        <p className="text-right font-medium text-gray-600">- {quote.author}</p>
      </div>
      
      <button 
        onClick={generateRandomQuote}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Generate New Quote
      </button>
    </div>
  );
}