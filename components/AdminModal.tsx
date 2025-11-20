import React, { useState, useEffect } from 'react';
import { Card } from '../types';
import { CATEGORIES } from '../constants';
import { CloseIcon } from './Icons';

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
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Resim URL (İsteğe Bağlı)</label>
            <input type="text" id="imageUrl" name="imageUrl" value={card.imageUrl} onChange={handleChange} placeholder="https://..." className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-white" />
          </div>
          {!card.imageUrl && (
            <div>
              <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Arkaplan Rengi</label>
              <input type="color" id="backgroundColor" name="backgroundColor" value={card.backgroundColor} onChange={handleChange} className="mt-1 block w-full h-10" />
            </div>
          )}
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">İptal</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary dark:bg-accent dark:hover:bg-blue-500">Kaydet</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminModal;