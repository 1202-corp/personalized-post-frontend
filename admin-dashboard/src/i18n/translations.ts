export type Lang = 'ru' | 'en'

export const translations: Record<Lang, Record<string, string>> = {
  ru: {
    // common
    'common.logout': 'Выйти',
    'common.login': 'Войти',
    'common.loading': 'Загрузка…',
    'common.error_loading': 'Ошибка загрузки данных',
    'common.trained': 'обучено',
    'common.users': 'Пользователи',
    'common.posts': 'Постов',
    'common.status': 'Статус',
    'common.language': 'Язык',
    'common.last_activity': 'Последняя активность',
    'common.not_available': 'Н/Д',

    // header
    'header.title': 'PPP Admin',

    // sidebar
    'nav.dashboard': 'Панель',
    'nav.users': 'Пользователи',
    'nav.channels': 'Каналы',
    'nav.ab_testing': 'A/B Тестирование',
    'nav.clusters': 'Кластеры',

    // pages
    'page.dashboard.title': 'Панель управления',
    'page.users.title': 'Пользователи',
    'page.channels.title': 'Каналы',
    'page.ab_testing.title': 'A/B Тестирование',
    'page.clusters.title': 'Кластеры постов',

    // dashboard
    'dashboard.users': 'Пользователей',
    'dashboard.channels': 'Каналов',
    'dashboard.posts': 'Постов',
    'dashboard.interactions': 'Оценок',
    'dashboard.likes': 'Лайков',
    'dashboard.dislikes': 'Дизлайков',
    'dashboard.with_ml_scoring': 'с ML-скорингом',
    'dashboard.like_rate': 'Процент лайков',
    'dashboard.avg_score_liked': 'Средняя оценка (лайки)',
    'dashboard.avg_score_liked_desc': 'Средняя оценка лайкнутых',
    'dashboard.avg_score_disliked': 'Средняя оценка (дизлайки)',
    'dashboard.avg_score_disliked_desc': 'Средняя оценка дизлайкнутых',
    'dashboard.score_difference': 'Разница оценок',
    'dashboard.score_difference_desc': 'Разница (чем больше - лучше)',
    'dashboard.ml_coverage': 'Покрытие ML',
    'dashboard.ml_coverage_desc': '% постов с скорингом',
    'dashboard.ab_testing_title': 'A/B Тестирование алгоритмов',
    'dashboard.ab_testing_desc': 'Сравнение эффективности разных алгоритмов рекомендаций. Пользователи автоматически распределяются по вариантам.',
    'dashboard.ab_users': 'Пользователи:',
    'dashboard.ab_trained': 'Обучено:',
    'dashboard.ab_post_training': 'Post-training:',

    // users
    'users.telegram_id': 'Telegram ID',
    'users.username': 'Username',
    'users.status': 'Статус',
    'users.trained': '✓ Обучен',
    'users.in_progress': '⏳ В процессе',
    'users.language': 'Язык',
    'users.bonus_channels': 'Бонус каналов',
    'users.last_activity': 'Последняя активность',

    // channels
    'channels.channel': 'Канал',
    'channels.posts': 'Постов',
    'channels.default': 'По умолчанию',
    'channels.default_yes': 'Да',
    'channels.default_no': 'Нет',

    // ab testing
    'ab_testing.info': 'Сравнение эффективности разных алгоритмов рекомендаций. Пользователи автоматически распределяются по вариантам (50/50 по хешу user_id). control = cosine similarity, treatment_a = hybrid (cosine + recency). Процент лайков показывает какой алгоритм лучше предсказывает предпочтения.',
    'ab_testing.users': 'Пользователи:',
    'ab_testing.trained': 'Обучено:',
    'ab_testing.post_training': 'Post-training:',
    'ab_testing.like_rate': 'Процент лайков:',
    'ab_testing.control': 'Control',
    'ab_testing.treatment': 'Treatment',
    'ab_testing.no_trained_users': 'Нет обученных пользователей для сравнения',

    // clusters
    'clusters.recalculate': 'Пересчитать кластеры',
    'clusters.total': 'Всего кластеров',
    'clusters.posts_in_clusters': 'Постов в кластерах',
    'clusters.unclustered_posts': 'Постов без кластера',
    'clusters.distribution_title': 'Распределение по кластерам',
    'clusters.cluster_id': 'ID кластера',
    'clusters.post_count': 'Количество постов',

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
    'common.trained': 'trained',
    'common.users': 'Users',
    'common.posts': 'Posts',
    'common.status': 'Status',
    'common.language': 'Language',
    'common.last_activity': 'Last activity',
    'common.not_available': 'N/A',

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
    'page.clusters.title': 'Post Clusters',

    // dashboard
    'dashboard.users': 'Users',
    'dashboard.channels': 'Channels',
    'dashboard.posts': 'Posts',
    'dashboard.interactions': 'Interactions',
    'dashboard.likes': 'Likes',
    'dashboard.dislikes': 'Dislikes',
    'dashboard.with_ml_scoring': 'with ML scoring',
    'dashboard.like_rate': 'like rate',
    'dashboard.avg_score_liked': 'Avg Score (liked)',
    'dashboard.avg_score_liked_desc': 'Average score of liked posts',
    'dashboard.avg_score_disliked': 'Avg Score (disliked)',
    'dashboard.avg_score_disliked_desc': 'Average score of disliked posts',
    'dashboard.score_difference': 'Score Difference',
    'dashboard.score_difference_desc': 'Difference (higher is better)',
    'dashboard.ml_coverage': 'ML Coverage',
    'dashboard.ml_coverage_desc': '% posts with scoring',
    'dashboard.ab_testing_title': 'A/B Testing Algorithms',
    'dashboard.ab_testing_desc': 'Comparison of effectiveness of different recommendation algorithms. Users are automatically distributed across variants.',
    'dashboard.ab_users': 'Users:',
    'dashboard.ab_trained': 'Trained:',
    'dashboard.ab_post_training': 'Post-training:',

    // users
    'users.telegram_id': 'Telegram ID',
    'users.username': 'Username',
    'users.status': 'Status',
    'users.trained': '✓ Trained',
    'users.in_progress': '⏳ In progress',
    'users.language': 'Language',
    'users.bonus_channels': 'Bonus channels',
    'users.last_activity': 'Last activity',

    // channels
    'channels.channel': 'Channel',
    'channels.posts': 'Posts',
    'channels.default': 'Default',
    'channels.default_yes': 'Yes',
    'channels.default_no': 'No',

    // ab testing
    'ab_testing.info': 'Comparison of effectiveness of different recommendation algorithms. Users are automatically distributed across variants (50/50 by user_id hash). control = cosine similarity, treatment_a = hybrid (cosine + recency). Like rate shows which algorithm better predicts preferences.',
    'ab_testing.users': 'Users:',
    'ab_testing.trained': 'Trained:',
    'ab_testing.post_training': 'Post-training:',
    'ab_testing.like_rate': 'Like rate:',
    'ab_testing.control': 'Control',
    'ab_testing.treatment': 'Treatment',
    'ab_testing.no_trained_users': 'No trained users for comparison',

    // clusters
    'clusters.recalculate': 'Recalculate clusters',
    'clusters.total': 'Total clusters',
    'clusters.posts_in_clusters': 'Posts in clusters',
    'clusters.unclustered_posts': 'Unclustered posts',
    'clusters.distribution_title': 'Cluster distribution',
    'clusters.cluster_id': 'Cluster ID',
    'clusters.post_count': 'Post count',

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
