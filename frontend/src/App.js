import React, { useState } from 'react';
import Register from './Register';
import Login from './Login';
import VerifyOTP from './VerifyOTP';
import Dashboard from './Dashboard';

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0f1117',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: '#e2e8f0',
    padding: '20px',
  },
  container: {
    width: '100%',
    maxWidth: '420px',
  },
  title: {
    fontFamily: 'monospace',
    fontSize: '1.4rem',
    color: '#06d6a0',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subtitle: {
    color: '#7b8db0',
    fontSize: '0.85rem',
    textAlign: 'center',
    marginBottom: '32px',
    letterSpacing: '0.05em',
  },
};

// Main App component that manages the state of the application and renders different screens based on user actions.
function App() {
  // State to manage the current screen and the logged-in username.
  const [screen, setScreen] = useState('login');
  // State to store the username of the logged-in user.
  const [username, setUsername] = useState('');

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>MFA System</h1>
        <p style={styles.subtitle}>Secure sign-in with multi-factor authentication</p>

        {/* Render the appropriate screen based on the current state. */}
        {screen === 'register' && <Register onSuccess={() => setScreen('login')} />}
        {screen === 'login' && (
          <Login
            onSuccess={(user) => {
              setUsername(user);
              setScreen('verify');
            }}
            onRegister={() => setScreen('register')}
          />
        )}
        {screen === 'verify' && <VerifyOTP onSuccess={() => setScreen('dashboard')} />}
        {screen === 'dashboard' && <Dashboard username={username} onLogout={() => setScreen('login')} />}
      </div>
    </div>
  );
}

export default App;

