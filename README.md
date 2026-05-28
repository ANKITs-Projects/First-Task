# Social-Media-App

This backend application serves as the core API for a social media platform, allowing users to create communities, share posts, and engage via comments. Its primary purpose is to provide a lightweight, scalable system.
---

## 🚀 Features

- **Authentication & Authorization**: Secure JWT-based user authentication and RBAC (Role-Based Access Control).
- **RESTful API**: Clean, predictable, and resource-oriented API design.
- **Database Integration**: Robust PostgreSQL schema structure with built-in migrations and database seeding support.
- **Error Handling**: Centralized global error handling with clear HTTP status codes.
- **Validation**: Strict input validation and sanitization for all incoming requests.
- **Logging**: Production-grade logging (Winston).

---

## 🛠️ Tech Stack

- **Language:** JavaScript 
- **Framework:** Express.js 
- **Database:** PostgreSQL 

---

## ⚙️ Getting Started

### 1. Clone the Repository
```bash
git clone (https://github.com/ANKITs-Projects/First-Task.git)
cd First-Task
2. Environment VariablesCreate a .env file in the root directory and copy the keys from .env.example
3. npm install
npm run dev

Project Structure
├── src/
│   ├── config/          # DB configuration
│   ├── controllers/     # HTTP request handlers 
│   ├── integrations/    # Email integration with nodemailer
│   ├── middlewares/     # Auth and validation middlewares
│   ├── repositories/    # Sql querys to communicate with db
│   ├── routes/          # Express/API route definitions
│   ├── services/        # Core business logic 
│   ├── utils/           # Helper functions and constants
│   ├── validators/      # Api validators to validate api request
│   └── app.js           # Express application setup
│   └── container.js     # Integrate controllers with services
├── .env.example         # Template for environment variables
├── README.md            # Project documentation
├── server.js            # Entry point of the project
├── package-lock.json    # Dependencies and scripts
└── package.json         # Dependencies and scripts
