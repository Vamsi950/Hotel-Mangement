# LuxeStay - Premium Full Stack Hotel Booking Portal

A premium, modern, and highly responsive **Full Stack Hotel Booking Website** featuring a curated glassmorphism dark-theme design. 
The system features only two user roles: **Customer** (for browsing, searching, and securing reservations) and **Admin** (for dashboard statistics, CRUD listings, user locking, and coupon building).

---

## 🚀 Custom Premium Integrations (New!)

We have successfully integrated a suite of premium, highly robust full-stack features:
- **Interactive Checkout Coupons Tag List**: Dynamically fetches active coupons on checkout load, rendering small clickable tag pills in the sidebar to auto-populate and apply discounts instantly.
- **Conjoint Multi-Amenities Checklist Filters**: Transitioned the single featured amenity selector to a dynamic conjoint checklist (Luxury Spa, Swimming Pool, Private Beach, Ski Retreat), showing only hotels hosting *all* active items.
- **Dynamic Homepage Location Resolver**: Dynamically pulls unique locations from active properties in the database to automatically populate search shortcuts and Bento Grid links.
- **System Admin Permanence Protection Policy**: Hardened core authentication services so the master system admin (`admin@hotel.com`) can never be blocked and its password remains permanent.
- **Real-time Email Dispatch Debugger**: Upgraded async email helpers with full stack trace connection dumps to dynamically route elegant HTML confirmation letters to guests and hotel owners on checkout.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), React Router, Axios, Custom Vanilla CSS (fluid animations, CSS variables, theme variables, glassmorphic styles).
- **Backend**: Spring Boot 3.x, Spring Security, JWT (Stateless Bearer Tokens), JPA/Hibernate.
- **Database**: MySQL 8.x.
- **Documentation**: Swagger / OpenAPI UI.

---

## 🔑 Default Seed Accounts

The application automatically seeds the database with the following default accounts and data at startup:

| Role | Email Address | Password | Functionality |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@hotel.com` | `password` | Gross revenue charts, complete hotels/rooms CRUD, bookings state update, block/unblock users, discount coupon builder. |
| **Customer** | `john@hotel.com` | `password` | Advanced stays searches, dates selection, promo code checkout, simulated card payments, reservations history, cancel / rebook. |

---

## 🏗️ Getting Started & Setup

Follow these simple steps to configure and run the full stack application locally:

### 1. Database Setup

1. Make sure your local **MySQL** service is running (on standard port `3306`).
2. The Spring Boot backend uses `createDatabaseIfNotExist=true` in its connection URL. This means **you do not need to manually create the database**; the driver will automatically initialize `hotel_booking_db` on startup!
3. If your local MySQL root user has a password other than `root`, adjust it in the properties file:
   - File: `backend/src/main/resources/application.properties`
   - Properties: `spring.datasource.username` and `spring.datasource.password`

### 2. Run the Spring Boot Backend

Navigate to the `backend` folder and run the Maven wrapper:
```bash
cd backend
# On Windows PowerShell
.\mvnw.cmd spring-boot:run

# On macOS / Linux Terminal
chmod +x mvnw
./mvnw spring-boot:run
```

Once started:
- The server will run on `http://localhost:8080`
- **Swagger Documentation UI** is fully integrated and accessible at: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- Access and test all protected endpoints directly from Swagger by clicking "Authorize" and pasting the JWT token generated from `/api/auth/login`.

---

### 3. Run the React Frontend

Navigate to the `frontend` folder and launch the Vite dev server:
```bash
cd frontend
# Install packages
npm install

# Launch local server
npm run dev
```

Once started:
- The website is accessible at: [http://localhost:5173](http://localhost:5173)

---

## ✨ Features Checklist

### 1. Customer Experience
- **Interactive Portal**: Fully customized responsive glassmorphic cards, Google Fonts integration, floating menus.
- **Advanced Search Filter**: Real-time filtering by location keywords, price range sliders, and popular amenities.
- **Invoice calculation**: Calculates base totals based on night counts, processes dynamic discount coupon checks, handles sales taxes, and prints final grand totals.
- **Mock Payment Checkout**: Integrated stepper layout with simulated credit card forms (validates Card Name, Expiry, CVV).
- **Reservation Portfolio**: Profile card displaying upcoming active stays, historical records, cancellation releases, and rebooking redirects.
- **Hotel Testimonials (Reviews)**: Write star ratings and comments directly on hotel detail pages.

### 2. Admin Operations Console
- **Dashboard Analytics**: Gross revenue calculations, occupancy ratios, bookings/users counts, and visual SVG charts showing performance trends.
- **Hotels CRUD**: Frosted-glass modal sheets to add, edit, or delete hotel records.
- **Rooms Configuration**: Mapped room additions, pricing rates, guest capacity inputs, and live availability toggles.
- **Reservation Logs**: Global list of bookings, payment methods, total prices, and buttons to Confirm or Cancel logs directly.
- **Moderator Console**: Block or unblock registered customer accounts immediately.
- **Promotional Coupons**: Active discount percentage generators with easy delete/status triggers.
