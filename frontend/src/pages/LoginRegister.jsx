import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function LoginRegister() {
  const { login, register, forgotPassword } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Dynamic redirect check (e.g. from checkout redirect)
  const redirectUrl = searchParams.get('redirect') || '/';
  
  const [state, setState] = useState('login'); // 'login', 'register', 'forgot'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    newPassword: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await login(formData.email, formData.password);
      if (data.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(redirectUrl);
      }
    } catch (err) {
      setError(err || 'Failed to authenticate.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await register(formData.name, formData.email, formData.password);
      navigate(redirectUrl);
    } catch (err) {
      setError(err || 'Failed to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const msg = await forgotPassword(formData.email, formData.newPassword);
      setSuccess(msg + ' Please login with your new password.');
      setTimeout(() => {
        setState('login');
        setFormData({ ...formData, password: '', newPassword: '' });
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err || 'Reset failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-md py-xl bg-surface select-none">
      <div className="bg-white rounded-xl shadow-[0px_12px_32px_rgba(15,23,42,0.06)] border border-outline-variant/30 p-md lg:p-lg w-full max-w-[460px]">
        
        {/* Header */}
        <div className="text-center mb-lg">
          <h2 className="font-display-lg text-headline-md font-bold text-primary mb-xs">
            {state === 'login' && 'Welcome Back'}
            {state === 'register' && 'Create Account'}
            {state === 'forgot' && 'Reset Password'}
          </h2>
          <p className="font-body-sm text-body-sm text-secondary">
            {state === 'login' && 'Discover premium stays worldwide'}
            {state === 'register' && 'Join us for seamless hotel reservations'}
            {state === 'forgot' && 'Enter your email to update your password'}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-error-container/20 border border-error-container text-on-error-container font-semibold text-body-sm px-md py-sm rounded-lg text-center mb-md">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] font-semibold text-body-sm px-md py-sm rounded-lg text-center mb-md">
            ✓ {success}
          </div>
        )}

        {/* Form rendering */}
        {state === 'login' && (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-md">
            <div className="flex flex-col gap-xs">
              <label className="font-label-uppercase text-label-uppercase text-secondary">Email Address</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-md py-base border border-outline-variant/50 rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-primary"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="flex flex-col gap-xs">
              <label className="font-label-uppercase text-label-uppercase text-secondary">Password</label>
              <input
                type="password"
                name="password"
                required
                className="w-full px-md py-base border border-outline-variant/50 rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-primary"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>

            <button 
              type="submit" 
              disabled={submitting} 
              className="bg-[#FF7A00] hover:brightness-95 text-white font-bold py-md px-lg rounded-lg w-full transition-all active:scale-95 flex items-center justify-center gap-base mt-sm select-none"
            >
              <span className="material-symbols-outlined text-[20px]">login</span>
              {submitting ? 'Authenticating...' : 'Sign In'}
            </button>
            
            <div className="flex justify-between items-center mt-sm text-body-sm">
              <span 
                onClick={() => setState('forgot')} 
                className="text-secondary hover:text-primary cursor-pointer transition-colors font-semibold"
              >
                Forgot Password?
              </span>
              <span 
                onClick={() => setState('register')} 
                className="text-[#FF7A00] hover:underline cursor-pointer transition-colors font-bold"
              >
                Create Account
              </span>
            </div>
          </form>
        )}

        {state === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-md">
            <div className="flex flex-col gap-xs">
              <label className="font-label-uppercase text-label-uppercase text-secondary">Full Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-md py-base border border-outline-variant/50 rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-primary"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-uppercase text-label-uppercase text-secondary">Email Address</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-md py-base border border-outline-variant/50 rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-primary"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-uppercase text-label-uppercase text-secondary">Password</label>
              <input
                type="password"
                name="password"
                required
                className="w-full px-md py-base border border-outline-variant/50 rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-primary"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-uppercase text-label-uppercase text-secondary">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                className="w-full px-md py-base border border-outline-variant/50 rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-primary"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
            </div>

            <button 
              type="submit" 
              disabled={submitting} 
              className="bg-[#FF7A00] hover:brightness-95 text-white font-bold py-md px-lg rounded-lg w-full transition-all active:scale-95 flex items-center justify-center gap-base mt-sm select-none"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
            
            <div className="text-center mt-sm text-body-sm">
              <span 
                onClick={() => setState('login')} 
                className="text-[#FF7A00] hover:underline cursor-pointer transition-colors font-bold"
              >
                Already have an account? Sign In
              </span>
            </div>
          </form>
        )}

        {state === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="flex flex-col gap-md">
            <div className="flex flex-col gap-xs">
              <label className="font-label-uppercase text-label-uppercase text-secondary">Email Address</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-md py-base border border-outline-variant/50 rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-primary"
                placeholder="your-email@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-uppercase text-label-uppercase text-secondary">New Password</label>
              <input
                type="password"
                name="newPassword"
                required
                className="w-full px-md py-base border border-outline-variant/50 rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-primary"
                placeholder="Minimum 6 characters"
                value={formData.newPassword}
                onChange={handleInputChange}
              />
            </div>

            <button 
              type="submit" 
              disabled={submitting} 
              className="bg-[#FF7A00] hover:brightness-95 text-white font-bold py-md px-lg rounded-lg w-full transition-all active:scale-95 flex items-center justify-center gap-base mt-sm select-none"
            >
              <span className="material-symbols-outlined text-[20px]">lock_reset</span>
              {submitting ? 'Resetting password...' : 'Update Password'}
            </button>
            
            <div className="text-center mt-sm text-body-sm">
              <span 
                onClick={() => setState('login')} 
                className="text-secondary hover:text-primary cursor-pointer transition-colors font-semibold"
              >
                Back to Login
              </span>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
