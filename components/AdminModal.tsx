
import React, { useState, useEffect } from 'react';
import { Card } from '../types';
import { CATEGORIES } from '../constants';
import { CloseIcon } from './Icons';
import { supabase } from '../supabaseClient';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Omit<Card, 'id'> | Card) => void;
  cardToEdit: Card | null;
}

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onSave, cardToEdit }) => {
  const [card, setCard] = useState<Omit<Card, 'id'>>({
    category: CATEGORIES[0],
    text: '',
    imageUrl: '',
    backgroundColor: '#e0f2fe'
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (cardToEdit) {
      setCard(cardToEdit);
    } else {
      setCard({
        category: CATEGORIES[0],
        text: '',
        imageUrl: '',
        backgroundColor: '#e0f2fe'
      });
    }
  }, [cardToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCard(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploading(true);
    
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        // 'images' is the standard bucket name we assume exists
        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file);

        if (uploadError) {
             throw uploadError;
        }

        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        
        setCard(prev => ({ ...prev, imageUrl: data.publicUrl }));
    } catch (error: any) {
        alert(`Resim yüklenirken hata oluştu: ${error.message}`);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl p-8 w-full max-w-lg relative animate-slide-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{cardToEdit ? 'Kartı Düzenle' : 'Yeni Kart Ekle'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Kategori</label>
            <select id="category" name="category" value={card.category} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 dark:text-white">
              {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Açıklama</label>
            <textarea id="text" name="text" value={card.text} onChange={handleChange} rows={4} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-white"></textarea>
          </div>
          
          <div>
            <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Resim Yükle (PC/Mobil)</label>
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
                <div className="mt-2 relative group w-24 h-24">
                    <img src={card.imageUrl} alt="Önizleme" className="w-full h-full object-cover rounded-md border border-gray-300" />
                    <button type="button" onClick={() => setCard(prev => ({...prev, imageUrl: ''}))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <CloseIcon className="w-3 h-3" />
                    </button>
                </div>
            )}
          </div>

          {!card.imageUrl && (
            <div>
              <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Arkaplan Rengi</label>
              <input type="color" id="backgroundColor" name="backgroundColor" value={card.backgroundColor} onChange={handleChange} className="mt-1 block w-full h-10 cursor-pointer" />
            </div>
          )}
          <div className="flex justify-end space-x-4 pt-4">
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
