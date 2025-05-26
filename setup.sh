#!/bin/bash

# Create necessary directories
mkdir -p backend/src/{config,controllers,middleware,models,routes,seeders,migrations}
mkdir -p frontend
mkdir -p admin

# Install backend dependencies
cd backend
npm init -y
npm install bcryptjs cors dotenv express express-validator jsonwebtoken pg pg-hstore sequelize
npm install --save-dev jest nodemon sequelize-cli supertest

# Create .env file
echo "NODE_ENV=development
PORT=5000

# Database
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=job_search_platform
DB_HOST=localhost

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880" > .env

# Initialize frontend (React)
cd ../frontend
npx create-react-app . --template typescript
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material axios react-router-dom

# Initialize admin panel (Angular)
cd ../admin
npx @angular/cli new admin --style=scss --routing=true
cd admin
npm install @angular/material @angular/cdk @angular/flex-layout

# Return to root directory
cd ../..

echo "Project setup completed!"
echo "Please update the .env file with your database credentials."
echo "To start the backend server: cd backend && npm run dev"
echo "To start the frontend: cd frontend && npm start"
echo "To start the admin panel: cd admin/admin && ng serve" 