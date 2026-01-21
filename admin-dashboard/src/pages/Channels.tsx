import React, { useEffect, useState } from 'react'
import { Table, Text, Loader, Pagination, Label, Link } from '@gravity-ui/uikit'
import { api } from '../services/api'
import { Channel } from '../types'
import type { TableColumnConfig } from '@gravity-ui/uikit'
import './Channels.css'

const Channels: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 50

  useEffect(() => {
    loadChannels()
  }, [page])

  const loadChannels = async () => {
    try {
      setLoading(true)
      const skip = (page - 1) * pageSize
      const response = await api.get<{ total: number; channels: Channel[] }>('/admin/channels', {
        params: { skip, limit: pageSize },
      })
      setChannels(response.data.channels)
      setTotal(response.data.total)
    } catch (error) {
      console.error('Error loading channels:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns: TableColumnConfig<Channel>[] = [
    {
      id: 'username',
      name: 'Канал',
      template: (item) => (
        <div>
          <Link href={`https://t.me/${item.username}`} target="_blank">
            @{item.username}
          </Link>
          <Text variant="caption-1" color="secondary">
            {item.title}
          </Text>
        </div>
      ),
    },
    {
      id: 'posts_count',
      name: 'Постов',
      template: (item) => <Text>{item.posts_count}</Text>,
    },
    {
      id: 'is_default',
      name: 'По умолчанию',
      template: (item) => (
        <Label
          theme={item.is_default ? 'success' : 'normal'}
          value={item.is_default ? 'Да' : 'Нет'}
        />
      ),
    },
  ]

  if (loading && channels.length === 0) {
    return (
      <div className="channels-loading">
        <Loader size="l" />
      </div>
    )
  }

  return (
    <div className="channels">
      <Text variant="header-1" className="channels-title">
        Каналы
      </Text>

      <Table data={channels} columns={columns} className="channels-table" />

      <div className="channels-pagination">
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

export default Channels
