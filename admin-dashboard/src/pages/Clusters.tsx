import React, { useEffect, useMemo, useState } from 'react'
import { Card, Text, Loader, Table, Label } from '@gravity-ui/uikit'
import { api } from '../services/api'
import { TasteClusterStats } from '../types'
import type { TableColumnConfig } from '@gravity-ui/uikit'
import { useLanguage } from '../context/LanguageContext'
import { useDataLoader } from '../hooks/useDataLoader'
import './Clusters.css'

type DistributionItem = TasteClusterStats['cluster_distribution'][number]

const Clusters: React.FC = () => {
  const { data: stats, loading, load: loadStats } = useDataLoader<TasteClusterStats>()
  const [recalculating, setRecalculating] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    loadStats(async () => {
      const response = await api.get<TasteClusterStats>('/admin/clusters/stats')
      return response.data
    })
  }, [loadStats])

  const handleRecalculate = async () => {
    try {
      setRecalculating(true)
      await api.post('/admin/clusters/recalculate')
      await loadStats(async () => {
        const response = await api.get<TasteClusterStats>('/admin/clusters/stats')
        return response.data
      })
    } catch (error) {
      console.error('Error recalculating taste clusters:', error)
    } finally {
      setRecalculating(false)
    }
  }

  const byChannelSummary = useMemo(() => {
    const dist = stats?.cluster_distribution || []
    const byChannel: Record<string | number, { channelLabel: string; clusters: number; users: number }> = {}
    const legacyKey = '__legacy__'
    for (const item of dist) {
      const cid = item.channel_id
      const key = cid == null ? legacyKey : cid
      const channelLabel =
        cid == null
          ? t('clusters.channel_legacy')
          : item.channel_title || item.channel_username || `@${item.channel_username || '?'}` || `#${cid}`
      if (!byChannel[key]) {
        byChannel[key] = { channelLabel, clusters: 0, users: 0 }
      }
      byChannel[key].clusters += 1
      byChannel[key].users += item.user_count ?? 0
    }
    return Object.entries(byChannel).map(([key, v]) => ({
      key,
      ...v,
      isLegacy: key === legacyKey,
    }))
  }, [stats?.cluster_distribution, t])

  if (loading && !stats) {
    return (
      <div className="clusters-loading">
        <Loader size="l" />
      </div>
    )
  }

  if (!stats) {
    return <Text>{t('common.error_loading')}</Text>
  }

  const distributionData = stats.cluster_distribution || []

  const columns: TableColumnConfig<DistributionItem>[] = [
    {
      id: 'cluster_id',
      name: t('clusters.cluster_id'),
      template: (item) => <Text>{item.cluster_id}</Text>,
    },
    {
      id: 'channel',
      name: t('clusters.channel'),
      template: (item) => {
        if (item.channel_id == null) {
          return <Label theme="warning">{t('clusters.channel_legacy')}</Label>
        }
        const label = item.channel_title || (item.channel_username ? `@${item.channel_username}` : null) || `#${item.channel_id}`
        return <Text>{label}</Text>
      },
    },
    {
      id: 'user_count',
      name: t('clusters.user_count'),
      template: (item) => <Text>{item.user_count}</Text>,
    },
  ]

  return (
    <div className="clusters">
      <div className="clusters-header">
        <Text variant="header-1" className="clusters-title">
          {t('page.clusters.title')}
        </Text>
        <button
          className="btn-reset btn-primary"
          onClick={handleRecalculate}
          disabled={recalculating}
        >
          {recalculating ? t('common.loading') : t('clusters.recalculate')}
        </button>
      </div>

      <Card className="clusters-info">
        <Text variant="body-2" color="secondary">
          {t('clusters.info_per_channel')}
        </Text>
      </Card>

      <div className="clusters-stats">
        <Card className="cluster-stat-card">
          <Text variant="body-1" color="secondary">
            {t('clusters.num_clusters')}
          </Text>
          <Text variant="header-1">{stats.num_clusters}</Text>
        </Card>

        <Card className="cluster-stat-card">
          <Text variant="body-1" color="secondary">
            {t('clusters.channels_with_clusters')}
          </Text>
          <Text variant="header-1">{byChannelSummary.length}</Text>
        </Card>

        <Card className="cluster-stat-card">
          <Text variant="body-1" color="secondary">
            {t('clusters.total_users')}
          </Text>
          <Text variant="header-1">{stats.total_users}</Text>
        </Card>

        <Card className="cluster-stat-card">
          <Text variant="body-1" color="secondary">
            {t('clusters.users_in_clusters')}
          </Text>
          <Text variant="header-1">{stats.users_with_taste_cluster}</Text>
        </Card>

        <Card className="cluster-stat-card">
          <Text variant="body-1" color="secondary">
            {t('clusters.users_without_cluster')}
          </Text>
          <Text variant="header-1">{stats.users_without_taste_cluster}</Text>
        </Card>

        <Card className="cluster-stat-card">
          <Text variant="body-1" color="secondary">
            {t('clusters.avg_users_per_cluster')}
          </Text>
          <Text variant="header-1">{stats.avg_users_per_cluster}</Text>
        </Card>

        <Card className="cluster-stat-card">
          <Text variant="body-1" color="secondary">
            {t('clusters.max_users_in_cluster')}
          </Text>
          <Text variant="header-1">{stats.max_users_in_cluster}</Text>
        </Card>
      </div>

      {byChannelSummary.length > 0 && (
        <Card className="clusters-by-channel">
          <Text variant="header-2" className="distribution-title">
            {t('clusters.by_channel_title')}
          </Text>
          <div className="clusters-by-channel-grid">
            {byChannelSummary.map(({ key, channelLabel, clusters, users, isLegacy }) => (
              <Card key={key} className="cluster-channel-card">
                <Text variant="body-2" color="secondary">
                  {isLegacy ? t('clusters.channel_legacy') : channelLabel}
                </Text>
                <div className="cluster-channel-card-stats">
                  <Text variant="header-2">{clusters}</Text>
                  <Text variant="body-2" color="secondary">{t('clusters.clusters_short')}</Text>
                  <Text variant="header-2">{users}</Text>
                  <Text variant="body-2" color="secondary">{t('clusters.users_short')}</Text>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      <Card className="clusters-distribution">
        <Text variant="header-2" className="distribution-title">
          {t('clusters.distribution_title')}
        </Text>
        <Table data={distributionData} columns={columns} />
      </Card>
    </div>
  )
}

export default Clusters
