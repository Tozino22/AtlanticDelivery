'use client';

import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { createPhoneOrder } from '@/lib/supabase';

interface CallSimulatorProps {
    menuContext: string;
    onMessage: (message: string) => void;
    onClose: () => void;
}

const simulatedScenarios = [
    {
        name: 'Simple Order',
        steps: [
            { speaker: 'Customer', text: 'Hi, I\'d like to place an order for pickup.' },
            { speaker: 'AI', text: 'Great! I\'d be happy to help you with that. What would you like to order?' },
            { speaker: 'Customer', text: 'I\'ll have 2 Margherita Pizzas and 1 Caesar Salad.' },
            { speaker: 'AI', text: 'Perfect! So that\'s 2 Margherita Pizzas and 1 Caesar Salad. Any special instructions?' },
            { speaker: 'Customer', text: 'Extra cheese on the pizzas, please.' },
            { speaker: 'AI', text: 'Got it! Can I get your name and phone number for the order?' },
            { speaker: 'Customer', text: 'John Smith, 555-1234.' },
            { speaker: 'AI', text: 'Thank you, John! Your order for 2 Margherita Pizzas with extra cheese and 1 Caesar Salad will be ready for pickup in about 20 minutes. Your total is $45.50. See you soon!' },
        ],
    },
    {
        name: 'Menu Question',
        steps: [
            { speaker: 'Customer', text: 'What desserts do you have?' },
            { speaker: 'AI', text: 'We have several delicious desserts! Let me tell you about them...' },
            { speaker: 'Customer', text: 'I\'ll take the Chocolate Cake for delivery.' },
            { speaker: 'AI', text: 'Excellent choice! Can I get your name, phone number, and delivery address?' },
            { speaker: 'Customer', text: 'Sarah Johnson, 555-5678, 123 Main Street.' },
            { speaker: 'AI', text: 'Perfect! Your Chocolate Cake will be delivered to 123 Main Street in about 30-40 minutes. Total is $8.99. Thank you!' },
        ],
    },
];

export default function CallSimulator({ menuContext, onMessage, onClose }: CallSimulatorProps) {
    const [selectedScenario, setSelectedScenario] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    function playScenario() {
        setIsPlaying(true);
        const scenario = simulatedScenarios[selectedScenario];

        let step = 0;
        const interval = setInterval(() => {
            if (step >= scenario.steps.length) {
                clearInterval(interval);
                setIsPlaying(false);
                setCurrentStep(0);

                // Simulate order creation
                setTimeout(() => {
                    onMessage('✅ Order saved successfully!');
                    simulateOrderCreation();
                }, 1000);
                return;
            }

            const currentMessage = scenario.steps[step];
            onMessage(`${currentMessage.speaker}: ${currentMessage.text}`);
            setCurrentStep(step + 1);
            step++;
        }, 2000);
    }

    async function simulateOrderCreation() {
        try {
            // Create a simulated order based on the scenario
            const orderData = {
                customer_name: selectedScenario === 0 ? 'John Smith' : 'Sarah Johnson',
                customer_phone: selectedScenario === 0 ? '555-1234' : '555-5678',
                order_items: selectedScenario === 0 ? [
                    { item_id: '1', name: 'Margherita Pizza', quantity: 2, price: 18.99 },
                    { item_id: '2', name: 'Caesar Salad', quantity: 1, price: 7.52 },
                ] : [
                    { item_id: '3', name: 'Chocolate Cake', quantity: 1, price: 8.99 },
                ],
                special_instructions: selectedScenario === 0 ? 'Extra cheese on the pizzas' : '',
                order_type: selectedScenario === 0 ? 'Pickup' as const : 'Delivery' as const,
                status: 'pending' as const,
                total_amount: selectedScenario === 0 ? 45.50 : 8.99,
            };

            await createPhoneOrder(orderData);
            onMessage('📝 Order added to dashboard!');
        } catch (error) {
            console.error('Error creating simulated order:', error);
            onMessage('❌ Error saving order (database not configured)');
        }
    }

    return (
        <div className="glass-card p-6 animate-scale-in">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Call Simulator</h3>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Scenario Selection */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Scenario</label>
                <select
                    value={selectedScenario}
                    onChange={(e) => setSelectedScenario(Number(e.target.value))}
                    disabled={isPlaying}
                    className="input-field"
                >
                    {simulatedScenarios.map((scenario, index) => (
                        <option key={index} value={index}>
                            {scenario.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Play Button */}
            <button
                onClick={playScenario}
                disabled={isPlaying}
                className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
            >
                <Send className="w-5 h-5" />
                {isPlaying ? `Playing... (Step ${currentStep}/${simulatedScenarios[selectedScenario].steps.length})` : 'Play Scenario'}
            </button>

            {/* Preview */}
            <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Scenario Preview:</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {simulatedScenarios[selectedScenario].steps.map((step, index) => (
                        <div
                            key={index}
                            className={`text-sm p-2 rounded ${step.speaker === 'Customer'
                                    ? 'bg-blue-500/20 text-blue-300'
                                    : 'bg-purple-500/20 text-purple-300'
                                } ${index < currentStep ? 'opacity-50' : ''}`}
                        >
                            <strong>{step.speaker}:</strong> {step.text}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
