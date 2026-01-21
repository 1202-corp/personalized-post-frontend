import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, TextInput, Card, Text } from '@gravity-ui/uikit'
import { useAuth } from '../context/AuthContext'
import './Login.css'

const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login({ username, password })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка входа. Проверьте учетные данные.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card" view="raised">
        <div className="login-content">
          <Text variant="header-1" className="login-title">
            PPB Admin Dashboard
          </Text>
          <Text variant="body-1" className="login-subtitle">
            Войдите в систему управления
          </Text>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error">
                <Text color="danger">{error}</Text>
              </div>
            )}

            <TextInput
              label="Имя пользователя"
              placeholder="Введите имя пользователя"
              value={username}
              onUpdate={setUsername}
              size="l"
              disabled={loading}
            />

            <TextInput
              label="Пароль"
              type="password"
              placeholder="Введите пароль"
              value={password}
              onUpdate={setPassword}
              size="l"
              disabled={loading}
            />

            <Button
              type="submit"
              view="action"
              size="l"
              width="max"
              loading={loading}
              disabled={!username || !password}
            >
              Войти
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}

export default Login
