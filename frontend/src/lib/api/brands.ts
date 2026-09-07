import { API_URL } from './index';

// We assume API_URL is exported from index.ts, or we can just define it if it's not.
// Let's redefine it locally just to be safe if index.ts doesn't export it.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const fetchBrands = async (page = 1, perPage = 15, search = '', status = '') => {
  let url = `${BASE_URL}/admin/brands?page=${page}&per_page=${perPage}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status !== '') url += `&status=${status}`;

  const res = await fetch(url, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch brands');
  return res.json();
};

export const fetchPublicBrands = async () => {
  const res = await fetch(`${BASE_URL}/brands`, {
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to fetch brands');
  return res.json();
};

export const getPublicBrandDetails = async (slug: string) => {
  const res = await fetch(`${BASE_URL}/brands/${slug}`, {
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to fetch brand details');
  return res.json();
};

export const getBrand = async (id: number | string) => {
  const res = await fetch(`${BASE_URL}/admin/brands/${id}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch brand');
  return res.json();
};

export const createBrand = async (data: FormData | any) => {
  // If it's FormData, don't set Content-Type header so browser sets multipart boundary
  const isFormData = data instanceof FormData;
  const headers: any = getAuthHeaders();
  if (isFormData) delete headers['Content-Type'];

  const res = await fetch(`${BASE_URL}/admin/brands`, {
    method: 'POST',
    headers,
    body: isFormData ? data : JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create brand');
  return res.json();
};

export const updateBrand = async (id: number | string, data: FormData | any) => {
  const isFormData = data instanceof FormData;
  const headers: any = getAuthHeaders();
  if (isFormData) {
      delete headers['Content-Type'];
      data.append('_method', 'PUT'); // Laravel spoofing for PUT with FormData
  }

  const res = await fetch(`${BASE_URL}/admin/brands/${id}`, {
    method: 'POST', // Use POST for FormData spoofing or PUT for JSON
    headers,
    body: isFormData ? data : JSON.stringify({ ...data, _method: 'PUT' })
  });
  if (!res.ok) throw new Error('Failed to update brand');
  return res.json();
};

export const deleteBrand = async (id: number | string) => {
  const res = await fetch(`${BASE_URL}/admin/brands/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete brand');
  return true;
};

export const bulkDeleteBrands = async (ids: (number | string)[]) => {
  const res = await fetch(`${BASE_URL}/admin/brands/bulk-delete`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ids })
  });
  if (!res.ok) throw new Error('Failed to bulk delete brands');
  return res.json();
};

export const bulkUpdateBrandStatus = async (ids: (number | string)[], status: boolean) => {
  const res = await fetch(`${BASE_URL}/admin/brands/bulk-status`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ids, status })
  });
  if (!res.ok) throw new Error('Failed to bulk update status');
  return res.json();
};
