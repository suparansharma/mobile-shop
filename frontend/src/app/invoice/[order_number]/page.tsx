"use client";

import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function InvoicePage({ params }: { params: { order_number: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { token, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated()) {
      fetchOrderDetails();
    }
  }, [isAuthenticated, params.order_number]);

  const fetchOrderDetails = async () => {
    try {
      // Determine if admin or user based on user role (if available) or try user first, then admin
      const isAdmin = user?.role === 'admin';
      const endpoint = isAdmin 
        ? `${API_URL}/admin/orders/${params.order_number}` // Note: Admin show uses ID, so we might need a workaround. Let's assume order_number is passed and we need a specific endpoint or user endpoint works if we are admin
        : `${API_URL}/user/orders/${params.order_number}`;

      // UserOrderController show() allows admins to view any order by order_number!
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
        document.body.innerHTML = "<div style='padding:50px;font-family:sans-serif;color:red;'>Order not found or unauthorized.</div>";
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading invoice...</div>;
  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; margin: 0; padding: 0; }
          .no-print { display: none !important; }
        }
      `}} />
      
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-orange-500 mb-2">INVOICE</h1>
          <p className="text-gray-500 font-medium">#{order.order_number}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-gray-900">MobileShop</h2>
          <p className="text-sm text-gray-500 mt-1">123 Tech Street, Silicon Valley</p>
          <p className="text-sm text-gray-500">contact@mobileshop.com</p>
          <p className="text-sm text-gray-500">+1 234 567 890</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-12">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Billed To</h3>
          <p className="font-bold text-gray-900 text-lg mb-1">{order.customer_name}</p>
          <p className="text-sm text-gray-600">{order.customer_phone}</p>
          <p className="text-sm text-gray-600">{order.customer_email}</p>
          <p className="text-sm text-gray-600 mt-2 max-w-xs">
            {order.customer_address},<br/>
            {order.upazila}, {order.district},<br/>
            {order.division}
          </p>
        </div>
        <div className="text-right">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Order Details</h3>
          <div className="space-y-2">
            <p className="text-sm"><span className="text-gray-500 mr-2">Date:</span> <span className="font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</span></p>
            <p className="text-sm"><span className="text-gray-500 mr-2">Payment:</span> <span className="font-medium text-gray-900 uppercase">{order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}</span></p>
            <p className="text-sm"><span className="text-gray-500 mr-2">Status:</span> <span className="font-medium text-gray-900 capitalize">{order.order_status}</span></p>
          </div>
        </div>
      </div>

      <table className="w-full text-left border-collapse mb-8">
        <thead>
          <tr className="border-b-2 border-gray-900">
            <th className="py-3 text-sm font-bold text-gray-900">Item Description</th>
            <th className="py-3 text-sm font-bold text-gray-900 text-center">Qty</th>
            <th className="py-3 text-sm font-bold text-gray-900 text-right">Price</th>
            <th className="py-3 text-sm font-bold text-gray-900 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {order.items.map((item: any) => (
            <tr key={item.id}>
              <td className="py-4 text-sm font-medium text-gray-900">{item.product?.name || 'Product deleted'}</td>
              <td className="py-4 text-sm text-gray-600 text-center">{item.quantity}</td>
              <td className="py-4 text-sm text-gray-600 text-right">${Number(item.unit_price).toFixed(2)}</td>
              <td className="py-4 text-sm font-bold text-gray-900 text-right">${Number(item.total_price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>${(Number(order.total_amount) - Number(order.delivery_charge) + Number(order.discount_amount)).toFixed(2)}</span>
          </div>
          {Number(order.discount_amount) > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-${Number(order.discount_amount).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-600">
            <span>Delivery Charge</span>
            <span>${Number(order.delivery_charge).toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t-2 border-gray-900 pt-3">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-black text-xl text-orange-500">${Number(order.total_amount).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-20 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>Thank you for shopping with MobileShop!</p>
        <p className="mt-1">If you have any questions concerning this invoice, contact our support.</p>
      </div>

      <div className="fixed bottom-8 right-8 no-print">
        <button 
          onClick={() => window.print()}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Print Invoice
        </button>
      </div>
    </div>
  );
}
