export type Lang = 'ru' | 'en'

export const translations: Record<Lang, Record<string, string>> = {
  ru: {
    // common
    'common.logout': 'Выйти',
    'common.login': 'Войти',
    'common.loading': 'Загрузка…',
    'common.error_loading': 'Ошибка загрузки данных',

    // header
    'header.title': 'PPP Admin',

    // sidebar
    'nav.dashboard': 'Dashboard',
    'nav.users': 'Пользователи',
    'nav.channels': 'Каналы',
    'nav.ab_testing': 'A/B Testing',
    'nav.clusters': 'Кластеры',

    // pages
    'page.dashboard.title': 'Dashboard',
    'page.users.title': 'Пользователи',
    'page.channels.title': 'Каналы',
    'page.ab_testing.title': 'A/B Тестирование',
    'page.clusters.title': 'Кластеры',

    // login
    'login.title': 'PPP Admin Dashboard',
    'login.subtitle': 'Войдите в систему управления',
    'login.username': 'Имя пользователя',
    'login.username_placeholder': 'Введите имя пользователя',
    'login.password': 'Пароль',
    'login.password_placeholder': 'Введите пароль',
    'login.error_fallback': 'Ошибка входа. Проверьте учетные данные.',
  },
  en: {
    // common
    'common.logout': 'Logout',
    'common.login': 'Sign in',
    'common.loading': 'Loading…',
    'common.error_loading': 'Failed to load data',

    // header
    'header.title': 'PPP Admin',

    // sidebar
    'nav.dashboard': 'Dashboard',
    'nav.users': 'Users',
    'nav.channels': 'Channels',
    'nav.ab_testing': 'A/B Testing',
    'nav.clusters': 'Clusters',

    // pages
    'page.dashboard.title': 'Dashboard',
    'page.users.title': 'Users',
    'page.channels.title': 'Channels',
    'page.ab_testing.title': 'A/B Testing',
    'page.clusters.title': 'Clusters',

    // login
    'login.title': 'PPP Admin Dashboard',
    'login.subtitle': 'Sign in to the admin panel',
    'login.username': 'Username',
    'login.username_placeholder': 'Enter username',
    'login.password': 'Password',
    'login.password_placeholder': 'Enter password',
    'login.error_fallback': 'Login failed. Check your credentials.',
  },
}


