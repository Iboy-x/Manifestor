// Authentication hook for Firebase Auth
// This is a basic structure - implement actual Firebase auth logic as needed

import { useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for real Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        });
        // Create user doc in Firestore if not exists
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            createdAt: new Date().toISOString(),
          }, { merge: true });
        } else {
          // Update email verification status in Firestore
          await setDoc(userRef, {
            emailVerified: firebaseUser.emailVerified,
          }, { merge: true });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update profile with display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
        
        // Send email verification
        await sendEmailVerification(userCredential.user, {
          url: window.location.origin + '/intro', // Redirect URL after verification
          handleCodeInApp: false,
        });
      }
      return userCredential.user;
    } catch (error) {
      console.error('Email sign-up error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Email sign-in error:', error);
      throw error;
    }
  };

  const sendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }
    
    try {
      await sendEmailVerification(auth.currentUser, {
        url: window.location.origin + '/intro',
        handleCodeInApp: false,
      });
    } catch (error) {
      console.error('Send verification email error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      console.log('User signed out');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    sendVerificationEmail,
    resetPassword,
    signOut
  };
};