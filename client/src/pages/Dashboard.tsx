import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  authApi,
  propertiesApi,
  favouritesApi,
  Property,
  FavouritedProperty,
} from "../api";
import { useUser } from "../context/UserContext";
import PropertyCard from "../components/PropertyCard";
import FavouritesList from "../components/FavouritesList";
import Footer from "../components/Footer";

// Toast

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

let toastCounter = 0;

// Dashboard

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const [properties, setProperties] = useState<Property[]>([]);
  const [favourites, setFavourites] = useState<FavouritedProperty[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loadingToggle, setLoadingToggle] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Helpers

  function addToast(message: string, type: Toast["type"]) {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  }

  const loadData = useCallback(async () => {
    try {
      const [props, favs] = await Promise.all([
        propertiesApi.getAll(),
        favouritesApi.getAll(),
      ]);
      setProperties(props);
      setFavourites(favs);
    } catch {
      addToast("Failed to load data. Please refresh.", "error");
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Logout

  async function handleLogout() {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      navigate("/login", { replace: true });
    }
  }

  // Toggle favourite

  async function handleToggleFavourite(
    propertyId: number,
    currentlySaved: boolean,
  ) {
    if (loadingToggle !== null) return;

    // Optimistic update
    setProperties((prev) =>
      prev.map((p) =>
        p.id === propertyId ? { ...p, isFavourited: !currentlySaved } : p,
      ),
    );

    setLoadingToggle(propertyId);
    try {
      if (currentlySaved) {
        await favouritesApi.remove(propertyId);
        setFavourites((prev) => prev.filter((f) => f.id !== propertyId));
        addToast("Removed from favourites.", "success");
      } else {
        await favouritesApi.add(propertyId);
        // Re-fetch favourites list to get the full object with savedAt
        const updated = await favouritesApi.getAll();
        setFavourites(updated);
        addToast("Added to favourites!", "success");
      }
    } catch (err: unknown) {
      // Revert on failure
      setProperties((prev) =>
        prev.map((p) =>
          p.id === propertyId ? { ...p, isFavourited: currentlySaved } : p,
        ),
      );
      addToast((err as Error).message ?? "Something went wrong.", "error");
    } finally {
      setLoadingToggle(null);
    }
  }

  // Remove favourite from the list panel

  async function handleRemoveFavourite(propertyId: number) {
    setRemovingId(propertyId);
    try {
      await favouritesApi.remove(propertyId);
      setFavourites((prev) => prev.filter((f) => f.id !== propertyId));
      setProperties((prev) =>
        prev.map((p) =>
          p.id === propertyId ? { ...p, isFavourited: false } : p,
        ),
      );
      addToast("Removed from favourites.", "success");
    } catch (err: unknown) {
      addToast(
        (err as Error).message ?? "Failed to remove favourite.",
        "error",
      );
    } finally {
      setRemovingId(null);
    }
  }

  // Render

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <span className="text-indigo-700 font-bold text-sm">
                {user?.name.charAt(0).toUpperCase() ?? "?"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 text-sm truncate">
                {user?.name}
              </p>
              <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 capitalize">
                {user?.role ?? "buyer"}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="shrink-0 text-sm font-medium text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-300 rounded-lg px-4 py-2 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* My Favourites section */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 text-rose-500"
            >
              <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-2.184C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.936a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
            </svg>
            My Favourites
            <span className="text-sm font-normal text-slate-400">
              ({favourites.length})
            </span>
          </h2>
          {dataLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <FavouritesList
              favourites={favourites}
              onRemove={handleRemoveFavourite}
              removingId={removingId}
            />
          )}
        </section>

        {/* All Properties section */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 text-indigo-500"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            All Properties
            <span className="text-sm font-normal text-slate-400">
              ({properties.length})
            </span>
          </h2>
          {dataLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onToggleFavourite={handleToggleFavourite}
                  loading={loadingToggle === property.id}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Toast notifications */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 rounded-xl shadow-lg px-4 py-3 text-sm font-medium text-white pointer-events-auto animate-fade-in
              ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}
          >
            {toast.type === "success" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
