import React from 'react'
import { Button, Text } from '@gravity-ui/uikit'
import { SignOut } from '@gravity-ui/icons'
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
        iconStart={SignOut}
      >
        Выйти
      </Button>
    </header>
  )
}

export default Header
