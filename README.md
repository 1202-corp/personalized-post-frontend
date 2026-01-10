# Personalized Post Bot - Frontend Services

> [Русская версия](docs/README-RU.md)

This directory contains two frontend services for the Personalized Post Bot platform.

## Components

### MiniApp (`miniapp/`)

Tinder-style swipe interface for post rating in Telegram WebApp format.

**Key Features:**
- Swipe interface for post rating
- Telegram WebApp integration
- Dark/light theme support
- API integration for post loading and interaction submission
- Responsive design for mobile devices

**Technology Stack:**
- HTML/CSS/JavaScript - Vanilla, no frameworks
- Telegram WebApp API - Telegram integration
- Nginx - Static file server

**Documentation:** [miniapp/README.md](miniapp/README.md)

### Admin Dashboard (`admin-dashboard/`)

Monitoring dashboard for Personalized Post Bot with service status, statistics, and A/B testing controls.

**Key Features:**
- Service health status monitoring
- User and post statistics
- A/B testing configuration
- Activity graphs and metrics
- Secure access via SSH tunnel

**Technology Stack:**
- HTML/CSS/JavaScript - Static web interface
- Nginx - Web server

**Documentation:** [admin-dashboard/README.md](admin-dashboard/README.md)

## Usage

### MiniApp

The MiniApp is accessed through Telegram WebApp and provides a swipe interface for users to rate posts during training. It requires HTTPS and should be deployed with a public URL.

### Admin Dashboard

The admin dashboard is a secure monitoring interface that should be accessed via SSH tunnel in production. It provides comprehensive monitoring and management capabilities for the bot platform.

## Documentation

- [Russian documentation](docs/README-RU.md)

