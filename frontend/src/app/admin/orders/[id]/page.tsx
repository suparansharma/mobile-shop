"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function AdminOrderDetailsPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchOrderDetails();
  }, [params.id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/orders/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        router.push('/admin/orders');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`${API_URL}/admin/orders/${params.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ order_status: newStatus })
      });
      
      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Order status has been updated successfully.',
          timer: 1500,
          showConfirmButton: false
        });
        fetchOrderDetails();
      } else {
        throw new Error(data.message || 'Failed to update status');
      }
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You are about to cancel this order. If paid, it will be marked for refund.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it!'
    });

    if (result.isConfirmed) {
      setUpdating(true);
      try {
        const res = await fetch(`${API_URL}/admin/orders/${params.id}/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        const data = await res.json();
        if (res.ok) {
          Swal.fire('Cancelled!', 'Order has been cancelled.', 'success');
          fetchOrderDetails();
        } else {
          throw new Error(data.message || 'Failed to cancel order');
        }
      } catch (error: any) {
        Swal.fire('Error', error.message, 'error');
      } finally {
        setUpdating(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <svg className="animate-spin h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link href="/admin/orders" className="text-sm text-orange-500 hover:underline mb-2 inline-block">
            &larr; Back to Orders
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.order_number}</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => window.open(`/invoice/${order.order_number}`, '_blank')}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-2 px-4 rounded-lg shadow-sm transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print Invoice
          </button>
          {!['delivered', 'cancelled', 'returned'].includes(order.order_status) && (
            <button 
              onClick={handleCancelOrder}
              disabled={updating}
              className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-bold py-2 px-4 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Order Status</h2>
          <select 
            disabled={updating || ['cancelled', 'returned'].includes(order.order_status)}
            value={order.order_status}
            onChange={(e) => handleUpdateStatus(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-9500 focus:border-orange-9500 sm:text-sm rounded-md capitalize"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipping">Shipping</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled" disabled>Cancelled</option>
            <option value="returned" disabled>Returned</option>
          </select>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer Info</h2>
          <p className="font-medium text-gray-900">{order.customer_name}</p>
          <p className="text-sm text-gray-500">{order.customer_phone}</p>
          <p className="text-sm text-gray-500">{order.customer_email}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment</h2>
          <p className="font-medium text-gray-900 uppercase">Method: {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}</p>
          <div className="mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 
                order.payment_status === 'refunded' ? 'bg-orange-900 text-orange-700' :
                'bg-yellow-100 text-yellow-800'
              }`}>
              Status: {order.payment_status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Order Items</h2>
            </div>
            <ul className="divide-y divide-gray-200 p-6">
              {order.items.map((item: any) => (
                <li key={item.id} className="py-4 flex gap-4">
                  <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900">{item.product?.name || 'Product deleted'}</h4>
                    <p className="text-sm text-gray-500">Unit Price: ${Number(item.unit_price).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-bold text-gray-900">
                    ${Number(item.total_price).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end space-y-2 text-sm text-gray-600 flex-col items-end">
                <div className="flex w-64 justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium text-gray-900">${(Number(order.total_amount) - Number(order.delivery_charge) + Number(order.discount_amount)).toFixed(2)}</span>
                </div>
                <div className="flex w-64 justify-between">
                  <span>Discount:</span>
                  <span className="font-medium text-green-600">-${Number(order.discount_amount).toFixed(2)}</span>
                </div>
                <div className="flex w-64 justify-between">
                  <span>Delivery Charge:</span>
                  <span className="font-medium text-gray-900">${Number(order.delivery_charge).toFixed(2)}</span>
                </div>
                <div className="flex w-64 justify-between pt-2 border-t border-gray-200">
                  <span className="font-bold text-gray-900 text-base">Total:</span>
                  <span className="font-extrabold text-orange-500 text-base">${Number(order.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Delivery Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Delivery Area</p>
                <p className="font-medium text-gray-900 capitalize">{order.delivery_area.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-gray-500">Division & District</p>
                <p className="font-medium text-gray-900">{order.division}, {order.district}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-gray-500">Full Address</p>
                <p className="font-medium text-gray-900">{order.customer_address}, {order.upazila}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white shadow rounded-lg p-6 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Order Timeline</h2>
            {order.status_histories?.length > 0 ? (
              <div className="space-y-6">
                {order.status_histories.map((history: any, index: number) => (
                  <div key={history.id} className="relative">
                    {index !== order.status_histories.length - 1 && (
                      <div className="absolute top-6 left-3.5 w-0.5 h-full bg-gray-200"></div>
                    )}
                    <div className="flex gap-4 items-start relative z-10">
                      <div className="mt-1 w-7 h-7 rounded-full bg-orange-900 border-2 border-orange-500 flex items-center justify-center shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 capitalize">{history.status}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(history.created_at).toLocaleString()}</p>
                        <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded border border-gray-100">{history.notes}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No timeline events found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
