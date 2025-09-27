import { useEffect, useState } from "react";
import { useAccessControl } from "@/contexts/AccessControlContext";
import { useNavigate } from "react-router-dom";
import { createCheckoutSession } from "@/lib/api";

const plans = [
  {
    code: "basic",
    name: "Basic",
    description: "Ideal for small restaurants starting out",
    price: "$0 / month",
  },
  {
    code: "pro",
    name: "Pro",
    description: "For growing restaurants with moderate traffic",
    price: "$29 / month",
  },
  {
    code: "elite",
    name: "Elite",
    description: "Full features for high-volume restaurants",
    price: "$99 / month",
  },
];

export default function OnboardingPage() {
  const { currentTenantId, subscriptionStatus, role } = useAccessControl();
  const navigate = useNavigate();

  const [tenantName, setTenantName] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);

  useEffect(() => {
    if (role && role !== "tenant_admin") {
      navigate("/dashboard");
    } else if (subscriptionStatus === "active" || subscriptionStatus === "trialing") {
      navigate("/dashboard");
    }
  }, [subscriptionStatus, navigate, role]);

  const handleTenantNameSubmit = () => {
    if (!tenantName.trim()) {
      alert("Please enter a name for your restaurant or tenant.");
      return;
    }
    setNameSubmitted(true);
  };

  const handleSelectPlan = async (planCode: string) => {
    if (!currentTenantId) return;
    try {
      const { url } = await createCheckoutSession(currentTenantId, planCode);
      window.location.href = url;
    } catch (err) {
      console.error("Failed to create checkout session", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      {!nameSubmitted ? (
        <div className="mb-8">
          <label className="block text-lg font-medium mb-2">
            Your Restaurant or Tenant Name
          </label>
          <input
            type="text"
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g. Green Garden Bistro"
          />
          <button
            onClick={handleTenantNameSubmit}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Continue
          </button>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-6">
            Choose a Plan to Get Started
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.code}
                className="border rounded-lg p-6 shadow hover:shadow-md transition"
              >
                <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                <p className="text-lg font-bold mb-4">{plan.price}</p>
                <button
                  onClick={() => handleSelectPlan(plan.code)}
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                  Choose {plan.name}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}