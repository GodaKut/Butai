import { useDrag } from 'react-dnd';
import { MapPin, Calendar, Euro, ExternalLink, Trash2 } from 'lucide-react';
import { Apartment, calculateFirstInstallment } from '../types/apartment';

interface ApartmentCardProps {
  apartment: Apartment;
  onDelete?: (id: number | string) => void;
}

export function ApartmentCard({ apartment, onDelete }: ApartmentCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'apartment',
    item: { id: apartment.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const firstInstallment = calculateFirstInstallment(apartment.price);

  return (
    <div
      ref={drag}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-move transition-opacity hover:shadow-md ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {onDelete && (
        <button
          className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-700 text-white rounded-full p-1 shadow"
          onClick={(e) => { e.stopPropagation(); onDelete(apartment.id); }}
          title="Delete listing"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}
      {apartment.imageUrl && (
        <a 
          href={apartment.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block relative group"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={apartment.imageUrl}
            alt={apartment.address}
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
            <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </a>
      )}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-base">{apartment.address}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
            <MapPin className="w-4 h-4" />
            <span>{apartment.district}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Built in {apartment.yearBuilt}</span>
          </div>
          {apartment.floor && (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              Floor: {apartment.floor}
            </span>
          )}
        </div>

        <div className="pt-2 border-t border-gray-100 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Price</span>
            <div className="flex items-center gap-1 text-lg font-bold text-gray-900">
              <Euro className="w-5 h-5" />
              <span>{apartment.price.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">First Installment</span>
            <div className="flex items-center gap-1 text-sm font-semibold text-blue-600">
              <Euro className="w-4 h-4" />
              <span>{firstInstallment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}