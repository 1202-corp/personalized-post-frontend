import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
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
        <div className="header-container">
          <Header onLogout={handleLogout} />
        </div>
        <div className="layout-content">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout
