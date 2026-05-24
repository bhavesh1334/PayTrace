import * as functions from 'firebase-functions';
import { cascadeDeleteUser } from '../utils/cascadeDelete';

export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  try {
    await cascadeDeleteUser(user.uid);
    console.log(`Successfully cascaded deletion for user: ${user.uid}`);
  } catch (error) {
    console.error(`Failed to cascade deletion for user ${user.uid}:`, error);
  }
});
