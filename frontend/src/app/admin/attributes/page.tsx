"use client";

import { useEffect, useState, KeyboardEvent } from 'react';
import { fetchAttributes, deleteAttribute, bulkDeleteAttributes, bulkUpdateAttributeStatus, createAttribute, updateAttribute } from '@/lib/api/attributes';
import toast from 'react-hot-toast';

export default function AttributesPage() {
  const [attributes, setAttributes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  // Pagination & Filter States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const perPage = 10;
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [saving, setSaving] = useState(false);
  
  // Delete Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | 'bulk' | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const defaultFormData = {
    id: null as number | null,
    name: '',
    status: true,
    values: [] as string[]
  };
  
  const [formData, setFormData] = useState(defaultFormData);
  const [inputValue, setInputValue] = useState(''); // For the tags input

  const loadAttributes = async () => {
    setLoading(true);
    try {
      const data = await fetchAttributes(currentPage, perPage, searchQuery, statusFilter);
      setAttributes(data.data || []);
      setTotalPages(data.last_page || 1);
      setTotalItems(data.total || 0);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load attributes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAttributes();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, searchQuery, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(attributes.map(a => a.id));
    else setSelectedIds([]);
  };

  const openCreateModal = () => {
    setFormData(defaultFormData);
    setInputValue('');
    setModalMode('create');
    setIsModalOpen(true);
  };

  const openEditModal = (attr: any) => {
    setFormData({
      id: attr.id,
      name: attr.name,
      status: !!attr.status,
      values: attr.values.map((v: any) => v.value)
    });
    setInputValue('');
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputValue.trim();
      if (val && !formData.values.includes(val)) {
        setFormData({ ...formData, values: [...formData.values, val] });
        setInputValue('');
      }
    }
  };

  const removeValue = (valToRemove: string) => {
    setFormData({ ...formData, values: formData.values.filter(v => v !== valToRemove) });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Attribute Name is required');
      return;
    }
    
    // Auto-add input value if user forgets to press Enter
    let finalValues = [...formData.values];
    if (inputValue.trim() && !finalValues.includes(inputValue.trim())) {
        finalValues.push(inputValue.trim());
    }
    
    setSaving(true);
    const dataToSave = {
      name: formData.name,
      status: formData.status,
      values: finalValues
    };

    try {
      if (modalMode === 'create') {
        await createAttribute(dataToSave);
        toast.success('Attribute created successfully!');
      } else {
        await updateAttribute(formData.id!, dataToSave);
        toast.success('Attribute updated successfully!');
      }
      setIsModalOpen(false);
      loadAttributes();
    } catch (error) {
      console.error(error);
      toast.error(modalMode === 'create' ? 'Failed to create attribute' : 'Failed to update attribute');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (target: number | 'bulk') => {
    setDeleteTarget(target);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    
    try {
      if (deleteTarget === 'bulk') {
        await bulkDeleteAttributes(selectedIds);
        toast.success('Selected attributes deleted!');
        setSelectedIds([]);
      } else {
        await deleteAttribute(deleteTarget);
        toast.success('Attribute deleted successfully!');
      }
      loadAttributes();
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch(e) {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkStatus = async (status: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      await bulkUpdateAttributeStatus(selectedIds, status);
      toast.success(`Status updated to ${status ? 'Active' : 'Inactive'}!`);
      setSelectedIds([]);
      loadAttributes();
    } catch(e) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Attributes Management</h1>
        <button onClick={openCreateModal} className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition shadow-sm">
          + Add New Attribute
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-96">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search attributes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-9500 focus:border-orange-9500 sm:text-sm"
            />
          </div>
        </div>
        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-lg focus:ring-orange-9500 focus:border-orange-9500 sm:text-sm bg-white"
          >
            <option value="">All Status</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-orange-950 p-4 rounded-lg flex items-center justify-between border border-orange-900 shadow-sm">
          <span className="text-orange-700 font-medium">{selectedIds.length} items selected</span>
          <div className="space-x-2">
            <button onClick={() => handleBulkStatus(true)} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 shadow-sm transition">Set Active</button>
            <button onClick={() => handleBulkStatus(false)} className="bg-yellow-600 text-white px-3 py-1.5 rounded text-sm hover:bg-yellow-700 shadow-sm transition">Set Inactive</button>
            <button onClick={() => confirmDelete('bulk')} className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700 shadow-sm transition">Delete Selected</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left w-12">
                <input type="checkbox" onChange={handleSelectAll} checked={attributes.length > 0 && selectedIds.length === attributes.length} className="rounded border-gray-300 text-orange-500 focus:ring-orange-9500" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Values</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-medium">Loading attributes...</td></tr>
            ) : attributes.map(attr => (
              <tr key={attr.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" checked={selectedIds.includes(attr.id)} onChange={() => handleSelect(attr.id)} className="rounded border-gray-300 text-orange-500 focus:ring-orange-9500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">{attr.name}</div>
                </td>
                <td className="px-6 py-4 w-1/2">
                  <div className="flex flex-wrap gap-1.5">
                    {attr.values.map((v: any) => (
                      <span key={v.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        {v.value}
                      </span>
                    ))}
                    {attr.values.length === 0 && <span className="text-sm text-gray-400 italic">No values added</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${attr.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {attr.status ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button onClick={() => openEditModal(attr)} className="text-orange-500 hover:text-orange-800 transition-colors">Edit</button>
                  <button onClick={() => confirmDelete(attr.id)} className="text-red-600 hover:text-red-900 transition-colors">Delete</button>
                </td>
              </tr>
            ))}
            {!loading && attributes.length === 0 && (
              <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No attributes found. Create one to get started!</td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * perPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * perPage, totalItems)}</span> of <span className="font-medium">{totalItems}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1 ? 'z-10 bg-orange-950 border-orange-9500 text-orange-500' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full relative flex flex-col my-8 max-h-[calc(100vh-4rem)]">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900">{modalMode === 'create' ? 'Create New Attribute' : 'Edit Attribute'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="attributeForm" onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attribute Name *</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-9500 focus:ring-orange-9500 sm:text-sm p-2.5 border" 
                    placeholder="e.g. RAM, Storage, Color" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attribute Values</label>
                  <p className="text-xs text-gray-500 mb-2">Type a value and press Enter to add it.</p>
                  
                  <div className="border border-gray-300 rounded-md p-2 bg-white flex flex-wrap gap-2 items-center focus-within:ring-1 focus-within:ring-orange-9500 focus-within:border-orange-9500">
                    {formData.values.map(val => (
                      <span key={val} className="inline-flex items-center px-2.5 py-1 rounded bg-orange-950 text-orange-600 text-sm font-medium border border-orange-900">
                        {val}
                        <button type="button" onClick={() => removeValue(val)} className="ml-1.5 text-orange-9500 hover:text-orange-700 focus:outline-none">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                    <input 
                      type="text" 
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={formData.values.length === 0 ? "Type e.g. 4GB and press Enter" : "Add more..."}
                      className="flex-1 min-w-[120px] outline-none border-none text-sm p-1 shadow-none focus:ring-0"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={formData.status} onChange={e => setFormData({...formData, status: e.target.checked})} className="rounded text-orange-500 focus:ring-orange-9500 h-4 w-4" />
                    <span className="text-sm text-gray-700 font-semibold">Active Status</span>
                  </label>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 rounded-b-xl">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" form="attributeForm" disabled={saving} className="px-4 py-2.5 text-sm font-semibold text-white bg-orange-500 border border-transparent rounded-lg shadow-sm hover:bg-orange-600 transition flex items-center justify-center min-w-[140px]">
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Saving...
                  </>
                ) : 'Save Attribute'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg leading-6 font-bold text-gray-900 mb-2">Confirm Deletion</h3>
            <p className="text-sm text-gray-500 mb-6">
              {deleteTarget === 'bulk' 
                ? `Are you sure you want to delete the ${selectedIds.length} selected attributes? This action cannot be undone.` 
                : 'Are you sure you want to delete this attribute? This action cannot be undone.'}
            </p>
            <div className="flex justify-center space-x-3">
              <button 
                type="button" 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteTarget(null);
                }} 
                className="px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={executeDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none transition-colors flex items-center shadow-sm"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Deleting...
                  </>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
