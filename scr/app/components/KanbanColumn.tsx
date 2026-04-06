import { useDrop } from 'react-dnd';
import { Apartment } from '../types/apartment';
import { ApartmentCard } from './ApartmentCard';
import { useEffect, useRef } from 'react';


interface KanbanColumnProps {
  columnId: string;
  title: string;
  apartments: Apartment[];
  onMoveApartment: (apartmentId: string, newStatus: Apartment['status']) => void;
  onDeleteApartment?: (apartmentId: number | string) => void;
  maxHeight?: number;
  registerHeight: (el: HTMLDivElement | null) => void;
}

export function KanbanColumn({ columnId, title, apartments, onMoveApartment, onDeleteApartment, maxHeight, registerHeight }: KanbanColumnProps) {
  const columnRef = useRef<HTMLDivElement>(null);
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
    <div
     ref={(el) => {
      columnRef.current = el;
      registerHeight(el);
    }}
    style={{ height: maxHeight ? `${maxHeight}px` : 'auto' }} 
    className="flex flex-col w-80 h-[calc(100vh-120px)]"
    >
      <div className="bg-gray-100 rounded-t-lg px-4 py-3 border-b-2 border-gray-300">
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
          {title}
          <span className="ml-2 text-gray-500">({apartments.length})</span>
        </h2>
      </div>
      <div
        ref={drop}
        className={`flex-1 overflow-y-auto bg-gray-50 rounded-b-lg p-3 space-y-3 min-h-[200px] transition-colors ${
          isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : 'border border-gray-200'
        }`}
      >
        {apartments.map((apartment) => (
          <div key={apartment.id} className="relative">
            <ApartmentCard apartment={apartment} onDelete={onDeleteApartment} />
          </div>
        ))}
      </div>
    </div>
  );
}
