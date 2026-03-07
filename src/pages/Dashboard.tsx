import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import GeneratorForm from '../components/GeneratorForm';

const Dashboard: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>AI Content Generator</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <GeneratorForm />
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;


