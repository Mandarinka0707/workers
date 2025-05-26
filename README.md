# Job Search Platform

A comprehensive job search platform that connects job seekers with employers.

## Project Structure

The project consists of three main components:

1. **Frontend (React)**
   - User interface for job seekers and employers
   - Job search and filtering
   - Profile management
   - Resume creation and management
   - Job applications

2. **Admin Panel (Angular)**
   - Job posting moderation
   - Employer verification
   - Resume management
   - Application statistics
   - User management

3. **Backend (Node.js)**
   - REST API
   - Authentication/Authorization
   - Database management
   - Business logic

## Database Schema

The platform uses the following main tables:
- JobSeekers (Соискатели)
- Employers (Работодатели)
- Vacancies (Вакансии)
- Applications (Отклики)
- Resumes (Резюме)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL
- Angular CLI
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies for each component:
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd frontend
   npm install

   # Admin Panel
   cd admin
   npm install
   ```

3. Set up environment variables
4. Start the development servers

## Features

### For Job Seekers
- Create and manage profile
- Upload and manage resumes
- Search and filter job listings
- Apply for jobs
- Track application status

### For Employers
- Create company profile
- Post job vacancies
- Manage applications
- View candidate resumes

### For Administrators
- Moderate job postings
- Verify employer accounts
- Manage user accounts
- View platform statistics
- Monitor system activity

## Tech Stack

- **Frontend**: React, Material-UI
- **Admin Panel**: Angular, Angular Material
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Authentication**: JWT
- **API**: REST 