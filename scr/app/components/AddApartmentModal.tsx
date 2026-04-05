import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Apartment } from '../types/apartment';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface AddApartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (apartment: Omit<Apartment, 'id'>) => void;
}

export function AddApartmentModal({ isOpen, onClose, onAdd }: AddApartmentModalProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Call the scraping endpoint
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e770b7da/scrape`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ url }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to scrape apartment data');
      }

      const scrapedData = await response.json();
      
      console.log('Scraped apartment data:', scrapedData);
      console.log('Scraped rooms:', scrapedData.rooms);
      console.log('Scraped area:', scrapedData.area);
      console.log('Scraped current floor:', scrapedData.currentFloor);

      // Add the apartment with scraped data, ensuring url and imageUrl are set
      onAdd({
        address: scrapedData.address || 'Unknown Address',
        district: scrapedData.district || 'Unknown District',
        yearBuilt: scrapedData.yearBuilt || new Date().getFullYear(),
        price: scrapedData.price || 0,
        // Use currentFloor from scraping
        floor: scrapedData.currentFloor ?? null,
        // Add rooms and area
        rooms: scrapedData.rooms ?? null,
        area: scrapedData.area ?? null,
        imageUrl:
          scrapedData.imageUrl && scrapedData.imageUrl !== ''
            ? scrapedData.imageUrl
            : 'https://via.placeholder.com/400x300?text=No+Image',
        url: scrapedData.url || url,
        status: 'interested',
      });

      // Reset form
      setUrl('');
      onClose();
    } catch (err) {
      console.error('Error scraping apartment:', err);
      setError(err instanceof Error ? err.message : 'Failed to scrape apartment data');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add Apartment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apartment Listing URL
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.aruodas.lt/..."
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste the URL from aruodas.lt and we'll automatically extract the details
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scraping...
                </>
              ) : (
                'Add Apartment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}