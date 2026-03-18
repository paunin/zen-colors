import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { FullscreenPlayground } from './FullscreenPlayground';
import './App.css';

function Router() {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (route === '#/playground') {
    return <FullscreenPlayground />;
  }

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router />
  </StrictMode>
);
