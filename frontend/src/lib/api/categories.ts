const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthToken = () => {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
};

export const fetchCategoryTree = async () => {
  const res = await fetch(`${API_URL}/categories/tree`);
  if (!res.ok) throw new Error('Failed to fetch category tree');
  return res.json();
};

export const fetchPublicCategories = async () => {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
};

export const fetchAdminCategories = async (page = 1, perPage = 10, parentId = '', search = '', status = '') => {
  let url = `${API_URL}/admin/categories?page=${page}&per_page=${perPage}`;
  if (parentId) url += `&parent_id=${parentId}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status !== '') url += `&status=${status}`;
  
  const token = getAuthToken();
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
};

export const fetchAdminCategoryTree = async () => {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/admin/categories/tree`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch category tree');
  return res.json();
};

export const createCategory = async (data: FormData) => {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/admin/categories`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: data,
  });
  if (!res.ok) throw new Error('Failed to create category');
  return res.json();
};

export const updateCategory = async (id: number, data: FormData) => {
  const token = getAuthToken();
  data.append('_method', 'PUT'); // Laravel requirement for multipart form data
  const res = await fetch(`${API_URL}/admin/categories/${id}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: data,
  });
  if (!res.ok) throw new Error('Failed to update category');
  return res.json();
};

export const deleteCategory = async (id: number) => {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/admin/categories/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to delete category');
  return res.json();
};

export const bulkDeleteCategories = async (ids: number[]) => {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/admin/categories/bulk-delete`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error('Failed to bulk delete');
  return res.json();
};

export const bulkUpdateCategoryStatus = async (ids: number[], status: boolean) => {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/admin/categories/bulk-status`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ids, status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
};

export const fetchCategoryDetails = async (slug: string) => {
  const res = await fetch(`${API_URL}/categories/${slug}`);
  if (!res.ok) throw new Error('Failed to fetch category details');
  return res.json();
};
