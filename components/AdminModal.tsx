
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-3xl relative animate-slide-in-up flex flex-col max-h-[92vh]">
        <div className="px-6 sm:px-8 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-dark-card/95 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400">{cardToEdit ? 'Kart Güncelle' : 'Yeni Kart Oluştur'}</p>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{cardToEdit ? 'Bilgi Kartı Düzenle' : 'Bilgi Kartı Ekle'}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition-colors"
            aria-label="Kapat"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
          {/* Main Info Section */}
          <section className="space-y-4 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5 bg-gray-50/60 dark:bg-gray-900/40">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <PaletteIcon className="w-4 h-4 text-indigo-500" /> Kart Bilgileri
            </h3>
            <div className="grid gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Kategori</label>
                <select
                  id="category"
                  name="category"
                  value={card.category}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Kart İçeriği</label>
                <textarea
                  id="text"
                  name="text"
                  value={card.text}
                  onChange={handleChange}
                  rows={6}
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
            </div>
          </section>

          {/* Background Color Picker */}
          <section className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5 bg-gray-50/60 dark:bg-gray-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <PaletteIcon className="w-4 h-4 text-pink-500" /> Arka Plan Rengi
              </h3>
              <span className="text-xs text-gray-400 font-mono">{card.backgroundColor}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={`w-9 h-9 rounded-full border shadow-sm transition-transform hover:scale-110 ${card.backgroundColor === color ? 'ring-2 ring-offset-2 ring-indigo-500' : 'border-gray-200 dark:border-gray-700'}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-500 dark:text-gray-400">Özel Renk</label>
              <input
                type="color"
                name="backgroundColor"
                value={card.backgroundColor || '#ffffff'}
                onChange={handleChange}
                className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700 cursor-pointer bg-transparent"
              />
            </div>
          </section>

          {/* Image Upload */}
          <section className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5 bg-gray-50/60 dark:bg-gray-900/40 space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Kart Görseli</h3>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="file"
                id="imageFile"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-700 dark:file:text-white"
              />
              {uploading && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>}
            </div>
            {card.imageUrl && (
              <div className="relative group w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-dashed border-gray-300 dark:border-gray-700">
                <img src={card.imageUrl} alt="Önizleme" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setCard(prev => ({ ...prev, imageUrl: '' }))}
                  className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </section>

          {/* Live Preview */}
          <section className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5 bg-gray-50/60 dark:bg-gray-900/60 space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Kart Önizleme</h3>
            <div
              className="rounded-2xl shadow-inner p-4 min-h-[220px] flex flex-col gap-3 border border-gray-200 dark:border-gray-700"
              style={{ backgroundColor: card.backgroundColor || '#ffffff' }}
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">{card.category}</span>
              <p className="text-base text-gray-800 dark:text-gray-900 font-medium whitespace-pre-wrap break-words flex-1">
                {card.text || 'Kart içeriği burada görünecek.'}
              </p>
              {card.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-black/10">
                  <img src={card.imageUrl} alt="Kart görseli" className="w-full h-40 object-cover" />
                </div>
              )}
            </div>
          </section>

          {/* Quiz Section */}
          <section className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5 bg-gray-50/60 dark:bg-gray-900/40 space-y-4">
            <div className="flex items-center gap-2">
              <BrainIcon className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Sınav Modu Ayarları</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="quizQuestion" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Soru Cümlesi</label>
                <input
                  type="text"
                  id="quizQuestion"
                  name="quizQuestion"
                  value={card.quizQuestion || ''}
                  onChange={handleChange}
                  placeholder="Örn: TBMM İstanbul'da bulunmaktadır."
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="quizIsTrue" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Doğru Mu?</label>
                  <select
                    id="quizIsTrue"
                    name="quizIsTrue"
                    value={String(card.quizIsTrue)}
                    onChange={handleBooleanChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="true">Doğru</option>
                    <option value="false">Yanlış</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text">Sonuç</label>
                  <div className={`mt-1 px-3 py-2 rounded-lg text-sm font-semibold ${card.quizIsTrue ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    {card.quizIsTrue ? 'Doğru' : 'Yanlış'}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="quizExplanation" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Açıklama (Yanlışsa doğrusu nedir?)</label>
                <textarea
                  id="quizExplanation"
                  name="quizExplanation"
                  value={card.quizExplanation || ''}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Örn: Yanlış, TBMM Ankara'dadır."
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
            </div>
          </section>

          <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-secondary dark:bg-accent dark:hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {uploading ? 'Yükleniyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminModal;
