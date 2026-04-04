import { useDrop } from 'react-dnd';
import { Apartment } from '../types/apartment';
import { ApartmentCard } from './ApartmentCard';

interface KanbanColumnProps {
  columnId: string;
  title: string;
  apartments: Apartment[];
  onMoveApartment: (apartmentId: string, newStatus: Apartment['status']) => void;
}

export function KanbanColumn({ columnId, title, apartments, onMoveApartment }: KanbanColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'apartment',
    drop: (item: { id: string }) => {
      onMoveApartment(item.id, columnId as Apartment['status']);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div className="flex flex-col w-80 flex-shrink-0">
      <div className="bg-gray-100 rounded-t-lg px-4 py-3 border-b-2 border-gray-300">
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
          {title}
          <span className="ml-2 text-gray-500">({apartments.length})</span>
        </h2>
      </div>
      <div
        ref={drop}
        className={`flex-1 bg-gray-50 rounded-b-lg p-3 space-y-3 min-h-[200px] transition-colors ${
          isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : 'border border-gray-200'
        }`}
      >
        {apartments.map((apartment) => (
          <ApartmentCard key={apartment.id} apartment={apartment} />
        ))}
      </div>
    </div>
  );
}
