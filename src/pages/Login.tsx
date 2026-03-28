import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent, IonButton, IonInput, IonIcon, IonSpinner, IonText } from '@ionic/react';
import { mail, lockClosed, eye, eyeOff, arrowForward } from 'ionicons/icons';
import { api } from '../services/api';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDark, setIsDark] = useState(false);
  const history = useHistory();

  // Detect dark mode
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const isAuthenticated = () => !!localStorage.getItem('token');

  useEffect(() => {
    if (isAuthenticated()) {
      history.replace('/dashboard');
    }
  }, [history]);

  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = isRegister 
        ? await api.register({ email, password }) 
        : await api.login({ email, password });

      localStorage.setItem('token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }

      history.replace('/dashboard');
    } catch (error: any) {
      const message = error?.message || 'An error occurred. Please try again.';
      setError(message);
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setIsRegister(!isRegister);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <IonPage>
      <IonContent className={`login-page ${isDark ? 'dark-theme' : 'light-theme'}`}>
        <div className="login-wrapper">
          {/* TOP DECORATION */}
          <div className="decoration-top"></div>

          {/* LOGO & HEADER */}
          <div className="header-section">
            <div className="logo-circle">🚀</div>
            <h1 className="app-title">AI Content Generator</h1>
            <p className="app-subtitle">
              {isRegister 
                ? 'Join us and start creating amazing content' 
                : 'Welcome back! Login to continue'}
            </p>
          </div>

          {/* FORM SECTION */}
          <div className={`form-container ${isRegister ? 'register-mode' : 'login-mode'}`}>
            {/* AUTH CARD */}
            <div className="auth-card">
              {/* TABS */}
              <div className="auth-tabs">
                <button
                  className={`tab ${!isRegister ? 'active' : ''}`}
                  onClick={() => !loading && handleToggleMode()}
                >
                  <span>Login</span>
                  {!isRegister && <div className="tab-indicator"></div>}
                </button>
                <button
                  className={`tab ${isRegister ? 'active' : ''}`}
                  onClick={() => !loading && handleToggleMode()}
                >
                  <span>Register</span>
                  {isRegister && <div className="tab-indicator"></div>}
                </button>
              </div>

              {/* ERROR MESSAGE */}
              {error && (
                <div className="error-banner">
                  <p>{error}</p>
                </div>
              )}

              {/* EMAIL INPUT */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <IonIcon icon={mail} className="input-icon" />
                  <IonInput
                    className="form-input"
                    placeholder="Enter your email"
                    type="email"
                    value={email}
                    onIonChange={(e) => {
                      setEmail(e.detail.value!);
                      setError('');
                    }}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* PASSWORD INPUT */}
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <IonIcon icon={lockClosed} className="input-icon" />
                  <IonInput
                    className="form-input"
                    placeholder="Enter your password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onIonChange={(e) => {
                      setPassword(e.detail.value!);
                      setError('');
                    }}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                  <button
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    <IonIcon icon={showPassword ? eyeOff : eye} />
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD INPUT (Register only) */}
              {isRegister && (
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <IonIcon icon={lockClosed} className="input-icon" />
                    <IonInput
                      className="form-input"
                      placeholder="Confirm your password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onIonChange={(e) => {
                        setConfirmPassword(e.detail.value!);
                        setError('');
                      }}
                      onKeyPress={handleKeyPress}
                      disabled={loading}
                    />
                    <button
                      className="toggle-password"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      type="button"
                    >
                      <IonIcon icon={showConfirmPassword ? eyeOff : eye} />
                    </button>
                  </div>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <IonButton
                className="submit-button"
                onClick={handleSubmit}
                disabled={loading || !email || !password || (isRegister && !confirmPassword)}
              >
                {loading ? (
                  <IonSpinner name="crescent" />
                ) : (
                  <>
                    <span>{isRegister ? 'Create Account' : 'Login'}</span>
                    <IonIcon icon={arrowForward} slot="end" />
                  </>
                )}
              </IonButton>

              {/* TOGGLE LINK */}
              <div className="auth-toggle">
                <p>
                  {isRegister 
                    ? 'Already have an account? ' 
                    : "Don't have an account? "}
                </p>
                <button
                  className="toggle-link"
                  onClick={handleToggleMode}
                  disabled={loading}
                  type="button"
                >
                  {isRegister ? 'Login here' : 'Register here'}
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM DECORATION */}
          <div className="decoration-bottom"></div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;