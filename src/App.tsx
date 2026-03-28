import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect, Switch } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import UpdateModal from './components/UpdateModal';
import {
  checkForUpdates,
  setLastUpdateCheck,
  setUpdateDismissed,
  hasUserDismissedUpdate,
} from './services/updateService';

const isAuthenticated = () => !!localStorage.getItem('token');

/* Core CSS required for Ionic */
import '@ionic/react/css/core.css';

/* Basic CSS */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [isForceUpdate, setIsForceUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Check for updates on app launch
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const result = await checkForUpdates();

        if (result.updateAvailable && result.versionInfo) {
          // Only show if user hasn't dismissed this version
          if (!hasUserDismissedUpdate(result.versionInfo.latestVersion)) {
            setUpdateInfo(result.versionInfo);
            setIsForceUpdate(result.isForceUpdate);
            setUpdateModalOpen(true);
          }
        }

        setLastUpdateCheck();
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    };

    initializeApp();
  }, []);

  // Handle update installation
  const handleUpdateClick = async () => {
    setIsUpdating(true);
    try {
      // For Capacitor Android app, open Play Store update dialog
      // This requires Google Play In-App Update API integration in native code
      const url = `https://play.google.com/store/apps/details?id=io.ionic.starter`;
      
      // For Android: Open Play Store
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Development mode - just log
        console.log('Would open Play Store:', url);
        window.open(url, '_blank');
      } else {
        // Production: Use Capacitor browser
        try {
          const { Browser } = await import('@capacitor/browser');
          await Browser.open({ url });
        } catch {
          window.open(url, '_blank');
        }
      }

      setUpdateModalOpen(false);
    } catch (error) {
      console.error('Error during update:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle dismiss
  const handleDismiss = () => {
    if (updateInfo) {
      setUpdateDismissed(updateInfo.latestVersion);
    }
    setUpdateModalOpen(false);
  };

  return (
    <IonApp>
      <UpdateModal
        isOpen={updateModalOpen}
        versionInfo={updateInfo}
        isForceUpdate={isForceUpdate}
        onUpdate={handleUpdateClick}
        onDismiss={handleDismiss}
        isLoading={isUpdating}
      />
      <IonReactRouter>
        <IonRouterOutlet>
          <Switch>
            <Route exact path="/" render={() => <Redirect to="/login" />} />
            <Route
              exact
              path="/login"
              render={() => (isAuthenticated() ? <Redirect to="/dashboard" /> : <Login />)}
            />
            <Route
              exact
              path="/dashboard"
              render={() => (isAuthenticated() ? <Dashboard /> : <Redirect to="/login" />)}
            />
          </Switch>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;