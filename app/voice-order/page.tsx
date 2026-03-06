'use client';

import { useState } from 'react';
import { Mic, MicOff, Loader2, ChevronLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function VoiceOrderPage() {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');

    function startListening() {
        const SpeechRecognition =
            (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

        if (!SpeechRecognition) {
            alert('Your browser does not support voice recognition. Please use Chrome.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = async (event: any) => {
            const said = event.results[0][0].transcript;
            setTranscript(said);
            setIsProcessing(true);
            setAiResponse('');

            try {
                const res = await fetch('/api/voice-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transcript: said }),
                });
                const data = await res.json();
                setAiResponse(data.reply || 'Order received!');
                speak(data.reply || 'Your order has been placed!');
            } catch (err) {
                setAiResponse('Something went wrong. Please try again.');
            } finally {
                setIsProcessing(false);
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.start();
    }

    function speak(text: string) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text.replace(/\*\*/g, ''));
            utterance.rate = 1;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                <Link href="/order" className="text-gray-500 hover:text-gray-900 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <span className="font-black text-blue-600 text-lg">Voice Order</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-sm mx-auto w-full">
                {/* Icon */}
                <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 transition-all duration-300 ${isListening
                        ? 'bg-red-500 shadow-2xl shadow-red-200 scale-110 animate-pulse'
                        : 'bg-blue-600 shadow-xl shadow-blue-200'
                    }`}>
                    {isListening
                        ? <MicOff className="w-14 h-14 text-white" />
                        : <Mic className="w-14 h-14 text-white" />
                    }
                </div>

                <h1 className="text-2xl font-black text-gray-900 mb-2 text-center">
                    {isListening ? 'Listening...' : 'Tap to Speak'}
                </h1>
                <p className="text-gray-500 text-sm text-center mb-8 leading-relaxed">
                    Say something like:<br />
                    <span className="font-semibold text-gray-700">"I'd like two Jollof Rice and one Chapman"</span>
                </p>

                {/* Button */}
                <button
                    onClick={startListening}
                    disabled={isListening || isProcessing}
                    className={`w-full py-4 rounded-2xl font-bold text-white text-lg transition-all ${isListening
                            ? 'bg-red-500 cursor-not-allowed'
                            : isProcessing
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-100'
                        }`}
                >
                    {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Start Voice Order'}
                </button>

                {/* Transcript */}
                {transcript && (
                    <div className="mt-6 w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">You said:</p>
                        <p className="text-gray-900 font-semibold text-sm">"{transcript}"</p>
                    </div>
                )}

                {/* AI Response */}
                {(isProcessing || aiResponse) && (
                    <div className="mt-4 w-full bg-blue-50 border border-blue-100 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-4 h-4 text-blue-500" />
                            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">AI Response:</p>
                        </div>
                        {isProcessing
                            ? <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                            : <p className="text-gray-800 text-sm font-medium leading-relaxed">{aiResponse}</p>
                        }
                    </div>
                )}

                <Link href="/order" className="mt-8 text-sm text-gray-400 hover:text-blue-600 transition-colors font-medium">
                    Switch to text ordering →
                </Link>
            </div>
        </div>
    );
}
