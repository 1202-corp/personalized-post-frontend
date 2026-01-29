import React, { useEffect, useState } from 'react'
import { Card, Text, Loader, Button, Table } from '@gravity-ui/uikit'
import { api } from '../services/api'
import { TasteClusterStats } from '../types'
import type { TableColumnConfig } from '@gravity-ui/uikit'
import { useLanguage } from '../context/LanguageContext'
import { useDataLoader } from '../hooks/useDataLoader'
import './Clusters.css'

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

  const columns: TableColumnConfig<typeof distributionData[0]>[] = [
    {
      id: 'cluster_id',
      name: t('clusters.cluster_id'),
      template: (item) => <Text>{item.cluster_id}</Text>,
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
        <Button
          view="action"
          size="l"
          onClick={handleRecalculate}
          loading={recalculating}
        >
          {t('clusters.recalculate')}
        </Button>
      </div>

      <div className="clusters-stats">
        <Card className="cluster-stat-card">
          <Text variant="body-1" color="secondary">
            {t('clusters.num_clusters')}
          </Text>
          <Text variant="header-1">{stats.num_clusters}</Text>
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
