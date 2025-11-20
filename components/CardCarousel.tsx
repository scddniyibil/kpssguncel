
import React, { useState, useEffect } from 'react';
import { Card, Role, User } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, HeartIcon, EditIcon, DeleteIcon } from './Icons';

interface CardCarouselProps {
  cards: Card[];
  currentUser: Omit<User, 'password' | 'email'> | null;
  onClose: () => void;
  favorites: string[];
  onToggleFavorite: (cardId: string) => void;
  onEdit: (card: Card) => void;
  onDelete: (cardId: string) => void;
  theme: 'light' | 'dark';
}

const CardCarousel: React.FC<CardCarouselProps> = ({
  cards,
  currentUser,
  onClose,
  favorites,
  onToggleFavorite,
  onEdit,
  onDelete,
  theme,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // When the cards array changes (e.g., a card is deleted),
    // adjust the index to prevent errors.
    if (cards.length === 0) {
      onClose();
    } else if (currentIndex >= cards.length) {
      setCurrentIndex(cards.length - 1);
    }
  }, [cards, currentIndex, onClose]);


  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  };

  if (!cards || cards.length === 0 || currentIndex >= cards.length) {
    return null;
  }
  
  const currentCard = cards[currentIndex];
  const isFavorite = favorites.includes(currentCard.id);

  const cardContentStyle = {
    backgroundColor: (theme === 'light' && !currentCard.imageUrl) ? currentCard.backgroundColor || '#ffffff' : undefined,
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center animate-fade-in" onClick={onClose}>
        <div className="relative w-full h-full flex items-center justify-center p-2 md:p-4" onClick={e => e.stopPropagation()}>
            {cards.length > 1 && (
                <>
                    <button onClick={handlePrev} className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 z-50 transition-all backdrop-blur-sm">
                        <ChevronLeftIcon className="w-8 h-8 md:w-10 md:h-10" />
                    </button>
                    <button onClick={handleNext} className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 z-50 transition-all backdrop-blur-sm">
                        <ChevronRightIcon className="w-8 h-8 md:w-10 md:h-10" />
                    </button>
                </>
            )}
            
            {/* Kart Boyutları: w-[95vw] max-w-6xl h-[85vh] */}
            <div className="w-[95vw] max-w-6xl h-[85vh] flex flex-col relative rounded-3xl shadow-2xl overflow-hidden animate-pop-in bg-base-100 dark:bg-dark-card">
                 
                 {/* Kapatma Butonu */}
                 <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white z-[60] transition-transform hover:scale-110 backdrop-blur-sm border border-white/20"
                    title="Kapat"
                 >
                    <CloseIcon className="w-8 h-8" />
                 </button>

                 {currentCard.imageUrl && (
                    <div className="w-full h-3/5 md:h-2/3 bg-gray-100 dark:bg-gray-800 relative group">
                        <img 
                            className="w-full h-full object-cover" 
                            src={currentCard.imageUrl} 
                            alt={currentCard.text}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null; 
                                target.src = "https://via.placeholder.com/800x600?text=Resim+Yuklenemedi";
                            }} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                    </div>
                )}
                
                <div className={`flex-grow flex flex-col justify-center items-center text-center p-6 md:p-12 overflow-y-auto ${!currentCard.imageUrl ? 'h-full' : ''}`} style={cardContentStyle}>
                    <p className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white leading-relaxed max-w-4xl mx-auto drop-shadow-sm">
                        {currentCard.text}
                    </p>
                </div>
                
                <div className="p-6 bg-gray-50 dark:bg-gray-900/80 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xl font-bold text-gray-500 dark:text-gray-400 pl-4">
                        {currentIndex + 1} / {cards.length}
                    </p>
                    
                     {currentUser && (
                        <div className="flex items-center space-x-6 pr-4">
                          {(currentUser.role === Role.USER || currentUser.role === Role.ADMIN) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onToggleFavorite(currentCard.id); }}
                              className="group flex flex-col items-center justify-center transition-transform active:scale-90"
                              aria-label="Favorilere ekle"
                            >
                              <HeartIcon className={`w-12 h-12 transition-colors ${isFavorite ? 'text-red-500 fill-current drop-shadow-md' : 'text-gray-400 dark:text-gray-500 group-hover:text-red-400'}`} />
                            </button>
                          )}
                          {currentUser.role === Role.ADMIN && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); onEdit(currentCard); }}
                                className="group transition-transform active:scale-90"
                                aria-label="Düzenle"
                              >
                                <EditIcon className="w-10 h-10 text-gray-600 dark:text-gray-400 group-hover:text-blue-500" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); onDelete(currentCard.id); }}
                                className="group transition-transform active:scale-90"
                                aria-label="Sil"
                              >
                                <DeleteIcon className="w-10 h-10 text-gray-600 dark:text-gray-400 group-hover:text-red-500" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default CardCarousel;
