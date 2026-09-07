"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <div className="bg-gray-50 min-h-screen py-20 px-4 flex flex-col items-center">
      <div className="bg-white p-10 md:p-16 rounded-3xl shadow-lg border border-gray-100 text-center max-w-2xl w-full">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Order Confirmed!</h1>
        <p className="text-lg text-gray-600 mb-8">
          Thank you for shopping with us! Your order has been successfully placed.
        </p>

        {orderNumber && (
          <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300 mb-10">
            <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">Order Number</p>
            <p className="text-2xl font-black text-orange-500 tracking-widest">{orderNumber}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/shop" 
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-orange-800 transition-all"
          >
            Continue Shopping
          </Link>
          <Link 
            href="/profile/orders" 
            className="bg-white hover:bg-gray-50 text-gray-900 font-bold py-4 px-8 rounded-xl shadow-sm border border-gray-200 transition-all"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
