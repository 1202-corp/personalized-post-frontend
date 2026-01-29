import React, { useEffect, useState, useMemo } from 'react'
import { Table, Text, Loader, Pagination, Label, Select, Button } from '@gravity-ui/uikit'
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

  // Admin management state
  const [admins, setAdmins] = useState<User[]>([])
  const [adminsLoading, setAdminsLoading] = useState(false)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [allUsersLoading, setAllUsersLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
    loadAdmins()
  }, [page])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const skip = (page - 1) * pageSize
      const response = await api.get<{ total: number; users: User[] }>('/admin/users', {
        params: { skip, limit: pageSize },
      })
      console.log('Loaded users:', response.data.users)
      setUsers(response.data.users)
      setTotal(response.data.total)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAdmins = async () => {
    try {
      setAdminsLoading(true)
      const response = await api.get<{ total: number; users: User[] }>('/admin/users', {
        params: { user_role: 'admin', limit: 1000 },
      })
      setAdmins(response.data.users)
    } catch (error) {
      console.error('Error loading admins:', error)
    } finally {
      setAdminsLoading(false)
    }
  }

  const loadAllUsersForSelect = async (query?: string) => {
    try {
      setAllUsersLoading(true)
      const params: Record<string, any> = { limit: 33 } // Уменьшили в 3 раза (было 100)
      if (query && query.length > 0) {
        params.q = query
      }
      const response = await api.get<{ total: number; users: User[] }>('/admin/users', {
        params,
      })
      setAllUsers(response.data.users)
    } catch (error) {
      console.error('Error loading users for select:', error)
    } finally {
      setAllUsersLoading(false)
    }
  }

  const handleUserSearchChange = (value: string) => {
    loadAllUsersForSelect(value || undefined)
  }

  const handleSelectOpen = () => {
    if (allUsers.length === 0) {
      loadAllUsersForSelect()
    }
  }

  const formatUserName = (user: User): string => {
    const nameParts = [user.first_name, user.last_name].filter(Boolean)
    const name = nameParts.length > 0 ? nameParts.join(' ') : '-'
    const username = user.username ? `(@${user.username})` : ''
    return `${name} ${username}`.trim()
  }

  const selectOptions = useMemo(() => {
    const filtered = allUsers.filter((user) => !admins.some((admin) => admin.id === user.id))
    return filtered.map((user) => {
      const displayName = formatUserName(user)
      return {
        value: user.id.toString(), // Используем ID как value для уникальности
        content: displayName,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allUsers, admins])



  const handleAddAdmin = async () => {
    if (!selectedUserId) return

    try {
      const userId = parseInt(selectedUserId)
      await api.patch(`/admin/users/${userId}`, {
        user_role: 'admin',
      })
      await loadAdmins()
      setSelectedUserId(null)
    } catch (error) {
      console.error('Error adding admin:', error)
    }
  }

  const handleRemoveAdmin = async (userId: number) => {
    try {
      // Remove admin role - set to member (admin was likely trained)
      await api.patch(`/admin/users/${userId}`, {
        user_role: 'member',
      })
      await loadAdmins()
    } catch (error) {
      console.error('Error removing admin:', error)
    }
  }

  const columns: TableColumnConfig<User>[] = [
    {
      id: 'telegram_id',
      name: t('users.telegram_id'),
      template: (item) => <Text variant="code-inline-1">{item.telegram_id}</Text>,
    },
    {
      id: 'username',
      name: t('users.username'),
      template: (item) => (
        <Text>{item.username ? `@${item.username}` : '-'}</Text>
      ),
    },
    {
      id: 'status',
      name: t('users.status'),
      template: (item) => {
        if (!item.status) {
          console.warn('User item missing status:', item)
          return <Label theme="info" value="-" />
        }
        const statusLabels: Record<string, string> = {
          new: t('users.status_new'),
          onboarding: t('users.status_onboarding'),
          training: t('users.status_training'),
          trained: t('users.status_trained'),
          active: t('users.status_active'),
          churned: t('users.status_churned'),
        }
        const themeMap: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
          new: 'info',
          onboarding: 'info',
          training: 'warning',
          trained: 'success',
          active: 'success',
          churned: 'danger',
        }
        const statusValue = String(item.status).toLowerCase()
        return (
          <Label
            theme={themeMap[statusValue] || 'info'}
            value={statusLabels[statusValue] || item.status}
          />
        )
      },
    },
    {
      id: 'user_role',
      name: t('users.user_role'),
      template: (item) => {
        if (!item.user_role) {
          console.warn('User item missing user_role:', item)
          return <Label theme="info" value="-" />
        }
        const roleLabels: Record<string, string> = {
          guest: t('users.role_guest'),
          member: t('users.role_member'),
          admin: t('users.role_admin'),
        }
        const themeMap: Record<string, 'success' | 'warning' | 'info'> = {
          guest: 'info',
          member: 'warning',
          admin: 'success',
        }
        const roleValue = String(item.user_role).toLowerCase()
        return (
          <Label
            theme={themeMap[roleValue] || 'info'}
            value={roleLabels[roleValue] || item.user_role}
          />
        )
      },
    },
    {
      id: 'language',
      name: t('users.language'),
      template: (item) => <Text>{item.language}</Text>,
    },
    {
      id: 'bonus_channels_count',
      name: t('users.bonus_channels'),
      template: (item) => <Text>{item.bonus_channels_count}</Text>,
    },
    {
      id: 'last_activity_at',
      name: t('users.last_activity'),
      template: (item) => (
        <Text>
          {item.last_activity_at
            ? new Date(item.last_activity_at).toLocaleString(language === 'en' ? 'en-US' : 'ru-RU')
            : '-'}
        </Text>
      ),
    },
  ]

  const adminColumns: TableColumnConfig<User>[] = [
    {
      id: 'name',
      name: t('users.username'),
      template: (item) => <Text>{formatUserName(item)}</Text>,
    },
    {
      id: 'telegram_id',
      name: t('users.telegram_id'),
      template: (item) => <Text variant="code-inline-1">{item.telegram_id}</Text>,
    },
    {
      id: 'actions',
      name: '',
      template: (item) => (
        <Button
          view="flat-danger"
          size="s"
          onClick={() => handleRemoveAdmin(item.id)}
        >
          {t('users.remove_admin')}
        </Button>
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

      {/* Admin Management Section */}
      <div className="users-section">
        <Text variant="header-2" className="users-section-title">
          {t('users.admins_section')}
        </Text>

        <div className="users-admins-controls">
          <Select
            value={selectedUserId ? [selectedUserId] : []}
            onUpdate={(value) => {
              const userId = value[0] || null
              setSelectedUserId(userId)
            }}
            filterable
            onFilterChange={handleUserSearchChange}
            onOpenChange={(open) => {
              if (open && allUsers.length === 0) {
                handleSelectOpen()
              }
            }}
            placeholder={t('users.select_user')}
            options={selectOptions}
            loading={allUsersLoading}
            className="users-admin-select"
          />
          <Button
            view="action"
            onClick={handleAddAdmin}
            disabled={!selectedUserId}
            className="users-admin-add-button"
          >
            {t('users.add_admin')}
          </Button>
        </div>

        <div className="users-admins-table-wrapper">
          {adminsLoading ? (
            <Loader size="m" />
          ) : (
            <>
              <Text variant="subheader-1" className="users-admins-list-title">
                {t('users.admins_list')}
              </Text>
              <Table data={admins} columns={adminColumns} className="users-admins-table" />
            </>
          )}
        </div>
      </div>

      {/* Users Table Section */}
      <div className="users-section">
        <Text variant="header-2" className="users-section-title">
          {t('users.users_list')}
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
    </div>
  )
}

export default Users
