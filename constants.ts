
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

// Initial cards with relevant images for each topic
export const INITIAL_CARDS: Card[] = [
  {
    id: '1',
    category: 'Tarih',
    text: "Türkiye Cumhuriyeti'nin kurucusu ve ilk Cumhurbaşkanı Mustafa Kemal Atatürk, 1938 yılında Dolmabahçe Sarayı'nda vefat etmiştir.",
    imageUrl: 'https://image.pollinations.ai/prompt/Mustafa%20Kemal%20Ataturk%20portrait%20realistic?width=800&height=600&nologo=true',
    backgroundColor: '#ffffff'
  },
  {
    id: '2',
    category: 'Coğrafya',
    text: "Peri Bacaları, Nevşehir ilimizde bulunan Kapadokya bölgesindeki volkanik arazide oluşmuş doğal harikalardır.",
    imageUrl: 'https://image.pollinations.ai/prompt/Cappadocia%20fairy%20chimneys%20turkey%20landscape?width=800&height=600&nologo=true',
    backgroundColor: '#ffffff'
  },
  {
    id: '3',
    category: 'Sanat & Edebiyat',
    text: "İstiklal Marşı'mızın şairi Mehmet Akif Ersoy, marşı Tacettin Dergahı'nda kaleme almıştır.",
    imageUrl: 'https://image.pollinations.ai/prompt/Mehmet%20Akif%20Ersoy%20portrait%20old%20photo?width=800&height=600&nologo=true',
    backgroundColor: '#ffffff'
  },
  {
    id: '4',
    category: 'Vatandaşlık',
    text: "Türkiye Büyük Millet Meclisi (TBMM), yasama yetkisini Türk Milleti adına kullanan tek organ olup Ankara'da bulunmaktadır.",
    imageUrl: 'https://image.pollinations.ai/prompt/Grand%20National%20Assembly%20of%20Turkey%20building%20ankara?width=800&height=600&nologo=true',
    backgroundColor: '#ffffff'
  },
  {
    id: '5',
    category: 'Güncel Bilgiler',
    text: "Türkiye'nin yerli ve milli otomobili Togg, Bursa Gemlik'teki tesislerde üretilmektedir.",
    imageUrl: 'https://image.pollinations.ai/prompt/Togg%20turkish%20electric%20car%20suv%20blue?width=800&height=600&nologo=true',
    backgroundColor: '#ffffff'
  },
  {
    id: '6',
    category: 'Tarih',
    text: "İstanbul'un Fethi, 29 Mayıs 1453 tarihinde Fatih Sultan Mehmet komutasındaki Osmanlı ordusu tarafından gerçekleştirilmiştir.",
    imageUrl: 'https://image.pollinations.ai/prompt/Conquest%20of%20Istanbul%201453%20oil%20painting?width=800&height=600&nologo=true',
    backgroundColor: '#ffffff'
  },
  {
    id: '7',
    category: 'Coğrafya',
    text: "Türkiye'nin en büyük gölü olan Van Gölü, aynı zamanda dünyanın en büyük sodalı gölüdür.",
    imageUrl: 'https://image.pollinations.ai/prompt/Lake%20Van%20Turkey%20landscape%20akdamar?width=800&height=600&nologo=true',
    backgroundColor: '#ffffff'
  },
  {
    id: '8',
    category: 'Sanat & Edebiyat',
    text: "Dünyaca ünlü 'Kaplumbağa Terbiyecisi' tablosu, Osman Hamdi Bey tarafından yapılmıştır.",
    imageUrl: 'https://image.pollinations.ai/prompt/The%20Tortoise%20Trainer%20painting%20osman%20hamdi%20bey?width=800&height=600&nologo=true',
    backgroundColor: '#ffffff'
  },
  {
    id: '9',
    category: 'Güncel Bilgiler',
    text: "James Webb Uzay Teleskobu, insanlık tarihinin en gelişmiş uzay teleskobu olarak evrenin derinliklerini görüntülemektedir.",
    imageUrl: 'https://image.pollinations.ai/prompt/James%20Webb%20Space%20Telescope%20in%20space?width=800&height=600&nologo=true',
    backgroundColor: '#ffffff'
  },
  {
    id: '10',
    category: 'Vatandaşlık',
    text: "1982 Anayasası'na göre Cumhurbaşkanı, halk tarafından 5 yıllığına seçilir.",
    imageUrl: 'https://image.pollinations.ai/prompt/Turkish%20flag%20waving%20presidential%20palace?width=800&height=600&nologo=true',
    backgroundColor: '#ffffff'
  }
];
