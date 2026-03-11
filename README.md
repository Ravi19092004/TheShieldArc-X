# 🚀 My-Project

A comprehensive **cybersecurity platform** featuring URL scanning, phishing detection, and user management. 

## ✨ Features

- **🔗 URL Scanning**: Advanced URL analysis and threat detection  
- **🎣 Phishing Detection**: ML-powered phishing detection using XGBoost  
- **🔐 User Authentication**: Secure registration and login with NextAuth.js  
- **📊 Dashboard**: Real-time monitoring and analytics  
- **🖥️ Browser Extension**: Chrome extension for on-the-fly URL scanning  
- **🌐 API Services**: RESTful API for integrations  

---

## 🛠️ Tech Stack

### Frontend (Web)
- **Framework**: Next.js 14 with App Router  
- **Styling**: Tailwind CSS  
- **Authentication**: NextAuth.js  
- **Database**: Prisma + PostgreSQL  
- **Charts**: Recharts  

### Backend (API)
- **Framework**: Flask  
- **ML Model**: XGBoost for phishing detection  
- **Serialization**: Pickle for model storage  

### Browser Extension
- **Platform**: Chrome Extension API  
- **UI**: React + TypeScript  

---

## 📁 Project Structure

```
packages/
├── api/                 # Flask API service
│   ├── assets/         # ML models and assets
│   ├── main.py         # Main API application
│   └── requirements.txt
├── web/                # Next.js web application
│   ├── app/            # App router pages and API routes
│   ├── components/     # Reusable UI components
│   ├── lib/            # Utility functions and configurations
│   └── prisma/         # Database schema and migrations
└── extension/          # Chrome browser extension
    ├── manifest.json
    ├── popup.html
    ├── popup.js
    └── background.js
```

## 🏁 Getting Started

### Prerequisites
- Node.js 18+  
- Python 3.8+  
- PostgreSQL  
- Git  

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/My-Project.git
   cd My-Project
   git clone https://github.com/yourusername/My-Project.git
   cd My-Project
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install web dependencies
   cd packages/web
   npm install

   # Install API dependencies
   cd ../api
   pip install -r requirements.txt
   ```

3. **Set up the database**
   ```bash
   cd packages/web
   npx prisma migrate dev
   ```

4. **Configure environment variables**
   Create `.env.local` in `packages/web` with:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/myproject"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

5. **Run the applications**
   ```bash
   # Start the web application
   cd packages/web
   npm run dev

   # Start the API service (in another terminal)
   cd packages/api
   python main.py

   # Load the extension in Chrome
   # Go to chrome://extensions/
   # Enable "Developer mode"
   # Click "Load unpacked" and select packages/extension
   ```

## 🔌API Endpoints

### 🔐Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication

### 👀Scanning
- `POST /api/predict` - Predict phishing probability
- `POST /api/get-scan` - Get scan results
- `POST /api/save-scan` - Save scan results

### 👤User Management
- `POST /api/user/update-profile` - Update user profile
- `POST /api/user/accept-terms` - Accept terms of service

### Dashboard
- `GET /api/dashboard-stats` - Get dashboard statistics
- `GET /api/scan-history` - Get scan history
- `DELETE /api/scan-history/delete-one` - Delete single scan
- `DELETE /api/scan-history/clear-all` - Clear all scans

## 🤖Machine Learning Model

The phishing detection model uses:
- **Algorithm**: XGBoost Classifier
- **Features**: TF-IDF vectorized URL features
- **Training Data**: Balanced dataset of phishing and legitimate URLs
- **Accuracy**: ~95% on test set

## 🤝Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒Security

This project implements various security measures:
- Input validation and sanitization
- Rate limiting
- Secure authentication
- HTTPS enforcement
- Regular security updates

## 💬Support

For support, email rgharabbidi@gmail.com

## Roadmap

- [ ] Mobile app development
- [ ] Advanced threat intelligence
- [ ] Integration with SIEM systems
- [ ] Multi-language support
- [ ] API rate limiting enhancements

 


