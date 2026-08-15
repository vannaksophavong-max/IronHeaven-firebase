# IronHeaven — React

React + Vite port of the original static IronHeaven site.

## Structure
- `src/data/bikes.js` — single source of truth for all bike data (replaces the six duplicate lookup objects that lived inline in `bike-detail.html`)
- `src/components/` — `Navbar`, `Footer`, `BackBar`, `BikeCard`
- `src/pages/` — `Home`, `About`, `Explore`, `BikeDetail`
- Routing via `react-router-dom`: `/`, `/about`, `/explore`, `/bikes/:id`
- `src/style.css` — original stylesheet, unchanged except image `url()` paths updated to `/images/...`

## Run
```
npm install
npm run dev
```

## Build
```
npm run build
```

## Firebase backend

Real auth + database, no server to run — Firestore + Firebase Auth.

### Setup
1. Go to https://console.firebase.google.com and create a project.
2. In **Build > Authentication**, enable the **Email/Password** sign-in provider.
3. In **Build > Firestore Database**, create a database (start in production mode — the rules below lock it down).
4. In **Project settings > General > Your apps**, add a Web app, and copy the config values into a `.env` file at the project root (copy `.env.example` and fill it in).
5. Deploy the security rules in `firestore.rules`:
   ```
   npm install -g firebase-tools
   firebase login
   firebase init firestore   # point it at this existing firestore.rules file
   firebase deploy --only firestore:rules
   ```

### Migrate existing bike data
The site currently reads bikes from the static `src/data/bikes.js`. To move that into Firestore:
1. In **Project settings > Service accounts**, generate a private key and save it as `scripts/serviceAccountKey.json` (gitignored, never commit it).
2. Run:
   ```
   node scripts/seedBikes.js
   ```
3. Once bikes are in Firestore, swap any page still importing `src/data/bikes.js` (e.g. `Explore.jsx`, `BikeDetail.jsx`) over to `getAllBikes()` / `getBikeById()` from `src/firebase/bikes.js`.

### Admin API server (reset password / remove user)
The browser can't reset another user's password or delete their Firebase Auth account (the Admin SDK is required), so privileged actions run through a small local Express server:
1. Make sure `scripts/serviceAccountKey.json` exists (same key used by `seedBikes.js`).
2. Start it alongside the frontend:
   ```
   npm run server     # terminal 1
   npm run dev        # terminal 2
   ```
3. `npm run dev` proxies `/api/*` to the server automatically, so the admin Users page can use **Reset password** and **Remove**. Every request is verified with the caller's Firebase ID token and must belong to an admin (checked against Firestore).

### Making yourself an admin
There's no self-serve "become admin" button on purpose. After registering an account:
1. Open **Firestore Database** in the console.
2. Find your user doc under `users/{your-uid}`.
3. Edit its `role` field from `customer` to `admin`.
4. Log out and back in — the Navbar will show an **Admin** link, and `/admin` will be reachable.

### What's enforced where
- `src/context/AuthContext.jsx` — real Firebase Auth (register/login/logout), loads the user's role from Firestore.
- `src/components/AdminRoute.jsx` — UI-level gate, redirects non-admins away from `/admin/*`.
- `firestore.rules` — the actual security boundary. Bikes are publicly readable but only writable by users whose `users/{uid}.role == "admin"`. Users can read/create their own profile; only admins can read every user (for the admin Users page) or change anyone's role.
- `src/pages/admin/` — `AdminDashboard.jsx` (list/delete bikes), `BikeForm.jsx` (add/edit a bike, including specs and features), `AdminUsers.jsx` (list every auth account; change roles, reset passwords, and remove users). The Users page lists accounts through `server/index.js` (so console-created accounts without a Firestore doc still show up); role changes/reset/remove all go through the Admin SDK.
- `src/pages/Explore.jsx` and `src/pages/BikeDetail.jsx` now read from Firestore (`getAllBikes` / `getBikeById`) instead of the static `data/bikes.js` — so bikes added in the dashboard show up on the public site immediately. `data/bikes.js` is now only used by `scripts/seedBikes.js` to migrate the original 6 bikes in.
- An admin can't demote themselves from the Users page (the dropdown is disabled on your own row) — prevents accidentally locking yourself out.
