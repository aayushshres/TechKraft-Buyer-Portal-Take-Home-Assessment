import { Property } from '../api';

interface PropertyCardProps {
  property: Property;
  onToggleFavourite: (id: number, currentState: boolean) => void;
  loading?: boolean;
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

export default function PropertyCard({ property, onToggleFavourite, loading }: PropertyCardProps) {
  const { id, title, address, price, imageUrl, isFavourited } = property;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-slate-100">
        <img
          src={imageUrl ?? FALLBACK_IMAGE}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
        />
        {/* Favourite badge overlay */}
        <button
          onClick={() => onToggleFavourite(id, isFavourited)}
          disabled={loading}
          aria-label={isFavourited ? 'Remove from favourites' : 'Add to favourites'}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow transition
            ${
              isFavourited
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50'
            }
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isFavourited ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={isFavourited ? 0 : 2}
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-1 flex-1">
        <h3 className="font-semibold text-slate-800 text-base leading-snug">{title}</h3>
        <p className="text-sm text-slate-500 flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-3.5 h-3.5 shrink-0 text-slate-400"
          >
            <path
              fillRule="evenodd"
              d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
              clipRule="evenodd"
            />
          </svg>
          {address}
        </p>
        <p className="mt-auto pt-2 text-lg font-bold text-indigo-600">{formatPrice(price)}</p>
      </div>
    </div>
  );
}
