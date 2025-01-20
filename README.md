# Fitness App

A personalized workout planning application that generates custom workout plans based on user preferences, fitness level, and available equipment.

## Features

- User authentication with email/password and social logins
- Detailed fitness questionnaire for personalization
- AI-powered workout plan generation
- Progress tracking
- Workout plan management
- Responsive design with Material-UI

## Project Structure

```
fitness-app/
├── frontend/           # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       └── firebase.js
├── backend/            # Node.js backend
│   ├── server.js
│   └── generateWorkout.js
└── firestore.rules     # Firebase security rules
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- OpenAI API key

## Setup

1. Clone the repository:
```bash
git clone [your-repository-url]
cd fitness-app
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables:

Create `.env` files in both frontend and backend directories:

Frontend `.env`:
```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
```

Backend `.env`:
```
OPENAI_API_KEY=your_openai_api_key
```

4. Start the development servers:

Frontend:
```bash
cd frontend
npm start
```

Backend:
```bash
cd backend
node server.js
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. # fitness-app
# fitness-app
