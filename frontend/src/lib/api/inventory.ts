import { getAuthHeaders } from './brands'; // Reusing getAuthHeaders

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const fetchInventory = async (page = 1, perPage = 15, search = '') => {
  let url = `${BASE_URL}/admin/inventory?page=${page}&per_page=${perPage}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  const res = await fetch(url, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch inventory');
  return res.json();
};

export const adjustStock = async (data: {
  product_id: number;
  product_variant_id?: number | null;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  notes?: string;
  reference?: string;
}) => {
  const res = await fetch(`${BASE_URL}/admin/inventory/adjust`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to adjust stock');
  }
  return res.json();
};

export const fetchInventoryHistory = async (page = 1, perPage = 15, filters: { product_id?: number; product_variant_id?: number; type?: string } = {}) => {
  let url = `${BASE_URL}/admin/inventory/history?page=${page}&per_page=${perPage}`;
  
  if (filters.product_id) url += `&product_id=${filters.product_id}`;
  if (filters.product_variant_id) url += `&product_variant_id=${filters.product_variant_id}`;
  if (filters.type) url += `&type=${filters.type}`;

  const res = await fetch(url, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch inventory history');
  return res.json();
};
