import { useEffect, useState } from "react";
import { useAccessControl } from "@/contexts/AccessControlContext";
import { getBillingPortalUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function BillingPage() {
  const { currentUser } = useAccessControl();
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const subscription = currentUser?.subscriptionStatus;
  const entitlements = currentUser?.entitlements as { plan_code?: string; limits?: Record<string, any> } | undefined;
  const plan = entitlements?.plan_code;
  const limits = entitlements?.limits;

  useEffect(() => {
    if (!portalUrl && currentUser?.tenantId) {
      getBillingPortalUrl(currentUser.tenantId).then((res) => {
        if (res?.url) setPortalUrl(res.url);
      });
    }
  }, [portalUrl, currentUser?.tenantId]);

  const handleManage = async () => {
    if (!portalUrl) return;
    setLoading(true);
    window.location.href = portalUrl;
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-4">
      <h1 className="text-2xl font-semibold mb-4">Billing & Subscription</h1>
      <div className="border p-4 rounded shadow-sm">
        <p className="mb-2">
          <strong>Plan:</strong> {plan || "Unknown"}
        </p>
        <p className="mb-2">
          <strong>Status:</strong> {subscription || "N/A"}
        </p>
        {limits && (
          <div className="mb-4">
            <strong>Limits:</strong>
            <pre className="text-sm bg-muted p-2 rounded mt-1">
              {JSON.stringify(limits, null, 2)}
            </pre>
          </div>
        )}
        <Button onClick={handleManage} disabled={!portalUrl || loading}>
          Manage Subscription
        </Button>
      </div>
    </div>
  );
}
