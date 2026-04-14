// Types

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Property {
  id: number;
  title: string;
  address: string;
  price: number;
  imageUrl: string | null;
  isFavourited: boolean;
}

export interface FavouritedProperty {
  id: number;
  title: string;
  address: string;
  price: number;
  imageUrl: string | null;
  savedAt: string;
}

export interface FieldErrors {
  [field: string]: string;
}

export interface ApiError {
  error?: string;
  errors?: FieldErrors;
}

// Base fetch helper

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data: unknown = await res.json();

  if (!res.ok) {
    const err = data as ApiError;
    const message =
      err.error ?? Object.values(err.errors ?? {})[0] ?? "An error occurred.";
    throw Object.assign(new Error(message), { status: res.status, data: err });
  }

  return data as T;
}

// Auth API

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    apiFetch<User>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    apiFetch<User>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  logout: () =>
    apiFetch<{ message: string }>("/api/auth/logout", { method: "POST" }),

  me: () => apiFetch<User>("/api/auth/me"),
};

// Properties API

export const propertiesApi = {
  getAll: () => apiFetch<Property[]>("/api/properties"),
};

// Favourites API

export const favouritesApi = {
  getAll: () => apiFetch<FavouritedProperty[]>("/api/favourites"),

  add: (propertyId: number) =>
    apiFetch<{ message: string }>(`/api/favourites/${propertyId}`, {
      method: "POST",
    }),

  remove: (propertyId: number) =>
    apiFetch<{ message: string }>(`/api/favourites/${propertyId}`, {
      method: "DELETE",
    }),
};
