"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchProducts, fetchTrashedProducts, deleteProduct, restoreProduct, duplicateProduct, getProductsExportUrl, importProducts } from '@/lib/api/products';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'active' | 'trashed'>('active');
  const perPage = 10;

  // Modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Import / Export
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const fetcher = viewMode === 'trashed' ? fetchTrashedProducts : fetchProducts;
      const filters: any = { search: searchQuery };
      if (statusFilter !== '') filters.status = statusFilter;
      
      const data = await fetcher(currentPage, perPage, filters);
      setProducts(data.data || []);
      setTotalPages(data.last_page || 1);
      setTotalItems(data.total || 0);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, searchQuery, statusFilter, viewMode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, viewMode]);

  const confirmDelete = (id: number) => {
    setDeleteTarget(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget);
      toast.success('Product deleted successfully!');
      loadProducts();
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch(e) {
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreProduct(id);
      toast.success('Product restored successfully!');
      loadProducts();
    } catch(e) {
      toast.error('Failed to restore product');
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await duplicateProduct(id);
      toast.success('Product duplicated successfully!');
      loadProducts();
    } catch(e) {
      toast.error('Failed to duplicate product');
    }
  };

  const handleExport = (format: 'xlsx' | 'csv') => {
    window.open(getProductsExportUrl(format), '_blank');
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }
    setImporting(true);
    try {
      await importProducts(importFile);
      toast.success('Products imported successfully!');
      setIsImportModalOpen(false);
      setImportFile(null);
      loadProducts();
    } catch (e: any) {
      toast.error(e.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
        <div className="flex gap-3 items-center">
          <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <button 
              onClick={() => handleExport('xlsx')} 
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border-r border-gray-200 transition"
              title="Export as Excel"
            >
              Export XLSX
            </button>
            <button 
              onClick={() => handleExport('csv')} 
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              title="Export as CSV"
            >
              Export CSV
            </button>
          </div>
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition shadow-sm text-sm"
          >
            Import
          </button>
          <Link href="/admin/products/create" className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition shadow-sm text-sm">
            + Add New
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-96 flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by Name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-9500 focus:border-orange-9500 sm:text-sm"
            />
          </div>
        </div>
        <div className="flex w-full sm:w-auto gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-36 py-2 pl-3 pr-10 border border-gray-300 rounded-lg focus:ring-orange-9500 focus:border-orange-9500 sm:text-sm bg-white"
          >
            <option value="">All Status</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('active')}
              className={`px-4 py-2 text-sm font-medium ${viewMode === 'active' ? 'bg-orange-950 text-orange-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Active
            </button>
            <button
              onClick={() => setViewMode('trashed')}
              className={`px-4 py-2 text-sm font-medium border-l border-gray-300 ${viewMode === 'trashed' ? 'bg-red-50 text-red-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Trash
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Info</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category & Brand</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price / Stock</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-medium">Loading products...</td></tr>
            ) : products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                      {/* Image placeholder */}
                      <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">SKU: {product.sku} | Type: <span className="capitalize">{product.type}</span></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">{product.category?.name || '-'}</div>
                  <div className="text-xs text-gray-500">{product.brand?.name || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">${parseFloat(product.price).toFixed(2)}</div>
                  <div className="text-xs text-gray-500">Stock: {product.stock}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {product.status ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  {viewMode === 'active' ? (
                    <>
                      <Link href={`/admin/products/${product.id}/edit`} className="text-orange-500 hover:text-orange-800 transition-colors">Edit</Link>
                      <button onClick={() => handleDuplicate(product.id)} className="text-emerald-600 hover:text-emerald-900 transition-colors">Duplicate</button>
                      <button onClick={() => confirmDelete(product.id)} className="text-red-600 hover:text-red-900 transition-colors">Delete</button>
                    </>
                  ) : (
                    <button onClick={() => handleRestore(product.id)} className="text-green-600 hover:text-green-900 font-bold transition-colors">Restore</button>
                  )}
                </td>
              </tr>
            ))}
            {!loading && products.length === 0 && (
              <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No products found.</td>
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
              Are you sure you want to move this product to Trash? You can restore it later.
            </p>
            <div className="flex justify-center space-x-3">
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteTarget(null);
                }} 
                className="px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none transition-colors flex items-center shadow-sm"
              >
                {deleting ? 'Deleting...' : 'Move to Trash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Import Products</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div className="p-4 bg-orange-950 text-orange-700 rounded-lg text-sm mb-4">
                Upload a <strong>.xlsx</strong> or <strong>.csv</strong> file. If the <strong>SKU</strong> exists, the product will be updated. Otherwise, a new product will be created.
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
                <input 
                  type="file" 
                  accept=".xlsx,.csv"
                  onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-950 file:text-orange-600 hover:file:bg-orange-900 border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none transition-colors shadow-sm text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={importing || !importFile}
                  className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 focus:outline-none transition-colors shadow-sm disabled:opacity-50 text-sm flex items-center"
                >
                  {importing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importing...
                    </>
                  ) : 'Upload & Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
