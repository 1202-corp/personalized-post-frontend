import React, { useEffect } from 'react'
import { Card, Text, Loader } from '@gravity-ui/uikit'
import { api } from '../services/api'
import { DashboardData } from '../types'
import { useLanguage } from '../context/LanguageContext'
import { useDataLoader } from '../hooks/useDataLoader'
import './Dashboard.css'

const Dashboard: React.FC = () => {
  const { data: dashboardData, loading, load } = useDataLoader<DashboardData>()
  const { t } = useLanguage()

  useEffect(() => {
    load(async () => {
      const dashboardRes = await api.get<DashboardData>('/analytics/dashboard')
      return dashboardRes.data
    })
  }, [load])

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loader size="l" />
      </div>
    )
  }

  if (!dashboardData) {
    return <Text>{t('common.error_loading')}</Text>
  }

  const { overview, recommendations } = dashboardData

  return (
    <div className="dashboard">
      <Text variant="header-1" className="dashboard-title">
        {t('page.dashboard.title')}
      </Text>

      {/* Overview Stats */}
      <div className="dashboard-stats">
        <Card className="stat-card">
          <Text variant="body-1" color="secondary">
            {t('dashboard.users')}
          </Text>
          <Text variant="header-1">{overview.users.total}</Text>
          <Text variant="caption-2" color="positive">
            {overview.users.trained} {t('common.trained')} ({overview.users.training_rate}%)
          </Text>
        </Card>

        <Card className="stat-card">
          <Text variant="body-1" color="secondary">
            {t('dashboard.channels')}
          </Text>
          <Text variant="header-1">{overview.channels.total}</Text>
        </Card>

        <Card className="stat-card">
          <Text variant="body-1" color="secondary">
            {t('dashboard.posts')}
          </Text>
          <Text variant="header-1">{overview.posts.total}</Text>
          <Text variant="caption-2" color="secondary">
            {recommendations.posts_with_scores} {t('dashboard.with_ml_scoring')}
          </Text>
        </Card>

        <Card className="stat-card">
          <Text variant="body-1" color="secondary">
            {t('dashboard.interactions')}
          </Text>
          <Text variant="header-1">{overview.interactions.total}</Text>
          <Text variant="caption-2" color="positive">
            {overview.interactions.like_rate}% {t('dashboard.like_rate')}
          </Text>
        </Card>

        <Card className="stat-card">
          <Text variant="body-1" color="secondary">
            {t('dashboard.likes')}
          </Text>
          <Text variant="header-1" color="positive">
            {overview.interactions.likes}
          </Text>
        </Card>

        <Card className="stat-card">
          <Text variant="body-1" color="secondary">
            {t('dashboard.dislikes')}
          </Text>
          <Text variant="header-1" color="danger">
            {overview.interactions.dislikes}
          </Text>
        </Card>
      </div>

      {/* ML Metrics */}
      <div className="dashboard-metrics">
        <Card className="metric-card metric-card-green">
          <Text variant="header-2" color="positive">
            {recommendations.avg_liked_score.toFixed(4)}
          </Text>
          <Text variant="body-2" color="secondary">
            {t('dashboard.avg_score_liked')}
          </Text>
          <Text variant="caption-1" color="secondary">
            {t('dashboard.avg_score_liked_desc')}
          </Text>
        </Card>

        <Card className="metric-card metric-card-red">
          <Text variant="header-2" color="danger">
            {recommendations.avg_disliked_score.toFixed(4)}
          </Text>
          <Text variant="body-2" color="secondary">
            {t('dashboard.avg_score_disliked')}
          </Text>
          <Text variant="caption-1" color="secondary">
            {t('dashboard.avg_score_disliked_desc')}
          </Text>
        </Card>

        <Card className="metric-card metric-card-blue">
          <Text variant="header-2" color="info">
            {recommendations.score_difference.toFixed(4)}
          </Text>
          <Text variant="body-2" color="secondary">
            {t('dashboard.score_difference')}
          </Text>
          <Text variant="caption-1" color="secondary">
            {t('dashboard.score_difference_desc')}
          </Text>
        </Card>

        <Card className="metric-card metric-card-purple">
          <Text variant="header-2" color="utility">
            {recommendations.scoring_coverage}%
          </Text>
          <Text variant="body-2" color="secondary">
            {t('dashboard.ml_coverage')}
          </Text>
          <Text variant="caption-1" color="secondary">
            {t('dashboard.ml_coverage_desc')}
          </Text>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
