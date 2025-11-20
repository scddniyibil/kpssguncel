
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Card } from '../types';
import { CATEGORIES } from '../constants';
import { CloseIcon, BrainIcon, SparklesIcon } from './Icons';

interface AIQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Card[];
}

interface QuizStatement {
  statement: string;
  isTrue: boolean;
  explanation: string;
}

const AIQuizModal: React.FC<AIQuizModalProps> = ({ isOpen, onClose, cards }) => {
  const [step, setStep] = useState<'setup' | 'loading' | 'quiz' | 'result'>('setup');
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[1]); // Default to History
  
  // Quiz State
  const [quizQueue, setQuizQueue] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [quizStatement, setQuizStatement] = useState<QuizStatement | null>(null);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetQuiz();
    }
  }, [isOpen]);

  const resetQuiz = () => {
    setStep('setup');
    setSelectedCategory(CATEGORIES[1]);
    setQuizQueue([]);
    setCurrentCard(null);
    setQuizStatement(null);
    setUserAnswer(null);
    setScore(0);
    setTotalQuestions(0);
    setError(null);
  };

  const handleStartQuiz = () => {
    const eligibleCards = cards.filter(c => c.category === selectedCategory);
    
    if (eligibleCards.length === 0) {
      setError('Bu kategoride hiç kart bulunmuyor.');
      return;
    }

    // Shuffle cards
    const shuffled = [...eligibleCards].sort(() => Math.random() - 0.5);
    setQuizQueue(shuffled);
    setStep('loading');
    setTotalQuestions(0);
    setScore(0);
    
    // Start first question
    generateQuestion(shuffled[0]);
  };

  const generateQuestion = async (card: Card) => {
    setCurrentCard(card);
    setQuizStatement(null);
    setUserAnswer(null);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Faster prompt for True/False
      const prompt = `
      Referans Bilgi: "${card.text}"
      
      Görevin: Bu bilgiye dayanarak Doğru/Yanlış testi için bir cümle oluştur.
      1. Rastgele seç: Ya bilgiyi olduğu gibi doğru bir cümle yap, ya da içindeki önemli bir detayı (isim, tarih, yer, sayı) değiştirerek yanlış bir cümle yap.
      2. Yanıtı JSON olarak ver.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              statement: { type: Type.STRING, description: "Soru cümlesi." },
              isTrue: { type: Type.BOOLEAN, description: "Cümle doğru mu yanlış mı?" },
              explanation: { type: Type.STRING, description: "Kısaca doğrusunu veya neden yanlış olduğunu açıkla." }
            },
            required: ["statement", "isTrue", "explanation"],
          },
        },
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        setQuizStatement(data);
        setStep('quiz');
      } else {
        throw new Error("AI boş yanıt döndü.");
      }

    } catch (err) {
      console.error(err);
      // If AI fails, just show the original card text as a TRUE statement fallback
      setQuizStatement({
        statement: card.text,
        isTrue: true,
        explanation: "Bu bilgi kartta yazdığı gibi doğrudur."
      });
      setStep('quiz');
    }
  };

  const handleAnswer = (answer: boolean) => {
    if (!quizStatement || userAnswer !== null) return;
    
    setUserAnswer(answer);
    if (answer === quizStatement.isTrue) {
      setScore(s => s + 1);
    }
    setTotalQuestions(t => t + 1);
  };

  const handleNext = () => {
    // Remove current card from queue
    const remaining = quizQueue.slice(1);
    setQuizQueue(remaining);

    if (remaining.length > 0) {
      setStep('loading');
      generateQuestion(remaining[0]);
    } else {
      setStep('result');
    }
  };

  const getScoreMessage = () => {
      const percentage = (score / totalQuestions) * 100;
      if (percentage === 100) return "Mükemmel! Hepsini bildin.";
      if (percentage >= 70) return "Harika iş çıkardın!";
      if (percentage >= 50) return "Fena değil, biraz daha çalışmalısın.";
      return "Daha fazla tekrar yapmalısın.";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl p-6 w-full max-w-lg relative animate-slide-in-up flex flex-col min-h-[400px]">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b dark:border-gray-700 pb-4">
             <div className="flex items-center space-x-2">
                <BrainIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">AI Sınavı</h2>
             </div>
             <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors">
                <CloseIcon className="w-6 h-6" />
             </button>
        </div>

        {/* SETUP STEP */}
        {step === 'setup' && (
          <div className="flex flex-col flex-grow justify-center space-y-6">
            <div className="text-center">
                <p className="text-gray-600 dark:text-dark-text-secondary mb-4">
                    Seçilen kategorideki kartlar sırasıyla sorulacak. Her soru için Doğru veya Yanlış demen yeterli.
                </p>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">Kategori Seç</label>
                <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                >
                    {CATEGORIES.filter(c => c !== 'Favoriler').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-2 text-right">
                    {cards.filter(c => c.category === selectedCategory).length} kart mevcut
                </p>
            </div>
            
            {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}

            <div className="mt-auto">
                <button 
                    onClick={handleStartQuiz}
                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md transition-transform transform active:scale-95"
                >
                    Başlat
                </button>
            </div>
          </div>
        )}

        {/* LOADING STEP */}
        {step === 'loading' && (
           <div className="flex flex-col items-center justify-center flex-grow space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
                <p className="text-base font-medium text-gray-600 dark:text-dark-text animate-pulse">Soru hazırlanıyor...</p>
           </div>
        )}

        {/* QUIZ STEP */}
        {step === 'quiz' && quizStatement && (
           <div className="flex flex-col h-full">
                <div className="flex justify-between text-sm font-semibold text-gray-500 mb-2">
                    <span>Soru: {totalQuestions + 1}</span>
                    <span>Kalan: {quizQueue.length}</span>
                </div>
                
                {/* Question Card */}
                <div className="bg-indigo-50 dark:bg-gray-800 p-6 rounded-xl border border-indigo-100 dark:border-gray-700 mb-6 flex-grow flex items-center justify-center min-h-[150px]">
                    <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white leading-relaxed">
                        "{quizStatement.statement}"
                    </h3>
                </div>

                {/* Answer Buttons */}
                {userAnswer === null ? (
                    <div className="grid grid-cols-2 gap-4 mt-auto">
                        <button 
                            onClick={() => handleAnswer(true)}
                            className="py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 active:translate-y-0"
                        >
                            DOĞRU
                        </button>
                        <button 
                            onClick={() => handleAnswer(false)}
                            className="py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 active:translate-y-0"
                        >
                            YANLIŞ
                        </button>
                    </div>
                ) : (
                    <div className="mt-auto animate-pop-in">
                         <div className={`p-4 rounded-lg mb-4 text-center font-bold text-white ${
                            userAnswer === quizStatement.isTrue ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                            {userAnswer === quizStatement.isTrue ? 'TEBRİKLER! DOĞRU CEVAP.' : 'MAALESEF YANLIŞ CEVAP.'}
                        </div>
                        
                        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
                             <p className="text-sm font-bold text-gray-500 dark:text-gray-300 uppercase mb-1">Açıklama</p>
                             <p className="text-gray-800 dark:text-gray-200">{quizStatement.explanation}</p>
                        </div>

                        <div className="flex space-x-3">
                             <button 
                                onClick={() => setStep('result')}
                                className="flex-1 py-3 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-lg hover:bg-gray-400 transition-colors"
                             >
                                Bitir
                             </button>
                             <button 
                                onClick={handleNext}
                                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                             >
                                {quizQueue.length > 1 ? 'Sıradaki Soru' : 'Sonucu Gör'}
                             </button>
                        </div>
                    </div>
                )}
           </div>
        )}

        {/* RESULT STEP */}
        {step === 'result' && (
            <div className="flex flex-col items-center justify-center flex-grow text-center space-y-6">
                <SparklesIcon className="w-16 h-16 text-yellow-400 animate-bounce" />
                
                <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Sınav Tamamlandı!</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">{getScoreMessage()}</p>
                </div>

                <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-2xl w-full">
                    <div className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                        {score} / {totalQuestions}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Doğru Cevap</div>
                </div>

                <button 
                    onClick={resetQuiz}
                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md"
                >
                    Yeni Sınav Başlat
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default AIQuizModal;
