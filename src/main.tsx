import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global Google Maps auth/quota error tap
(window as any).gm_authFailure = () => {
  console.warn('Google Maps authentication failure detected (invalid key, missing billing, or referrer restriction).');
  window.dispatchEvent(new CustomEvent('gmp-auth-failed'));
};

createRoot(document.getElementById('root')!).render(<App />);
