import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Text, Icon } from '@gravity-ui/uikit'
import { 
  ChartLine, 
  Users, 
  Video, 
  TestTube, 
  FolderNetwork 
} from '@gravity-ui/icons'
import './Sidebar.css'

interface SidebarProps {
  currentPath: string
}

interface MenuItem {
  path: string
  label: string
  icon: React.ComponentType
}

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: ChartLine },
  { path: '/users', label: 'Пользователи', icon: Users },
  { path: '/channels', label: 'Каналы', icon: Video },
  { path: '/ab-testing', label: 'A/B Testing', icon: TestTube },
  { path: '/clusters', label: 'Кластеры', icon: FolderNetwork },
]

const Sidebar: React.FC<SidebarProps> = ({ currentPath }) => {
  const navigate = useNavigate()

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Text variant="header-2">PPP Admin</Text>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const IconComponent = item.icon
          const isActive = currentPath === item.path

          return (
            <button
              key={item.path}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <Icon data={IconComponent} size={20} />
              <Text variant="body-2">{item.label}</Text>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
