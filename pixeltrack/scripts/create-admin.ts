/**
 * One-time script to create the first admin user
 * Run: npx tsx scripts/create-admin.ts
 *
 * Make sure to set GOOGLE_APPLICATION_CREDENTIALS environment variable
 * pointing to your service account key file.
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

// Replace with your service account path or use environment variable
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json'

// Admin user details - CHANGE THESE
const ADMIN_USER = {
  email: 'ahumuzacedric@gmail.com',  // Change this
  password: 'Urhumuzer@123', // Change this - min 6 chars
  displayName: 'Cedric Ahumuza',
}

async function createFirstAdmin() {
  try {
    // Initialize Firebase Admin
    initializeApp({
      credential: cert(serviceAccountPath),
    })

    const auth = getAuth()
    const db = getFirestore()

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email: ADMIN_USER.email,
      password: ADMIN_USER.password,
      displayName: ADMIN_USER.displayName,
      emailVerified: true,
    })

    console.log('✅ Created Firebase Auth user:', userRecord.uid)

    // Create Firestore user document with admin role
    const now = Timestamp.now()
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: ADMIN_USER.email,
      displayName: ADMIN_USER.displayName,
      role: 'admin',
      createdAt: now,
      updatedAt: now,
    })

    console.log('✅ Created Firestore admin profile')
    console.log('')
    console.log('Admin account created successfully!')
    console.log(`Email: ${ADMIN_USER.email}`)
    console.log(`Password: ${ADMIN_USER.password}`)
    console.log('')
    console.log('You can now log in at: http://localhost:5173/login')

  } catch (error) {
    console.error('❌ Error creating admin:', error)
    process.exit(1)
  }
}

createFirstAdmin()
