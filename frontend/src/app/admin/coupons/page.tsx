"use client";

import { useEffect, useState } from 'react';
import { fetchAdminCoupons, deleteCoupon, bulkDeleteCoupons, bulkUpdateCouponStatus, createCoupon, updateCoupon } from '@/lib/api/coupons';
import toast from 'react-hot-toast';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Pagination & Filter States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const perPage = 15;
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [saving, setSaving] = useState(false);
  
  const defaultFormData = {
    id: null,
    code: '',
    name: '',
    description: '',
    type: 'fixed',
    value: 0,
    min_spend: '',
    max_discount: '',
    usage_limit: '',
    per_customer_limit: '',
    starts_at: '',
    expires_at: '',
    status: true
  };
  
  const [formData, setFormData] = useState<any>(defaultFormData);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminCoupons(currentPage, perPage, searchQuery, statusFilter);
      setCoupons(data.data || data);
      if (data.last_page) setTotalPages(data.last_page);
      if (data.total) setTotalItems(data.total);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCoupons();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, searchQuery, statusFilter]);

  const handleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(coupons.map(c => c.id));
    else setSelectedIds([]);
  };

  const openCreateModal = () => {
    setFormData(defaultFormData);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: any) => {
    setFormData({
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      type: coupon.type,
      value: coupon.value,
      min_spend: coupon.min_spend || '',
      max_discount: coupon.max_discount || '',
      usage_limit: coupon.usage_limit || '',
      per_customer_limit: coupon.per_customer_limit || '',
      starts_at: coupon.starts_at ? coupon.starts_at.substring(0, 16) : '',
      expires_at: coupon.expires_at ? coupon.expires_at.substring(0, 16) : '',
      status: coupon.status
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString() : null,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        min_spend: formData.min_spend || null,
        max_discount: formData.max_discount || null,
        usage_limit: formData.usage_limit || null,
        per_customer_limit: formData.per_customer_limit || null,
      };
      
      if (modalMode === 'create') {
        await createCoupon(payload);
        toast.success('Coupon created successfully');
      } else {
        await updateCoupon(formData.id, payload);
        toast.success('Coupon updated successfully');
      }
      setIsModalOpen(false);
      loadCoupons();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await deleteCoupon(id);
      toast.success('Coupon deleted successfully');
      loadCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };
  
  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) return;
    try {
      if (action === 'delete') {
        if (!confirm('Are you sure you want to delete selected coupons?')) return;
        await bulkDeleteCoupons(selectedIds);
        toast.success('Coupons deleted');
      } else if (action === 'activate') {
        await bulkUpdateCouponStatus(selectedIds, true);
        toast.success('Coupons activated');
      } else if (action === 'deactivate') {
        await bulkUpdateCouponStatus(selectedIds, false);
        toast.success('Coupons deactivated');
      }
      setSelectedIds([]);
      loadCoupons();
    } catch (error) {
      toast.error('Bulk action failed');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coupons & Discounts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage store coupons and promotions</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600"
        >
          Add New Coupon
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full sm:w-64 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-orange-9500 focus:border-orange-9500 sm:text-sm px-4 py-2 border"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full sm:w-40 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-orange-9500 focus:border-orange-9500 sm:text-sm px-4 py-2 border"
            >
              <option value="">All Status</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
          
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{selectedIds.length} selected</span>
              <select 
                onChange={(e) => handleBulkAction(e.target.value)}
                className="block rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 sm:text-sm px-4 py-2 border"
                value=""
              >
                <option value="" disabled>Bulk Actions</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
                <option value="delete">Delete</option>
              </select>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={coupons?.length > 0 && selectedIds.length === coupons.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-9500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No coupons found.</td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(coupon.id)}
                        onChange={() => handleSelect(coupon.id)}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-9500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{coupon.code}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{coupon.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {coupon.type === 'fixed' ? '$' : ''}{coupon.value}{coupon.type === 'percent' ? '%' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{coupon.used_count} / {coupon.usage_limit || '∞'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${coupon.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {coupon.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openEditModal(coupon)} className="text-orange-500 hover:text-orange-800 dark:hover:text-orange-500 mr-4">Edit</button>
                      <button onClick={() => handleDelete(coupon.id)} className="text-red-600 hover:text-red-900 dark:hover:text-red-400">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                    {modalMode === 'create' ? 'Add New Coupon' : 'Edit Coupon'}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Coupon Code</label>
                      <input required type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 border py-2 px-3 shadow-sm focus:border-orange-9500 focus:ring-orange-9500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                      <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 border py-2 px-3 shadow-sm focus:border-orange-9500 focus:ring-orange-9500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                      <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={2} className="mt-1 block w-full rounded-md border-gray-300 border py-2 px-3 shadow-sm focus:border-orange-9500 focus:ring-orange-9500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Discount Type</label>
                      <select required value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 border py-2 px-3 shadow-sm focus:border-orange-9500 focus:ring-orange-9500 sm:text-sm dark:bg-gray-700 dark:border-gray-600">
                        <option value="fixed">Fixed Amount</option>
                        <option value="percent">Percentage</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Discount Value</label>
                      <input required type="number" step="0.01" value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 border py-2 px-3 shadow-sm focus:border-orange-9500 focus:ring-orange-9500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Min. Spend</label>
                      <input type="number" step="0.01" value={formData.min_spend} onChange={(e) => setFormData({...formData, min_spend: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 border py-2 px-3 shadow-sm focus:border-orange-9500 focus:ring-orange-9500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Discount</label>
                      <input type="number" step="0.01" value={formData.max_discount} onChange={(e) => setFormData({...formData, max_discount: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 border py-2 px-3 shadow-sm focus:border-orange-9500 focus:ring-orange-9500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Usage Limit</label>
                      <input type="number" value={formData.usage_limit} onChange={(e) => setFormData({...formData, usage_limit: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 border py-2 px-3 shadow-sm focus:border-orange-9500 focus:ring-orange-9500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Limit Per Customer</label>
                      <input type="number" value={formData.per_customer_limit} onChange={(e) => setFormData({...formData, per_customer_limit: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 border py-2 px-3 shadow-sm focus:border-orange-9500 focus:ring-orange-9500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                      <input type="datetime-local" value={formData.starts_at} onChange={(e) => setFormData({...formData, starts_at: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 border py-2 px-3 shadow-sm focus:border-orange-9500 focus:ring-orange-9500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                      <input type="datetime-local" value={formData.expires_at} onChange={(e) => setFormData({...formData, expires_at: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 border py-2 px-3 shadow-sm focus:border-orange-9500 focus:ring-orange-9500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div className="flex items-center mt-4">
                      <input type="checkbox" id="status" checked={formData.status} onChange={(e) => setFormData({...formData, status: e.target.checked})} className="h-4 w-4 text-orange-500 focus:ring-orange-9500 border-gray-300 rounded" />
                      <label htmlFor="status" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Active Status</label>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" disabled={saving} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-500 text-base font-medium text-white hover:bg-orange-600 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                    {saving ? 'Saving...' : 'Save Coupon'}
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
