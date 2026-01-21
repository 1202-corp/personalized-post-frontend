import React from 'react'
import { Button, Text } from '@gravity-ui/uikit'
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
        <Button
          view="outlined"
          size="m"
          onClick={toggleLanguage}
          className="language-button"
        >
          {language.toUpperCase()}
        </Button>
        <Button
          view="outlined"
          size="m"
          onClick={onLogout}
          iconStart={ArrowRightToSquare}
        >
          {t('common.logout')}
        </Button>
      </div>
    </header>
  )
}

export default Header
