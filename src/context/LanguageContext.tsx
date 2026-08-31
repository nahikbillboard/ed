import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { speakText, stopSpeaking, convertToHindiSpeech, playChime } from '../utils/audioSpeech';

export type SupportedLanguage = 'hi' | 'en';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  isHindi: boolean;
  speak: (text: string, options?: { rate?: number; pitch?: number; lang?: SupportedLanguage }) => void;
  stopAudio: () => void;
  translate: (text: string) => string;
  playAudioChime: (type?: 'success' | 'alert' | 'ding') => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'sath_audio_language';

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: SupportedLanguage;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage = 'hi', // Default to Hindi
}) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'hi' || saved === 'en') {
        return saved;
      }
    } catch (e) {
      console.warn('Could not read saved language from storage', e);
    }
    return defaultLanguage;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (e) {
      console.warn('Could not save language to storage', e);
    }
  }, [language]);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (lang === 'hi') {
      speakText('ऑडियो भाषा हिंदी चुनी गई है।', 0.9);
    } else {
      speakText('Audio language set to English.', 0.9, 1.0, 'en');
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(nextLang);
  };

  const speak = (
    text: string,
    options: { rate?: number; pitch?: number; lang?: SupportedLanguage } = {}
  ) => {
    const targetLang = options.lang || language;
    speakText(text, options.rate ?? 0.88, options.pitch ?? 1.0, targetLang);
  };

  const stopAudio = () => {
    stopSpeaking();
  };

  const translate = (text: string) => {
    if (language === 'hi') {
      return convertToHindiSpeech(text);
    }
    return text;
  };

  const playAudioChime = (type: 'success' | 'alert' | 'ding' = 'ding') => {
    playChime(type);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        isHindi: language === 'hi',
        speak,
        stopAudio,
        translate,
        playAudioChime,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useAudioLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback for components used outside provider
    return {
      language: 'hi',
      setLanguage: () => {},
      toggleLanguage: () => {},
      isHindi: true,
      speak: (text, options) => speakText(text, options?.rate, options?.pitch, options?.lang || 'hi'),
      stopAudio: stopSpeaking,
      translate: (text) => convertToHindiSpeech(text),
      playAudioChime: playChime,
    };
  }
  return context;
}

export const useLanguage = useAudioLanguage;
