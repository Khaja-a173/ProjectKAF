import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessControl } from '@/contexts/AccessControlContext';
import { Button } from '@/components/ui/button';

function Alert({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded border border-red-500 bg-red-100 p-4 text-red-800 ${className}`}>{children}</div>;
}

function AlertTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold mb-1">{children}</h2>;
}

function AlertDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm">{children}</p>;
}

export default function PaywallPage() {
  const { subscriptionStatus } = useAccessControl();
  const logout = () => {
    localStorage.clear();
    window.location.href = '/';
  };
  const navigate = useNavigate();

  useEffect(() => {
    // Optional: Redirect if already subscribed (just in case)
    if (subscriptionStatus === 'active' || subscriptionStatus === 'trialing' || subscriptionStatus === 'grace') {
      navigate('/dashboard'); // or wherever the home page is
    }
  }, [subscriptionStatus, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <Alert className="max-w-md">
        <AlertTitle>Access Restricted</AlertTitle>
        <AlertDescription>
          Your subscription is inactive or expired. Please upgrade your plan to continue using admin features.
        </AlertDescription>
      </Alert>

      <div className="mt-6 flex gap-4">
        <Button onClick={() => navigate('/subscribe')}>Choose a Plan</Button>
        <Button className="bg-gray-300 text-black" onClick={logout}>
          Log out
        </Button>
      </div>
    </div>
  );
}