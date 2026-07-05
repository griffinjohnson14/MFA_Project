import React, { useState } from 'react';
import Register from './Register';
import Login from './Login';
import VerifyOTP from './VerifyOTP';
import Dashboard from './Dashboard';

{/* Main App component that manages the state of the application and renders different screens based on user actions. */}
function App() {
  {/* State to manage the current screen and the logged-in username. */}
  const [screen, setScreen] = useState('login');
  {/* State to store the username of the logged-in user. */}
  const [username, setUsername] = useState('');

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>MFA System</h1>

      {/* Render the appropriate screen based on the current state, must be true */}
      {screen === 'register' && (<Register onSuccess={() => setScreen('login')} />)}
      {screen === 'login' && (<Login onSuccess={(user) => { setUsername(user); setScreen('verify'); }} onRegister={() => setScreen('register')}/>)}
      {screen === 'verify' && (<VerifyOTP onSuccess={() => setScreen('dashboard')}/>)}
      {screen === 'dashboard' && (<Dashboard username={username} onLogout={() => setScreen('login')} />)}
    </div>
  );
}

export default App;