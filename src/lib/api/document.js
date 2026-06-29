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

export const getClientCategoriesForSystem = async (id) => {
  const response = await fetch(`/api/system/categories/${id}/`);

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

export const fetchDataForAccountManager = async () => {
  const response = await fetch("/api/account-manager/getuser");

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch dashboard");
  }

  return data;
};
