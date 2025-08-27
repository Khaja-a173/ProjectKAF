import { useState } from 'react';
import { CreditCard, DollarSign, Smartphone, Wallet } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: any;
}

interface MethodPickerProps {
  enabledMethods: string[];
  selectedMethod: string;
  onMethodSelect: (method: string) => void;
  currency: string;
}

export default function MethodPicker({ 
  enabledMethods, 
  selectedMethod, 
  onMethodSelect,
  currency 
}: MethodPickerProps) {
  const allMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, Amex',
      icon: CreditCard
    },
    {
      id: 'cash',
      name: 'Cash',
      description: 'Pay at counter',
      icon: DollarSign
    },
    {
      id: 'upi',
      name: 'UPI',
      description: 'Google Pay, PhonePe, Paytm',
      icon: Smartphone
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      description: 'Apple Pay, Samsung Pay',
      icon: Wallet
    }
  ];

  const availableMethods = allMethods.filter(method => 
    enabledMethods.includes(method.id)
  );

  if (availableMethods.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="text-yellow-800 mb-2">No payment methods configured</div>
        <p className="text-sm text-yellow-700">
          Contact restaurant admin to configure payment methods
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select Payment Method</h3>
      
      <div className="space-y-3">
        {availableMethods.map(method => (
          <button
            key={method.id}
            onClick={() => onMethodSelect(method.id)}
            className={`w-full p-4 border-2 rounded-xl transition-colors text-left ${
              selectedMethod === method.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <method.icon className={`w-6 h-6 ${
                selectedMethod === method.id ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <div>
                <div className="font-medium text-gray-900">{method.name}</div>
                <div className="text-sm text-gray-500">{method.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedMethod && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-800">
            Selected: {availableMethods.find(m => m.id === selectedMethod)?.name}
          </div>
        </div>
      )}
    </div>
  );
}