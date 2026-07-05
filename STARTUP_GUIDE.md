# 🚀 Queue Management System - Startup Guide

## ✅ Good News: Your App is Already Live!

Your application is **deployed on Firebase Hosting** and runs entirely in the cloud. You don't need to start any servers or run any commands to use it!

---

## 🌐 How to Access Your Application

### **For Students:**
Simply open this URL in any browser:
```
https://queue-mgmt-sys.web.app
```

### **For Admins:**
Open this URL in any browser:
```
https://queue-mgmt-sys.web.app/admin.html
```

**That's it!** No local servers needed. Everything runs on Firebase.

---

## 🔑 One-Time Setup (If Not Done Yet)

### **Create Admin Users** (Only needed once)

1. Go to [Firebase Console - Authentication](https://console.firebase.google.com/project/queue-mgmt-sys/authentication/users)

2. Click **"Add user"** and create:
   - **Email:** `kingmakerr2103@gmail.com`
   - **Password:** `king@0321`

3. Click **"Add user"** again and create:
   - **Email:** `admin@test.com`
   - **Password:** `admin123`

4. Done! You can now login to the admin panel.

---

## 🖥️ If You Want to Run Locally (Optional)

If you want to test changes or run the app locally before deploying:

### **Option 1: Firebase Hosting Emulator**
```bash
cd C:\Users\Ashwin Rathinakumar\queue-mgmt
cmd /c npx firebase-tools serve
```
Then open: `http://localhost:5000`

### **Option 2: Simple HTTP Server**
```bash
cd C:\Users\Ashwin Rathinakumar\queue-mgmt\public
cmd /c npx http-server -p 8080
```
Then open: `http://localhost:8080`

### **Option 3: VS Code Live Server**
1. Right-click on `public/index.html`
2. Select "Open with Live Server"

---

## 📝 Making Changes and Deploying

If you make changes to the code and want to deploy them:

### **Deploy Everything:**
```bash
cd C:\Users\Ashwin Rathinakumar\queue-mgmt
cmd /c npx firebase-tools deploy
```

### **Deploy Only Hosting (HTML/CSS/JS):**
```bash
cmd /c npx firebase-tools deploy --only hosting
```

### **Deploy Only Firestore Rules:**
```bash
cmd /c npx firebase-tools deploy --only firestore:rules
```

---

## ✅ Quick Start Checklist (After Restart)

### **To Use the Application:**
- [ ] Open browser
- [ ] Go to https://queue-mgmt-sys.web.app
- [ ] That's it! ✨

### **To Develop/Make Changes:**
- [ ] Open VS Code
- [ ] Open folder: `C:\Users\Ashwin Rathinakumar\queue-mgmt`
- [ ] Make your changes
- [ ] Run: `cmd /c npx firebase-tools deploy --only hosting`
- [ ] Refresh the live website

---

## 🔧 Troubleshooting

### **Problem: "Permission denied" when deploying**
**Solution:** Make sure you're logged in to Firebase CLI:
```bash
cmd /c npx firebase-tools login
```

### **Problem: PowerShell script execution error**
**Solution:** Use `cmd /c` before the command:
```bash
cmd /c npx firebase-tools serve
```

### **Problem: Admin can't call tokens**
**Solution:** Make sure you're logged in with one of these emails:
- `kingmakerr2103@gmail.com`
- `admin@test.com`

### **Problem: Student not receiving notifications**
**Solution:** 
1. Allow browser notifications when prompted
2. Keep the student page open in browser
3. Make sure admin clicks "📢 Call Again" (not just "Call Next")

---

## 📱 Testing the Complete Flow

### **Test 1: Student Gets Token**
1. Open: https://queue-mgmt-sys.web.app
2. Create account or login
3. Select fee type (e.g., "Semester Fee")
4. Click "Get Token"
5. ✅ Should see token number and queue position

### **Test 2: Admin Calls Token**
1. Open: https://queue-mgmt-sys.web.app/admin.html
2. Login with: `kingmakerr2103@gmail.com` / `king@0321`
3. Click "📢 Call Next"
4. ✅ Student receives notification
5. ✅ Token moves to "Currently Serving"

### **Test 3: Call Again Feature**
1. With a token already called
2. Admin clicks "📢 Call Again" button
3. ✅ Student receives another notification

### **Test 4: Mark Paid**
1. Click "Mark Paid" for the current token
2. ✅ Student dashboard shows "Paid" status
3. ✅ Token removed from queue

---

## 🎯 Important URLs

| Purpose | URL |
|---------|-----|
| **Student App** | https://queue-mgmt-sys.web.app |
| **Admin App** | https://queue-mgmt-sys.web.app/admin.html |
| **Firebase Console** | https://console.firebase.google.com/project/queue-mgmt-sys |
| **Authentication** | https://console.firebase.google.com/project/queue-mgmt-sys/authentication/users |
| **Firestore Database** | https://console.firebase.google.com/project/queue-mgmt-sys/firestore |

---

## 💡 Pro Tips

1. **No Need to Start Servers**: Your app is live 24/7 on Firebase
2. **Mobile Friendly**: Share the links with students - works on phones!
3. **Real-time Updates**: All changes sync automatically via Firestore
4. **Multiple Admins**: Both admin accounts can be used simultaneously
5. **Browser Notifications**: Students must allow notifications for recall alerts

---

## 📞 Quick Reference

### **Admin Credentials:**
```
Email: kingmakerr2103@gmail.com
Password: king@0321

Email: admin@test.com
Password: admin123
```

### **Project Info:**
```
Project ID: queue-mgmt-sys
Location: C:\Users\Ashwin Rathinakumar\queue-mgmt
```

---

## 🎉 Summary

**After restarting your computer, you don't need to do anything!**

Your application is already running on Firebase's servers. Just:
1. Open your browser
2. Go to https://queue-mgmt-sys.web.app
3. Start using it!

No installation, no setup, no commands needed! 🚀
