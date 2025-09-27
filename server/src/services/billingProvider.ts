

export async function createCheckoutSession(tenantId: string, planCode: string): Promise<{ url: string }> {
  // TODO: Integrate Stripe or Razorpay later
  const url = `https://billing.projectkaf.com/checkout?tenant=${tenantId}&plan=${planCode}`;
  return { url };
}

export async function createCustomerPortal(tenantId: string): Promise<{ url: string }> {
  // TODO: Integrate Stripe or Razorpay later
  const url = `https://billing.projectkaf.com/portal?tenant=${tenantId}`;
  return { url };
}