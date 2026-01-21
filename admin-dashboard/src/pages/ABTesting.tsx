import React, { useEffect, useState } from 'react'
import { Card, Text, Loader } from '@gravity-ui/uikit'
import { api } from '../services/api'
import { ABTestResults } from '../types'
import { useLanguage } from '../context/LanguageContext'
import './ABTesting.css'

const ABTesting: React.FC = () => {
  const [abTestData, setAbTestData] = useState<ABTestResults | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    loadABTestData()
  }, [])

  const loadABTestData = async () => {
    try {
      const response = await api.get<ABTestResults>('/ab-testing/results')
      setAbTestData(response.data)
    } catch (error) {
      console.error('Error loading AB test data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="ab-testing-loading">
        <Loader size="l" />
      </div>
    )
  }

  if (!abTestData) {
    return <Text>Ошибка загрузки данных</Text>
  }

  return (
    <div className="ab-testing">
      <Text variant="header-1" className="ab-testing-title">
        {t('page.ab_testing.title')}
      </Text>

      <Card className="ab-testing-info">
        <Text variant="body-2" color="secondary">
          Сравнение эффективности разных алгоритмов рекомендаций. Юзеры автоматически
          распределяются по вариантам (50/50 по хешу user_id). control = cosine similarity,
          treatment_a = hybrid (cosine + recency). Like rate показывает какой алгоритм лучше
          предсказывает предпочтения.
        </Text>
      </Card>

      <div className="ab-testing-variants">
        {Object.entries(abTestData.variants).map(([name, variant]) => (
          <Card
            key={name}
            className={`ab-testing-variant ${name === 'control' ? 'variant-control' : 'variant-treatment'}`}
          >
            <div className="ab-testing-variant-header">
              <Text variant="header-2">{name}</Text>
              <Text variant="caption-1" color="secondary">
                {variant.algorithm}
              </Text>
            </div>
            <div className="ab-testing-variant-stats">
              <div className="ab-testing-stat">
                <Text variant="caption-1" color="secondary">
                  Юзеры:
                </Text>
                <Text variant="body-1" style={{ fontWeight: 500 }}>
                  {variant.users}
                </Text>
              </div>
              <div className="ab-testing-stat">
                <Text variant="caption-1" color="secondary">
                  Обучено:
                </Text>
                <Text variant="body-1" style={{ fontWeight: 500 }}>
                  {variant.trained}
                </Text>
              </div>
              <div className="ab-testing-stat">
                <Text variant="caption-1" color="secondary">
                  Post-training:
                </Text>
                <Text variant="body-1" style={{ fontWeight: 500 }}>
                  {variant.post_training_interactions || 0}
                </Text>
              </div>
              <div className="ab-testing-stat">
                <Text variant="caption-1" color="secondary">
                  Like rate:
                </Text>
                <Text
                  variant="body-1"
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
              <Text variant="caption-1" color="secondary" className="ab-testing-note">
                {variant.note}
              </Text>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ABTesting
