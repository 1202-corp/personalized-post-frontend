import React, { useEffect, useState, useMemo } from 'react'
import { Table, Text, Loader, Pagination, Label, Link } from '@gravity-ui/uikit'
import { api } from '../services/api'
import { Channel } from '../types'
import type { TableColumnConfig } from '@gravity-ui/uikit'
import { useLanguage } from '../context/LanguageContext'
import './Channels.css'

const Channels: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 50
  const { t } = useLanguage()
  const [dataFetchTime, setDataFetchTime] = useState(Date.now())
  const [currentTime, setCurrentTime] = useState(Date.now())

  // Update current time every second to refresh TTL display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTTL = (seconds: number | null): string => {
    if (seconds === null) {
      return t('channels.posts_ttl_no_posts')
    }
    if (seconds <= 0) {
      return t('channels.posts_ttl_expired')
    }
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м`
    } else if (minutes > 0) {
      return `${minutes}м ${secs}с`
    } else {
      return `${secs}с`
    }
  }

  // Calculate current TTL for each channel based on elapsed time since data fetch
  const channelsWithCurrentTTL = useMemo(() => {
    const elapsedSeconds = Math.floor((currentTime - dataFetchTime) / 1000)
    return channels.map(channel => {
      if (channel.posts_ttl_remaining_seconds === null) {
        return { ...channel, currentTTL: null }
      }
      const currentTTL = Math.max(0, channel.posts_ttl_remaining_seconds - elapsedSeconds)
      return { ...channel, currentTTL }
    })
  }, [channels, currentTime, dataFetchTime])

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
      setDataFetchTime(Date.now()) // Update fetch time for TTL calculation
    } catch (error) {
      console.error('Error loading channels:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns: TableColumnConfig<Channel>[] = [
    {
      id: 'username',
      name: t('channels.channel'),
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
      name: t('channels.posts'),
      template: (item) => <Text>{item.posts_count}</Text>,
    },
    {
      id: 'posts_ttl',
      name: t('channels.posts_ttl'),
      template: (item: Channel & { currentTTL?: number | null }) => {
        const ttlSeconds = item.currentTTL !== undefined ? item.currentTTL : item.posts_ttl_remaining_seconds
        const ttlText = formatTTL(ttlSeconds)
        const isExpired = ttlSeconds !== null && ttlSeconds <= 0
        const hasNoPosts = ttlSeconds === null
        
        if (hasNoPosts) {
          return <Text color="secondary">{ttlText}</Text>
        }
        
        return (
          <Label theme={isExpired ? 'danger' : 'success'}>
            {ttlText}
          </Label>
        )
      },
    },
    {
      id: 'is_default',
      name: t('channels.default'),
      template: (item) => (
        <Label theme={item.is_default ? 'success' : 'normal'}>
          {item.is_default ? t('channels.default_yes') : t('channels.default_no')}
        </Label>
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
        {t('page.channels.title')}
      </Text>

      <Table data={channelsWithCurrentTTL} columns={columns} className="channels-table" />

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
