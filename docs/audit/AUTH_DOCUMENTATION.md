# Authentication System Documentation

## Architecture Overview

This application follows a clean **MVC (Model-View-Controller)** architecture with clear separation between frontend (client) and backend (server).

```
enterprise-payroll-web-529/
├── client/                    # Frontend (React)
│   ├── pages/
│   │   └── Login.jsx         # Login UI component
│   └── ...
└── server/                    # Backend (Express)
    ├── controllers/
    │   └── authController.js  # Authentication business logic
    ├── middleware/
    │   ├── authMiddleware.js  # JWT verification & authorization
    │   └── commonMiddleware.js # Logging, error handling
    ├── routes/
    │   └── auth.js           # Auth route definitions
    ├── db.js                 # Database connection pool
    └── index.js              # Express server entry point
```

---

## Backend Components

### 1. **Controllers** (`server/controllers/authController.js`)

Handles the business logic for authentication:

- **`login(req, res)`**: Authenticates user credentials
  - Queries `userdetails` table by `UserID`
  - Supports both bcrypt-hashed and plain-text passwords (legacy)
  - Generates JWT token on success
  - Logs login activity to `userlogs` table

- **`getCurrentUser(req, res)`**: Returns authenticated user info
  - Requires valid JWT token (via middleware)
  - Returns user profile data

- **`logout(req, res)`**: Handles user logout
  - Logs logout activity
  - Client removes token from localStorage

### 2. **Middleware** (`server/middleware/`)

#### `authMiddleware.js`
- **`authenticate`**: Verifies JWT token from `Authorization` header
  - Extracts token from `Bearer <token>` format
  - Validates token signature and expiration
  - Attaches `req.user` object for downstream use

- **`authorize(...roles)`**: Role-based access control
  - Checks if authenticated user has required role(s)
  - Example: `authorize('admin', 'super_admin')`

- **`optionalAuth`**: Soft authentication
  - Attaches user if token exists, but doesn't require it

#### `commonMiddleware.js`
- **`requestLogger`**: Logs all incoming requests
- **`errorHandler`**: Centralized error handling
- **`notFound`**: Handles 404 errors

### 3. **Routes** (`server/routes/auth.js`)

Defines API endpoints:

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | User login |
| GET | `/api/auth/me` | Private | Get current user |
| POST | `/api/auth/logout` | Private | User logout |

---

## Frontend Components

### **Login Page** (`client/pages/Login.jsx`)

React component that:
1. Collects username/password from user
2. Sends POST request to `/api/auth/login`
3. Stores JWT token in `localStorage`
4. Redirects to `/dashboard` on success

**Key Features:**
- Form validation
- Loading states
- Error handling
- Demo credentials display

---

## Authentication Flow

### Login Sequence

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│ Client  │                │ Server  │                │ Database │
└────┬────┘                └────┬────┘                └────┬─────┘
     │                          │                          │
     │ POST /api/auth/login     │                          │
     │ { email, password }      │                          │
     ├─────────────────────────>│                          │
     │                          │                          │
     │                          │ SELECT * FROM userdetails│
     │                          │ WHERE UserID = ?         │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │<─────────────────────────┤
     │                          │ User record              │
     │                          │                          │
     │                          │ Verify password          │
     │                          │ (bcrypt or plain text)   │
     │                          │                          │
     │                          │ Generate JWT token       │
     │                          │                          │
     │                          │ INSERT INTO userlogs     │
     │                          ├─────────────────────────>│
     │                          │                          │
     │<─────────────────────────┤                          │
     │ { token, user }          │                          │
     │                          │                          │
     │ Store in localStorage    │                          │
     │ Navigate to /dashboard   │                          │
     │                          │                          │
```

### Protected Route Access

```
┌─────────┐                ┌─────────┐
│ Client  │                │ Server  │
└────┬────┘                └────┬────┘
     │                          │
     │ GET /api/auth/me         │
     │ Authorization: Bearer    │
     │ <token>                  │
     ├─────────────────────────>│
     │                          │
     │                          │ authenticate middleware
     │                          │ - Verify JWT
     │                          │ - Attach req.user
     │                          │
     │                          │ getCurrentUser controller
     │                          │ - Query user data
     │                          │
     │<─────────────────────────┤
     │ { user: {...} }          │
     │                          │
```

---

## Database Schema

### `userdetails` Table

```sql
CREATE TABLE `userdetails` (
  `UserID` varchar(50) NOT NULL,        -- Login username
  `id` int NOT NULL AUTO_INCREMENT,
  `Password` varchar(255) NOT NULL,     -- Plain text or bcrypt hash
  `UserName` varchar(100) NOT NULL,     -- Display name
  `Qualification` varchar(255),
  `Department` varchar(255),
  `Role` enum('super_admin','admin','hr_officer','accountant','auditor','employee'),
  `Contact` varchar(255),
  `Remark` varchar(255),
  `CreatedAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `new_id` (`id`),
  KEY `idx_user_userid` (`UserID`),
  KEY `idx_user_role` (`Role`)
);
```

### `userlogs` Table

```sql
CREATE TABLE `userlogs` (
  `LogID` int NOT NULL AUTO_INCREMENT,
  `UserID` varchar(255),
  `UserName` varchar(255),
  `Role` varchar(50),
  `ActionType` varchar(50),              -- e.g., 'LOGIN', 'LOGOUT'
  `Module` varchar(100),                 -- e.g., 'Authentication'
  `Description` text,
  `IPAddress` varchar(50),
  `LogDate` date,
  `LogTime` time,
  `CreatedAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`LogID`)
);
```

---

## Environment Variables

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Prawin@2k4
DB_NAME=billing_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=90d
```

---

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "admin",
    "role": "admin",
    "department": null,
    "contact": null
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

## Security Features

1. **JWT Authentication**: Stateless token-based auth
2. **Password Hashing**: Supports bcrypt (legacy plain text for migration)
3. **Role-Based Access Control**: Middleware for authorization
4. **Activity Logging**: All login/logout events tracked
5. **Token Expiration**: Configurable via `JWT_EXPIRES_IN`
6. **CORS Protection**: Configured in Express
7. **Input Validation**: Required fields checked

---

## Usage Examples

### Login from Frontend

```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'admin',      // Maps to UserID
    password: 'admin123' 
  })
});

const data = await response.json();
if (data.success) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  navigate('/dashboard');
}
```

### Protected API Request

```javascript
const token = localStorage.getItem('token');

const response = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.user);
```

### Using Authorization Middleware

```javascript
import { authenticate, authorize } from '../middleware/authMiddleware.js';

// Only authenticated users
router.get('/profile', authenticate, getProfile);

// Only admins
router.delete('/user/:id', authenticate, authorize('admin', 'super_admin'), deleteUser);
```

---

## Testing

### Test Credentials (from `billing_db.sql`)

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | admin |
| prawin | prawin | admin |
| gandhi | hr123 | hr_officer |
| lathareddi | acc123 | accountant |

### Health Check

```bash
curl http://localhost:5001/api/health
```

### Login Test

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","password":"admin123"}'
```

---

## Future Enhancements

- [ ] Password reset functionality
- [ ] Email verification
- [ ] Two-factor authentication (2FA)
- [ ] Session management
- [ ] Refresh tokens
- [ ] Account lockout after failed attempts
- [ ] Password strength requirements
- [ ] Migrate all plain-text passwords to bcrypt

---

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check if token is included in Authorization header
   - Verify token hasn't expired
   - Ensure JWT_SECRET matches between token generation and verification

2. **Database Connection Error**
   - Verify MySQL is running
   - Check `.env` credentials
   - Ensure `billing_db` database exists

3. **CORS Error**
   - Verify CORS is enabled in `server/index.js`
   - Check frontend is making requests to correct backend URL

---

## License

Proprietary - Enterprise Payroll System
