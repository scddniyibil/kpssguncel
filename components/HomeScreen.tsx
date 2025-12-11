
import React, { useState, useMemo } from 'react';
import { Card, Category, Role, User } from '../types';
import { CATEGORIES } from '../constants';
import AdminModal from './AdminModal';
import AIQuizModal from './AIQuizModal';
import CardCarousel from './CardCarousel';
import ThemeToggle from './ThemeToggle';
import UpdatePasswordModal from './UpdatePasswordModal';
import { LogoIcon, PlusIcon, BookIcon, GlobeIcon, ScaleIcon, LightbulbIcon, PaletteIcon, BrainIcon, KeyIcon } from './Icons';
import { HeartIcon } from './Icons';

interface HomeScreenProps {
  currentUser: Omit<User, 'password'> | null;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  cards: Card[];
  favorites: string[];
  onSaveCard: (cardData: Omit<Card, 'id'> | Card | Omit<Card, 'id'>[]) => void;
  onDeleteCard: (cardId: string) => void;
  onToggleFavorite: (cardId: string) => void;
  onUpdatePassword: (newPassword: string) => Promise<void>;
  onFetchCategory: (category: string) => Promise<void>;
}

const categoryIcons: { [key: string]: React.FC<{ className: string }> } = {
  'Favoriler': HeartIcon,
  'Tarih': BookIcon,
  'Coğrafya': GlobeIcon,
  'Vatandaşlık': ScaleIcon,
  'Güncel Bilgiler': LightbulbIcon,
  'Sanat & Edebiyat': PaletteIcon,
};

const categoryColors = {
  'Favoriler': 'from-amber-400 to-yellow-500',
  'Tarih': 'from-blue-500 to-blue-600',
  'Coğrafya': 'from-green-500 to-green-600',
  'Vatandaşlık': 'from-indigo-500 to-indigo-600',
  'Güncel Bilgiler': 'from-teal-500 to-teal-600',
  'Sanat & Edebiyat': 'from-pink-500 to-pink-600',
};


const HomeScreen: React.FC<HomeScreenProps> = ({
  currentUser,
  onLogout,
  theme,
  toggleTheme,
  cards,
  favorites,
  onSaveCard,
  onDeleteCard,
  onToggleFavorite,
  onUpdatePassword,
  onFetchCategory
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<Card | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);

  const handleEdit = (card: Card) => {
    setCardToEdit(card);
    setViewingCategory(null);
    setIsModalOpen(true);
  };

  const handleDeleteWithConfirm = (cardId: string) => {
    if (window.confirm('Bu kartı silmek istediğinizden emin misiniz?')) {
      onDeleteCard(cardId);
    }
  };

  const handleCategoryClick = async (cat: string) => {
    // Set viewing category FIRST so carousel opens immediately
    setViewingCategory(cat);
    // Then lazy load cards for this category
    await onFetchCategory(cat);
  };

  const handleSaveCard = async (cardData: Omit<Card, 'id'> | Card | Omit<Card, 'id'>[]) => {
    // Save the card
    onSaveCard(cardData);

    // If it's a single card (not array), auto-open its category
    if (!Array.isArray(cardData)) {
      const category = cardData.category;
      // Wait a bit for the save to complete, then fetch and open
      setTimeout(async () => {
        await handleCategoryClick(category);
      }, 500);
    }
  };

  const categoryCardCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    CATEGORIES.forEach(cat => {
      if (cat === 'Favoriler') {
        counts[cat] = favorites.length;
      } else {
        counts[cat] = cards.filter(card => card.category === cat).length;
      }
    });
    return counts;
  }, [cards, favorites]);

  const cardsForCarousel = useMemo(() => {
    // If cards is empty BUT we are viewing a category, it implies we fetched it.
    // However, since we now fetch ONLY the relevant cards into 'cards' state,
    // we don't really need to filter by category anymore IF the backend only returns that category.
    // BUT, for safety (in case we change logic later), we can keep filtering or just return all cards.
    // Given the new logic: `cards` contains ONLY the clicked category (or favorites).

    // Safety check: Filter anyway in case `cards` has mixed content (though it shouldn't).
    if (!viewingCategory) return [];

    if (viewingCategory === 'Favoriler') {
      // If we fetched favorites, `cards` should contain them.
      return cards;
    }

    return cards.filter(c => c.category === viewingCategory);
  }, [cards, viewingCategory, favorites]);

  return (
    <div className="min-h-screen bg-neutral dark:bg-dark-bg transition-colors flex flex-col">
      <header className="bg-base-100 dark:bg-dark-card shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <LogoIcon className="h-8 w-8 text-primary dark:text-accent" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white hidden md:block">KPSS Bilgi Kartları</h1>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white md:hidden">KPSS Kart</h1>
          </div>
          <div className="flex items-center space-x-3 md:space-x-4">
            <span className="text-sm hidden sm:inline-block text-gray-600 dark:text-dark-text-secondary">
              {currentUser?.email} ({currentUser?.role})
            </span>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Şifre Değiştir"
            >
              <KeyIcon className="w-6 h-6" />
            </button>

            <button onClick={onLogout} className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">Çıkış</button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 flex-grow flex flex-col items-center">

        <div className="w-full flex justify-center mb-8 animate-fade-in">
          <button
            onClick={() => setIsQuizModalOpen(true)}
            className="group relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 transform hover:scale-105 transition-all duration-300"
          >
            <span className="relative px-6 py-3.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0 flex items-center space-x-2">
              <BrainIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400 group-hover:text-white" />
              <span className="text-lg font-bold">Sınav Modu'nu Başlat</span>
            </span>
          </button>
        </div>

        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white">Kart Kategorileri</h2>
          <p className="text-gray-600 dark:text-dark-text-secondary mt-2">Ezber yapmak için bir başlık seç.</p>
        </div>

        <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-6 animate-slide-in-up max-w-5xl">
          {CATEGORIES.map((cat) => {
            const Icon = categoryIcons[cat];
            const cardCount = categoryCardCounts[cat];
            const color = categoryColors[cat] || 'from-gray-500 to-gray-600';

            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`
                        p-6 rounded-2xl flex flex-col justify-between items-center text-white font-bold 
                        shadow-lg transform hover:-translate-y-2 transition-all duration-300
                        bg-gradient-to-br ${color}
                        min-h-[160px] cursor-pointer
                    `}
              >
                <div className="flex-grow flex flex-col items-center justify-center">
                  {Icon && <Icon className="w-12 h-12 mb-3 opacity-90" />}
                  <span className="text-lg text-center break-words w-full">{cat}</span>
                </div>
              </button>
            )
          })}
        </div>
      </main>

      {viewingCategory && (
        <CardCarousel
          cards={cardsForCarousel}
          currentUser={currentUser}
          onClose={() => setViewingCategory(null)}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          onEdit={handleEdit}
          onDelete={handleDeleteWithConfirm}
          theme={theme}
        />
      )}

      {currentUser?.role === Role.ADMIN && (
        <div className="fixed bottom-8 right-8 flex flex-col space-y-4 items-end z-40">
          <button
            onClick={() => { setCardToEdit(null); setIsModalOpen(true); }}
            className="bg-accent text-white p-4 rounded-full shadow-lg hover:bg-secondary transition-transform transform hover:scale-110"
            aria-label="Yeni Kart Ekle"
            title="Yeni Kart Ekle"
          >
            <PlusIcon className="w-8 h-8" />
          </button>
        </div>
      )}

      <AIQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        cards={cards}
      />

      <UpdatePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onUpdatePassword={onUpdatePassword}
      />

      {currentUser?.role === Role.ADMIN && (
        <AdminModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCard}
          cardToEdit={cardToEdit}
        />
      )}
    </div>
  );
};

export default HomeScreen;
