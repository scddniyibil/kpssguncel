
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Card } from '../types';
import { CATEGORIES } from '../constants';
import { CloseIcon, SparklesIcon } from './Icons';

interface AICardGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCards: (cards: Omit<Card, 'id'>[]) => void;
}

const AICardGenerator: React.FC<AICardGeneratorProps> = ({ isOpen, onClose, onSaveCards }) => {
  const [category, setCategory] = useState(CATEGORIES[1]); // Default to first non-fav category
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<Omit<Card, 'id'>[]>([]);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedCards([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `KPSS (Kamu Personeli Seçme Sınavı) öğrencileri için '${category}' kategorisinde, '${topic}' konusuna odaklanan 3 adet güncel, zorlayıcı ve öğretici bilgi kartı oluştur. Her kart bir soru veya önemli bir bilgi içermelidir.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                text: { type: Type.STRING, description: "Soru cümlesi veya bilgi notu." },
                backgroundColor: { type: Type.STRING, description: "Pastel tonlarda bir hex renk kodu (örn: #e0f2fe)." }
              },
              required: ["category", "text", "backgroundColor"],
            },
          },
        },
      });

      if (response.text) {
        const cards = JSON.parse(response.text);
        // Ensure category matches selected (AI might strictly follow prompt but good to enforce)
        // Supabase expects snake_case for image_url but frontend types use imageUrl. 
        // We will map it in the parent handler, here we keep frontend types.
        const safeCards = cards.map((c: any) => ({ 
            category,
            text: c.text,
            backgroundColor: c.backgroundColor,
            imageUrl: '' // Default empty
        }));
        setGeneratedCards(safeCards);
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      alert("Kartlar oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAll = () => {
    onSaveCards(generatedCards);
    onClose();
    setGeneratedCards([]);
    setTopic('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl p-8 w-full max-w-2xl relative animate-slide-in-up flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
          <CloseIcon className="w-6 h-6" />
        </button>
        
        <div className="flex items-center space-x-2 mb-6">
            <SparklesIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">AI ile Kart Üretici</h2>
        </div>

        {!generatedCards.length ? (
            <form onSubmit={handleGenerate} className="space-y-6">
            <p className="text-gray-600 dark:text-dark-text-secondary">
                Konu başlığını girin, Gemini sizin için anında güncel KPSS çalışma kartları hazırlasın.
            </p>
            <div>
                <label htmlFor="ai-category" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Kategori</label>
                <select 
                    id="ai-category" 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 dark:text-white"
                >
                {CATEGORIES.filter(c => c !== 'Favoriler').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="ai-topic" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Konu Başlığı / Anahtar Kelime</label>
                <input 
                    type="text" 
                    id="ai-topic" 
                    value={topic} 
                    onChange={(e) => setTopic(e.target.value)} 
                    placeholder="Örn: I. Dünya Savaşı Cepheleri, Anayasa Mahkemesi, 2024 Nobel..." 
                    required
                    className="mt-1 block w-full px-4 py-3 shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 dark:text-white" 
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all ${loading ? 'opacity-75 cursor-wait' : ''}`}
            >
                {loading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Gemini Düşünüyor...
                    </>
                ) : (
                    <>
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        Kartları Oluştur
                    </>
                )}
            </button>
            </form>
        ) : (
            <div className="flex flex-col h-full overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Önizleme</h3>
                <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                    {generatedCards.map((card, idx) => (
                        <div key={idx} className="p-4 rounded-lg shadow border dark:border-gray-600" style={{ backgroundColor: card.backgroundColor }}>
                             <p className="text-xs font-bold text-gray-600 uppercase mb-1">{card.category}</p>
                             <p className="text-gray-900">{card.text}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex space-x-4">
                    <button 
                        onClick={() => setGeneratedCards([])}
                        className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                        Vazgeç
                    </button>
                    <button 
                        onClick={handleAddAll}
                        className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-lg"
                    >
                        Hepsini Ekle ({generatedCards.length})
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AICardGenerator;
