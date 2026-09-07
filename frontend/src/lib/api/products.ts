const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const fetchProducts = async (page = 1, perPage = 15, filters: any = {}) => {
  let url = `${API_URL}/admin/products?page=${page}&per_page=${perPage}`;
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== '' && filters[key] !== null) {
      url += `&${key}=${encodeURIComponent(filters[key])}`;
    }
  });

  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
};

export const fetchTrashedProducts = async (page = 1, perPage = 15, filters: any = {}) => {
  let url = `${API_URL}/admin/products/trashed?page=${page}&per_page=${perPage}`;
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== '' && filters[key] !== null) {
      url += `&${key}=${encodeURIComponent(filters[key])}`;
    }
  });

  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch trashed products');
  return res.json();
};

export const fetchProductById = async (id: number) => {
  const res = await fetch(`${API_URL}/admin/products/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
};

export const createProduct = async (data: any) => {
  const res = await fetch(`${API_URL}/admin/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    let msg = errorData.message || 'Failed to create product';
    if (errorData.errors) {
      msg = Object.values(errorData.errors).flat().join('\n');
    }
    throw new Error(msg);
  }
  return res.json();
};

export const updateProduct = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/admin/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    let msg = errorData.message || 'Failed to update product';
    if (errorData.errors) {
      msg = Object.values(errorData.errors).flat().join('\n');
    }
    throw new Error(msg);
  }
  return res.json();
};

export const deleteProduct = async (id: number) => {
  const res = await fetch(`${API_URL}/admin/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete product');
  return true;
};

export const restoreProduct = async (id: number) => {
  const res = await fetch(`${API_URL}/admin/products/${id}/restore`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to restore product');
  return res.json();
};

export const duplicateProduct = async (id: number) => {
  const res = await fetch(`${API_URL}/admin/products/${id}/duplicate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to duplicate product');
  return res.json();
};

export const fetchPublicProductBySlug = async (slug: string) => {
  const res = await fetch(`${API_URL}/products/${slug}`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  if (!res.ok) throw new Error('Failed to fetch product details');
  return res.json();
};

export const fetchPublicProducts = async (page = 1, perPage = 15, filters: any = {}) => {
  let url = `${API_URL}/products?page=${page}&per_page=${perPage}`;
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== '' && filters[key] !== null) {
      if (Array.isArray(filters[key])) {
        url += `&${key}=${encodeURIComponent(filters[key].join(','))}`;
      } else {
        url += `&${key}=${encodeURIComponent(filters[key])}`;
      }
    }
  });

  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json'
    }
  });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
};

export const uploadProductImages = async (productId: number, files: File[]) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images[]', file);
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_URL}/admin/products/${productId}/images`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: formData, // Do not set Content-Type, browser will set it with boundary
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to upload images');
  }
  return res.json();
};

export const deleteProductImage = async (imageId: number) => {
  const res = await fetch(`${API_URL}/admin/products/images/${imageId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete image');
  return res.json();
};

export const reorderProductImages = async (productId: number, imageIds: number[]) => {
  const res = await fetch(`${API_URL}/admin/products/${productId}/images/reorder`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ image_ids: imageIds })
  });
  if (!res.ok) throw new Error('Failed to reorder images');
  return res.json();
};

export const setProductImageThumbnail = async (imageId: number) => {
  const res = await fetch(`${API_URL}/admin/products/images/${imageId}/thumbnail`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to set thumbnail');
  return res.json();
};

export const getProductsExportUrl = (format: 'xlsx' | 'csv' = 'xlsx') => {
  return `${API_URL}/admin/products/export?format=${format}`;
};

export const importProducts = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_URL}/admin/products/import`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    let msg = errorData.message || 'Failed to import products';
    if (errorData.errors && Array.isArray(errorData.errors)) {
      msg = errorData.errors.join('\n');
    }
    throw new Error(msg);
  }
  return res.json();
};
