const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "";
const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

function authHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "x-publishable-api-key": PUBLISHABLE_KEY,
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface Order {
  id: string;
  display_id: number;
  status: string;
  created_at: string;
  total: number;
  currency_code: string;
  items: {
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    thumbnail: string | null;
  }[];
}

export async function registerCustomer(data: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}): Promise<{ token: string }> {
  const regRes = await fetch(
    `${MEDUSA_URL}/auth/customer/emailpass/register`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ email: data.email, password: data.password }),
    }
  );
  if (!regRes.ok) {
    const err = await regRes.json().catch(() => ({}));
    throw new Error(err.message || "Registration failed");
  }
  const { token: regToken } = await regRes.json();

  await fetch(`${MEDUSA_URL}/store/customers`, {
    method: "POST",
    headers: authHeaders(regToken),
    body: JSON.stringify({
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
    }),
  });

  const { token } = await loginCustomer({
    email: data.email,
    password: data.password,
  });

  return { token };
}

export async function loginCustomer(data: {
  email: string;
  password: string;
}): Promise<{ token: string }> {
  const res = await fetch(`${MEDUSA_URL}/auth/customer/emailpass`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Invalid email or password");
  }
  return res.json();
}

export async function getCustomer(token: string): Promise<Customer> {
  const res = await fetch(`${MEDUSA_URL}/store/customers/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Session expired");
  const data = await res.json();
  return data.customer;
}

/**
 * Recent orders by customer. Sort is newest-first; line items are included.
 * Medusa does not accept category filters on this route — filter by product
 * category on the shop via `/store/products?category_id=…` instead.
 */
export async function getOrders(token: string): Promise<Order[]> {
  const res = await fetch(
    `${MEDUSA_URL}/store/orders?fields=*items&order=-created_at`,
    { headers: authHeaders(token) }
  );
  if (!res.ok) throw new Error("Failed to fetch orders");
  const data = await res.json();
  return data.orders ?? [];
}
