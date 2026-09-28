import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Fingerprint, 
  AlertCircle,
  Delete,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { MyDocAnizerIcon } from './brand/MyDocAnizerIcon';
import { MyDocAnizerBanner } from './brand/MyDocAnizerBanner';

interface LockScreenModalProps {
  isOpen: boolean;
  expectedPin: string;
  authMethod: 'os_system' | 'pin' | 'none';
  onUnlock: () => void;
  onShowToast: (msg: string) => void;
}

export const LockScreenModal: React.FC<LockScreenModalProps> = ({
  isOpen,
  expectedPin,
  authMethod,
  onUnlock,
  onShowToast
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [isVerifyingBiometric, setIsVerifyingBiometric] = useState<boolean>(false);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset states when modal is opened or closed
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
      setIsVerifyingBiometric(false);
    } else {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
        errorTimerRef.current = null;
      }
    }
  }, [isOpen]);

  const handleUnlockSuccess = useCallback(() => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
    setPin('');
    setError(false);
    onUnlock();
    onShowToast('🔓 Dokumenten-Tresor erfolgreich entsperrt');
  }, [onUnlock, onShowToast]);

  const handleBiometricAuth = useCallback(() => {
    setIsVerifyingBiometric(true);
    setTimeout(() => {
      setIsVerifyingBiometric(false);
      handleUnlockSuccess();
    }, 700);
  }, [handleUnlockSuccess]);

  const handleKeyPress = useCallback((digit: string) => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }

    setPin(currentPin => {
      if (currentPin.length >= expectedPin.length) return currentPin;
      const nextPin = currentPin + digit;
      
      // Schedule verification outside reducer / state-transition
      if (nextPin.length === expectedPin.length) {
        setTimeout(() => {
          if (nextPin === expectedPin) {
            handleUnlockSuccess();
          } else {
            setError(true);
            errorTimerRef.current = setTimeout(() => {
              setPin('');
              setError(false);
            }, 800);
          }
        }, 50);
      }
      return nextPin;
    });
    setError(false);
  }, [expectedPin, handleUnlockSuccess]);

  const handleBackspace = useCallback(() => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
    setPin(prev => prev.slice(0, -1));
    setError(false);
  }, []);

  // Physical keyboard support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter' && authMethod === 'os_system') {
        handleBiometricAuth();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, [isOpen, handleKeyPress, handleBackspace, authMethod, handleBiometricAuth]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Banner & Locked Icon */}
        <div className="flex flex-col items-center">
          <div className="relative mb-2">
            <MyDocAnizerIcon size={64} glow={true} />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <MyDocAnizerBanner variant="desktop" height={44} className="filter drop-shadow-md" />
          </div>
          <h2 className="text-sm font-bold text-slate-100 mt-2">
            Dokumenten-Tresor gesperrt
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {authMethod === 'os_system'
              ? 'Autorisiere dich über dein Betriebssystem oder gib deine PIN ein.'
              : 'Gib deine 4-stellige PIN ein, um den Tresor zu öffnen.'}
          </p>
        </div>

        {/* OS Biometric / Windows Hello Fast Action */}
        {authMethod === 'os_system' && (
          <div className="pt-1">
            <button
              onClick={handleBiometricAuth}
              disabled={isVerifyingBiometric}
              className="w-full py-3 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm"
            >
              <Fingerprint className={`w-5 h-5 text-cyan-400 ${isVerifyingBiometric ? 'animate-pulse' : ''}`} />
              <span>
                {isVerifyingBiometric ? 'Autorisiere mit System...' : 'Mit Windows Hello / Touch ID entsperren'}
              </span>
            </button>
            <div className="text-[10px] text-slate-500 mt-2 font-mono">
              ODER PIN MANUELL EINGEBEN:
            </div>
          </div>
        )}

        {/* PIN Indicators */}
        <div className="flex justify-center items-center gap-3">
          {Array.from({ length: expectedPin.length }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border transition-all ${
                error
                  ? 'bg-rose-500 border-rose-400 animate-bounce'
                  : i < pin.length
                  ? 'bg-cyan-400 border-cyan-300 scale-110'
                  : 'bg-slate-800 border-slate-700'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="text-xs text-rose-400 flex items-center justify-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Falsche PIN. Bitte erneut versuchen.</span>
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="w-16 h-13 rounded-2xl bg-slate-800 hover:bg-slate-750 active:bg-cyan-600 text-lg font-semibold text-slate-100 flex items-center justify-center transition-colors border border-slate-700/60"
            >
              {digit}
            </button>
          ))}

          <div />
          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-13 rounded-2xl bg-slate-800 hover:bg-slate-750 active:bg-cyan-600 text-lg font-semibold text-slate-100 flex items-center justify-center transition-colors border border-slate-700/60"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="w-16 h-13 rounded-2xl bg-slate-800/60 hover:bg-slate-750 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors border border-slate-700/40"
            title="Löschen"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <div className="text-[11px] text-slate-500 pt-1">
          Standard-PIN: <span className="font-mono text-slate-400">1234</span>
        </div>
      </div>
    </div>
  );
};
