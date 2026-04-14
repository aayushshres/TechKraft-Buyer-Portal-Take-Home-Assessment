import { FavouritedProperty } from '../api';

interface FavouritesListProps {
  favourites: FavouritedProperty[];
  onRemove: (id: number) => void;
  removingId: number | null;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';

export default function FavouritesList({ favourites, onRemove, removingId }: FavouritesListProps) {
  if (favourites.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-slate-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-10 h-10 mx-auto mb-3 text-slate-300"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
        <p className="text-sm font-medium">No favourites yet.</p>
        <p className="text-xs mt-1">Browse properties below and tap the heart icon to save them.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {favourites.map((fav) => (
        <li
          key={fav.id}
          className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow transition-shadow"
        >
          <img
            src={fav.imageUrl ?? FALLBACK_IMAGE}
            alt={fav.title}
            className="w-16 h-16 rounded-lg object-cover shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 text-sm truncate">{fav.title}</p>
            <p className="text-xs text-slate-500 truncate">{fav.address}</p>
            <p className="text-sm font-bold text-indigo-600 mt-0.5">{formatPrice(fav.price)}</p>
          </div>
          <button
            onClick={() => onRemove(fav.id)}
            disabled={removingId === fav.id}
            className="shrink-0 text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed border border-red-200 hover:border-red-400 rounded-lg px-3 py-1.5 transition"
          >
            {removingId === fav.id ? 'Removing…' : 'Remove'}
          </button>
        </li>
      ))}
    </ul>
  );
}
