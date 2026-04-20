import NetInfo from '@react-native-community/netinfo';
import { getUnsyncedActivities, markSynced } from './database';
import api from './api';

export const syncOfflineData = async () => {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return;

  const unsynced = await getUnsyncedActivities();
  for (const item of unsynced) {
    try {
      const payload = {
        client_uuid: item.client_uuid,
        activity_type: item.activity_type,
        farmer: item.farmer_id,
        date: item.date,
        time: item.time,
        notes: item.notes,
        gps_latitude: item.gps_latitude,
        gps_longitude: item.gps_longitude,
        photos: JSON.parse(item.photos || '[]'),
      };

      if (item.activity_type === 'Visit') {
        payload.visit_purpose = item.visit_purpose;
      }

      await api.logActivity(payload);
      await markSynced(item.id);
    } catch (e) {
      console.error('Sync failed for item', item.id, e);
      // Backend handles idempotent sync via client_uuid
    }
  }
};
