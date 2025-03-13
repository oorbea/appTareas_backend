import admin from 'firebase-admin';
import serviceAccount from '../../serviceAccountKey.json'; // Esto solo debería usarse en desarrollo
import dotenv from 'dotenv';

dotenv.config();

export default class FcmController {
  protected admin;
  protected projectId: string;
  protected clientEmail: string;
  protected privateKey: string;
  constructor () {
    this.projectId = process.env.FIREBASE_PROJECT_ID ?? serviceAccount.project_id;
    this.clientEmail = process.env.FIREBASE_CLIENT_EMAIL ?? serviceAccount.client_email;
    this.privateKey = process.env.FIREBASE_PRIVATE_KEY ?? serviceAccount.private_key;
    this.admin = admin;

    if (!admin.apps.length) this.initializeApp();
  }

  public async initializeApp (): Promise<void> {
    this.admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.projectId,
        clientEmail: this.clientEmail,
        privateKey: this.privateKey.replace(/\\n/g, '\n')
      })
    });
  }
}
