import React from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { download } from 'ionicons/icons';

interface UpdateModalProps {
  isOpen: boolean;
  versionInfo: {
    latestVersion: string;
    releaseNotes: string;
  } | null;
  isForceUpdate: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
  isLoading?: boolean;
}

const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  versionInfo,
  isForceUpdate,
  onUpdate,
  onDismiss,
  isLoading = false,
}) => {
  if (!versionInfo) return null;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss} backdropDismiss={!isForceUpdate}>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Update Available</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ marginBottom: '20px', marginTop: '20px' }}>
          <h2>Version {versionInfo.latestVersion}</h2>

          <div
            style={{
              background: '#f5f5f5',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Release Notes</h3>
            <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {versionInfo.releaseNotes}
            </p>
          </div>

          {isForceUpdate && (
            <div
              style={{
                background: '#fff3cd',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #ffc107',
              }}
            >
              <strong style={{ color: '#856404' }}>
                ⚠️ This is a required update. You must update to continue using the app.
              </strong>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
          {!isForceUpdate && (
            <IonButton color="medium" onClick={onDismiss} disabled={isLoading}>
              Later
            </IonButton>
          )}
          <IonButton
            color="primary"
            onClick={onUpdate}
            disabled={isLoading}
            expand="block"
          >
            <IonIcon icon={download} slot="start" />
            {isLoading ? 'Updating...' : 'Update Now'}
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default UpdateModal;
