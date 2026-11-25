import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { authApi } from '../../../api/authApi';
import { extractApiError, formatDate } from '../../../utils/formatters';
import ErrorMessage from '../../../components/ErrorMessage';

export default function BuyerProfile() {
  const { user, updateProfile } = useAuth();

  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    location: user?.location || '',
  });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwdForm, setPwdForm] = useState({ old_password: '', new_password: '' });
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdErr, setPwdErr] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    setSavingProfile(true);
    try {
      await updateProfile(profileForm);
      setProfileMsg('Profile updated successfully.');
    } catch (err) {
      setProfileErr(extractApiError(err, 'Could not update profile.').message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdMsg('');
    setPwdErr('');
    setSavingPwd(true);
    try {
      await authApi.changePassword(pwdForm);
      setPwdMsg('Password updated successfully.');
      setPwdForm({ old_password: '', new_password: '' });
    } catch (err) {
      const parsed = extractApiError(err, 'Could not update password.');
      setPwdErr(
        parsed.fieldErrors.old_password ||
          parsed.fieldErrors.new_password ||
          parsed.message
      );
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
          Account Settings
        </p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Buyer Profile
        </h1>
        <p className="mt-1 text-xs text-ink-muted">
          Registered Email: <span className="font-semibold text-ink">{user?.email}</span> &middot;
          Member since {formatDate(user?.date_joined)}
        </p>
      </div>

      <form onSubmit={handleProfileSubmit} className="card-surface space-y-5 p-6 sm:p-8">
        <h2 className="font-serif text-lg font-semibold text-ink">Personal Information</h2>
        <ErrorMessage message={profileErr} />
        {profileMsg && (
          <div className="rounded-md border border-[#BFD6C9] bg-forest-light px-4 py-3 text-sm font-medium text-forest">
            {profileMsg}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-ink">
              First Name
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              required
              value={profileForm.first_name}
              onChange={handleProfileChange}
              className="input-field mt-1"
            />
          </div>

          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-ink">
              Last Name
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              required
              value={profileForm.last_name}
              onChange={handleProfileChange}
              className="input-field mt-1"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-ink">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={profileForm.phone}
              onChange={handleProfileChange}
              className="input-field mt-1"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-ink">
              City &amp; State
            </label>
            <input
              id="location"
              name="location"
              type="text"
              required
              value={profileForm.location}
              onChange={handleProfileChange}
              className="input-field mt-1"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={savingProfile} className="btn-primary">
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <form onSubmit={handlePasswordSubmit} className="card-surface space-y-5 p-6 sm:p-8">
        <h2 className="font-serif text-lg font-semibold text-ink">Change Password</h2>
        <ErrorMessage message={pwdErr} />
        {pwdMsg && (
          <div className="rounded-md border border-[#BFD6C9] bg-forest-light px-4 py-3 text-sm font-medium text-forest">
            {pwdMsg}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="old_password" className="block text-sm font-medium text-ink">
              Current Password
            </label>
            <input
              id="old_password"
              type="password"
              required
              value={pwdForm.old_password}
              onChange={(e) => setPwdForm((p) => ({ ...p, old_password: e.target.value }))}
              className="input-field mt-1"
            />
          </div>

          <div>
            <label htmlFor="new_password" className="block text-sm font-medium text-ink">
              New Password (min 8 characters)
            </label>
            <input
              id="new_password"
              type="password"
              required
              minLength={8}
              value={pwdForm.new_password}
              onChange={(e) => setPwdForm((p) => ({ ...p, new_password: e.target.value }))}
              className="input-field mt-1"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={savingPwd} className="btn-secondary">
            {savingPwd ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}