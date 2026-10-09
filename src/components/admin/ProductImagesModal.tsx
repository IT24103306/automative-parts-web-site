import { useState, useRef, useEffect } from 'react';
import { X, Upload, Loader2, Star, Trash2 } from 'lucide-react';
import { apiClient } from '../../api/client';
import AutomotiveImage from '../AutomotiveImage';

interface ProductImagesModalProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductImagesModal({ productId, isOpen, onClose }: ProductImagesModalProps) {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/products/${productId}`);
      setImages(response.data.images || []);
    } catch (error) {
      console.error('Failed to fetch product images', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && productId) {
      fetchImages();
    }
  }, [isOpen, productId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, etc).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      await apiClient.post(`/images/products/${productId}`, formData);
      fetchImages();
    } catch (error: any) {
      const mainError = error.response?.data?.error || 'Failed to upload image';
      const details = error.response?.data?.details || '';
      alert(`${mainError}${details ? ': ' + details : ''}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await apiClient.delete(`/images/${imageId}`);
      fetchImages();
    } catch (error: any) {
      alert('Failed to delete image');
    }
  };

  const setPrimary = async (imageId: string) => {
    try {
      await apiClient.patch(`/images/${imageId}/primary`);
      fetchImages();
    } catch (error: any) {
      alert('Failed to set primary image');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black/80 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative inline-block w-full max-w-2xl p-6 overflow-hidden text-left align-middle transition-all transform bg-neutral-950 border border-neutral-800 shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-5 border-b border-neutral-900 pb-4">
            <h3 className="text-xl font-bold text-white">Manage Product Images</h3>
            <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-800 hover:border-primary bg-black rounded-md p-8 text-center cursor-pointer transition-colors"
            >
              {uploading ? (
                <div className="flex flex-col items-center justify-center text-neutral-400">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                  <span className="text-sm">Uploading securely to Supabase...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-neutral-400">
                  <Upload className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">Click to upload new image (Max 5MB)</span>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*" 
                disabled={uploading}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : images.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 text-sm">No images uploaded yet.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {images.map((image) => (
                <div key={image.id} className="relative group bg-black border border-neutral-800 rounded-sm overflow-hidden aspect-square flex items-center justify-center">
                  <AutomotiveImage src={image.url} alt="Product Image" className="object-contain w-full h-full" />
                  
                  {/* Overlays */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex justify-between">
                      <button 
                        onClick={() => setPrimary(image.id)}
                        className={`p-1.5 rounded-sm ${image.isPrimary ? 'bg-primary text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
                        title="Set as Primary"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(image.id)}
                        className="p-1.5 rounded-sm bg-neutral-800 text-neutral-400 hover:bg-red-900 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {image.isPrimary && (
                    <div className="absolute bottom-2 left-2 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                      Primary
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-neutral-900 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-neutral-900 text-white rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
