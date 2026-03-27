import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonText
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import GeneratorForm from '../components/GeneratorForm';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const history = useHistory();

  const handleLogout = () => {
    localStorage.removeItem('token');
    history.replace('/login');
  };

  return (
    <IonPage>

      {/* HEADER */}
      <IonHeader>
        <IonToolbar className="dashboard-header">
          <IonTitle className="dashboard-title">
            🚀 AI Content Generator
          </IonTitle>

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