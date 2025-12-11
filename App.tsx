
import React, { useState, useEffect } from 'react';
import { Card, User, Role } from './types';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import { supabase } from './supabaseClient';
import { INITIAL_CARDS } from './constants';

const Toast: React.FC<{ message: string; onClose: () => void; }> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgClass = message.toLowerCase().includes('hata') || message.toLowerCase().includes('başarısız') || message.toLowerCase().includes('uyarı')
    ? 'from-red-500 to-red-600'
    : 'from-green-500 to-green-600';

  return (
    <div className={`fixed bottom-5 right-5 text-white py-3 px-6 rounded-lg shadow-xl animate-slide-in-up z-[100] bg-gradient-to-r ${bgClass}`}>
      <p className="font-semibold">{message}</p>
    </div>
  );
};

// Helper to map DB response to Card type consistently
const mapDbCardToType = (item: any): Card => {
  // 1. Get raw values
  let text = item.text || '';
  let imageUrl = item.image_url || item.imageUrl || item.img_url || item.image || item.img || item.picture || item.url || item.link || '';
  let quizExplanation = item.quiz_explanation || item.quizExplanation || item.explanation || '';

  // 2. PIGGYBACK DECODE STRATEGY
  const PIGGYBACK_DELIMITER = '|||IMG:';

  // Check Text for hidden image
  if (!imageUrl && text && text.includes(PIGGYBACK_DELIMITER)) {
    const parts = text.split(PIGGYBACK_DELIMITER);
    if (parts.length > 1) {
      text = parts[0].trim(); // The real text content
      imageUrl = parts[1].trim(); // The hidden image URL
    }
  }

  // Check Quiz Explanation for hidden image (Secondary Backup)
  if (!imageUrl && quizExplanation && quizExplanation.includes(PIGGYBACK_DELIMITER)) {
    const parts = quizExplanation.split(PIGGYBACK_DELIMITER);
    if (parts.length > 1) {
      quizExplanation = parts[0].trim();
      imageUrl = parts[1].trim();
    }
  }

  return {
    id: item.id,
    category: item.category,
    text: text,
    imageUrl: imageUrl,
    backgroundColor: item.background_color || item.backgroundColor || '#ffffff',
    created_at: item.created_at,
    quizQuestion: item.quiz_question || item.quizQuestion || item.question,
    quizIsTrue: item.quiz_is_true ?? item.quizIsTrue ?? item.is_true ?? true,
    quizExplanation: quizExplanation
  };
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

  /* --- OPTIMIZED AUTH & DATA FETCHING --- */
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Safety timeout to ensure loading screen doesn't hang forever
    const safetyTimeout = setTimeout(() => {
      if (mounted && isLoading) {
        console.warn("Loading timeout reached, forcing UI render.");
        setIsLoading(false);
        setToastMessage("Yükleme uzun sürdü, bağlantı yavaş olabilir.");
      }
    }, 12000); // Reduced to 12s for better UX

    const initApp = async () => {
      try {
        // Cleanup legacy data in background (don't await critical path)
        cleanupLegacyData().catch(e => console.error("Legacy cleanup init error:", e));

        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && mounted) {
          const userRole = await fetchUserProfile(session.user.id, session.user.email!);
          if (mounted) {
            // Load favorites in background, don't block UI
            fetchFavorites(session.user.id).catch(console.error);
            setIsDataLoaded(true);
          }
        }
      } catch (e) {
        console.error("Init App Error:", e);
      } finally {
        if (mounted) {
          setIsLoading(false);
          clearTimeout(safetyTimeout);
        }
      }
    };

    initApp();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Improve logic: Only fetch if we haven't loaded data yet, or if it's a fresh sign-in
      if (event === 'SIGNED_IN' && session?.user) {
        if (!isDataLoaded) {
          try {
            const userRole = await fetchUserProfile(session.user.id, session.user.email!);
            await fetchFavorites(session.user.id);
            if (mounted) setIsDataLoaded(true);
          } catch (e) {
            console.error("Auth listener fetch error:", e);
          } finally {
            if (mounted) setIsLoading(false);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setCurrentUser(null);
          setCards([]);
          setFavorites([]);
          setIsDataLoaded(false);
          setIsLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      authListener.subscription.unsubscribe();
    };
  }, [isDataLoaded]); // Depend on isDataLoaded to prevent loops, though logic inside handles it

  const cleanupLegacyData = async () => {
    try {
      /* Lightweight check - usually redundant */
    } catch (err) { }
  };

  const fetchUserProfile = async (userId: string, email: string): Promise<Role> => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle(); // safer than single() if 0 rows

      const role = data?.role === 'ADMIN' ? Role.ADMIN : Role.USER;

      setCurrentUser({
        id: userId,
        email: email,
        role: role
      });

      return role;
    } catch (error) {
      console.error("Profile fetch error:", error);
      setCurrentUser({
        id: userId,
        email: email,
        role: Role.USER
      });
      return Role.USER;
    }
  };

  const checkAndSeedDatabase = async () => {
    const { count, error } = await supabase
      .from('cards')
      .select('id', { count: 'exact', head: true });

    if (!error && count === 0) {
      setToastMessage("Veritabanı boş. Varsayılan kartlar yükleniyor...");
      // Seed logic...
      const cardsToInsert = INITIAL_CARDS.map(card => ({
        category: card.category,
        text: card.text,
        image_url: card.imageUrl,
        background_color: card.backgroundColor
      }));
      await supabase.from('cards').insert(cardsToInsert);
      setToastMessage("Varsayılan kartlar yüklendi!");
    }
  };

  const fetchCards = async (role?: Role, category?: string) => {
    console.log("=== fetchCards START ===");
    console.log("Role:", role, "Category:", category);

    if (role === Role.ADMIN) {
      checkAndSeedDatabase().catch(console.error);
    }

    setIsLoading(true);

    try {
      let query = supabase
        .from('cards')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters based on category
      if (category) {
        if (category === 'Favoriler') {
          if (favorites.length === 0) {
            setCards([]);
            setIsLoading(false);
            return;
          }
          query = query.in('id', favorites);
        } else {
          query = query.eq('category', category);
        }
      } else {
        console.warn("fetchCards called without category - this shouldn't happen");
        setIsLoading(false);
        return;
      }

      query = query.limit(100);

      const { data, error } = await query;

      if (error) {
        console.error("Fetch error:", error);
        setToastMessage("Kartlar çekilirken bir sorun oluştu.");
        setIsLoading(false);
        return;
      }

      if (data) {
        const mappedCards = data.map(mapDbCardToType);
        setCards(mappedCards);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
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

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('kpss-theme', theme);
  }, [theme]);

  // --- AUTH HANDLERS ---
  const handleLogin = async (credentials: { userId?: string; password?: string; provider?: string }) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      if (credentials.provider) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin // Otomatik olarak doğru URL'i alır
          }
        });

        if (error) throw error;
      } else if (credentials.userId && credentials.password) {
        const { error } = await supabase.auth.signInWithPassword({
          email: credentials.userId,
          password: credentials.password
        });
        if (error) throw error;
      }
    } catch (e: any) {
      setAuthError(e.message);
      setIsLoading(false);
    }
  };

  const handleSignUp = async (credentials: { userId: string; email: string; password?: string; }) => {
    setAuthError(null);
    if (!credentials.password) return;
    const { error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: { emailRedirectTo: 'https://kpssguncel-git-main-scddniyibils-projects.vercel.app' }
    });
    if (error) setAuthError(error.message);
    else setToastMessage('Kayıt oldunuz! Lütfen mailinizi kontrol edip hesabınızı aktif edin.');
  };

  const handleResetPassword = async (email: string) => {
    setAuthError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://kpssguncel-git-main-scddniyibils-projects.vercel.app',
    });
    if (error) setAuthError(error.message);
    else setToastMessage('Şifre sıfırlama bağlantısı e-postana gönderildi.');
  };

  const handleUpdatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { setToastMessage(`Hata: ${error.message}`); throw error; }
    else setToastMessage('Şifreniz başarıyla güncellendi.');
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setIsLoading(false);
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // --- WARRIOR SAVE LOGIC (Try Every Possible Way) ---
  const saveCardToSupabase = async (payload: any, id?: string) => {
    const query = supabase.from('cards');

    // If we don't have an image, just save simply
    if (!payload.image_url) {
      const minimalPayload = { ...payload };
      delete minimalPayload.image_url;
      // Normalize snake_case for minimal (ensure keys are correct)
      // But payload passed here is already mixed. Let's act on known keys.
      const cleanPayload: any = {
        category: payload.category,
        text: payload.text,
        background_color: payload.background_color,
        quiz_question: payload.quiz_question,
        quiz_is_true: payload.quiz_is_true,
        quiz_explanation: payload.quiz_explanation
      };

      let op = id ? query.update(cleanPayload).eq('id', id) : query.insert(cleanPayload);
      const { data, error } = await op.select().single();
      return { data, error, partialSuccess: false };
    }

    // We have an image, let's try to save it.
    // List of potential column names people use for images
    const potentialImageCols = ['image_url', 'imageUrl', 'img_url', 'image', 'picture', 'url', 'avatar', 'cover'];

    // STRATEGY 1: Try every column name until one sticks
    for (const colName of potentialImageCols) {
      const tryPayload: any = {
        category: payload.category,
        text: payload.text,
        background_color: payload.background_color,
        quiz_question: payload.quiz_question,
        quiz_is_true: payload.quiz_is_true,
        quiz_explanation: payload.quiz_explanation
      };
      tryPayload[colName] = payload.image_url;

      let op = id ? query.update(tryPayload).eq('id', id) : query.insert(tryPayload);
      const { data, error } = await op.select().single();

      if (!error) {
        return { data, error: null, partialSuccess: false }; // SUCCESS!
      }
    }

    // STRATEGY 2: PIGGYBACK on TEXT
    // If columns failed, try to append URL to the text field.
    // Delimiter used: |||IMG:
    const PIGGYBACK_DELIMITER = '|||IMG:';
    const hackedText = `${payload.text} ${PIGGYBACK_DELIMITER}${payload.image_url}`;

    const textFallbackPayload: any = {
      category: payload.category,
      text: hackedText,
      background_color: payload.background_color,
      quiz_question: payload.quiz_question,
      quiz_is_true: payload.quiz_is_true,
      quiz_explanation: payload.quiz_explanation
    };

    let opText = id ? query.update(textFallbackPayload).eq('id', id) : query.insert(textFallbackPayload);
    const resText = await opText.select().single();

    if (!resText.error) {
      return { data: resText.data, error: null, partialSuccess: false }; // Piggyback Success!
    }

    // STRATEGY 3: PIGGYBACK on QUIZ_EXPLANATION (If Text failed due to length)
    const hackedExplanation = `${payload.quiz_explanation || ''} ${PIGGYBACK_DELIMITER}${payload.image_url}`;
    const explFallbackPayload: any = {
      category: payload.category,
      text: payload.text, // Original text
      background_color: payload.background_color,
      quiz_question: payload.quiz_question,
      quiz_is_true: payload.quiz_is_true,
      quiz_explanation: hackedExplanation
    };

    let opExpl = id ? query.update(explFallbackPayload).eq('id', id) : query.insert(explFallbackPayload);
    const resExpl = await opExpl.select().single();

    if (!resExpl.error) {
      return { data: resExpl.data, error: null, partialSuccess: false }; // Backup Piggyback Success!
    }

    // STRATEGY 4: SURRENDER (Save without image)
    const minimalPayload: any = {
      category: payload.category,
      text: payload.text,
      background_color: payload.background_color,
    };
    let opMin = id ? query.update(minimalPayload).eq('id', id) : query.insert(minimalPayload);
    const resMin = await opMin.select().single();

    if (!resMin.error) {
      return { data: resMin.data, error: null, partialSuccess: true }; // Saved but lost image
    }

    return { data: null, error: resMin.error, partialSuccess: false };
  };

  const handleSaveCard = async (cardData: Omit<Card, 'id'> | Card | Omit<Card, 'id'>[]) => {
    if (!currentUser || currentUser.role !== Role.ADMIN) return;

    if (Array.isArray(cardData)) {
      const payload = cardData.map(c => ({
        category: c.category,
        text: c.text,
        image_url: c.imageUrl || '',
        background_color: c.backgroundColor
      }));
      const { error } = await supabase.from('cards').insert(payload);
      if (error) setToastMessage(`Toplu ekleme hatası: ${error.message}`);
      else {
        setToastMessage(`${cardData.length} kart başarıyla eklendi!`);
        // Cards will be loaded when user clicks on a category
      }
      return;
    }

    try {
      const fullPayload = {
        category: cardData.category,
        text: cardData.text,
        image_url: cardData.imageUrl ?? null,
        background_color: cardData.backgroundColor,
        quiz_question: cardData.quizQuestion,
        quiz_is_true: cardData.quizIsTrue,
        quiz_explanation: cardData.quizExplanation
      };

      const isUpdate = 'id' in cardData;
      const { data, error, partialSuccess } = await saveCardToSupabase(fullPayload, isUpdate ? (cardData as Card).id : undefined);

      if (error) throw error;

      if (partialSuccess) {
        setToastMessage("Kart kaydedildi! (Uyarı: Resim veritabanı limitleri nedeniyle kaydedilemedi).");
      } else {
        setToastMessage(isUpdate ? 'Kart başarıyla güncellendi!' : 'Kart başarıyla eklendi!');
      }

      // --- UI-FIRST UPDATE (OPTIMISTIC UI) ---
      // This ensures the user sees the change immediately, even if DB lags
      const mergedCard: Card = {
        id: data?.id || (isUpdate ? (cardData as Card).id : Date.now().toString()),
        created_at: data?.created_at || new Date().toISOString(),
        text: cardData.text,
        category: cardData.category,
        backgroundColor: cardData.backgroundColor || '#ffffff',
        imageUrl: cardData.imageUrl || '',
        quizQuestion: cardData.quizQuestion,
        quizIsTrue: cardData.quizIsTrue,
        quizExplanation: cardData.quizExplanation
      };

      if (isUpdate) {
        setCards(prev => prev.map(c => c.id === mergedCard.id ? mergedCard : c));
      } else {
        setCards(prev => [mergedCard, ...prev]);
      }

    } catch (err: any) {
      console.error("Save error:", err);
      setToastMessage(`Hata: ${err.message}`);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!currentUser || currentUser.role !== Role.ADMIN) return;
    const { error } = await supabase.from('cards').delete().eq('id', cardId);
    if (error) setToastMessage('Silme işlemi başarısız.');
    else {
      setToastMessage('Kart silindi!');
      setCards(prev => prev.filter(c => c.id !== cardId));
    }
  };

  const handleToggleFavorite = async (cardId: string) => {
    if (!currentUser) return;
    const isFavorite = favorites.includes(cardId);
    if (isFavorite) {
      const { error } = await supabase.from('favorites').delete().eq('user_id', currentUser.id).eq('card_id', cardId);
      if (!error) setFavorites(prev => prev.filter(id => id !== cardId));
    } else {
      const { error } = await supabase.from('favorites').insert({ user_id: currentUser.id, card_id: cardId });
      if (!error) setFavorites(prev => [...prev, cardId]);
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral dark:bg-dark-bg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Yükleniyor...</p>
        </div>
      ) : (
        currentUser ? (
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
            onFetchCategory={(cat: string) => fetchCards(currentUser.role, cat)}
          />
        ) : (
          <LoginScreen
            onLogin={handleLogin}
            onSignUp={handleSignUp}
            onResetPassword={handleResetPassword}
            error={authError}
          />
        )
      )}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
    </>
  );
};

export default App;
