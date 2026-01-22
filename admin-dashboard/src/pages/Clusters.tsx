import React, { useEffect, useState } from 'react'
import { Card, Text, Loader, Button, Table } from '@gravity-ui/uikit'
import { api } from '../services/api'
import { ClusterStats } from '../types'
import type { TableColumnConfig } from '@gravity-ui/uikit'
import { useLanguage } from '../context/LanguageContext'
import './Clusters.css'

const Clusters: React.FC = () => {
  const [clusterStats, setClusterStats] = useState<ClusterStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    loadClusterStats()
  }, [])

  const loadClusterStats = async () => {
    try {
      setLoading(true)
      const response = await api.get<ClusterStats>('/admin/clusters/stats')
      setClusterStats(response.data)
    } catch (error) {
      console.error('Error loading cluster stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRecalculate = async () => {
    try {
      setRecalculating(true)
      await api.post('/admin/clusters/recalculate', { n_clusters: 50 })
      await loadClusterStats()
    } catch (error) {
      console.error('Error recalculating clusters:', error)
    } finally {
      setRecalculating(false)
    }
  }

  if (loading && !clusterStats) {
    return (
      <div className="clusters-loading">
        <Loader size="l" />
      </div>
    )
  }

  if (!clusterStats) {
    return <Text>{t('common.error_loading')}</Text>
  }

  const distributionData = Object.entries(clusterStats.cluster_distribution || {}).map(
    ([clusterId, postCount]) => ({
      cluster_id: parseInt(clusterId),
      post_count: postCount,
    })
  )

  const columns: TableColumnConfig<typeof distributionData[0]>[] = [
    {
      id: 'cluster_id',
      name: t('clusters.cluster_id'),
      template: (item) => <Text>{item.cluster_id}</Text>,
    },
    {
      id: 'post_count',
      name: t('clusters.post_count'),
      template: (item) => <Text>{item.post_count}</Text>,
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
            {t('clusters.total')}
          </Text>
          <Text variant="header-1">{clusterStats.total_clusters}</Text>
        </Card>

        <Card className="cluster-stat-card">
          <Text variant="body-1" color="secondary">
            {t('clusters.posts_in_clusters')}
          </Text>
          <Text variant="header-1">{clusterStats.posts_with_clusters}</Text>
        </Card>

        <Card className="cluster-stat-card">
          <Text variant="body-1" color="secondary">
            {t('clusters.unclustered_posts')}
          </Text>
          <Text variant="header-1">{clusterStats.total_posts - clusterStats.posts_with_clusters}</Text>
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
