export const API_URL = 'http://localhost:8000/api/v1';

export async function fetchProducts(params = '') {
  try {
    const res = await fetch(`${API_URL}/products${params}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  } catch (error) {
    console.error(error);
    return { data: [] };
  }
}

export async function fetchCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchBrands() {
  try {
    const res = await fetch(`${API_URL}/brands`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) throw new Error('Failed to fetch brands');
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchProductDetails(slug: string) {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchCategoryDetails(slug: string) {
  try {
    const res = await fetch(`${API_URL}/categories/${slug}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchBrandDetails(slug: string) {
  try {
    const res = await fetch(`${API_URL}/brands/${slug}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}
