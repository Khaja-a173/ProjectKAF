import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from "@/contexts/SessionContext";
import { createCheckoutSession } from "@/lib/api";

const plans = [
  {
    code: "basic",
    name: "Basic",
    price: "$0",
    features: ["Limited access", "Community support"],
  },
  {
    code: "pro",
    name: "Pro",
    price: "$19/mo",
    features: ["Full access", "Email support", "Priority features"],
  },
  {
    code: "elite",
    name: "Elite",
    price: "$99/mo",
    features: ["Everything in Pro", "White-glove onboarding", "SLA support"],
  },
];

export default function Subscribe() {
  const context = useSessionContext();
  const session = context?.session;
  const tenant = session?.tenant;
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planCode: string) => {
    if (!tenant?.id) return;
    setLoading(planCode);
    const res = await createCheckoutSession(tenant.id, planCode);
    if (res?.url) {
      window.location.href = res.url;
    } else {
      alert("Failed to create checkout session.");
    }
    setLoading(null);
  };

  useEffect(() => {
    if (!tenant?.id) navigate("/onboarding");
  }, [tenant?.id, navigate]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-6 text-center">Choose a Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.code}
            className="border rounded-lg p-6 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <p className="text-gray-600 mb-4">{plan.price}</p>
              <ul className="mb-6 list-disc list-inside text-sm text-gray-700">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => handleSubscribe(plan.code)}
              className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800 disabled:opacity-50"
              disabled={!!loading}
            >
              {loading === plan.code ? "Redirecting..." : "Subscribe"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}