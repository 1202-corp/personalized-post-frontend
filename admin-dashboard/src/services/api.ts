import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios'
import { LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10300/api/v1'

class ApiClient {
  private client: AxiosInstance
  private refreshTokenPromise: Promise<string> | null = null

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add access token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const accessToken = localStorage.getItem('access_token')
        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        // If 401 and haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          // Try to refresh token
          try {
            const newAccessToken = await this.refreshAccessToken()
            if (newAccessToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
              return this.client(originalRequest)
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  private async refreshAccessToken(): Promise<string | null> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise
    }

    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      return null
    }

    this.refreshTokenPromise = (async () => {
      try {
        const response = await axios.post<RefreshTokenResponse>(
          `${API_BASE_URL}/admin/auth/refresh`,
          { refresh_token: refreshToken } as RefreshTokenRequest
        )
        const newAccessToken = response.data.access_token
        localStorage.setItem('access_token', newAccessToken)
        return newAccessToken
      } catch (error) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        throw error
      } finally {
        this.refreshTokenPromise = null
      }
    })()

    return this.refreshTokenPromise
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/admin/auth/login', credentials)
    return response.data
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await this.client.post<RefreshTokenResponse>('/admin/auth/refresh', {
      refresh_token: refreshToken,
    } as RefreshTokenRequest)
    return response.data
  }

  getClient(): AxiosInstance {
    return this.client
  }
}

export const apiClient = new ApiClient()
export const api = apiClient.getClient()
