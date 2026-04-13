import * as admin from 'firebase-admin';
import { onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { sendEmail, generateVerificationCode, verifySMTPConnection } from './emailService';

const db = admin.firestore();

// Send verification email
export const sendVerificationEmail = onCall(async (request: CallableRequest) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Authentication required.');

  const { email, username } = (request.data || {}) as { email?: string; username?: string };
  if (!email || typeof email !== 'string') {
    throw new HttpsError('invalid-argument', 'Email address required');
  }

  try {
    // Generate verification code
    const code = generateVerificationCode();

    // Save verification code to Firestore with expiration (30 minutes)
    const verificationRef = db.collection('emailVerifications').doc(uid);
    await verificationRef.set({
      uid,
      email,
      code,
      username: username || '',
      attempts: 0,
      verified: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000)), // 30 minutes
    });

    // Send email
    const result = await sendEmail(email, 'verification', {
      code,
      username: username || 'Kullanıcı',
    });

    if (!result.success) {
      throw new HttpsError('internal', 'Failed to send verification email');
    }

    return { success: true, message: 'Verification email sent' };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new HttpsError('internal', 'Failed to send verification email');
  }
});

// Verify email code
export const verifyEmailCode = onCall(async (request: CallableRequest) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Authentication required.');

  const { code } = (request.data || {}) as { code?: string };
  if (!code || typeof code !== 'string') {
    throw new HttpsError('invalid-argument', 'Verification code required');
  }

  try {
    const verificationRef = db.collection('emailVerifications').doc(uid);
    const verificationSnap = await verificationRef.get();

    if (!verificationSnap.exists) {
      throw new HttpsError('not-found', 'No verification request found');
    }

    const verificationData = verificationSnap.data() as any;

    // Check if already verified
    if (verificationData.verified) {
      throw new HttpsError('already-exists', 'Email already verified');
    }

    // Check expiration
    const now = admin.firestore.Timestamp.now();
    if (verificationData.expiresAt && verificationData.expiresAt.toMillis() < now.toMillis()) {
      throw new HttpsError('deadline-exceeded', 'Verification code expired');
    }

    // Check max attempts (5 attempts)
    if (verificationData.attempts >= 5) {
      throw new HttpsError('resource-exhausted', 'Too many attempts. Please request a new code.');
    }

    // Increment attempts
    await verificationRef.update({
      attempts: admin.firestore.FieldValue.increment(1),
    });

    // Verify code
    if (verificationData.code !== code) {
      throw new HttpsError('invalid-argument', 'Invalid verification code');
    }

    // Mark as verified
    await verificationRef.update({
      verified: true,
      verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update user profile
    const userRef = db.collection('users').doc(uid);
    await userRef.update({
      emailVerified: true,
      emailVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: 'Email verified successfully' };
  } catch (error) {
    console.error('Error verifying email:', error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', 'Failed to verify email');
  }
});

// Resend verification email
export const resendVerificationEmail = onCall(async (request: CallableRequest) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Authentication required.');

  try {
    const verificationRef = db.collection('emailVerifications').doc(uid);
    const verificationSnap = await verificationRef.get();

    if (!verificationSnap.exists) {
      throw new HttpsError('not-found', 'No verification request found. Please start the verification process.');
    }

    const verificationData = verificationSnap.data() as any;

    // Check if already verified
    if (verificationData.verified) {
      throw new HttpsError('already-exists', 'Email already verified');
    }

    // Check rate limit (can only resend every 60 seconds)
    const now = admin.firestore.Timestamp.now();
    if (verificationData.lastSentAt) {
      const lastSent = verificationData.lastSentAt.toMillis();
      const timeDiff = now.toMillis() - lastSent;
      if (timeDiff < 60000) { // 60 seconds
        const waitSeconds = Math.ceil((60000 - timeDiff) / 1000);
        throw new HttpsError('resource-exhausted', `Please wait ${waitSeconds} seconds before requesting a new code.`);
      }
    }

    // Generate new code
    const code = generateVerificationCode();

    // Update verification record
    await verificationRef.update({
      code,
      attempts: 0,
      lastSentAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000)),
    });

    // Send email
    const result = await sendEmail(verificationData.email, 'verification', {
      code,
      username: verificationData.username || 'Kullanıcı',
    });

    if (!result.success) {
      throw new HttpsError('internal', 'Failed to send verification email');
    }

    return { success: true, message: 'New verification email sent' };
  } catch (error) {
    console.error('Error resending verification email:', error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', 'Failed to resend verification email');
  }
});

// Send password reset email
export const sendPasswordResetEmail = onCall(async (request: CallableRequest) => {
  const { email } = (request.data || {}) as { email?: string };
  if (!email || typeof email !== 'string') {
    throw new HttpsError('invalid-argument', 'Email address required');
  }

  try {
    // Find user by email
    const usersRef = db.collection('users');
    const query = usersRef.where('email', '==', email).limit(1);
    const snapshot = await query.get();

    if (snapshot.empty) {
      // Don't reveal if email exists or not for security
      return { success: true, message: 'If the email exists, a reset code has been sent.' };
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // Generate reset code
    const code = generateVerificationCode();

    // Save reset code
    const resetRef = db.collection('passwordResets').doc(userDoc.id);
    await resetRef.set({
      uid: userDoc.id,
      email,
      code,
      attempts: 0,
      used: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000)),
    });

    // Send email
    const result = await sendEmail(email, 'passwordReset', {
      code,
      username: userData.username || 'Kullanıcı',
    });

    if (!result.success) {
      throw new HttpsError('internal', 'Failed to send password reset email');
    }

    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new HttpsError('internal', 'Failed to send password reset email');
  }
});

// Verify password reset code and update password
export const verifyPasswordResetCode = onCall(async (request: CallableRequest) => {
  const { email, code, newPassword } = (request.data || {}) as {
    email?: string;
    code?: string;
    newPassword?: string;
  };

  if (!email || !code || !newPassword) {
    throw new HttpsError('invalid-argument', 'Email, code, and new password are required');
  }

  try {
    // Find user
    const usersRef = db.collection('users');
    const query = usersRef.where('email', '==', email).limit(1);
    const snapshot = await query.get();

    if (snapshot.empty) {
      throw new HttpsError('not-found', 'User not found');
    }

    const userDoc = snapshot.docs[0];

    // Get reset record
    const resetRef = db.collection('passwordResets').doc(userDoc.id);
    const resetSnap = await resetRef.get();

    if (!resetSnap.exists) {
      throw new HttpsError('not-found', 'No reset request found');
    }

    const resetData = resetSnap.data() as any;

    // Check if used
    if (resetData.used) {
      throw new HttpsError('already-exists', 'Reset code already used');
    }

    // Check expiration
    const now = admin.firestore.Timestamp.now();
    if (resetData.expiresAt && resetData.expiresAt.toMillis() < now.toMillis()) {
      throw new HttpsError('deadline-exceeded', 'Reset code expired');
    }

    // Check max attempts
    if (resetData.attempts >= 5) {
      throw new HttpsError('resource-exhausted', 'Too many attempts. Please request a new code.');
    }

    // Increment attempts
    await resetRef.update({
      attempts: admin.firestore.FieldValue.increment(1),
    });

    // Verify code
    if (resetData.code !== code) {
      throw new HttpsError('invalid-argument', 'Invalid reset code');
    }

    // Mark as used
    await resetRef.update({
      used: true,
      usedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update password in Firebase Auth
    await admin.auth().updateUser(userDoc.id, {
      password: newPassword,
    });

    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    console.error('Error verifying password reset:', error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', 'Failed to reset password');
  }
});

// Check email verification status
export const checkEmailVerificationStatus = onCall(async (request: CallableRequest) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Authentication required.');

  try {
    const verificationRef = db.collection('emailVerifications').doc(uid);
    const verificationSnap = await verificationRef.get();

    if (!verificationSnap.exists) {
      return { verified: false, email: null };
    }

    const verificationData = verificationSnap.data() as any;

    return {
      verified: verificationData.verified || false,
      email: verificationData.email || null,
      verifiedAt: verificationData.verifiedAt || null,
    };
  } catch (error) {
    console.error('Error checking verification status:', error);
    throw new HttpsError('internal', 'Failed to check verification status');
  }
});

// Send welcome email on user creation
export const sendWelcomeEmail = onDocumentCreated('users/{userId}', async (event) => {
  const userData = event.data?.data();
  if (!userData) return;

  const { email, username } = userData as { email?: string; username?: string };

  if (!email) {
    console.log('No email found for user:', event.params.userId);
    return;
  }

  try {
    // Wait a bit to ensure user is fully created
    await new Promise(resolve => setTimeout(resolve, 5000));

    const result = await sendEmail(email, 'welcome', {
      username: username || 'Kullanıcı',
    });

    if (result.success) {
      console.log('Welcome email sent to:', email);
    } else {
      console.error('Failed to send welcome email:', result.error);
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
});

// Test SMTP connection
export const testSMTPConnection = onCall(async (request: CallableRequest) => {
  // Only allow admins to test
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Authentication required.');

  try {
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      throw new HttpsError('not-found', 'User not found');
    }

    const userData = userSnap.data();
    if (userData?.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }

    const isConnected = await verifySMTPConnection();

    return {
      success: isConnected,
      message: isConnected ? 'SMTP connection successful' : 'SMTP connection failed',
    };
  } catch (error) {
    console.error('Error testing SMTP:', error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', 'Failed to test SMTP connection');
  }
});
