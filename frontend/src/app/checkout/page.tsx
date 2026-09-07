"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { API_URL } from '@/lib/api';
import Link from 'next/link';
import Swal from 'sweetalert2';

type CheckoutForm = {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  division: string;
  district: string;
  upazila: string;
  delivery_area: 'inside_city' | 'outside_city';
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, couponCode, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<CheckoutForm>({
    defaultValues: {
      delivery_area: 'inside_city',
      customer_name: user?.name || '',
      customer_email: user?.email || '',
    }
  });

  const deliveryArea = watch('delivery_area');
  const deliveryCharge = deliveryArea === 'inside_city' ? 10.00 : 20.00;
  const total = subtotal - discount + deliveryCharge;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-12 flex items-center justify-center">
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cart is empty</h2>
          <p className="text-gray-500 mb-8">You need items in your cart to checkout.</p>
          <Link href="/shop" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all inline-block w-full">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutForm) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        coupon_code: couponCode,
        items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity }))
      };

      const res = await fetch(`${API_URL}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(user ? { 'Authorization': `Bearer ${useAuthStore.getState().token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      
      const responseData = await res.json();
      if (!res.ok) {
        if (responseData.errors) {
          const firstError = Object.values(responseData.errors)[0] as string[];
          throw new Error(firstError[0]);
        }
        throw new Error(responseData.message || 'Checkout failed');
      }
      
      // Clear cart
      await clearCart();
      
      // Redirect to success
      router.push(`/checkout/success?order=${responseData.order.order_number}`);
    } catch (error: any) {
      console.error('Checkout failed', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.message || 'Checkout failed. Please try again.',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-2/3">
          <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Customer Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input 
                    {...register('customer_name', { required: 'Name is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-9500 focus:border-orange-9500" 
                  />
                  {errors.customer_name && <p className="text-red-500 text-xs mt-1">{errors.customer_name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input 
                    {...register('customer_phone', { required: 'Phone is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-9500 focus:border-orange-9500" 
                  />
                  {errors.customer_phone && <p className="text-red-500 text-xs mt-1">{errors.customer_phone.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email"
                    {...register('customer_email')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-9500 focus:border-orange-9500" 
                  />
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6">Delivery Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Division *</label>
                  <select 
                    {...register('division', { required: 'Division is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-9500 focus:border-orange-9500 bg-white"
                  >
                    <option value="">Select Division</option>
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chattogram">Chattogram</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Barishal">Barishal</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                  </select>
                  {errors.division && <p className="text-red-500 text-xs mt-1">{errors.division.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                  <input 
                    {...register('district', { required: 'District is required' })}
                    placeholder="e.g. Dhaka"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-9500 focus:border-orange-9500" 
                  />
                  {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upazila / Area *</label>
                  <input 
                    {...register('upazila', { required: 'Upazila is required' })}
                    placeholder="e.g. Dhanmondi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-9500 focus:border-orange-9500" 
                  />
                  {errors.upazila && <p className="text-red-500 text-xs mt-1">{errors.upazila.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
                <textarea 
                  {...register('customer_address', { required: 'Address is required' })}
                  placeholder="House, Road, Block, etc."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-9500 focus:border-orange-9500" 
                ></textarea>
                {errors.customer_address && <p className="text-red-500 text-xs mt-1">{errors.customer_address.message}</p>}
              </div>

              <div className="mt-6 border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Delivery Area *</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      value="inside_city" 
                      {...register('delivery_area')} 
                      className="w-5 h-5 text-orange-500"
                    />
                    <span>Inside City ($10)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      value="outside_city" 
                      {...register('delivery_area')} 
                      className="w-5 h-5 text-orange-500"
                    />
                    <span>Outside City ($20)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6">Payment Method</h2>
              <div className="p-4 border-2 border-orange-9500 bg-orange-950 rounded-xl flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                <span className="font-bold text-orange-800">Cash on Delivery (COD)</span>
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.product_id} className="flex justify-between text-sm">
                  <span className="text-gray-600 line-clamp-1 pr-4">{item.quantity}x {item.name}</span>
                  <span className="font-medium whitespace-nowrap">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm text-gray-600 border-t border-gray-100 pt-4 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">${Number(subtotal).toFixed(2)}</span>
              </div>
              
              {Number(discount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {couponCode && `(${couponCode})`}</span>
                  <span className="font-medium">-${Number(discount).toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-medium text-gray-900">${Number(deliveryCharge).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-end mb-8 pt-4 border-t border-gray-100">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-extrabold text-orange-500">${Number(total).toFixed(2)}</span>
            </div>
            
            <button 
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-800 transition-all disabled:opacity-50 flex justify-center items-center"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
