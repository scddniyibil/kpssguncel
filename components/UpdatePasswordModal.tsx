
import React, { useState } from 'react';
import { CloseIcon, KeyIcon } from './Icons';

interface UpdatePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdatePassword: (newPassword: string) => Promise<void>;
}

const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({ isOpen, onClose, onUpdatePassword }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
        setError("Şifre en az 6 karakter olmalıdır.");
        return;
    }

    if (password !== confirmPassword) {
        setError("Şifreler eşleşmiyor.");
        return;
    }

    setLoading(true);
    try {
        await onUpdatePassword(password);
        setPassword('');
        setConfirmPassword('');
        onClose();
    } catch (err) {
        // Error handling is mostly done in parent but we catch here to stop loading
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] animate-fade-in p-4">
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl p-8 w-full max-w-md relative animate-slide-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
          <CloseIcon className="w-6 h-6" />
        </button>
        
        <div className="flex items-center space-x-2 mb-6">
            <KeyIcon className="w-8 h-8 text-primary dark:text-accent" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Şifre Güncelle</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Yeni Şifre</label>
            <input 
                type="password" 
                id="new-password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white" 
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Şifre Tekrar</label>
            <input 
                type="password" 
                id="confirm-password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white" 
            />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">İptal</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary dark:bg-accent dark:hover:bg-blue-500 disabled:opacity-50">
                {loading ? 'Güncelleniyor...' : 'Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordModal;
