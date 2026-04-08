import { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { Apartment } from '../types/apartment';
import { KanbanColumn } from './KanbanColumn';
import { AddApartmentModal } from './AddApartmentModal';
import { SetViewingModal } from './SetViewingModal';
import { supabase } from '../../../utils/supabase/client';


const [pendingMove, setPendingMove] = useState<{
  apartmentId: number;
  newStatus: Apartment['status'];
} | null>(null);

const [isModalOpen, setIsModalOpen] = useState(false);

const COLUMNS = [
  { id: 'interested', title: 'Interested' },
  { id: 'patricija-approves', title: 'Patricija Approves' },
  { id: 'to-view', title: 'To View' },
  { id: 'viewed', title: 'Viewed' },
  { id: 'offer', title: 'Offer' },
] as const;

export function KanbanBoard() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const columnRefs = useRef<HTMLDivElement[]>([]);
  const [maxHeight, setMaxHeight] = useState(0);
  const registerHeight = (el: HTMLDivElement | null) => {
    if (el && !columnRefs.current.includes(el)) {
      columnRefs.current.push(el);
    }
  };
  
  useEffect(() => {
    if (columnRefs.current.length === 0) return;

    const heights = columnRefs.current.map((el) => el.offsetHeight);
    const tallest = Math.max(...heights);

    setMaxHeight(tallest);
  }, [apartments]);

  useEffect(() => {
    async function fetchApartments() {
      setLoading(true);
      const { data, error } = await supabase.from('apartments').select('*');
      if (!error && data) {
        setApartments(data);
      }
      setLoading(false);
    }
    fetchApartments();
  }, []);

  const moveApartment = async (apartmentId: string, newStatus: Apartment['status']) => {
    if (newStatus === 'to-view') {
      setPendingMove({ apartmentId, newStatus });
      setIsModalOpen(true);
      return;
    }

    // normal move
    setApartments((prev) =>
      prev.map((apt) =>
        apt.id === apartmentId
          ? { ...apt, status: newStatus }
          : apt
      )
    );

    await supabase
      .from('apartments')
      .update({ status: newStatus })
      .eq('id', apartmentId);
  };

  const handleSetViewing = async (datetime: string) => {
    if (!pendingMove) return;

    const { apartmentId, newStatus } = pendingMove;

    setApartments((prev) =>
      prev.map((apt) =>
        apt.id === apartmentId
          ? {
              ...apt,
              status: newStatus,
              viewing_datetime: datetime,
            }
          : apt
      )
    );

    await supabase
      .from('apartments')
      .update({
        status: newStatus,
        viewing_datetime: datetime,
      })
      .eq('id', apartmentId);

    setPendingMove(null);
  };
  const addApartment = async (apartment: Omit<Apartment, 'id'>) => {
    const newApartment = {
      ...apartment,
      id: Date.now(), // Use a number for int8 compatibility
    };
    const { data, error } = await supabase
      .from('apartments')
      .insert([newApartment])
      .select();
    if (!error && data && data[0]) {
      setApartments((prev) => [...prev, data[0]]);
    }
  };

  const deleteApartment = async (apartmentId: number) => {
    await supabase.from('apartments').delete().eq('id', apartmentId);
    setApartments((prev) => prev.filter((apt) => apt.id !== apartmentId));
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
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
        <div className="grid grid-flow-col auto-cols-[20rem] gap-4 min-w-max items-start">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              columnId={column.id}
              title={column.title}
              apartments={apartments.filter((apt) => apt.status === column.id)}
              onMoveApartment={moveApartment}
              onDeleteApartment={deleteApartment}
              registerHeight={registerHeight}
              maxHeight={maxHeight}
            />
          ))}
        </div>
      </div>

      <AddApartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addApartment}
      />

      <SetViewingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPendingMove(null);
        }}
        onConfirm={handleSetViewing}
       />
    </div>
  );
}
