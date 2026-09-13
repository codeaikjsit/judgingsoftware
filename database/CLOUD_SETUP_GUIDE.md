# Cloud Database Setup & Connection Guide

This document explains how to set up and connect either **Supabase (PostgreSQL + RLS)** or **Firebase Firestore** to your Epoch Judging Platform.

---

## 🚀 Option 1: Supabase Setup (Recommended)

Supabase gives you PostgreSQL with built-in Row Level Security (RLS) and real-time WebSockets.

### Step 1: Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and click **"Start your project"**.
2. Sign in with GitHub / Email and create a new organization/project named `epoch-judging`.
3. Choose a strong database password and select the region nearest to you.

### Step 2: Deploy the Database Schema & RLS Policies
1. In the Supabase Dashboard, open the **SQL Editor** tab from the left sidebar.
2. Click **"New Query"**.
3. Open the file [database/schema.sql](file:///c:/Users/jaiga/OneDrive/Desktop/codeai%20epoch/database/schema.sql) in this workspace.
4. Copy and paste the entire content of `database/schema.sql` into the Supabase SQL Editor.
5. Click **"Run"** (Ctrl+Enter).
   - This automatically creates the `profiles`, `teams`, `active_session`, and `scores` tables.
   - It sets up all Row Level Security (RLS) policies to prevent unauthorized access.
   - It enables real-time publication listeners.

### Step 3: Enable Realtime
1. In the Supabase Dashboard, go to **Database** $\rightarrow$ **Replication**.
2. Verify that `active_session`, `scores`, and `teams` are checked for `supabase_realtime`.

### Step 4: Get API Credentials
1. Go to **Project Settings** $\rightarrow$ **API**.
2. Copy the **Project URL** (`https://<project-ref>.supabase.co`) and **anon public API Key**.

---

## 🔥 Option 2: Firebase Firestore Setup

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"** and name it `epoch-judging`.
3. Disable Google Analytics (optional) and click **"Create project"**.

### Step 2: Enable Authentication
1. Go to **Build** $\rightarrow$ **Authentication** $\rightarrow$ **Get Started**.
2. Under Sign-in method, enable **Email/Password**.

### Step 3: Enable Cloud Firestore
1. Go to **Build** $\rightarrow$ **Firestore Database** $\rightarrow$ **Create database**.
2. Select your preferred location and start in **Production mode**.
3. Go to the **Rules** tab in Firestore.
4. Paste the contents of [database/firestore.rules](file:///c:/Users/jaiga/OneDrive/Desktop/codeai%20epoch/database/firestore.rules).
5. Click **"Publish"**.

---

## ⚡ Zero-Setup Local Testing Engine (Already Working)

The platform comes with a built-in, multi-tab synchronized **Zero-Setup Database Engine**:
- Powered by the browser's native `BroadcastChannel` & `localStorage`.
- You **do not** need to install or configure Firebase/Supabase to test the complete software right now.
- Simply open [index.html](file:///c:/Users/jaiga/OneDrive/Desktop/codeai%20epoch/index.html) in your browser!
