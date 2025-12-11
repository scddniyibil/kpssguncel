
import React, { useState, useEffect } from 'react';
import { Card } from '../types';
import { CATEGORIES } from '../constants';
import { CloseIcon, BrainIcon, PaletteIcon } from './Icons';
import { supabase } from '../supabaseClient';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Omit<Card, 'id'> | Card) => void;
  cardToEdit: Card | null;
}

const PRESET_COLORS = [
  '#ffffff', // White
  '#fee2e2', // Red 100
  '#ffedd5', // Orange 100
  '#fef9c3', // Yellow 100
  '#ecfccb', // Lime 100
  '#dbeafe', // Blue 100
  '#e0e7ff', // Indigo 100
  '#f3e8ff', // Purple 100
  '#fce7f3', // Pink 100
];

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onSave, cardToEdit }) => {
  const [card, setCard] = useState<Omit<Card, 'id'>>({
    category: CATEGORIES[0],
    text: '',
    imageUrl: '',
    backgroundColor: '#ffffff',
    quizQuestion: '',
    quizIsTrue: true,
    quizExplanation: ''
  });
  const [uploading, setUploading] = useState(false);

  // Fix: Track cardToEdit by ID to prevent resetting state if parent re-renders with same object ref but updated data elsewhere
  useEffect(() => {
    if (isOpen) {
        if (cardToEdit) {
            setCard(cardToEdit);
        } else {
            setCard({
                category: CATEGORIES[0],
                text: '',
                imageUrl: '',
                backgroundColor: '#ffffff',
                quizQuestion: '',
                quizIsTrue: true,
                quizExplanation: ''
            });
        }
    }
  }, [cardToEdit?.id, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCard(prev => ({ ...prev, [name]: value }));
  };

  const handleBooleanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCard(prev => ({ ...prev, [name]: value === 'true' }));
  }

  const handleColorSelect = (color: string) => {
    setCard(prev => ({ ...prev, backgroundColor: color }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploading(true);
    
    try {
        // Sanitize filename and extension
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const safeExt = fileExt.replace(/[^a-z0-9]/g, '');
        // Keep filename short for potential database piggybacking
        const fileName = `${Date.now()}.${safeExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
             throw uploadError;
        }

        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        
        // Update local state with the new image URL
        setCard(prev => ({ ...prev, imageUrl: data.publicUrl }));
    } catch (error: any) {
        alert(`Resim yüklenirken hata oluştu: ${error.message}`);
        console.error("Upload error:", error);
    } finally {
        setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (card.text.trim()) {
      onSave(cardToEdit ? { ...card, id: cardToEdit.id } : card);
      onClose(); // Close modal after saving
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in p-4 overflow-y-auto">
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl p-8 w-full max-w-lg relative animate-slide-in-up my-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{cardToEdit ? 'Kartı Düzenle' : 'Yeni Kart Ekle'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Main Info Section */}
          <div className="space-y-4 border-b pb-6 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Bilgi Kartı</h3>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Kategori</label>
                <select id="category" name="category" value={card.category} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 dark:text-white">
                  {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Açıklama</label>
                <textarea id="text" name="text" value={card.text} onChange={handleChange} rows={3} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-white"></textarea>
              </div>

              {/* Background Color Picker */}
              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">Arka Plan Rengi</label>
                 <div className="flex flex-wrap gap-2 mb-2">
                    {PRESET_COLORS.map(color => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => handleColorSelect(color)}
                            className={`w-8 h-8 rounded-full border shadow-sm transition-transform hover:scale-110 ${card.backgroundColor === color ? 'ring-2 ring-offset-2 ring-indigo-500' : 'border-gray-200'}`}
                            style={{ backgroundColor: color }}
                            aria-label={`Select color ${color}`}
                        />
                    ))}
                 </div>
                 <div className="flex items-center space-x-2">
                     <div className="relative overflow-hidden w-10 h-10 rounded-full border border-gray-300 shadow-sm">
                        <input 
                            type="color" 
                            name="backgroundColor" 
                            value={card.backgroundColor || '#ffffff'} 
                            onChange={handleChange}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                        />
                     </div>
                     <span className="text-xs text-gray-500 dark:text-gray-400">Özel Renk Seç</span>
                 </div>
              </div>
              
              <div>
                <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Resim Yükle (Supabase)</label>
                <div className="mt-1 flex items-center space-x-4">
                    <input 
                        type="file" 
                        id="imageFile" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-700 dark:file:text-white" 
                    />
                    {uploading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>}
                </div>
                {card.imageUrl && (
                    <div className="mt-2 relative group w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden border border-gray-300">
                        <img src={card.imageUrl} alt="Önizleme" className="w-full h-full object-contain" />
                        <button type="button" onClick={() => setCard(prev => ({...prev, imageUrl: ''}))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <CloseIcon className="w-3 h-3" />
                        </button>
                    </div>
                )}
              </div>
          </div>

          {/* Quiz Section */}
          <div className="space-y-4 pt-2">
             <div className="flex items-center space-x-2">
                 <BrainIcon className="w-5 h-5 text-indigo-500" />
                 <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Sınav Modu Ayarları</h3>
             </div>
             
             <div>
                <label htmlFor="quizQuestion" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Soru Cümlesi</label>
                <input 
                    type="text" 
                    id="quizQuestion" 
                    name="quizQuestion" 
                    value={card.quizQuestion || ''} 
                    onChange={handleChange} 
                    placeholder="Örn: TBMM İstanbul'da bulunmaktadır."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 dark:text-white" 
                />
             </div>

             <div>
                <label htmlFor="quizIsTrue" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Doğru Mu?</label>
                <select 
                    id="quizIsTrue" 
                    name="quizIsTrue" 
                    value={String(card.quizIsTrue)} 
                    onChange={handleBooleanChange} 
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 dark:text-white"
                >
                    <option value="true">Doğru</option>
                    <option value="false">Yanlış</option>
                </select>
             </div>

             <div>
                <label htmlFor="quizExplanation" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Açıklama (Yanlışsa doğrusu nedir?)</label>
                <textarea 
                    id="quizExplanation" 
                    name="quizExplanation" 
                    value={card.quizExplanation || ''} 
                    onChange={handleChange} 
                    rows={2} 
                    placeholder="Örn: Yanlış, TBMM Ankara'dadır."
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-white"
                ></textarea>
             </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t dark:border-gray-700 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">İptal</button>
            <button type="submit" disabled={uploading} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary dark:bg-accent dark:hover:bg-blue-500 disabled:opacity-50">
                {uploading ? 'Yükleniyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminModal;
