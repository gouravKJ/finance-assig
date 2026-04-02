# 💰 Finance Management Backend 

## 🚀 Live Demo

🔗 https://finance-assig.onrender.com/

---

## 📌 Overview

A **production-ready finance management backend system** built with Node.js, Express, and MongoDB Atlas.

It supports **secure authentication, role-based access control (RBAC), financial record management, and analytics dashboards** for insights like category-wise spending and monthly trends.

---

## 🧠 Key Features

### 🔐 Authentication & Security

* JWT-based authentication
* Password hashing using bcrypt
* Protected routes

### 👥 Role-Based Access Control (RBAC)

* **Admin**

  * Full access (CRUD + user management)
* **Analyst**

  * Read-only access + analytics
* **Viewer**

  * Limited dashboard access

### 💰 Financial Records

* Create, read, update, delete records
* Filter by type & category
* Pagination support

### 📊 Analytics Dashboard

* Total income, expense, net balance
* Category-wise spending analysis
* Monthly trends tracking

---

## 🛠 Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas
* **Authentication:** JWT, bcrypt
* **Deployment:** Render

---

## ⚙️ Installation & Setup

```bash
git clone https://github.com/gouravKJ/finance-assig.git
cd finance-assig
npm install
```

### 🔑 Environment Variables

Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=3000
```

### ▶️ Run Server

```bash
npm run dev
```

---

## 📡 API Endpoints

### 🔐 Auth

* `POST /api/auth/register`
* `POST /api/auth/login`

### 👥 Users (Admin)

* `GET /api/users`
* `PATCH /api/users/:id`

### 💰 Records

* `POST /api/record` (Admin)
* `GET /api/record` (Admin, Analyst)
* `PUT /api/record/:id` (Admin)
* `DELETE /api/record/:id` (Admin)

### 📊 Dashboard

* `GET /api/dashboard/summary`
* `GET /api/dashboard/category`
* `GET /api/dashboard/monthly`

---

## 🔐 Authorization

Pass token in headers:

```
Authorization: <JWT_TOKEN>
```

---

## 📈 Example Workflow

1. Register user
2. Login → get JWT token
3. Create financial record
4. Fetch records
5. View analytics dashboard

---

## 🧪 Sample Request

```json
{
  "amount": 5000,
  "type": "income",
  "category": "salary",
  "date": "2026-04-02"
}
```

---

## 🏗 Project Architecture

* MVC-inspired structure
* Middleware-based authentication & authorization
* Scalable API design

---

## 👨‍💻 Author

**Gourav Kumar Jaiswal**

