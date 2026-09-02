# MindQuest

MindQuest is an AI-powered quiz platform where users can register, choose a topic, generate a custom quiz, answer questions, and view results and performance analytics.

This project is divided into:
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB
- AI engine: Google Gemini

---

## What this app does

MindQuest helps a user:
- create an account
- log in securely
- choose a topic for a quiz
- set quiz length and difficulty
- generate a quiz using AI
- answer multiple-choice questions
- get instant or final feedback
- see final score and analytics
- view previous quiz history on the dashboard

This is a text-based quiz system, and the current app is designed as an English-first experience.

---

## Technology stack used

### Frontend
- React
- Vite
- JavaScript
- React Router DOM
- Tailwind CSS
- Framer Motion
- Axios
- Lucide React
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing
- CORS
- express-validator

### AI Integration
- Google Gemini API via @google/generative-ai

### Tools / workflow
- Concurrently for running server and client together
- Dotenv for environment management

---

## Application architecture

The project has a simple and clean full-stack structure:

1. Frontend (React app)
   - Handles pages and user interaction
   - Sends requests to the backend API
   - Shows quiz pages, dashboard, login/register, and results

2. Backend (Express API)
   - Authenticates users
   - Validates incoming requests
   - Calls Gemini to generate quiz questions
   - Saves assessments in MongoDB
   - Evaluates quiz answers and calculates results

3. Database (MongoDB)
   - Stores user accounts
   - Stores quiz assessments and answers
   - Stores score, topic, difficulty, completion status, and timestamps

4. AI layer (Gemini)
   - Generates quiz questions based on user topic and difficulty
   - Evaluates answer quality and returns feedback

---

## Complete application flow

### 1. User opens the app
A user visits the homepage and can:
- register
- log in
- explore the app

### 2. User signs up or logs in
The frontend sends login/register requests to the backend.

Backend flow:
- validates email/password data
- checks MongoDB for the user
- hashes the password
- creates a JWT token
- sends token back to the client

The frontend saves the token in sessionStorage for the current browser tab. Previous sessions are invalidated when the backend restarts, so users must log in again after a project restart.

### 3. User enters quiz setup
After login, the user goes to the quiz setup page.

The user provides:
- topic
- number of questions
- difficulty level
- feedback mode

These values are sent to the backend API at /api/quiz/generate.

### 4. Backend generates AI quiz
The server receives the request and calls the Gemini service.

The Gemini service:
- creates a quiz prompt using the selected topic and difficulty
- asks Gemini for multiple-choice questions
- validates the returned JSON
- ensures each question has 4 options and one correct answer
- returns the data to the controller

The controller then creates an Assessment record in MongoDB.

### 5. Quiz starts
The front end redirects the user to a quiz page with the generated questions.

The quiz page:
- shows one question at a time
- tracks timer
- stores user answers
- lets the user move forward and backward
- shows instant or delayed feedback depending on settings

### 6. User answers questions
For each question:
- user selects an option
- frontend sends the answer to /api/quiz/evaluate
- backend loads the correct answer from the saved quiz
- AI or local evaluation checks whether the answer is correct
- feedback is returned to the frontend

### 7. Quiz completion
Once the user finishes or timer ends, the app calls /api/quiz/complete/:assessmentId.

Backend does:
- calculates total score
- counts correct/partial/incorrect answers
- saves final percentage
- marks the assessment as completed
- returns result summary

### 8. Results page
The user is redirected to the results page where they can see:
- total score
- percentage
- correct answers
- number of questions
- time taken
- detailed answers and explanations

### 9. Dashboard analytics
The dashboard fetches previous completed assessments and gives the user:
- total quests completed
- average score
- best score
- total questions answered
- recent performance data
- topic-wise stats

---

## Folder structure

```bash
MindQuest/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Animated.jsx
│   │   │   ├── BackgroundMesh.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedLayout.jsx
│   │   │   └── SharedUI.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── LanguageContext.jsx
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── QuizPage.jsx
│   │   │   ├── QuizSetupPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ResultsPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   └── quizController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Assessment.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── quizRoutes.js
│   ├── services/
│   │   └── geminiService.js
│   ├── package.json
│   └── server.js
│
├── .env
├── .env.example
├── package.json
├── README.md
└── plan.txt
```

---

## Prerequisites

Before running the project, make sure you have:
- Node.js installed
- MongoDB running locally or a MongoDB Atlas connection
- A Google Gemini API key

---

## Environment variables

Create a file named .env in the root folder.

Example:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mindquest
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_secret_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

You can copy from .env.example if available.

---

## How to run the project

### 1. Clone the project

```bash
git clone <your-repository-url>
cd MindQuest
```

### 2. Install dependencies

At the project root:

```bash
npm install
```

Then install frontend packages:

```bash
cd client
npm install
cd ..
```

Then install backend packages:

```bash
cd server
npm install
cd ..
```

### 3. Start in development mode

From the root folder:

```bash
npm run dev
```

This starts:
- frontend on http://localhost:5173
- backend on http://localhost:5000

### 4. Start backend only

```bash
npm run server
```

### 5. Start frontend only

```bash
npm run client
```

### 6. Build for production

```bash
npm run build
```

### 7. Start production server

```bash
npm start
```

---

## Important backend API routes

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Quiz
- POST /api/quiz/generate
- POST /api/quiz/evaluate
- POST /api/quiz/complete/:assessmentId
- GET /api/quiz/:assessmentId

### Dashboard
- GET /api/dashboard/stats
- GET /api/dashboard/performance
- GET /api/assessments
- DELETE /api/assessments/:assessmentId

### Health check
- GET /api/health

---

## Simple flow for a new developer

If someone is new to this project, this is the easiest way to understand it:

1. User signs up
2. Frontend sends request to backend
3. Backend authenticates user and gives JWT token
4. User chooses quiz topic and settings
5. Backend calls Gemini AI
6. AI returns quiz questions
7. Questions are saved in MongoDB
8. User answers each question
9. Answers are evaluated and saved
10. Results are shown on the results page
11. Dashboard shows historical stats

---

## Notes

- The current project is designed for English text-based quiz generation.
- AI quiz generation depends on a valid Gemini API key.
- If Gemini is not configured properly, the app has fallback handling, but real quiz generation will not work without the API key.
- The app uses protected routes, so users must be logged in to access quiz and dashboard pages.

---

## Summary

MindQuest is a full-stack AI quiz application built with React on the frontend, Express on the backend, MongoDB as the database, and Google Gemini for intelligent question generation and answer evaluation.

It gives users a complete learning experience: sign up, generate custom quizzes, answer questions, get results, and track performance over time.

---

## License

This project is for learning and project use. If needed, add your own license file based on your preferred setup.
