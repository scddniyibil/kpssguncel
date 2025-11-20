
import React, { useState } from 'react';
import { LogoIcon, GoogleIcon, FacebookIcon, ChevronLeftIcon } from './Icons';

interface LoginScreenProps {
  onLogin: (credentials: { userId?: string; password?: string; provider?: string }) => void;
  onSignUp: (credentials: { userId: string; email: string; password?: string }) => void;
  onResetPassword: (email: string) => void;
  error: string | null;
}

type Mode = 'login' | 'signup' | 'forgot';

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSignUp, onResetPassword, error }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup') {
      onSignUp({ userId: email, email, password });
    } else if (mode === 'login') {
      onLogin({ userId: email, password });
    } else if (mode === 'forgot') {
      onResetPassword(email);
    }
  };
  
  const getTitle = () => {
      switch(mode) {
          case 'login': return 'Giriş Yap';
          case 'signup': return 'Hesap Oluştur';
          case 'forgot': return 'Şifremi Unuttum';
      }
  }

  const getDescription = () => {
      switch(mode) {
          case 'login': return 'Hesabınıza hoş geldiniz!';
          case 'signup': return 'Bilgilerini girerek aramıza katıl.';
          case 'forgot': return 'E-posta adresini gir, sana bir sıfırlama bağlantısı gönderelim.';
      }
  }

  return (
    <div className="min-h-screen bg-neutral dark:bg-dark-bg flex items-center justify-center p-4 animate-fade-in">
        <div className="w-full max-w-4xl lg:grid lg:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden">
            <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-primary to-accent text-white text-center">
                <LogoIcon className="h-24 w-24 mb-6" />
                <h1 className="text-4xl font-bold">KPSS Bilgi Kartları</h1>
                <p className="mt-4 text-lg opacity-90">Başarıya giden yolda en büyük yardımcınız. Bilgilerinizi tazeleyin, hedeflerinize ulaşın!</p>
            </div>

            <div className="bg-base-100 dark:bg-dark-card p-8 sm:p-12 flex flex-col justify-center relative">
                {mode === 'forgot' && (
                    <button 
                        onClick={() => setMode('login')} 
                        className="absolute top-6 left-6 flex items-center text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors"
                    >
                        <ChevronLeftIcon className="w-5 h-5 mr-1" /> Geri
                    </button>
                )}

                <div className="w-full max-w-md mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">{getTitle()}</h2>
                    <p className="text-center text-gray-600 dark:text-dark-text-secondary mb-8">{getDescription()}</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-dark-text">E-posta Adresi</label>
                            <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
                                placeholder="ornek@eposta.com"/>
                        </div>

                        {mode !== 'forgot' && (
                            <div>
                                <div className="flex justify-between items-center">
                                    <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-dark-text">Şifre</label>
                                    {mode === 'login' && (
                                        <button type="button" onClick={() => setMode('forgot')} className="text-sm font-medium text-primary hover:text-secondary dark:text-accent dark:hover:text-blue-400">
                                            Şifremi unuttum?
                                        </button>
                                    )}
                                </div>
                                <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
                                    placeholder="••••••••"/>
                            </div>
                        )}
                        
                        {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}

                        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors dark:bg-accent dark:hover:bg-blue-500">
                           {mode === 'signup' ? 'Kayıt Ol' : (mode === 'forgot' ? 'Sıfırlama Bağlantısı Gönder' : 'Giriş Yap')}
                        </button>
                    </form>

                    {mode !== 'forgot' && (
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-600"></div></div>
                                <div className="relative flex justify-center text-sm"><span className="px-2 bg-base-100 dark:bg-dark-card text-gray-500 dark:text-dark-text-secondary">veya</span></div>
                            </div>
                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <button onClick={() => onLogin({provider: 'google'})} className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <GoogleIcon className="w-5 h-5 mr-2" /> Google
                                </button>
                                <button onClick={() => onLogin({provider: 'facebook'})} className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <FacebookIcon className="w-5 h-5 mr-2 fill-blue-600 dark:fill-white" /> Facebook
                                </button>
                            </div>
                        </div>
                    )}

                    {mode !== 'forgot' && (
                        <p className="mt-8 text-center text-sm text-gray-600 dark:text-dark-text-secondary">
                            {mode === 'signup' ? 'Zaten bir hesabın var mı?' : 'Hesabın yok mu?'}{' '}
                            <button onClick={() => {
                                setMode(mode === 'login' ? 'signup' : 'login');
                                setEmail('');
                                setPassword('');
                            }} className="font-medium text-accent hover:text-secondary dark:hover:text-blue-400">
                                {mode === 'signup' ? 'Giriş Yap' : 'Kayıt Ol'}
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default LoginScreen;
