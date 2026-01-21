import React, { useEffect, useState } from 'react'
import { Card, Text, Loader } from '@gravity-ui/uikit'
import { api } from '../services/api'
import { DashboardData, ABTestResults } from '../types'
import './Dashboard.css'

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [abTestData, setAbTestData] = useState<ABTestResults | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [dashboardRes, abTestRes] = await Promise.all([
        api.get<DashboardData>('/analytics/dashboard'),
        api.get<ABTestResults>('/ab-testing/results'),
      ])
      setDashboardData(dashboardRes.data)
      setAbTestData(abTestRes.data)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loader size="l" />
      </div>
    )
  }

  if (!dashboardData) {
    return <Text>Ошибка загрузки данных</Text>
  }

  const { overview, recommendations } = dashboardData

  return (
    <div className="dashboard">
      <Text variant="header-1" className="dashboard-title">
        Dashboard
      </Text>

      {/* Overview Stats */}
      <div className="dashboard-stats">
        <Card className="stat-card">
          <Text variant="body-1" color="secondary">
            Пользователей
          </Text>
          <Text variant="header-1">{overview.users.total}</Text>
          <Text variant="caption-2" color="positive">
            {overview.users.trained} обучено ({overview.users.training_rate}%)
          </Text>
        </Card>

        <Card className="stat-card">
          <Text variant="body-1" color="secondary">
            Каналов
          </Text>
          <Text variant="header-1">{overview.channels.total}</Text>
        </Card>

        <Card className="stat-card">
          <Text variant="body-1" color="secondary">
            Постов
          </Text>
          <Text variant="header-1">{overview.posts.total}</Text>
          <Text variant="caption-2" color="secondary">
            {recommendations.posts_with_scores} с ML-скорингом
          </Text>
        </Card>

        <Card className="stat-card">
          <Text variant="body-1" color="secondary">
            Оценок
          </Text>
          <Text variant="header-1">{overview.interactions.total}</Text>
          <Text variant="caption-2" color="positive">
            {overview.interactions.like_rate}% like rate
          </Text>
        </Card>

        <Card className="stat-card">
          <Text variant="body-1" color="secondary">
            Лайков
          </Text>
          <Text variant="header-1" color="positive">
            {overview.interactions.likes}
          </Text>
        </Card>

        <Card className="stat-card">
          <Text variant="body-1" color="secondary">
            Дизлайков
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
            Avg Score (liked)
          </Text>
          <Text variant="caption-1" color="secondary">
            Средний скор лайкнутых
          </Text>
        </Card>

        <Card className="metric-card metric-card-red">
          <Text variant="header-2" color="danger">
            {recommendations.avg_disliked_score.toFixed(4)}
          </Text>
          <Text variant="body-2" color="secondary">
            Avg Score (disliked)
          </Text>
          <Text variant="caption-1" color="secondary">
            Средний скор дизлайкнутых
          </Text>
        </Card>

        <Card className="metric-card metric-card-blue">
          <Text variant="header-2" color="info">
            {recommendations.score_difference.toFixed(4)}
          </Text>
          <Text variant="body-2" color="secondary">
            Score Difference
          </Text>
          <Text variant="caption-1" color="secondary">
            Разница (чем больше - лучше)
          </Text>
        </Card>

        <Card className="metric-card metric-card-purple">
          <Text variant="header-2" color="utility">
            {recommendations.scoring_coverage}%
          </Text>
          <Text variant="body-2" color="secondary">
            ML Coverage
          </Text>
          <Text variant="caption-1" color="secondary">
            % постов с скорингом
          </Text>
        </Card>
      </div>

      {/* A/B Testing */}
      {abTestData && (
        <Card className="ab-test-section">
          <Text variant="header-2" className="section-title">
            A/B Тестирование алгоритмов
          </Text>
          <Text variant="body-2" color="secondary" className="section-subtitle">
            Сравнение эффективности разных алгоритмов рекомендаций. Юзеры автоматически
            распределяются по вариантам.
          </Text>

          <div className="ab-test-variants">
            {Object.entries(abTestData.variants).map(([name, variant]) => (
              <Card
                key={name}
                className={`ab-test-variant ${name === 'control' ? 'variant-control' : 'variant-treatment'}`}
              >
                <div className="ab-test-variant-header">
                  <Text variant="body-1" style={{ fontWeight: 500 }}>
                    {name}
                  </Text>
                  <Text variant="caption-1" color="secondary">
                    {variant.algorithm}
                  </Text>
                </div>
                <div className="ab-test-variant-stats">
                  <div>
                    <Text variant="caption-1" color="secondary">
                      Юзеры:
                    </Text>
                    <Text variant="body-2" style={{ fontWeight: 500 }}>
                      {variant.users}
                    </Text>
                  </div>
                  <div>
                    <Text variant="caption-1" color="secondary">
                      Обучено:
                    </Text>
                    <Text variant="body-2" style={{ fontWeight: 500 }}>
                      {variant.trained}
                    </Text>
                  </div>
                  <div>
                    <Text variant="caption-1" color="secondary">
                      Post-training:
                    </Text>
                    <Text variant="body-2" style={{ fontWeight: 500 }}>
                      {variant.post_training_interactions || 0}
                    </Text>
                  </div>
                  <div>
                    <Text variant="caption-1" color="secondary">
                      Like rate:
                    </Text>
                    <Text
                      variant="body-2"
                      style={{ fontWeight: 700 }}
                      color={
                        variant.like_rate && variant.like_rate >= 50
                          ? 'positive'
                          : variant.post_training_interactions > 0
                          ? 'danger'
                          : 'secondary'
                      }
                    >
                      {variant.post_training_interactions > 0
                        ? `${variant.like_rate}%`
                        : 'N/A'}
                    </Text>
                  </div>
                </div>
                {variant.note && (
                  <Text variant="caption-1" color="secondary" className="ab-test-note">
                    {variant.note}
                  </Text>
                )}
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default Dashboard
