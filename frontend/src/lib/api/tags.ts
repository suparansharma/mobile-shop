const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const fetchTags = async (page = 1, perPage = 15, search = '', status = '') => {
  let url = `${API_URL}/admin/tags?page=${page}&per_page=${perPage}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status !== '') url += `&status=${status}`;

  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch tags');
  return res.json();
};

export const createTag = async (data: { name: string, status: boolean, sort_order: number }) => {
  const res = await fetch(`${API_URL}/admin/tags`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create tag');
  return res.json();
};

export const updateTag = async (id: number, data: { name: string, status: boolean, sort_order: number }) => {
  const res = await fetch(`${API_URL}/admin/tags/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update tag');
  return res.json();
};

export const deleteTag = async (id: number) => {
  const res = await fetch(`${API_URL}/admin/tags/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete tag');
  return true;
};

export const bulkDeleteTags = async (ids: number[]) => {
  const res = await fetch(`${API_URL}/admin/tags/bulk-delete`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error('Failed to bulk delete tags');
  return res.json();
};

export const bulkUpdateTagStatus = async (ids: number[], status: boolean) => {
  const res = await fetch(`${API_URL}/admin/tags/bulk-status`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ids, status }),
  });
  if (!res.ok) throw new Error('Failed to update tag status');
  return res.json();
};
