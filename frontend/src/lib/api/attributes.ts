const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const fetchAttributes = async (page = 1, perPage = 15, search = '', status = '') => {
  let url = `${API_URL}/admin/attributes?page=${page}&per_page=${perPage}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status !== '') url += `&status=${status}`;

  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch attributes');
  return res.json();
};

export const createAttribute = async (data: { name: string, status: boolean, values: string[] }) => {
  const res = await fetch(`${API_URL}/admin/attributes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create attribute');
  return res.json();
};

export const updateAttribute = async (id: number, data: { name: string, status: boolean, values: string[] }) => {
  const res = await fetch(`${API_URL}/admin/attributes/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update attribute');
  return res.json();
};

export const deleteAttribute = async (id: number) => {
  const res = await fetch(`${API_URL}/admin/attributes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete attribute');
  return true;
};

export const bulkDeleteAttributes = async (ids: number[]) => {
  const res = await fetch(`${API_URL}/admin/attributes/bulk-delete`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error('Failed to bulk delete attributes');
  return res.json();
};

export const bulkUpdateAttributeStatus = async (ids: number[], status: boolean) => {
  const res = await fetch(`${API_URL}/admin/attributes/bulk-status`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ids, status }),
  });
  if (!res.ok) throw new Error('Failed to update attribute status');
  return res.json();
};
