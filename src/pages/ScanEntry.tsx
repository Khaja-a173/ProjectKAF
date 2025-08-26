import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resolveQR } from '../lib/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { QrCode, Camera, AlertTriangle, CheckCircle, Loader } from 'lucide-react';

export default function ScanEntry() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<any>(null);

  // Extract QR parameters from URL
  const code = searchParams.get('code');
  const table = searchParams.get('table');
  const sig = searchParams.get('sig');
  const exp = searchParams.get('exp');

  useEffect(() => {
    if (code && table && sig && exp) {
      handleQRResolve();
    }
  }, [code, table, sig, exp]);

  const handleQRResolve = async () => {
    if (!code || !table || !sig || !exp) {
      setError('Invalid QR code parameters');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await resolveQR(code, table, sig, parseInt(exp));
      setQrData(response);

      // Store tenant and table context
      localStorage.setItem('tenant_id', response.tenant.id);
      localStorage.setItem('table_id', response.table.id);
      localStorage.setItem('table_number', response.table.table_number);

      // Redirect to menu with context
      setTimeout(() => {
        navigate(`/menu?tenant=${response.tenant.id}&table=${response.table.id}`);
      }, 2000);

    } catch (err: any) {
      console.error('QR resolve failed:', err);
      setError(err.message || 'Failed to resolve QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = () => {
    navigate('/book-table');
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing QR Code</h2>
            <p className="text-gray-600">Connecting you to {table}...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">QR Code Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={handleQRResolve}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleManualEntry}
                className="w-full bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
              >
                Enter Manually
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (qrData) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connected!</h2>
            <p className="text-gray-600 mb-2">Welcome to {qrData.tenant.name}</p>
            <p className="text-gray-600 mb-6">Table {qrData.table.table_number}</p>
            <div className="bg-white rounded-xl p-4 mb-6">
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Restaurant:</strong> {qrData.tenant.name}</p>
                <p><strong>Table:</strong> {qrData.table.table_number}</p>
                <p><strong>Capacity:</strong> {qrData.table.capacity} guests</p>
                <p><strong>Menu Items:</strong> {qrData.menu.items.length} available</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Redirecting to menu...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">QR Code Scanner</h2>
          <p className="text-gray-600 mb-6">
            Scan the QR code on your table to start ordering
          </p>
          <button
            onClick={handleManualEntry}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Camera className="w-5 h-5" />
            <span>Enter Table Manually</span>
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}