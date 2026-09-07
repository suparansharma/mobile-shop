"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchInventoryHistory } from '@/lib/api/inventory';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function InventoryHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  // Filters
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    loadData();
  }, [page, filterType]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchInventoryHistory(page, 20, { type: filterType });
      setHistory(res.data);
      setPagination({
        current_page: res.current_page,
        last_page: res.last_page,
        total: res.total
      });
    } catch (error) {
      toast.error('Failed to load inventory history');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'in': return 'bg-green-100 text-green-800';
      case 'out': return 'bg-red-100 text-red-800';
      case 'adjustment': return 'bg-orange-900 text-orange-700';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrefix = (type: string) => {
    switch (type) {
      case 'in': return '+';
      case 'out': return '-';
      case 'adjustment': return '±';
      default: return '';
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory History</h1>
          <p className="text-sm text-gray-500 mt-1">Audit log of all stock movements and adjustments.</p>
        </div>
        <Link href="/admin/inventory" className="bg-white border text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium shadow-sm">
          &larr; Back to Inventory
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium text-gray-700">Filter by Type:</span>
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-orange-9500 outline-none"
            >
              <option value="">All Types</option>
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
              <option value="adjustment">Adjustments</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Change</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resulting Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes / Ref</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                      <span>Loading history...</span>
                    </div>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No history found.
                  </td>
                </tr>
              ) : (
                history.map((record) => {
                  let variantInfo = '';
                  if (record.variant) {
                    const attrs = typeof record.variant.attributes === 'string' ? JSON.parse(record.variant.attributes) : record.variant.attributes;
                    variantInfo = attrs ? Object.values(attrs).join(', ') : record.variant.sku;
                  }

                  return (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="font-medium text-gray-900">{format(new Date(record.created_at), 'MMM dd, yyyy')}</div>
                        <div className="text-xs">{format(new Date(record.created_at), 'h:mm a')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{record.product?.name || 'Unknown Product'}</div>
                        {variantInfo && (
                          <div className="text-xs text-gray-500 mt-0.5">Variant: {variantInfo}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full uppercase tracking-wider ${getBadgeColor(record.type)}`}>
                          {record.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-bold ${
                          record.type === 'in' ? 'text-green-600' : record.type === 'out' ? 'text-red-600' : 'text-orange-500'
                        }`}>
                          {getPrefix(record.type)} {record.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">{record.current_stock}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {record.notes ? (
                          <div className="italic mb-1">"{record.notes}"</div>
                        ) : null}
                        {record.reference ? (
                          <div className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded inline-block">Ref: {record.reference}</div>
                        ) : null}
                        {!record.notes && !record.reference && <span className="text-gray-300">-</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Showing page <span className="font-medium">{pagination.current_page}</span> of <span className="font-medium">{pagination.last_page}</span>
            </span>
            <div className="flex space-x-2">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                disabled={page === pagination.last_page} 
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
