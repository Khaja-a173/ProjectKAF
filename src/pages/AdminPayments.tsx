import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPaymentConfig, updatePaymentConfig } from '../lib/api';
import DashboardHeader from '../components/DashboardHeader';
import {
  CreditCard,
  Settings,
  Save,
  AlertTriangle,
  CheckCircle,
  Globe,
  TestTube,
  Eye,
  EyeOff,
  Smartphone,
  Wallet,
  DollarSign
} from 'lucide-react';

interface PaymentConfig {
  configured: boolean;
  config?: {
    provider: 'stripe' | 'razorpay' | 'mock';
    live_mode: boolean;
    currency: string;
    enabled_methods: string[];
    publishable_key?: string;
    secret_key?: string;
    metadata?: any;
  };
}

export default function AdminPayments() {
  const [config, setConfig] = useState<PaymentConfig>({ configured: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [formData, setFormData] = useState({
    provider: 'mock' as const,
    live_mode: false,
    currency: 'USD',
    enabled_methods: ['card'],
    publishable_key: '',
    secret_key: ''
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await getPaymentConfig();
      setConfig(response);
      
      if (response.configured && response.config) {
        setFormData({
          provider: response.config.provider,
          live_mode: response.config.live_mode,
          currency: response.config.currency,
          enabled_methods: response.config.enabled_methods,
          publishable_key: response.config.publishable_key || '',
          secret_key: '' // Never populate secret key from server
        });
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Failed to load payment config:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updatePaymentConfig(formData);
      await loadConfig(); // Refresh to get masked secret
      alert('Payment configuration saved successfully!');
    } catch (err: any) {
      alert('Failed to save configuration: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMethodToggle = (method: string) => {
    const newMethods = formData.enabled_methods.includes(method)
      ? formData.enabled_methods.filter(m => m !== method)
      : [...formData.enabled_methods, method];
    
    setFormData(prev => ({ ...prev, enabled_methods: newMethods }));
  };

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
    { id: 'wallet', name: 'Digital Wallet', icon: Wallet },
    { id: 'upi', name: 'UPI', icon: Smartphone },
    { id: 'cash', name: 'Cash', icon: DollarSign }
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader title="Payment Settings" subtitle="Configure payment providers and methods" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Payment Settings" subtitle="Configure payment providers and methods" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 pb-2">
              Dashboard
            </Link>
            <Link to="/orders" className="text-gray-500 hover:text-gray-700 pb-2">
              Orders
            </Link>
            <Link to="/settings" className="text-gray-500 hover:text-gray-700 pb-2">
              Settings
            </Link>
            <Link to="/admin/payments" className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium">
              Payments
            </Link>
          </div>
        </nav>

        {/* Configuration Status */}
        <div className={`rounded-xl p-6 mb-8 ${
          config.configured 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-center space-x-3">
            {config.configured ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            )}
            <div>
              <h3 className={`font-semibold ${
                config.configured ? 'text-green-900' : 'text-yellow-900'
              }`}>
                {config.configured ? 'Payment Provider Configured' : 'Payment Provider Not Configured'}
              </h3>
              <p className={`text-sm ${
                config.configured ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {config.configured 
                  ? `Using ${config.config?.provider} in ${config.config?.live_mode ? 'live' : 'test'} mode`
                  : 'Configure a payment provider to start accepting payments'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="text-red-800">Error loading configuration: {error}</div>
          </div>
        )}

        {/* Configuration Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Payment Configuration</h2>

          <div className="space-y-8">
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Payment Provider
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'mock', name: 'Mock Provider', desc: 'For testing and development', icon: TestTube },
                  { id: 'stripe', name: 'Stripe', desc: 'Global payment processing', icon: CreditCard },
                  { id: 'razorpay', name: 'Razorpay', desc: 'India-focused payments', icon: Globe }
                ].map(provider => (
                  <button
                    key={provider.id}
                    onClick={() => setFormData(prev => ({ ...prev, provider: provider.id as any }))}
                    className={`p-4 border-2 rounded-xl transition-colors text-left ${
                      formData.provider === provider.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <provider.icon className={`w-6 h-6 ${
                        formData.provider === provider.id ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{provider.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Environment Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Environment Mode
              </label>
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!formData.live_mode}
                    onChange={() => setFormData(prev => ({ ...prev, live_mode: false }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex items-center space-x-2">
                    <TestTube className="w-4 h-4 text-yellow-600" />
                    <span>Test Mode</span>
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.live_mode}
                    onChange={() => setFormData(prev => ({ ...prev, live_mode: true }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-green-600" />
                    <span>Live Mode</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Methods */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Enabled Payment Methods
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {paymentMethods.map(method => (
                  <label
                    key={method.id}
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                      formData.enabled_methods.includes(method.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.enabled_methods.includes(method.id)}
                      onChange={() => handleMethodToggle(method.id)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <method.icon className={`w-5 h-5 ${
                        formData.enabled_methods.includes(method.id) ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <span className="text-sm font-medium text-gray-900">{method.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* API Keys (only for real providers) */}
            {formData.provider !== 'mock' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publishable Key
                  </label>
                  <input
                    type="text"
                    value={formData.publishable_key}
                    onChange={(e) => setFormData(prev => ({ ...prev, publishable_key: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={`pk_${formData.live_mode ? 'live' : 'test'}_...`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secret Key
                  </label>
                  <div className="relative">
                    <input
                      type={showSecretKey ? 'text' : 'password'}
                      value={formData.secret_key}
                      onChange={(e) => setFormData(prev => ({ ...prev, secret_key: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder={`sk_${formData.live_mode ? 'live' : 'test'}_...`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Secret key is encrypted and only the last 4 digits are stored
                  </p>
                </div>
              </div>
            )}

            {/* Mock Provider Info */}
            {formData.provider === 'mock' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TestTube className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Mock Provider</h4>
                </div>
                <p className="text-sm text-blue-800">
                  The mock provider simulates payment processing for testing and development. 
                  All transactions will be automatically approved without real money transfer.
                </p>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Test Payment Section */}
        {config.configured && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Test Payment</h3>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">Test Amount</span>
                <span className="text-lg font-bold text-gray-900">
                  {new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: config.config?.currency || 'USD'
                  }).format(25.00)}
                </span>
              </div>
              
              <div className="space-y-3">
                {config.config?.enabled_methods.map(method => (
                  <button
                    key={method}
                    className="w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900 capitalize">{method}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}