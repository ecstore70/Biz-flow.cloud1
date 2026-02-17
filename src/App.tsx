import React from 'react';
import { LandingPage } from './components/LandingPage';

export const App: React.FC = () => {
  const handleStart = () => {
    // TODO: navigate to registration or main app
    console.log('Start clicked');
  };

  const handleLogin = () => {
    // TODO: navigate to login screen
    console.log('Login clicked');
  };

  const handleOpenLegal = (tab: 'PRIVACY' | 'SECURITY' | 'TERMS') => {
    // TODO: open modal or route to legal content
    alert(`Open legal: ${tab}`);
  };

  return (
    <LandingPage
      onStart={handleStart}
      onLogin={handleLogin}
      onOpenLegal={handleOpenLegal}
      showInstallButton={false}
    />
  );
};