# Ethan Stoner - Portfolio

A modern, black-themed portfolio website showcasing my projects, skills, and experience as an automation engineer and full stack developer.

## Features

- **Black Theme**: Sleek black design with cyan accent colors
- **Smooth Animations**: Gradient orbs, typing effects, and smooth scrolling
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile
- **No Sign-In Required**: Direct access to all content
- **Modern UI**: Inspired by ElevenLabs design with glassmorphism effects

## Sections

- **Hero**: Animated typing introduction
- **About**: Education, experience, and interests
- **Projects**: Featured automation projects with descriptions
- **Tech Stack**: Technologies and tools I work with
- **Contact**: Links to GitHub, LinkedIn, and Email

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Running Locally

#### Without Docker

```bash
npm start
```

The site will be available at `http://localhost:3001`

#### With Docker

```bash
# Build Docker images
make build

# Start web server
make up

# Or use docker-compose directly
docker-compose up web
```

### Running Tests

#### Without Docker

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in headed mode
npm run test:headed

# Debug tests
npm run test:debug

# View test report
npm run test:report
```

#### With Docker (Recommended)

```bash
# Run tests in Docker containers
make test

# Or use docker-compose directly
docker-compose up test
```

The Docker setup uses multiple workers (4 locally, 2 in CI) for faster test execution.

## Tech Stack

- HTML5
- CSS3 (with animations and gradients)
- JavaScript (vanilla)
- Playwright (for QA testing)

## Project Structure

```
ethanstoner-portfolio/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── script.js           # JavaScript functionality
├── package.json        # Dependencies and scripts
├── playwright.config.js # Playwright configuration
├── Dockerfile          # Docker image for web server
├── Dockerfile.test     # Docker image for tests
├── docker-compose.yml  # Docker Compose configuration
├── Makefile            # Convenience commands
├── tests/              # QA test suite
│   └── portfolio.spec.js
└── README.md           # This file
```

## QA Testing

The project includes comprehensive QA tests using Playwright:

- Page loading and navigation
- Section visibility and content
- Link functionality
- Responsive design
- Theme and styling
- Animations and interactions

Run `npm test` to execute all tests.

## License

MIT

## Contact

- GitHub: [ethanstoner](https://github.com/ethanstoner)
- LinkedIn: [eastoner](https://linkedin.com/in/eastoner)
- Email: ethanstoner08@gmail.com
