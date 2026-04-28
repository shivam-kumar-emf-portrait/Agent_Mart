const BASE_URL = '/api';

export async function fetchServices() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  try {
    const res = await fetch(`${BASE_URL}/services`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error('Failed to fetch services');
    const data = await res.json();
    return data.services || [];
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('Fetch services error:', err);
    return [];
  }
}

export async function fetchService(id) {
  const res = await fetch(`${BASE_URL}/services/${id}`);
  if (!res.ok) throw new Error('Failed to fetch service');
  return res.json();
}

export async function createCheckout(serviceId, buyerInput) {
  const res = await fetch(`${BASE_URL}/checkout/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ service_id: serviceId, buyer_input: buyerInput }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create checkout');
  }
  return res.json();
}

export async function fetchOrder(sessionId) {
  const res = await fetch(`${BASE_URL}/orders/${sessionId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch order');
  }
  return res.json();
}

export async function simulatePayment(sessionId) {
  const res = await fetch(`${BASE_URL}/webhook/simulate-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Simulation failed');
  }
  return res.json();
}

export async function fetchWalletBalance() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  
  try {
    const res = await fetch(`${BASE_URL}/wallet/balance`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error('Failed to fetch wallet balance');
    return res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('Fetch wallet balance error:', err);
    return { balance: 0 };
  }
}

export async function depositFunds(amount) {
  const res = await fetch(`${BASE_URL}/wallet/deposit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) throw new Error('Deposit failed');
  return res.json();
}

export async function payWithWallet(serviceId, buyerInput) {
  const res = await fetch(`${BASE_URL}/wallet/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ service_id: serviceId, buyer_input: buyerInput }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Wallet payment failed');
  }
  return res.json();
}
