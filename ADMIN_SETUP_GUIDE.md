# Admin User Setup Guide

## Create Admin Users in Firebase Console

Follow these steps to create the admin users:

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com/project/queue-mgmt-sys/authentication/users
2. Make sure you're logged in with your Google account

### Step 2: Create First Admin User
1. Click **"Add user"** button
2. Enter the following details:
   - **Email**: `kingmakerr2103@gmail.com`
   - **Password**: `king@0321`
3. Click **"Add user"**

### Step 3: Create Second Admin User
1. Click **"Add user"** button again
2. Enter the following details:
   - **Email**: `admin@test.com`
   - **Password**: `admin123`
3. Click **"Add user"**

### Step 4: (Optional) Remove Old Admin Users
If you want to clean up old admin accounts:
1. Find `dkenterforlainnier@gmail.com` in the user list
2. Click the three dots menu (⋮) next to it
3. Select **"Delete user"**
4. Confirm deletion

### Step 5: Test Login
1. Go to your admin page: https://queue-mgmt-sys.web.app/admin.html
2. Try logging in with:
   - Email: `kingmakerr2103@gmail.com`
   - Password: `king@0321`
3. You should be able to access the admin dashboard

---

## What's Been Fixed

✅ **Firestore Rules Updated**: Only `kingmakerr2103@gmail.com` and `admin@test.com` can now manage the queue

✅ **"Call Again" Notifications Fixed**: Students will now receive notifications when their token is recalled

✅ **Better Error Handling**: Admin actions now show clear error messages if something goes wrong

---

## Admin Credentials

**Admin 1:**
- Email: `kingmakerr2103@gmail.com`
- Password: `king@0321`

**Admin 2:**
- Email: `admin@test.com`
- Password: `admin123`

---

## Testing the "Call Again" Feature

1. **Student Side**: 
   - Log in as a student and generate a token
   - Wait for admin to call your token
   
2. **Admin Side**:
   - Call the student's token (status changes to "called")
   - Click the **"📢 Call Again"** button
   
3. **Student Side**:
   - You should receive a notification saying "Your token #XXXX has been called"
   - Check browser console for the message: "🔔 Token recalled!"

**Note**: Make sure browser notifications are enabled for the site!
