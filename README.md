# 🍴 FoodieHub

🚀 **Live Demo:**  
👉 [Click Me!!](https://foodiehub-4js2.onrender.com/)

---

FoodieHub is a full-stack restaurant listing and food ordering web application where users can explore restaurants, view menu items, and manage their accounts.

---

## 🚀 Features

- 🔐 User Authentication (Register / Login / Logout)
- 🏪 Add & Manage Restaurants
- 🍽️ Add & Manage Food Items
- 📝 Edit & Delete Listings
- 🛒 Cart / Bucket System
- 💬 Flash Messages & Validations
- 📦 Session Management
- 🌩️ Cloud Image Upload (Cloudinary)
- 🗄️ MongoDB Integration

---

## 🛠️ Tech Stack

### Frontend
- HTML
- CSS
- Bootstrap
- EJS

### Backend
- Node.js
- Express.js

### Database
- MongoDB (Mongoose)

### Authentication
- Passport.js
- Express-session

---

## 📂 Project Structure

```
FoodieHub/
│
├── models/          # Mongoose Schemas
├── routes/          # Express Routes
├── views/           # EJS Templates
├── public/          # Static Files (CSS, JS, Images)
├── middleware/      # Custom Middleware
├── utils/           # Utility Functions
├── app.js           # Main Server File
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

1. Clone the repository

```
git clone https://github.com/ratneshnamdeo0207/FoodieHub.git
```

2. Navigate to project folder

```
cd FoodieHub
```

3. Install dependencies

```
npm install
```

4. Create a `.env` file in the root directory and add:

```
ATLASDB_URL=your_mongodb_connection_string
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_api_key
CLOUD_API_SECRET=your_api_secret
SECRET=session_secret_key
```

5. Start the server

```
node app.js
```

Server will run at:

```
http://localhost:4000
```

---

## 🌐 Deployment

You can deploy this project using:
- Render
- Railway

---

## 📌 Future Improvements

- 💳 Payment Gateway Integration
- 📦 Order History System
- ⭐ Ratings & Reviews
- 🔎 Search & Filter Feature
- 👨‍💼 Admin Dashboard

---

## 👨‍💻 Author

**Ratnesh Namdeo**  
GitHub: https://github.com/ratneshnamdeo0207

---

⭐ If you like this project, give it a star on GitHub!
