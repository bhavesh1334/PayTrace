import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { store } from '../store';
import { setPeopleError } from '../store/peopleSlice';

export class OfflineManager {
  private static unsubscribe: (() => void) | null = null;

  public static startMonitoring(onConnectionChange?: (isConnected: boolean) => void) {
    if (this.unsubscribe) return;

    this.unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isConnected = !!state.isConnected && !!state.isInternetReachable;
      
      if (onConnectionChange) {
        onConnectionChange(isConnected);
      }

      if (!isConnected) {
        // Dispatch warning state or offline mode to redux if needed
        console.log('App is currently offline.');
      } else {
        console.log('App is online.');
      }
    });
  }

  public static stopMonitoring() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  public static async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return !!state.isConnected && !!state.isInternetReachable;
  }
}
