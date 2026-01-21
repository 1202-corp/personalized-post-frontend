import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Text, Icon } from '@gravity-ui/uikit'
import { 
  ChartLine, 
  LayoutList, 
  Video, 
  Flask,
  FolderTree
} from '@gravity-ui/icons'
import './Sidebar.css'

interface SidebarProps {
  currentPath: string
}

interface MenuItem {
  path: string
  label: string
  iconData: any
}

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: 'Dashboard', iconData: ChartLine },
  { path: '/users', label: 'Пользователи', iconData: LayoutList },
  { path: '/channels', label: 'Каналы', iconData: Video },
  { path: '/ab-testing', label: 'A/B Testing', iconData: Flask },
  { path: '/clusters', label: 'Кластеры', iconData: FolderTree },
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
          const isActive = currentPath === item.path

          return (
            <button
              key={item.path}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <Icon data={item.iconData} size={20} />
              <Text variant="body-2">{item.label}</Text>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
