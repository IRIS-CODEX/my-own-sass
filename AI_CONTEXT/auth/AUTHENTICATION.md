# AUTHENTICATION.md — Authentication & Authorization Model

## 🔐 Authentication Architecture

AgentLens uses **Firebase Authentication** as its primary identity provider:

```
[ Browser Client ]
       │
       ├──► Firebase Google OAuth Popup (`signInWithPopup(auth, googleProvider)`)
       ├──► Firebase Email/Password Sign-In (`signInWithEmailAndPassword`)
       └──► Firebase Auth Listener (`onAuthStateChanged` in `src/lib/firebaseAuth.ts`)
                 │
                 ├── Updates local user state in `useAppStore`
                 └── Sends Firebase ID Token via `Authorization: Bearer <token>` to Backend
```

---

## 🛡️ Authorization & Role-Based Access Control (RBAC)

### User Roles
1. **`user`**: Standard user authenticated via Firebase Auth. Access restricted to owned resources (`userId == auth.uid`).
2. **`admin` / `portal_admin`**: Administrative user with access to portal metrics and policy overrides.
3. **`super_admin`**: Root platform administrator (`hamudijems4@gmail.com` or listed in `/admins/{uid}`). Super-admin bypasses ownership checks in Firestore rules.

---

## 🛠️ Key Reference Files
- **Firebase Client Setup**: `src/lib/firebase.ts`
- **Auth Helper & State Observer**: `src/lib/firebaseAuth.ts`
- **Firebase Admin SDK (Backend)**: `backend/lib/firebaseAdmin.ts`
- **Login Component**: `src/components/auth/LoginPage.tsx`
- **Security Rules**: `firestore.rules`
