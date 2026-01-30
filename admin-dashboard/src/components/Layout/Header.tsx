import React from 'react'
import { Text } from '@gravity-ui/uikit'
import { ArrowRightToSquare } from '@gravity-ui/icons'
import { useLanguage } from '../../context/LanguageContext'
import './Header.css'

interface HeaderProps {
  onLogout: () => void
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { language, toggleLanguage, t } = useLanguage()

  return (
    <header className="header">
      <Text variant="header-2">{t('header.title')}</Text>
      <div className="header-actions">
        <button className="btn-reset btn-outlined language-button" onClick={toggleLanguage}>
          {language.toUpperCase()}
        </button>
        <button className="btn-reset btn-outlined" onClick={onLogout}>
          <ArrowRightToSquare width={16} height={16} style={{ marginRight: 8 }} />
          {t('common.logout')}
        </button>
      </div>
    </header>
  )
}

export default Header
