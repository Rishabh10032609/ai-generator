import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonText
} from '@ionic/react';
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useHistory } from 'react-router-dom';
import GeneratorForm from '../components/GeneratorForm';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const history = useHistory();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    history.replace('/login');
  };

  const [user, setUser] = useState<{email:string,role:string} | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      history.replace('/login');
      return;
    }

    api.getMe(token)
      .then((result) => setUser(result))
      .catch(async (err) => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            const refreshResponse = await api.refreshToken(refreshToken);
            localStorage.setItem('token', refreshResponse.access_token);
            const result = await api.getMe(refreshResponse.access_token);
            setUser(result);
            return;
          } catch (refreshErr) {
            console.error('Refresh failed:', refreshErr);
          }
        }

        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        history.replace('/login');
      });
  }, [history]);

  return (
    <IonPage>

      {/* HEADER */}
      <IonHeader>
        <IonToolbar className="dashboard-header">
          <IonTitle className="dashboard-title">
            🚀 AI Content Generator
          </IonTitle>
          {user && (
            <IonText className="header-user">{user.email} ({user.role})</IonText>
          )}

          <IonButton
            slot="end"
            fill="solid"
            color="light"
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </IonButton>
        </IonToolbar>
      </IonHeader>
      {/* CONTENT */}
      <IonContent className="dashboard-content">
        <GeneratorForm />
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;