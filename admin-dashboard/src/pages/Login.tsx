import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TextInput, Card, Text } from '@gravity-ui/uikit'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import './Login.css'

const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login({ username, password })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || t('login.error_fallback'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card" view="raised">
        <div className="login-content">
          <Text variant="header-1" className="login-title">
            {t('login.title')}
          </Text>
          <Text variant="body-1" className="login-subtitle">
            {t('login.subtitle')}
          </Text>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error">
                <Text color="danger">{error}</Text>
              </div>
            )}

            <TextInput
              label={t('login.username')}
              placeholder={t('login.username_placeholder')}
              value={username}
              onUpdate={setUsername}
              disabled={loading}
            />

            <TextInput
              label={t('login.password')}
              type="password"
              placeholder={t('login.password_placeholder')}
              value={password}
              onUpdate={setPassword}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={!username || !password || loading}
              className="btn-reset btn-primary btn-full btn-flat-large login-submit-button"
            >
              {t('common.login')}
            </button>
          </form>
        </div>
      </Card>
    </div>
  )
}

export default Login
