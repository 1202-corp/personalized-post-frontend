import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '@gravity-ui/uikit'
import Sidebar from './Sidebar'
import Header from './Header'
import './Layout.css'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <Sidebar currentPath={location.pathname} />
      <div className="layout-main">
        <Header onLogout={handleLogout} />
        <div className="layout-content">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout
