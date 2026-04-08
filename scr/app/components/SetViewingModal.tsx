import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (datetime: string) => void;
}

export function SetViewingModal({ isOpen, onClose, onConfirm }: Props) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!date || !time) {
      alert('Please select date and time');
      return;
    }

    const datetime = new Date(`${date}T${time}`).toISOString();
    onConfirm(datetime);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-80 space-y-4 shadow-lg">
        <h2 className="text-lg font-semibold">Set Viewing Time</h2>

        <input
          type="date"
          className="w-full border p-2 rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="time"
          className="w-full border p-2 rounded"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}