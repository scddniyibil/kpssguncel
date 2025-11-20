
import { Card, Category } from './types';

// Kategoriler sadeleştirildi ve isim çakışmaları giderildi
export const CATEGORIES: Category[] = [
  'Favoriler',
  'Tarih',
  'Coğrafya',
  'Vatandaşlık',
  'Güncel Bilgiler', // Eski adı: Güncel & Genel Kültür
  'Sanat & Edebiyat', // Eski adı: Kültür & Sanat
];

export const INITIAL_CARDS: Card[] = [
  {
    id: '1',
    category: 'Tarih',
    text: 'Türkiye Cumhuriyeti\'nin ilk cumhurbaşkanı Mustafa Kemal Atatürk\'tür.',
    imageUrl: 'https://picsum.photos/seed/ataturk/400/200',
    backgroundColor: '#ffffff'
  },
  {
    id: '2',
    category: 'Coğrafya',
    text: 'Türkiye\'nin en yüksek dağı Ağrı Dağı\'dır.',
    backgroundColor: '#e0f2fe'
  },
  {
    id: '3',
    category: 'Vatandaşlık',
    text: 'Türkiye Büyük Millet Meclisi (TBMM) 600 milletvekilinden oluşur.',
    backgroundColor: '#ede9fe'
  },
  {
    id: '4',
    category: 'Sanat & Edebiyat',
    text: '2023 yılında Nobel Edebiyat Ödülü\'nü Jon Fosse kazanmıştır.',
    backgroundColor: '#fef3c7'
  },
  {
    id: '5',
    category: 'Güncel Bilgiler',
    text: '2022 FIFA Dünya Kupası\'nı Arjantin kazanmıştır.',
    imageUrl: 'https://picsum.photos/seed/football/400/200',
    backgroundColor: '#ffffff'
  },
  {
    id: '6',
    category: 'Sanat & Edebiyat',
    text: '"Bir Zamanlar Anadolu\'da" filminin yönetmeni Nuri Bilge Ceylan\'dır.',
    backgroundColor: '#d1fae5'
  },
  {
    id: '7',
    category: 'Güncel Bilgiler',
    text: 'DNA\'nın yapısını keşfeden bilim insanları Watson ve Crick\'tir.',
    imageUrl: 'https://picsum.photos/seed/dna/400/200',
    backgroundColor: '#ffffff'
  },
  {
    id: '8',
    category: 'Güncel Bilgiler',
    text: 'Türkiye\'nin ilk yerli otomobilinin adı Togg\'dur.',
    backgroundColor: '#fee2e2'
  },
    {
    id: '9',
    category: 'Tarih',
    text: 'İstanbul\'un Fethi 1453 yılında gerçekleşmiştir.',
    backgroundColor: '#fce7f3'
  },
  {
    id: '10',
    category: 'Coğrafya',
    text: 'Türkiye\'nin en büyük gölü Van Gölü\'dür.',
    imageUrl: 'https://picsum.photos/seed/lake/400/200',
    backgroundColor: '#ffffff'
  }
];
