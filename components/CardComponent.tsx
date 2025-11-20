
import React from 'react';
import { Card, Role, User } from '../types';
import { HeartIcon, EditIcon, DeleteIcon } from './Icons';

interface CardComponentProps {
  card: Card;
  // Fix: Changed currentUser prop type to match the session user state shape.
  currentUser: Omit<User, 'password' | 'email'> | null;
  isFavorite: boolean;
  onToggleFavorite: (cardId: string) => void;
  onEdit: (card: Card) => void;
  onDelete: (cardId: string) => void;
}

const CardComponent: React.FC<CardComponentProps> = ({ card, currentUser, isFavorite, onToggleFavorite, onEdit, onDelete }) => {
  const cardStyle = {
    backgroundColor: card.imageUrl ? '#ffffff' : card.backgroundColor || '#ffffff',
  };

  return (
    <div
      style={cardStyle}
      className="rounded-xl shadow-lg overflow-hidden flex flex-col justify-between transform hover:scale-105 transition-transform duration-300 animate-slide-in-up"
    >
      {card.imageUrl && (
        <img className="w-full h-40 object-cover" src={card.imageUrl} alt={card.text} />
      )}
      <div className="p-6 flex-grow flex flex-col">
        <p className={`text-sm font-semibold ${card.imageUrl ? 'text-blue-700' : 'text-gray-600'}`}>{card.category.toUpperCase()}</p>
        <p className={`mt-2 flex-grow ${card.imageUrl ? 'text-gray-800' : 'text-gray-900 text-lg'}`}>{card.text}</p>
      </div>
      {/* Fix: Removed check for non-existent Role.GUEST. The existence of currentUser is sufficient. */}
      {currentUser && (
        <div className="p-4 bg-black bg-opacity-5 flex items-center justify-end space-x-2">
          {currentUser.role === Role.USER && (
            <button
              onClick={() => onToggleFavorite(card.id)}
              className="p-2 rounded-full hover:bg-red-100 transition-colors"
              aria-label="Favorilere ekle"
            >
              <HeartIcon className={`w-6 h-6 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-500'}`} />
            </button>
          )}
          {currentUser.role === Role.ADMIN && (
            <>
              <button
                onClick={() => onEdit(card)}
                className="p-2 rounded-full hover:bg-blue-100 transition-colors"
                aria-label="Düzenle"
              >
                <EditIcon className="w-6 h-6 text-gray-600" />
              </button>
              <button
                onClick={() => onDelete(card.id)}
                className="p-2 rounded-full hover:bg-red-100 transition-colors"
                aria-label="Sil"
              >
                <DeleteIcon className="w-6 h-6 text-gray-600" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CardComponent;