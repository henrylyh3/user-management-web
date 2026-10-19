# user-management-web

Frontend using Next.js with React for user registration, authentication, profile management, profile-picture uploads, and administrator user

# tech stack

- Next.js 16.4.1
- React 19.3
- Next.js App Router
- React Server Components
- Next.js Server Actions
- Native Fetch API

# backend intergration

- ASP.NET Core .NET 10 Web API
- JWT authentication
- Role-based authorization
- MongoDB
- Image uploads

# Sample page structure

sample of user page can refer to 'User Profile Structure.txt' at root folder

# Prerequisites

- node.js 20.9 or newer
- npm
- backend repository setup (https://github.com/henrylyh3/user-management-api)
- mongodb connection

# command to run

1. install dependencies: 'npm install'
2. start frontend: 'npm run dev' -> http://localhost:3000
   Make sure to run backend user-management-api using http profile
   Health check: http://localhost:3000/api/health (web -> api)

# application route

landing: /
signup: /sign-up
signin: /sign-in
user page: /user/{id}
users list(admin): /users

# feature

- JWT token store in HttpOnly cookie
- sign up and sign in
- Role-base navigation for role user and admin
- view profile and update first name, last name & profile picture
- dropzone drag and drop for profile picture upload
- delete profile picure
- admin users list and admin's right to view and edit user detail

# Sample flow

User directly access /user/id -> get token from getSessionToken(cookie) -> use token to check /auth/whoami -> call GET /user/id

# Assumption

- jwt token is use for authorization, which control by backend
- backend is fully responsible for authentication and authorization
- only 2 role is available: User, Admin
- Profile picture must be jpeg / png format with less than 2MB in size
- image storage is depends on file store service on backend (Local/CloudflaeR2), in prod is default to CloudflareR2 in Render varaible (FileStorage\_\_Provider)
- Backend render is using free tier, may need a cold start after inactivity

# hosting (Vercel free tier)

- the application is deployed on vercel free tier
- Production URL: https://user-management-web-eta.vercel.app/
- Health check (frontend to backend): https://user-management-web-eta.vercel.app/api/health
- Backend using render
- Database using MongoDB

# Vercel variable

API_BASE_URL

# Useful link

Dropzone - https://dev.to/hamidrazadev/how-to-build-a-drag-and-drop-file-dropzone-in-react-nextjs-with-tailwind-css-line-by-line-3c6g
Folder strucure - https://thomas-hart.com/blog/nextjs-project-structure-2026

# postman collection

- Postman collection is available at the root folder 'User Management.postman_collection.json'
