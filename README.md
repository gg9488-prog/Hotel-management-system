# 🍽️ Saveur — Restaurant Management System

A full-stack Restaurant Management System with a modern dark-gold SaaS UI.

---

## 📁 Project Structure

```
restaurant-management/
├── backend/
│   ├── server.js                  ← Express entry point
│   ├── package.json
│   ├── config/
│   │   └── db.js                  ← MySQL connection pool
│   ├── routes/
│   │   ├── dashboard.js
│   │   ├── customers.js
│   │   ├── orders.js
│   │   ├── menu.js
│   │   └── feedback.js
│   └── controllers/
│       ├── dashboardController.js
│       ├── customerController.js
│       ├── orderController.js
│       ├── menuController.js
│       └── feedbackController.js
└── frontend/
    ├── index.html      ← Dashboard (live stats from DB)
    ├── customer.html   ← Add + view customers
    ├── order.html      ← Place orders + order history
    ├── menu.html       ← Add / edit / delete menu items
    ├── feedback.html   ← Submit + view guest feedback
    ├── reports.html    ← Reports & analytics
    ├── tables.html     ← Table management
    ├── staff.html      ← Staff management
    ├── settings.html   ← Settings
    └── style.css       ← Shared dark-gold design system
```

---

## ⚙️ Step-by-Step Setup

### 1. Prerequisites

- Node.js ≥ 16 (https://nodejs.org)
- MySQL already running with your database schema

### 2. Configure Database Credentials

Edit `backend/config/db.js`:

```js
const pool = mysql.createPool({
  host:     'localhost',
  port:     3306,
  user:     'root',          // your MySQL username
  password: 'your_password', // your MySQL password
  database: 'restaurant_db', // your database name
});
```

Or set environment variables instead:

```bash
export DB_HOST=localhost
export DB_USER=root
export DB_PASS=your_password
export DB_NAME=restaurant_db
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Start the Server

```bash
npm start
# or for auto-reload during development:
npm run dev
```

You should see:
```
✅  MySQL connected successfully
🍽️  Saveur Restaurant API running on http://localhost:3000
📊  Dashboard  → http://localhost:3000/index.html
🔗  API Base   → http://localhost:3000/api
```

### 5. Open the App

Visit **http://localhost:3000** in your browser.

---

## 🔗 API Endpoints

| Method | Route                          | Description                  |
|--------|-------------------------------|------------------------------|
| GET    | /api/dashboard                | Stats: orders, revenue, rating |
| GET    | /api/dashboard/recent-orders  | Last 10 orders               |
| GET    | /api/dashboard/top-items      | Top 5 menu items by quantity  |
| GET    | /api/customers                | All customers                |
| GET    | /api/customers/:id            | Single customer              |
| POST   | /api/customers                | Register new customer        |
| DELETE | /api/customers/:id            | Delete customer              |
| GET    | /api/orders                   | All orders with details      |
| GET    | /api/orders/:id               | Single order with items      |
| POST   | /api/orders                   | Place new order + bill       |
| GET    | /api/menu                     | All menu items               |
| POST   | /api/menu                     | Add menu item                |
| PUT    | /api/menu/:id                 | Update menu item             |
| DELETE | /api/menu/:id                 | Delete menu item             |
| GET    | /api/feedback                 | All feedback with names      |
| POST   | /api/feedback                 | Submit new feedback          |
| GET    | /api/health                   | Server health check          |

---

## 📦 POST Body Examples

### POST /api/customers
```json
{
  "customer_id": "CUST-001",
  "name": "Arjun Mehta",
  "phone": "+91 98001 23456",
  "email": "arjun@example.com"
}
```

### POST /api/orders
```json
{
  "order_id": "ORD-1001",
  "order_date": "2025-04-11",
  "order_time": "20:15",
  "customer_id": "CUST-001",
  "table_id": "T-03",
  "items": [
    { "item_id": "ITEM-001", "quantity": 2 },
    { "item_id": "ITEM-003", "quantity": 1 }
  ]
}
```
> The backend automatically creates an Order_Details row for each item and generates a Bill with the calculated total.

### POST /api/menu
```json
{
  "item_id": "ITEM-001",
  "item_name": "Butter Chicken",
  "price": 520
}
```

### POST /api/feedback
```json
{
  "feedback_id": "FB-001",
  "customer_id": "CUST-001",
  "rating": 5,
  "comments": "Absolutely amazing experience!"
}
```

---

## 🎨 Design System

| Token            | Value            |
|-----------------|-----------------|
| Background       | #0a0a0c          |
| Card background  | #16161c          |
| Gold accent      | #c49b4c          |
| Gold light       | #e8c47a          |
| Text primary     | #f0ede6          |
| Success          | #4caf82          |
| Warning          | #e8a04c          |
| Danger           | #e05c5c          |
| Font (serif)     | Cormorant Garamond |
| Font (sans)      | DM Sans          |

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| `ER_ACCESS_DENIED_ERROR` | Wrong DB credentials in `config/db.js` |
| `ECONNREFUSED` | MySQL not running; start it first |
| `ER_NO_SUCH_TABLE` | Table names must match exactly: `Customer`, `Orders`, `Menu_Item`, `Order_Details`, `Bill`, `Feedback` |
| Port 3000 in use | `PORT=4000 npm start` |
| CORS error in browser | Already configured; make sure you're opening via `http://localhost:3000` not as a file |
