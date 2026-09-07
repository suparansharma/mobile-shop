"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function AddressBookPage() {
  const { token, isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const initialForm = {
    type: "shipping",
    name: "",
    phone: "",
    address: "",
    city: "",
    zone: "",
    is_default: false
  };
  
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchAddresses();
  }, [isAuthenticated, router]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/addresses`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    
    try {
      const url = editingId ? `${API_URL}/addresses/${editingId}` : `${API_URL}/addresses`;
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to save address");
      }
      
      setMessage({ text: `Address ${editingId ? 'updated' : 'added'} successfully!`, type: "success" });
      setAdding(false);
      setEditingId(null);
      setFormData(initialForm);
      fetchAddresses();
      
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    
    try {
      const res = await fetch(`${API_URL}/addresses/${id}`, {
        method: 'DELETE',
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setAddresses(addresses.filter(a => a.id !== id));
        setMessage({ text: "Address deleted.", type: "success" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (address: any) => {
    setFormData({
      type: address.type,
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      zone: address.zone || "",
      is_default: address.is_default
    });
    setEditingId(address.id);
    setAdding(true);
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><svg className="animate-spin h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>;
  }

  return (
    <div className="p-6 sm:p-10">
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Address Book</h2>
          <p className="text-gray-500 mt-1">Manage your shipping and billing addresses.</p>
        </div>
        {!adding && (
          <button 
            onClick={() => { setFormData(initialForm); setAdding(true); setEditingId(null); }}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add New Address
          </button>
        )}
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl mb-6 font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {adding ? (
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">{editingId ? 'Edit Address' : 'Add New Address'}</h3>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-9500 focus:border-orange-9500 bg-white"
                >
                  <option value="shipping">Shipping</option>
                  <option value="billing">Billing</option>
                </select>
              </div>
              <div className="flex items-end pb-3">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.is_default}
                    onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                    className="h-5 w-5 text-orange-500 focus:ring-orange-9500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">Make this my default address</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-9500 focus:border-orange-9500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-9500 focus:border-orange-9500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input type="text" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-9500 focus:border-orange-9500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input type="text" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-9500 focus:border-orange-9500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zone / State (Optional)</label>
                <input type="text" value={formData.zone} onChange={(e) => setFormData({...formData, zone: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-9500 focus:border-orange-9500" />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button type="submit" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors">
                {editingId ? 'Update Address' : 'Save Address'}
              </button>
              <button type="button" onClick={() => { setAdding(false); setEditingId(null); }} className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.length === 0 ? (
            <div className="col-span-1 md:col-span-2 bg-gray-50 p-10 text-center rounded-2xl border border-gray-100 border-dashed">
              <p className="text-gray-500">You haven't added any addresses yet.</p>
            </div>
          ) : (
            addresses.map(address => (
              <div key={address.id} className={`bg-white rounded-2xl shadow-sm border p-6 relative ${address.is_default ? 'border-orange-9500 ring-1 ring-orange-9500' : 'border-gray-200'}`}>
                {address.is_default && (
                  <span className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                    Default {address.type}
                  </span>
                )}
                {!address.is_default && (
                  <span className="absolute top-4 right-4 bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {address.type}
                  </span>
                )}
                
                <h3 className="font-bold text-gray-900 text-lg mb-1">{address.name}</h3>
                <p className="text-gray-500 text-sm mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {address.phone}
                </p>
                
                <div className="text-gray-600 text-sm space-y-1 mb-6">
                  <p>{address.address}</p>
                  <p>{address.city}{address.zone ? `, ${address.zone}` : ''}</p>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button onClick={() => startEdit(address)} className="text-orange-500 hover:text-orange-700 text-sm font-semibold transition-colors">
                    Edit
                  </button>
                  <span className="text-gray-300">|</span>
                  <button onClick={() => handleDelete(address.id)} className="text-red-600 hover:text-red-800 text-sm font-semibold transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
