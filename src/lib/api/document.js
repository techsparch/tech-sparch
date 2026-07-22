export async function fetchCategories() {
  const response = await fetch("/api/document-category");

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch categories");
  }

  return data.categories;
}

export async function getCategories() {
  const response = await fetch("/api/get-docs/user");

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch categories");
  }

  return data.categories;
}

export async function getCategoryDocuments(categoryId) {
  const response = await fetch(`/api/get-docs/user/category/${categoryId}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch documents");
  }

  return data;
}

export const getClientCategoriesForSystem = async (id, page = 1) => {
  // Pass the page and limit to the API route via query parameters
  const response = await fetch(
    `/api/system/categories/${id}?page=${page}&limit=30 `,
    {
      cache: "no-store", // 👇 ADD THIS LINE
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
};

export const getClientCategoriesForAccountManager = async (id, page = 1) => {
  // Pass the page and limit to the API route via query parameters
  const response = await fetch(
    `/api/account-manager/categories/${id}?page=${page}&limit=30`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
};

export const getClientCategoriesForClient = async (page = 1) => {
  const response = await fetch(
    `/api/client/getCategories?page=${page}&limit=30`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
};
export async function getDocumentsByCategory(clientId, categoryId) {
  const res = await fetch(
    `/api/system/client/${clientId}/category/${categoryId}`,
    {
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch documents");
  }

  const result = await res.json();
  return result.data;
}

export async function getDocumentsByCategoryForAccountManager(
  clientId,
  categoryId,
) {
  const res = await fetch(
    `/api/account-manager/client/${clientId}/category/${categoryId}`,
  );

  if (!res.ok) {
    throw new Error("Failed to fetch documents");
  }

  const result = await res.json();
  return result.data;
}

export async function getDocumentsByCategoryForSystem(clientId, categoryId) {
  const res = await fetch(
    `/api/system/client/${clientId}/category/${categoryId}`,
  );

  if (!res.ok) {
    throw new Error("Failed to fetch documents");
  }

  const result = await res.json();
  return result.data;
}

export async function getDocumentsByCategoryForStaff(clientId, categoryId) {
  const res = await fetch(
    `/api/staff/client-files/${clientId}/${categoryId}`
  );

  console.log("status:", res.status);

  const result = await res.json();

  console.log("API Response:", result);

  if (!res.ok) {
    throw new Error(result.message || "Failed to fetch documents");
  }

  return result.data;
}

export const fetchDataForAccountManager = async () => {
  const response = await fetch("/api/account-manager/getuser");

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch dashboard");
  }

  return data;
};

export const getStaffForAccountManager = async (page = 1) => {
  // Pass the page and limit to the API route via query parameters
  const response = await fetch(
    `/api/account-manager/staff/`, // ?page=${page}&limit=30
  );

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
};

export const fetchStaffClients = async ({ page = 1, limit = 9, search = "" }) => {
  // Append the search parameter to your existing URL
  const response = await fetch(
    `/api/staff/getuser?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch clients");
  }

  return response.json();
};