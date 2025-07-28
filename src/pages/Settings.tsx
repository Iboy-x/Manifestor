import { useState } from 'react';
import { Moon, Sun, Bell, LogOut, User, Shield, Palette, Clock, Pencil, Check, X, Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile, deleteUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [reminderTime, setReminderTime] = useState('19:00');
  const { signOut, user, sendVerificationEmail } = useAuth();

  // Editable display name state
  const [editingName, setEditingName] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState(user?.displayName || '');
  const [savingName, setSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState('');

  // Email verification state
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState('');
  const [verificationError, setVerificationError] = useState('');

  const navigate = useNavigate();

  // Delete account confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleLogout = async () => {
    await signOut();
  };

  const displayName = user?.displayName || 'Manifestor User';
  const email = user?.email || 'user@example.com';
  const photoURL = user?.photoURL;
  const isEmailUser = user?.email && !user.email.includes('@gmail.com') && !user.email.includes('@google.com');
  const isEmailVerified = user?.emailVerified;

  const handleEditName = () => {
    setEditingName(true);
    setDisplayNameInput(displayName);
    setNameSuccess(false);
    setNameError('');
  };

  const handleCancelEditName = () => {
    setEditingName(false);
    setNameError('');
  };

  const handleSaveName = async () => {
    if (!user) return;
    setSavingName(true);
    setNameError('');
    try {
      await updateProfile(auth.currentUser, { displayName: displayNameInput });
      // Update in Firestore as well
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { displayName: displayNameInput });
      setNameSuccess(true);
      setEditingName(false);
      window.location.reload(); // To update the UI with new name
    } catch (err) {
      setNameError('Failed to update name.');
    } finally {
      setSavingName(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingVerification(true);
    setVerificationError('');
    setVerificationSuccess('');
    try {
      await sendVerificationEmail();
      setVerificationSuccess('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      setVerificationError(error.message || 'Failed to send verification email');
    } finally {
      setResendingVerification(false);
    }
  };

  const functions = getFunctions();

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    setDeleteError('');
    try {
      // 1. Call the backend function to delete all user data
      const deleteUserData = httpsCallable(functions, 'deleteUserData');
      await deleteUserData();

      // 2. Delete Auth user
      await deleteUser(auth.currentUser);

      // 3. Redirect to intro
      navigate('/intro', { replace: true });
    } catch (err) {
      setDeleteError('Failed to delete account. Please re-authenticate and try again.');
    } finally {
      setDeleting(false);
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // Toggle dark mode class on document
    document.documentElement.classList.toggle('dark');
  };

  const saveReminderTime = (time: string) => {
    setReminderTime(time);
    localStorage.setItem('dailyReminderTime', time);
    console.log('Reminder time saved:', time);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      {/* Account Section */}
      <section className="manifestor-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Account</h2>
            <p className="text-sm text-muted-foreground">Manage your account information</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Profile Picture */}
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium text-foreground">Profile Picture</div>
              <div className="text-sm text-muted-foreground">Your profile picture from your account</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="w-12 h-12 rounded-full" />
              ) : (
                <User className="w-6 h-6 text-accent" />
              )}
            </div>
          </div>

          {/* Display Name */}
          <div className="flex items-center justify-between py-3">
            <div className="flex-1">
              <div className="font-medium text-foreground">Display Name</div>
              <div className="text-sm text-muted-foreground">How your name appears in the app</div>
            </div>
            <div className="flex items-center gap-2">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={displayNameInput}
                    onChange={(e) => setDisplayNameInput(e.target.value)}
                    className="px-3 py-1 bg-background border border-border rounded-md text-foreground text-sm"
                    placeholder="Enter name"
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="h-8 px-2"
                  >
                    {savingName ? 'Saving...' : <Check className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEditName}
                    className="h-8 px-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-foreground">{displayName}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleEditName}
                    className="h-8 px-2"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            {nameSuccess && <div className="text-green-500 text-xs">Name updated!</div>}
            {nameError && <div className="text-red-500 text-xs mt-1">{nameError}</div>}
          </div>

          {/* Email */}
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium text-foreground">Email</div>
              <div className="text-sm text-muted-foreground">{email}</div>
            </div>
            <div className="flex items-center gap-2">
              {isEmailUser && (
                <div className="flex items-center gap-2">
                  {isEmailVerified ? (
                    <div className="flex items-center gap-1 text-green-500 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-yellow-500 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      Unverified
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Email Verification for Email Users */}
          {isEmailUser && !isEmailVerified && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-yellow-500 mb-1">Email Not Verified</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Please verify your email address to access all features. Check your inbox for a verification link.
                  </p>
                  {verificationSuccess && (
                    <div className="text-green-500 text-sm mb-2">{verificationSuccess}</div>
                  )}
                  {verificationError && (
                    <div className="text-red-500 text-sm mb-2">{verificationError}</div>
                  )}
                  <Button
                    onClick={handleResendVerification}
                    disabled={resendingVerification}
                    size="sm"
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    {resendingVerification ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Password (info only) */}
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium text-foreground">Password</div>
              <div className="text-sm text-muted-foreground">
                {user?.email?.includes('@gmail.com') || user?.email?.includes('@google.com') 
                  ? 'Google sign-in users manage their password via their Google Account.'
                  : 'Email/password users can reset their password from the login page.'
                }
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              {user?.email?.includes('@gmail.com') || user?.email?.includes('@google.com') 
                ? 'Google Account'
                : 'Email Account'
              }
            </Button>
          </div>
        </div>
      </section>

      {/* Appearance Section */}
      <section className="manifestor-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
            <Palette className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Appearance</h2>
            <p className="text-sm text-muted-foreground">Customize how Manifestor looks</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5 text-foreground" /> : <Sun className="w-5 h-5 text-foreground" />}
              <div>
                <Label className="font-medium text-foreground">Dark Mode</Label>
                <div className="text-sm text-muted-foreground">Toggle between light and dark themes</div>
              </div>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={toggleTheme}
            />
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="manifestor-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
            <Bell className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
            <p className="text-sm text-muted-foreground">Manage your notification preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <Label className="font-medium text-foreground">Daily Reminders</Label>
              <div className="text-sm text-muted-foreground">Get reminded to reflect on your day</div>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>

          {notifications && (
            <div className="flex items-center justify-between py-3">
              <div>
                <Label className="font-medium text-foreground">Reminder Time</Label>
                <div className="text-sm text-muted-foreground">When to send daily reminders</div>
              </div>
              <Select value={reminderTime} onValueChange={saveReminderTime}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="08:00">8:00 AM</SelectItem>
                  <SelectItem value="12:00">12:00 PM</SelectItem>
                  <SelectItem value="17:00">5:00 PM</SelectItem>
                  <SelectItem value="19:00">7:00 PM</SelectItem>
                  <SelectItem value="21:00">9:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </section>

      {/* Security Section */}
      <section className="manifestor-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Security</h2>
            <p className="text-sm text-muted-foreground">Manage your account security</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium text-foreground">Sign Out</div>
              <div className="text-sm text-muted-foreground">Sign out of your account</div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium text-destructive">Delete Account</div>
              <div className="text-sm text-muted-foreground">Permanently delete your account and all data</div>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteConfirm(true)}
              className="gap-2"
            >
              <Shield className="w-4 h-4" />
              Delete Account
            </Button>
          </div>
        </div>
      </section>

      {/* Delete Account Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete Account</h3>
            <p className="text-muted-foreground mb-4">
              This action cannot be undone. All your dreams, reflections, and data will be permanently deleted.
            </p>
            
            <div className="space-y-3">
              <Label htmlFor="delete-confirm" className="text-sm text-muted-foreground">
                Type "DELETE" to confirm
              </Label>
              <input
                id="delete-confirm"
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
                placeholder="DELETE"
              />
            </div>

            {deleteError && (
              <div className="text-red-500 text-sm mt-2">{deleteError}</div>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteInput('');
                  setDeleteError('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteInput !== 'DELETE' || deleting}
                className="flex-1"
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}