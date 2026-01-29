import React, { useEffect } from 'react'
import { Card, Text, Loader } from '@gravity-ui/uikit'
import { api } from '../services/api'
import { ABTestResults } from '../types'
import { useLanguage } from '../context/LanguageContext'
import { useDataLoader } from '../hooks/useDataLoader'
import './ABTesting.css'

const ABTesting: React.FC = () => {
  const { data: abTestData, loading, load: loadABTestData } = useDataLoader<ABTestResults>()
  const { t } = useLanguage()

  useEffect(() => {
    loadABTestData(async () => {
      const response = await api.get<ABTestResults>('/ab-testing/results')
      return response.data
    })
  }, [loadABTestData])

  if (loading) {
    return (
      <div className="ab-testing-loading">
        <Loader size="l" />
      </div>
    )
  }

  if (!abTestData) {
    return <Text>{t('common.error_loading')}</Text>
  }

  return (
    <div className="ab-testing">
      <Text variant="header-1" className="ab-testing-title">
        {t('page.ab_testing.title')}
      </Text>

      <Card className="ab-testing-info">
        <Text variant="body-2" color="secondary">
          {t('ab_testing.info')}
        </Text>
      </Card>

      <div className="ab-testing-variants">
        {Object.entries(abTestData.variants).map(([name, variant]) => (
          <Card
            key={name}
            className={`ab-testing-variant ${name === 'control' ? 'variant-control' : 'variant-treatment'}`}
          >
            <div className="ab-testing-variant-header">
              <Text variant="header-2">
                {name === 'control' ? t('ab_testing.control') : t('ab_testing.treatment')}
              </Text>
              <Text variant="caption-1" color="secondary">
                {variant.algorithm}
              </Text>
            </div>
            <div className="ab-testing-variant-stats">
              <div className="ab-testing-stat">
                <Text variant="caption-1" color="secondary">
                  {t('ab_testing.users')}
                </Text>
                <Text variant="body-1" style={{ fontWeight: 500 }}>
                  {variant.users}
                </Text>
              </div>
              <div className="ab-testing-stat">
                <Text variant="caption-1" color="secondary">
                  {t('ab_testing.trained')}
                </Text>
                <Text variant="body-1" style={{ fontWeight: 500 }}>
                  {variant.trained}
                </Text>
              </div>
              <div className="ab-testing-stat">
                <Text variant="caption-1" color="secondary">
                  {t('ab_testing.post_training')}
                </Text>
                <Text variant="body-1" style={{ fontWeight: 500 }}>
                  {variant.post_training_interactions || 0}
                </Text>
              </div>
              <div className="ab-testing-stat">
                <Text variant="caption-1" color="secondary">
                  {t('ab_testing.like_rate')}
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
                    : t('common.not_available')}
                </Text>
              </div>
            </div>
            {variant.note && (
              <Text variant="caption-1" color="secondary" className="ab-testing-note">
                {variant.note === 'No trained users for comparison' 
                  ? t('ab_testing.no_trained_users')
                  : variant.note}
              </Text>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ABTesting
