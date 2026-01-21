import React from 'react'
import { Button, Text } from '@gravity-ui/uikit'
import { ArrowRightToSquare } from '@gravity-ui/icons'
import './Header.css'

interface HeaderProps {
  onLogout: () => void
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  return (
    <header className="header">
      <Text variant="header-2">Админ панель</Text>
      <Button
        view="outlined"
        size="m"
        onClick={onLogout}
        iconStart={ArrowRightToSquare}
      >
        Выйти
      </Button>
    </header>
  )
}

export default Header
