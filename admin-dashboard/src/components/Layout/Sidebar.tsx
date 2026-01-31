import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Text, Icon } from '@gravity-ui/uikit'
import { 
  ChartLine, 
  LayoutList, 
  Video, 
  FolderTree
} from '@gravity-ui/icons'
import { useLanguage } from '../../context/LanguageContext'
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
  { path: '/dashboard', label: 'nav.dashboard', iconData: ChartLine },
  { path: '/users', label: 'nav.users', iconData: LayoutList },
  { path: '/channels', label: 'nav.channels', iconData: Video },
  { path: '/clusters', label: 'nav.clusters', iconData: FolderTree },
]

const Sidebar: React.FC<SidebarProps> = ({ currentPath }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <aside className="sidebar">
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
              <Text variant="body-2">{t(item.label)}</Text>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
