
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
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Reset index if cards change significantly
  useEffect(() => {
    if (cards.length === 0) {
      onClose();
    } else if (currentIndex >= cards.length) {
      setCurrentIndex(cards.length - 1);
    }
  }, [cards, currentIndex, onClose]);

  // Reset loading state when index changes
  useEffect(() => {
    setIsImageLoading(true);
  }, [currentIndex]);

  // Preload next image for faster navigation
  useEffect(() => {
    if (currentIndex < cards.length - 1) {
      const nextCard = cards[currentIndex + 1];
      if (nextCard.imageUrl) {
        const img = new Image();
        img.src = nextCard.imageUrl;
      }
    }
    // Also preload previous if exists
    if (currentIndex > 0) {
        const prevCard = cards[currentIndex - 1];
        if (prevCard.imageUrl) {
            const img = new Image();
            img.src = prevCard.imageUrl;
        }
    }
  }, [currentIndex, cards]);


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
    backgroundColor: (!currentCard.imageUrl) ? currentCard.backgroundColor || '#ffffff' : undefined,
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center animate-fade-in" onClick={onClose}>
        <div className="relative w-full h-full flex items-center justify-center p-2 md:p-4" onClick={e => e.stopPropagation()}>
            {cards.length > 1 && (
                <>
                    <button onClick={handlePrev} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 z-[60] transition-all backdrop-blur-sm shadow-lg">
                        <ChevronLeftIcon className="w-8 h-8" />
                    </button>
                    <button onClick={handleNext} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 z-[60] transition-all backdrop-blur-sm shadow-lg">
                        <ChevronRightIcon className="w-8 h-8" />
                    </button>
                </>
            )}
            
            {/* Kart Container */}
            <div className="w-[95vw] max-w-4xl h-[90vh] flex flex-col relative rounded-2xl shadow-2xl overflow-hidden animate-pop-in bg-base-100 dark:bg-dark-card border border-gray-200 dark:border-gray-800">
                 
                 {/* Kapatma Butonu */}
                 <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white z-[70] transition-transform hover:scale-110 backdrop-blur-sm border border-white/20 shadow-md"
                    title="Kapat"
                >
                    <CloseIcon className="w-6 h-6" />
                 </button>

                 {currentCard.imageUrl ? (
                    <div className="w-full h-[55%] md:h-[60%] relative bg-black flex items-center justify-center overflow-hidden">
                        
                        {/* Loading Spinner */}
                        {isImageLoading && (
                            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent mb-2"></div>
                                    <span className="text-white text-xs">Yükleniyor...</span>
                                </div>
                            </div>
                        )}

                        {/* Main Image - Object Contain to prevent cropping */}
                        <img 
                            className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                            src={currentCard.imageUrl} 
                            alt={currentCard.text}
                            onLoad={() => setIsImageLoading(false)}
                            onError={(e) => {
                                setIsImageLoading(false);
                                const target = e.target as HTMLImageElement;
                                target.onerror = null; 
                                target.style.display = 'none'; // Hide broken image
                            }} 
                        />
                    </div>
                ) : null}
                
                <div 
                    className={`flex-grow flex flex-col justify-center items-center text-center p-6 md:p-10 overflow-y-auto relative ${!currentCard.imageUrl ? 'h-full' : 'bg-white dark:bg-gray-900'}`} 
                    style={cardContentStyle}
                >
                    <p className={`text-xl md:text-2xl lg:text-3xl font-bold leading-relaxed max-w-3xl mx-auto px-4 ${currentCard.imageUrl ? 'text-gray-800 dark:text-gray-100' : 'text-gray-900'}`}>
                        {currentCard.text}
                    </p>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-800/90 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 shrink-0">
                    <p className="text-lg font-bold text-gray-500 dark:text-gray-400 pl-2">
                        {currentIndex + 1} / {cards.length}
                    </p>
                    
                     {currentUser && (
                        <div className="flex items-center space-x-4 pr-2">
                          {(currentUser.role === Role.USER || currentUser.role === Role.ADMIN) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onToggleFavorite(currentCard.id); }}
                              className="group flex flex-col items-center justify-center transition-transform active:scale-90 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                              aria-label="Favorilere ekle"
                            >
                              <HeartIcon className={`w-8 h-8 transition-colors ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400 dark:text-gray-500 group-hover:text-red-400'}`} />
                            </button>
                          )}
                          {currentUser.role === Role.ADMIN && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); onEdit(currentCard); }}
                                className="group transition-transform active:scale-90 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                                aria-label="Düzenle"
                              >
                                <EditIcon className="w-7 h-7 text-gray-600 dark:text-gray-400 group-hover:text-blue-500" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); onDelete(currentCard.id); }}
                                className="group transition-transform active:scale-90 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                                aria-label="Sil"
                              >
                                <DeleteIcon className="w-7 h-7 text-gray-600 dark:text-gray-400 group-hover:text-red-500" />
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
