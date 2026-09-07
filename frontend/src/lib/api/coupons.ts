const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthToken = () => {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }
  return res.json();
};

export const fetchAdminCoupons = async (page = 1, perPage = 15, search = '', status = '') => {
  let url = `${API_URL}/admin/coupons?page=${page}&per_page=${perPage}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status !== '') url += `&status=${status}`;
  
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });
  return handleResponse(res);
};

export const createCoupon = async (data: any) => {
  const res = await fetch(`${API_URL}/admin/coupons`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const updateCoupon = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/admin/coupons/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const deleteCoupon = async (id: number) => {
  const res = await fetch(`${API_URL}/admin/coupons/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });
  return handleResponse(res);
};

export const bulkDeleteCoupons = async (ids: number[]) => {
  const res = await fetch(`${API_URL}/admin/coupons/bulk-delete`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ids })
  });
  return handleResponse(res);
};

export const bulkUpdateCouponStatus = async (ids: number[], status: boolean) => {
  const res = await fetch(`${API_URL}/admin/coupons/bulk-status`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ids, status })
  });
  return handleResponse(res);
};

export const applyCoupon = async (code: string, orderTotal: number) => {
  const res = await fetch(`${API_URL}/coupons/apply`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ code, order_total: orderTotal })
  });
  return handleResponse(res);
};

export const removeCoupon = async (code: string) => {
  const res = await fetch(`${API_URL}/coupons/remove`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ code })
  });
  return handleResponse(res);
};
