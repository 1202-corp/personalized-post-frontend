import React, { useEffect, useState } from 'react'
import { Table, Text, Loader, Pagination, Label } from '@gravity-ui/uikit'
import { api } from '../services/api'
import { User } from '../types'
import type { TableColumnConfig } from '@gravity-ui/uikit'
import { useLanguage } from '../context/LanguageContext'
import './Users.css'

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 50
  const { t, language } = useLanguage()

  useEffect(() => {
    loadUsers()
  }, [page])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const skip = (page - 1) * pageSize
      const response = await api.get<{ total: number; users: User[] }>('/admin/users', {
        params: { skip, limit: pageSize },
      })
      setUsers(response.data.users)
      setTotal(response.data.total)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns: TableColumnConfig<User>[] = [
    {
      id: 'telegram_id',
      name: 'Telegram ID',
      template: (item) => <Text variant="code-inline-1">{item.telegram_id}</Text>,
    },
    {
      id: 'username',
      name: 'Username',
      template: (item) => (
        <Text>{item.username ? `@${item.username}` : '-'}</Text>
      ),
    },
    {
      id: 'is_trained',
      name: 'Статус',
      template: (item) => (
        <Label
          theme={item.is_trained ? 'success' : 'warning'}
          value={item.is_trained ? '✓ Обучен' : '⏳ В процессе'}
        />
      ),
    },
    {
      id: 'language',
      name: 'Язык',
      template: (item) => <Text>{item.language}</Text>,
    },
    {
      id: 'bonus_channels_count',
      name: 'Бонус каналов',
      template: (item) => <Text>{item.bonus_channels_count}</Text>,
    },
    {
      id: 'last_activity_at',
      name: 'Последняя активность',
      template: (item) => (
        <Text>
          {item.last_activity_at
            ? new Date(item.last_activity_at).toLocaleString(language === 'en' ? 'en-US' : 'ru-RU')
            : '-'}
        </Text>
      ),
    },
  ]

  if (loading && users.length === 0) {
    return (
      <div className="users-loading">
        <Loader size="l" />
      </div>
    )
  }

  return (
    <div className="users">
      <Text variant="header-1" className="users-title">
        {t('page.users.title')}
      </Text>

      <Table data={users} columns={columns} className="users-table" />

      <div className="users-pagination">
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onUpdate={(newPage) => setPage(newPage)}
        />
      </div>
    </div>
  )
}

export default Users
