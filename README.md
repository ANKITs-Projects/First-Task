# Social-Media-App

This backend application serves as the core API for a social media platform, allowing users to create communities, share posts, and engage via comments. Its primary purpose is to provide a lightweight, scalable system.
---

## 🚀 Features

- **Authentication & Authorization**: Secure JWT-based user authentication and RBAC (Role-Based Access Control).
- **RESTful API**: Clean, predictable, and resource-oriented API design.
- **Database Integration**: PostgreSQL structure schema database.
- **Error Handling**: Centralized global error handling with clear HTTP status codes.
- **Validation**: Strict input validation for incoming requests.
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
git clone https://github.com/ANKITs-Projects/First-Task.git
cd First-Task
````


### 2. Configure Environment Variables

Create a `.env` file in the root directory and copy the variables from `.env.example`.

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

## Project Structure

```txt
Project Structure
├── src/
│   ├── config/          # DB configuration
│   ├── controllers/     # HTTP request handlers
│   ├── integrations/    # Email integration with nodemailer
│   ├── middlewares/     # Auth and validation middlewares
│   ├── repositories/    # SQL queries to communicate with DB
│   ├── routes/          # Express/API route definitions
│   ├── services/        # Core business logic
│   ├── utils/           # Helper functions and constants
│   ├── validators/      # API validators to validate requests
│   ├── app.js           # Express application setup
│   └── container.js     # Integrates controllers with services
├── .env.example         # Template for environment variables
├── README.md            # Project documentation
├── server.js            # Entry point of the project
├── package-lock.json    # Dependencies and scripts
└── package.json         # Dependencies and scripts
```

