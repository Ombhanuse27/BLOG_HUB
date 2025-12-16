# 📝 BlogVerse

*A modern, Medium‑like blogging platform for creators & readers*

![BlogVerse UI](./assets/blogverse-ui.png)

BlogVerse is a **full‑stack blogging platform** inspired by Medium, designed to provide a clean reading experience and powerful social features for writers. Users can write stories, follow creators, save posts, and discover personalized content through a **"For You" feed**.

---

## ✨ Platform Overview (Based on UI)

The interface is split into two major sections:

### 📰 Main Feed

* Clean, card‑based post layout
* Banner images with smooth hover animations
* Author info, publish date & reading time
* Like ❤️, comment 💬, and save 🔖 actions
* Category tags (AI, Python, Data Science, etc.)

### 📌 Sidebar Widgets

* **Reading List** – saved posts for later reading
* **Top Creators** – trending authors ranked by followers
* Quick access to popular topics

### 🧭 Navigation

* "For You" feed based on followed topics
* Category‑wise filtering
* Global search for posts & authors
* Profile dropdown with saved posts & logout

---

## 🚀 Key Features

### 💬 Real-Time Chat (WebSockets)

* One-to-one and community chat for bloggers
* Instant message delivery without page refresh
* Online user presence (connected users)
* Enables creators to collaborate & stay connected

### 🔐 Authentication

* JWT‑based authentication
* OAuth login (Google)
* Secure protected routes

### ✍️ Blogging

* Create, edit & delete posts
* Rich‑text editor with HTML content
* Banner image upload

### 👥 Social Interaction

* Follow / unfollow creators
* Like & comment on posts
* Save posts to reading list
* **Real-time chat between bloggers using WebSockets**

### 🎯 Personalization

* "For You" feed using followed topics
* Category‑based content discovery

### 🖼 Media Support

* Banner images via **Cloudinary / Firebase**
* User profile avatars

---

## 🛠 Tech Stack

### Frontend

* React (CRA)
* Tailwind CSS
* React Router
* Axios
* Framer Motion (animations)

### Backend

* Node.js

* Express.js

* MongoDB + Mongoose

* JWT Authentication

* OAuth 2.0 (Google)

* **WebSockets (Socket.IO) for real-time chat**

* Node.js

* Express.js

* MongoDB + Mongoose

* JWT Authentication

* OAuth 2.0 (Google)

### DevOps & Deployment

* Docker & Docker Compose
* Vercel (Frontend)
* Render (Backend)
* MongoDB Atlas

---

## 🐳 Dockerized Setup (Recommended)

This project uses **Docker Compose** to run frontend, backend, and database together.

### 📁 Folder Structure

```bash
BLOGVERSE/
├── frontend/
│   ├── Dockerfile
│   └── ...
├── backend/
│   ├── Dockerfile
│   └── ...
├── docker-compose.yml
└── README.md
```

---

### ▶️ Run with Docker Compose

#### 1️⃣ Clone the repository

```bash
git clone https://github.com/Ombhanuse27/BLOG_HUB.git
cd BLOG_HUB
```

#### 2️⃣ Configure environment variables

**.env**

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret
BASE_URL=http://localhost:5000/api
```

#### 3️⃣ Start all services

```bash
docker-compose up --build
```

#### 4️⃣ Access the app

* Frontend → [http://localhost:3000](http://localhost:3000)
* Backend API → [http://localhost:5000/api](http://localhost:5000/api)

---

## 🧪 Run Without Docker (Manual Setup)

### 🔹 Backend

```bash
cd Backend
npm install
npm run dev
```

### 🔹 Frontend

```bash
cd Frontend
npm install
npm start
```


---

## 👨‍💻 Author

**Om Bhanuse**
B.Tech CSE | Full‑Stack Developer | MERN | DevOps Enthusiast

---

⭐ *If you like this project, don’t forget to star the repository!*
