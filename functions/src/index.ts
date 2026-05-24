import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export triggers
export { onUserCreated } from './triggers/onUserCreated';
export { onUserDeleted } from './triggers/onUserDeleted';
export { onTransactionWrite } from './triggers/onTransactionWrite';

// Export callables
export { deleteUserAccount } from './callables/deleteUserAccount';
