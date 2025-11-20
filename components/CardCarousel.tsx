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
    <div className="fixed inset-0 bg-black/80 dark:bg-black/90 z-50 flex flex-col items-center justify-center animate-fade-in" onClick={onClose}>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white dark:bg-gray-800/50 dark:hover:bg-gray-700/70 z-50 transition-colors">
            <CloseIcon className="w-8 h-8"/>
        </button>

        <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8" onClick={e => e.stopPropagation()}>
            {cards.length > 1 && (
                <>
                    <button onClick={handlePrev} className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white dark:bg-gray-800/50 dark:hover:bg-gray-700/70 z-50 transition-colors">
                        <ChevronLeftIcon className="w-8 h-8" />
                    </button>
                    <button onClick={handleNext} className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white dark:bg-gray-800/50 dark:hover:bg-gray-700/70 z-50 transition-colors">
                        <ChevronRightIcon className="w-8 h-8" />
                    </button>
                </>
            )}
            
            <div className="w-full max-w-4xl h-full max-h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-pop-in bg-base-100 dark:bg-dark-card">
                 {currentCard.imageUrl && (
                    <div className="w-full h-1/2 md:h-2/3 bg-gray-200 dark:bg-gray-800">
                        <img className="w-full h-full object-contain" src={currentCard.imageUrl} alt={currentCard.text} />
                    </div>
                )}
                <div className="p-8 flex-grow flex flex-col justify-center items-center text-center" style={cardContentStyle}>
                    <p className="text-xl md:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white">{currentCard.text}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-900/50 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-600 dark:text-dark-text-secondary">{currentIndex + 1} / {cards.length}</p>
                    
                     {currentUser && (
                        <div className="flex items-center space-x-2">
                          {(currentUser.role === Role.USER || currentUser.role === Role.ADMIN) && (
                            <button
                              onClick={() => onToggleFavorite(currentCard.id)}
                              className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                              aria-label="Favorilere ekle"
                            >
                              <HeartIcon className={`w-6 h-6 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-500 dark:text-gray-300'}`} />
                            </button>
                          )}
                          {currentUser.role === Role.ADMIN && (
                            <>
                              <button
                                onClick={() => onEdit(currentCard)}
                                className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                                aria-label="Düzenle"
                              >
                                <EditIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                              </button>
                              <button
                                onClick={() => onDelete(currentCard.id)}
                                className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                                aria-label="Sil"
                              >
                                <DeleteIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
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