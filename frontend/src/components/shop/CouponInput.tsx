"use client";

import { useState } from 'react';
import { applyCoupon, removeCoupon } from '@/lib/api/coupons';
import toast from 'react-hot-toast';

interface CouponInputProps {
  orderTotal: number;
  onCouponApplied?: (discountAmount: number, newTotal: number) => void;
  onCouponRemoved?: () => void;
}

export default function CouponInput({ orderTotal, onCouponApplied, onCouponRemoved }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      const response = await applyCoupon(code, orderTotal);
      if (response.success) {
        setAppliedCoupon(code);
        toast.success(response.message || 'Coupon applied successfully!');
        if (onCouponApplied) {
          onCouponApplied(response.data.discount_amount, response.data.new_total);
        }
      } else {
        toast.error(response.message || 'Failed to apply coupon.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid or expired coupon.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!appliedCoupon) return;
    
    setLoading(true);
    try {
      await removeCoupon(appliedCoupon);
      setAppliedCoupon(null);
      setCode('');
      toast.success('Coupon removed.');
      if (onCouponRemoved) {
        onCouponRemoved();
      }
    } catch (error) {
      toast.error('Failed to remove coupon.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Have a coupon?</h3>
      
      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className="text-sm font-medium text-green-800 dark:text-green-400">
              Code <span className="font-bold">{appliedCoupon}</span> applied!
            </span>
          </div>
          <button
            onClick={handleRemove}
            disabled={loading}
            className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
          >
            {loading ? 'Removing...' : 'Remove'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleApply} className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter coupon code"
            className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-orange-9500 focus:ring-orange-9500 sm:text-sm px-3 py-2 border text-gray-900 dark:text-white"
            required
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none disabled:opacity-50"
          >
            {loading ? 'Applying...' : 'Apply'}
          </button>
        </form>
      )}
    </div>
  );
}
