"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { API_URL } from '@/lib/api';
import Link from 'next/link';

export default function OrderDetailsPage({ params }: { params: { order_number: string } }) {
  const { token, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    } else {
      fetchOrderDetails();
    }
  }, [isAuthenticated, router, params.order_number]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`${API_URL}/user/orders/${params.order_number}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        router.push('/profile/orders');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isAuthenticated()) return null;

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <svg className="animate-spin h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
    );
  }

  if (!order) return null;

  const getStatusStep = (status: string) => {
    const steps = ['pending', 'confirmed', 'processing', 'shipping', 'delivered'];
    return steps.indexOf(status);
  };

  const currentStepIndex = getStatusStep(order.order_status);
  const isCancelledOrReturned = ['cancelled', 'returned'].includes(order.order_status);

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-gray-100 pb-6">
        <div>
          <Link href="/profile/orders" className="text-sm text-orange-500 hover:underline mb-2 inline-block">&larr; Back to Orders</Link>
          <h1 className="text-2xl font-extrabold text-gray-900">Order #{order.order_number}</h1>
          <p className="text-sm text-gray-500 mt-1">Placed on {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <button 
          onClick={() => window.open(`/invoice/${order.order_number}`, '_blank')}
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-2 px-4 rounded-lg shadow-sm transition flex items-center gap-2"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Download Invoice
        </button>
      </div>
      
      {/* Order Tracking Timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-8">Tracking Status</h2>
        
        {isCancelledOrReturned ? (
           <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex items-center gap-4">
             <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </div>
             <div>
               <h3 className="text-lg font-bold text-red-800 uppercase">{order.order_status}</h3>
               <p className="text-red-600">This order has been {order.order_status}.</p>
             </div>
           </div>
        ) : (
          <div className="relative">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-100">
              <div 
                style={{ width: `${Math.max(0, (currentStepIndex / 4) * 100)}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500 transition-all duration-500"
              ></div>
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className={`text-center w-1/5 ${currentStepIndex >= 0 ? 'text-orange-500' : ''}`}>Pending</div>
              <div className={`text-center w-1/5 ${currentStepIndex >= 1 ? 'text-orange-500' : ''}`}>Confirmed</div>
              <div className={`text-center w-1/5 ${currentStepIndex >= 2 ? 'text-orange-500' : ''}`}>Processing</div>
              <div className={`text-center w-1/5 ${currentStepIndex >= 3 ? 'text-orange-500' : ''}`}>Shipping</div>
              <div className={`text-center w-1/5 ${currentStepIndex >= 4 ? 'text-orange-500' : ''}`}>Delivered</div>
            </div>
          </div>
        )}
        
        {/* Timeline Updates */}
        <div className="mt-10 border-t pt-6">
          <h3 className="font-bold text-gray-900 mb-4">Status History</h3>
          {order.status_histories?.length > 0 ? (
            <div className="space-y-4">
              {order.status_histories.map((history: any) => (
                <div key={history.id} className="flex gap-4 items-start">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-orange-500 shrink-0"></div>
                  <div>
                    <p className="font-bold text-gray-900 capitalize">{history.status}</p>
                    <p className="text-sm text-gray-500">{history.notes}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(history.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No tracking history available yet.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Order Items</h2>
          <ul className="divide-y divide-gray-100">
            {order.items.map((item: any) => (
              <li key={item.id} className="py-4 flex gap-4">
                <div className="h-20 w-20 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-gray-900">{item.product?.name || 'Product deleted'}</h4>
                  <p className="text-sm text-gray-500 mt-1">Price: ${Number(item.unit_price).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="font-bold text-gray-900 text-lg">
                  ${Number(item.total_price).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary & Shipping */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">Payment Summary</h2>
            <div className="space-y-3 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">${(Number(order.total_amount) - Number(order.delivery_charge) + Number(order.discount_amount)).toFixed(2)}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-${Number(order.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-medium text-gray-900">${Number(order.delivery_charge).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-xl font-extrabold text-orange-500">${Number(order.total_amount).toFixed(2)}</span>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Payment Method</p>
              <p className="font-bold text-gray-900 uppercase">{order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}</p>
              
              <p className="text-sm text-gray-500 mb-1 mt-4">Payment Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {order.payment_status}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">Delivery Details</h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p><span className="font-medium text-gray-900">Name:</span> {order.customer_name}</p>
              <p><span className="font-medium text-gray-900">Phone:</span> {order.customer_phone}</p>
              {order.customer_email && <p><span className="font-medium text-gray-900">Email:</span> {order.customer_email}</p>}
              <p className="pt-2">
                <span className="font-medium text-gray-900 block mb-1">Address:</span>
                {order.customer_address}<br />
                {order.upazila}, {order.district}<br />
                {order.division}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
