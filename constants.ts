
import { Card, Category } from './types';

// Kategoriler
export const CATEGORIES: Category[] = [
  'Favoriler',
  'Tarih',
  'Coğrafya',
  'Vatandaşlık',
  'Güncel Bilgiler',
  'Sanat & Edebiyat',
];

// Initial cards with relevant images for each topic AND manual quiz questions
// Removed slow external URLs. Users should upload images to Supabase via Admin panel for best performance.
// IMAGES ARE INTENTIONALLY EMPTY to prevent random/incorrect AI images. User must upload their own.
// BACKGROUND COLORS UPDATED TO PASTELS for better text readability.
export const INITIAL_CARDS: Omit<Card, 'id' | 'created_at'>[] = [
  {
    category: 'Tarih',
    text: "Türkiye Cumhuriyeti'nin kurucusu ve ilk Cumhurbaşkanı Mustafa Kemal Atatürk, 1938 yılında Dolmabahçe Sarayı'nda vefat etmiştir.",
    imageUrl: '',
    backgroundColor: '#fee2e2', // Red-100 (Pastel)
    quizQuestion: "Mustafa Kemal Atatürk, 1938 yılında Ankara'da vefat etmiştir.",
    quizIsTrue: false,
    quizExplanation: "Yanlış. Atatürk, İstanbul Dolmabahçe Sarayı'nda hayata gözlerini yummuştur."
  },
  {
    category: 'Coğrafya',
    text: "Peri Bacaları, Nevşehir ilimizde bulunan Kapadokya bölgesindeki volkanik arazide oluşmuş doğal harikalardır.",
    imageUrl: '',
    backgroundColor: '#ffedd5', // Orange-100 (Pastel)
    quizQuestion: "Peri Bacaları, volkanik arazide oluşmuş doğal yapılardır.",
    quizIsTrue: true,
    quizExplanation: "Doğru. Erciyes, Hasandağı ve Güllüdağ'ın püskürttüğü lav ve küllerin aşınmasıyla oluşmuşlardır."
  },
  {
    category: 'Sanat & Edebiyat',
    text: "İstiklal Marşı'mızın şairi Mehmet Akif Ersoy, marşı Tacettin Dergahı'nda kaleme almıştır.",
    imageUrl: '',
    backgroundColor: '#fef9c3', // Yellow-100 (Pastel)
    quizQuestion: "İstiklal Marşı, Mehmet Akif Ersoy tarafından kendi evinde yazılmıştır.",
    quizIsTrue: false,
    quizExplanation: "Yanlış. Mehmet Akif Ersoy, İstiklal Marşı'nı Ankara'daki Tacettin Dergahı'nda yazmıştır."
  },
  {
    category: 'Vatandaşlık',
    text: "Türkiye Büyük Millet Meclisi (TBMM), yasama yetkisini Türk Milleti adına kullanan tek organ olup Ankara'da bulunmaktadır.",
    imageUrl: '',
    backgroundColor: '#ecfccb', // Lime-100 (Pastel)
    quizQuestion: "TBMM, yasama yetkisini Cumhurbaşkanı adına kullanır.",
    quizIsTrue: false,
    quizExplanation: "Yanlış. Anayasamıza göre yasama yetkisi Türk Milleti adına Türkiye Büyük Millet Meclisi'nindir."
  },
  {
    category: 'Güncel Bilgiler',
    text: "Türkiye'nin yerli ve milli otomobili Togg, Bursa Gemlik'teki tesislerde üretilmektedir.",
    imageUrl: '',
    backgroundColor: '#cffafe', // Cyan-100 (Pastel)
    quizQuestion: "Yerli otomobil Togg'un üretim fabrikası Bursa'nın Gemlik ilçesindedir.",
    quizIsTrue: true,
    quizExplanation: "Doğru. Togg Teknoloji Kampüsü Bursa Gemlik'te faaliyete geçmiştir."
  },
  {
    category: 'Tarih',
    text: "İstanbul'un Fethi, 29 Mayıs 1453 tarihinde Fatih Sultan Mehmet komutasındaki Osmanlı ordusu tarafından gerçekleştirilmiştir.",
    imageUrl: '',
    backgroundColor: '#dbeafe', // Blue-100 (Pastel)
    quizQuestion: "İstanbul'un fethi 1453 yılında gerçekleşmiştir.",
    quizIsTrue: true,
    quizExplanation: "Doğru. 29 Mayıs 1453 tarihinde fethedilmiştir."
  },
  {
    category: 'Coğrafya',
    text: "Türkiye'nin en büyük gölü olan Van Gölü, aynı zamanda dünyanın en büyük sodalı gölüdür.",
    imageUrl: '',
    backgroundColor: '#e0e7ff', // Indigo-100 (Pastel)
    quizQuestion: "Türkiye'nin en büyük gölü Tuz Gölü'dür.",
    quizIsTrue: false,
    quizExplanation: "Yanlış. Yüzölçümü bakımından en büyük gölümüz Van Gölü'dür."
  },
  {
    category: 'Sanat & Edebiyat',
    text: "Dünyaca ünlü 'Kaplumbağa Terbiyecisi' tablosu, Osman Hamdi Bey tarafından yapılmıştır.",
    imageUrl: '',
    backgroundColor: '#f3e8ff', // Purple-100 (Pastel)
    quizQuestion: "Kaplumbağa Terbiyecisi tablosu Osman Hamdi Bey'e aittir.",
    quizIsTrue: true,
    quizExplanation: "Doğru. Türk resim sanatının en önemli eserlerinden biridir."
  },
  {
    category: 'Güncel Bilgiler',
    text: "James Webb Uzay Teleskobu, insanlık tarihinin en gelişmiş uzay teleskobu olarak evrenin derinliklerini görüntülemektedir.",
    imageUrl: '',
    backgroundColor: '#fce7f3', // Pink-100 (Pastel)
    quizQuestion: "James Webb, bir denizaltı araştırma aracıdır.",
    quizIsTrue: false,
    quizExplanation: "Yanlış. James Webb, NASA tarafından geliştirilen en gelişmiş uzay teleskobudur."
  },
  {
    category: 'Vatandaşlık',
    text: "1982 Anayasası'na göre Cumhurbaşkanı, halk tarafından 5 yıllığına seçilir.",
    imageUrl: '',
    backgroundColor: '#ffe4e6', // Rose-100 (Pastel)
    quizQuestion: "Cumhurbaşkanlığı görev süresi 5 yıldır.",
    quizIsTrue: true,
    quizExplanation: "Doğru. 2017 anayasa değişikliği ile bu süre korunmuştur ve halk tarafından seçilir."
  }
];
