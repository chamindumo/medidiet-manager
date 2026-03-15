# MediDiet Manager - Hospital Dietary Solutions

A professional, real-time hospital dietary and meal management system built with React, Vite, and Firebase.

## 📌 Features
- **Hospital Branding**: Tailored for medical facilities and wards.
- **Dietary Controls**: Track patient names, ward locations, and nutritional restrictions (Diabetic, Low Sodium, etc.).
- **Real-time Sync**: Instant updates between Dietary Services (Staff) and the Hospital Kitchen (Chef).
- **Admin Analytics**: Monitor meal compliance and supply levels across the facility.
- **Dockerized**: Ready for production deployment using containers.

## 🚀 Local Development
1. Clone the repository.
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## 📦 Production Publishing

### Option 1: Static Hosting (Vercel / Netlify)
This is the easiest way to publish the frontend.
1. Connect your GitHub repository to Vercel or Netlify.
2. Add the environment variables from your `.env` file to the platform's Environment Variables settings.
3. Use the following build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Option 2: Docker Deployment (VPS)
If you have a private server (DigitalOcean, AWS, Linode):
1. Ensure Docker is installed on your server.
2. Transfer the project files.
3. Run the production build:
   ```bash
   docker compose up --build -d
   ```
   The app will be available on port `8080`.

## 🛠 Tech Stack
- **Frontend**: React (Vite)
- **Database/Auth**: Firebase Firestore
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Containerization**: Docker & Nginx

## 🔒 Security Note
Ensure you update your Firebase Security Rules in the Firebase Console before going live to restrict data access to authenticated users only.
