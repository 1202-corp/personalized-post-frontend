import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import { configure } from '@gravity-ui/uikit'
import { translations, type Lang } from '../i18n/translations'

interface LanguageContextType {
  language: Lang
  toggleLanguage: () => void
  setLanguage: (lang: Lang) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Lang>(() => {
    const saved = localStorage.getItem('admin_language')
    return (saved === 'en' || saved === 'ru') ? saved : 'ru'
  })

  useEffect(() => {
    localStorage.setItem('admin_language', language)
    configure({
      lang: language,
    })
  }, [language])

  const setLanguage = (lang: Lang) => {
    setLanguageState(lang)
  }

  const toggleLanguage = () => {
    setLanguageState(prev => prev === 'en' ? 'ru' : 'en')
  }

  const t = useMemo(() => {
    const dict = translations[language]
    return (key: string) => dict[key] ?? key
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

