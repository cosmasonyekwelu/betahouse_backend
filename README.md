# BetaHouse Backend 

## Overview
This repository contains a production-ready Node.js + Express backend for BetaHouse, exposing Users (signup/signin) and Properties APIs with search, filtering and pagination.

## Features
- Sign Up / Sign In (JWT)
- Protected routes
- Properties CRUD with image upload (multer)
- Search (text index), filter, pagination, sorting
- Validation (express-validator) and consistent error handling
- Rate limiting, helmet, compression, CORS config
- Uploads served from /uploads (configure for S3/Cloudinary in production)

## Quickstart
1. Copy `.env.example` to `.env` and set values (MONGO_URI, JWT_SECRET)
2. Install dependencies: `npm install`
3. Start in dev: `npm run dev`
4. Start in production: `npm start`

## Notes for production
- Use a managed DB (MongoDB Atlas).
- Replace local upload storage with S3 or Cloudinary.
- Use a secret manager for JWT_SECRET and other secrets.
- Set `NODE_ENV=production` in production environment.
- Add logging (winston) and monitoring as needed.

## API (examples)
- POST `/api/auth/signup`
- POST `/api/auth/signin`
- GET `/api/users/me` (protected)
- GET `/api/properties` (with filters)
- GET `/api/properties/:id`
- POST `/api/properties` (protected)
- PUT `/api/properties/:id` (protected)
- DELETE `/api/properties/:id` (protected)
