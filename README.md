# SANA Web Application

## Overview

SANA is a web application designed to provide an intuitive and efficient interface for users to submit and manage tasks. It features a modern React-based frontend and an Express.js backend, ensuring a seamless user experience with robust API handling.

### Features

1. User Authentication: Secure login and session management.
2. Task Submission: Users can submit jobs through a dedicated interface.
3. Job Management: View and track submitted jobs.
4. API Integration: Backend logic to handle task processing and data retrieval.

### Tech Stack

1. Frontend:

  a.React.js (with Vite for fast development)
  b.Tailwind CSS for styling
  c.React Router for navigation

2. Backend:
   a. Express.js (Node.js framework)
   b. JWT-based authentication

### Installation and Setup

#### Prerequisites:

Node.js (>=16)

npm or yarn package manager

#### Steps:

1. Clone the repository: git clone https://github.com/your-repo/sana.git --> cd sana

2. Install dependencies: npm install

3. Set up environment variables: Create a .env file in the root directory and configure: JWT_SECRET=your_secret_key

### Run the application:

npm start

#### API Endpoints

#### Authentication

POST /api/auth/login - User login

POST /api/auth/register - User registration

#### Jobs

POST /api/jobs/submit - Submit a new job

GET /api/jobs - Fetch submitted jobs
