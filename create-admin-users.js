// Script to create admin users in Firebase Authentication
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

async function createAdminUsers() {
    const admins = [
        { email: 'kingmakerr2103@gmail.com', password: 'king@0321' },
        { email: 'admin@test.com', password: 'admin123' }
    ];

    for (const adminUser of admins) {
        try {
            // Try to get existing user
            const existingUser = await auth.getUserByEmail(adminUser.email).catch(() => null);

            if (existingUser) {
                // Update password for existing user
                await auth.updateUser(existingUser.uid, {
                    password: adminUser.password
                });
                console.log(`✅ Updated password for: ${adminUser.email}`);
            } else {
                // Create new user
                const userRecord = await auth.createUser({
                    email: adminUser.email,
                    password: adminUser.password,
                    emailVerified: true
                });
                console.log(`✅ Created new admin user: ${adminUser.email} (UID: ${userRecord.uid})`);
            }
        } catch (error) {
            console.error(`❌ Error with ${adminUser.email}:`, error.message);
        }
    }

    console.log('\n✨ Admin user setup complete!');
    process.exit(0);
}

createAdminUsers();
