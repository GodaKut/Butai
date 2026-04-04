import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Apartment } from '../types/apartment';
import { KanbanColumn } from './KanbanColumn';
import { AddApartmentModal } from './AddApartmentModal';

const COLUMNS = [
  { id: 'interested', title: 'Interested' },
  { id: 'patricija-approves', title: 'Patricija Approves' },
  { id: 'to-view', title: 'To View' },
  { id: 'viewed', title: 'Viewed' },
  { id: 'offer', title: 'Offer' },
] as const;

export function KanbanBoard() {
  const [apartments, setApartments] = useState<Apartment[]>(() => {
    const saved = localStorage.getItem('apartments');
    return saved ? JSON.parse(saved) : [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('apartments', JSON.stringify(apartments));
  }, [apartments]);

  const moveApartment = (apartmentId: string, newStatus: Apartment['status']) => {
    setApartments((prev) =>
      prev.map((apt) =>
        apt.id === apartmentId ? { ...apt, status: newStatus } : apt
      )
    );
  };

  const addApartment = (apartment: Omit<Apartment, 'id'>) => {
    const newApartment: Apartment = {
      ...apartment,
      id: Date.now().toString(),
    };
    setApartments((prev) => [...prev, newApartment]);
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Apartment Hunt</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Apartment
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full min-w-max">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              columnId={column.id}
              title={column.title}
              apartments={apartments.filter((apt) => apt.status === column.id)}
              onMoveApartment={moveApartment}
            />
          ))}
        </div>
      </div>

      <AddApartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addApartment}
      />
    </div>
  );
}
