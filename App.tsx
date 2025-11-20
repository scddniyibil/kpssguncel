
import React, { useState, useEffect } from 'react';
import { Card, User, Role } from './types';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import { supabase } from './supabaseClient';

const Toast: React.FC<{ message: string; onClose: () => void; }> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgClass = message.includes('silindi') || message.includes('Hata')
    ? 'from-red-500 to-red-600' 
    : 'from-green-500 to-green-600';

  return (
    <div className={`fixed bottom-5 right-5 text-white py-3 px-6 rounded-lg shadow-xl animate-slide-in-up z-[100] bg-gradient-to-r ${bgClass}`}>
      <p className="font-semibold">{message}</p>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Omit<User, 'password'> | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('kpss-theme') as 'light' | 'dark') || 'light';
  });

  const [cards, setCards] = useState<Card[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // --- 1. AUTHENTICATION & INITIAL LOAD ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
         await fetchUserProfile(session.user.id, session.user.email!);
         await fetchCards();
         await fetchFavorites(session.user.id);
      }
      setIsLoading(false);
    };

    checkUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setIsLoading(true);
        await fetchUserProfile(session.user.id, session.user.email!);
        await fetchCards();
        await fetchFavorites(session.user.id);
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setCards([]);
        setFavorites([]);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string, email: string) => {
    // Fetch role from 'profiles' table
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const role = data?.role === 'ADMIN' ? Role.ADMIN : Role.USER;
    
    setCurrentUser({
      id: userId,
      email: email,
      role: role
    });
  };

  const fetchCards = async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching cards:', error);
    else {
      // FIX: Map Supabase snake_case columns to frontend camelCase properties
      const mappedCards: Card[] = (data || []).map((item: any) => ({
        id: item.id,
        category: item.category,
        text: item.text,
        imageUrl: item.image_url, // snake_case from DB -> camelCase for App
        backgroundColor: item.background_color, // snake_case from DB -> camelCase for App
        created_at: item.created_at
      }));
      setCards(mappedCards);
    }
  };

  const fetchFavorites = async (userId: string) => {
    const { data, error } = await supabase
      .from('favorites')
      .select('card_id')
      .eq('user_id', userId);

    if (error) console.error('Error fetching favorites:', error);
    else setFavorites(data?.map(f => f.card_id) || []);
  };

  // --- THEME ---
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('kpss-theme', theme);
  }, [theme]);


  // --- HANDLERS ---

  const handleLogin = async (credentials: { userId?: string; password?: string; provider?: string }) => {
    setAuthError(null);
    
    if (credentials.provider) {
       // REAL SOCIAL LOGIN
       const { error } = await supabase.auth.signInWithOAuth({ 
           provider: credentials.provider as any,
           options: {
               redirectTo: window.location.origin 
           }
       });
       if (error) setAuthError(error.message);
    } else if (credentials.userId && credentials.password) {
       // EMAIL / PASSWORD LOGIN
       const { error } = await supabase.auth.signInWithPassword({
         email: credentials.userId, 
         password: credentials.password
       });
       if (error) setAuthError(error.message);
    }
  };
  
  const handleSignUp = async (credentials: { userId: string; email: string; password?: string; }) => {
    setAuthError(null);
    if (!credentials.password) return;

    const { error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      setAuthError(error.message);
    } else {
      setToastMessage('Kayıt başarılı! Lütfen e-postanızı onaylayın.');
    }
  };

  const handleResetPassword = async (email: string) => {
    setAuthError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });

    if (error) {
      setAuthError(error.message);
    } else {
      setToastMessage('Şifre sıfırlama bağlantısı e-postana gönderildi.');
    }
  };

  const handleUpdatePassword = async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
          setToastMessage(`Hata: ${error.message}`);
          throw error;
      } else {
          setToastMessage('Şifreniz başarıyla güncellendi.');
      }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleSaveCard = async (cardData: Omit<Card, 'id'> | Card) => {
    if (!currentUser || currentUser.role !== Role.ADMIN) return;

    const cardsToSave = Array.isArray(cardData) ? cardData : [cardData];
    
    try {
      if ('id' in cardData && !Array.isArray(cardData)) {
        // UPDATE
        const { error } = await supabase
          .from('cards')
          .update({
            category: cardData.category,
            text: cardData.text,
            image_url: cardData.imageUrl,
            background_color: cardData.backgroundColor
          })
          .eq('id', cardData.id);
          
        if (error) throw error;
        setToastMessage('Kart güncellendi!');

      } else {
        // INSERT
        const payload = cardsToSave.map(c => ({
          category: c.category,
          text: c.text,
          image_url: c.imageUrl,
          background_color: c.backgroundColor
        }));

        const { error } = await supabase.from('cards').insert(payload);
        if (error) throw error;
        setToastMessage(`${payload.length} kart eklendi!`);
      }
      await fetchCards(); 
    } catch (err: any) {
      setToastMessage(`Hata: ${err.message}`);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!currentUser || currentUser.role !== Role.ADMIN) return;
    
    const { error } = await supabase.from('cards').delete().eq('id', cardId);
    if (error) {
      setToastMessage('Silme işlemi başarısız.');
    } else {
      setToastMessage('Kart silindi!');
      setCards(prev => prev.filter(c => c.id !== cardId));
    }
  };

  const handleToggleFavorite = async (cardId: string) => {
    if (!currentUser) return;

    const isFavorite = favorites.includes(cardId);

    if (isFavorite) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('card_id', cardId);
        
      if (!error) {
        setFavorites(prev => prev.filter(id => id !== cardId));
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: currentUser.id, card_id: cardId });

      if (!error) {
        setFavorites(prev => [...prev, cardId]);
      }
    }
  };

  if (isLoading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-neutral dark:bg-dark-bg">
         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
       </div>
     )
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} onSignUp={handleSignUp} onResetPassword={handleResetPassword} error={authError} />;
  }

  return (
    <>
      <HomeScreen 
            currentUser={currentUser} 
            onLogout={handleLogout} 
            theme={theme} 
            toggleTheme={toggleTheme}
            cards={cards}
            favorites={favorites}
            onSaveCard={handleSaveCard} 
            onDeleteCard={handleDeleteCard}
            onToggleFavorite={handleToggleFavorite}
            onUpdatePassword={handleUpdatePassword}
        />
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
    </>
  );
};

export default App;
