import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { theme } from '../theme';
import { queueActivity } from '../services/database';
import { syncOfflineData } from '../services/sync';

export default function LogVisitScreen({ route, navigation }) {
  const { farmerId, farmerName } = route.params;
  const [purpose, setPurpose] = useState('Routine');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  const handleSave = async () => {
    if (!notes) {
      Alert.alert('Missing Info', 'Please add some notes about the visit.');
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const activity = {
        client_uuid: Math.random().toString(36).substring(7), // In production use a proper UUID lib
        activity_type: 'Visit',
        farmer_id: farmerId,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0],
        visit_purpose: purpose,
        notes: notes,
        gps_latitude: location?.latitude || 0,
        gps_longitude: location?.longitude || 0,
        photos: []
      };

      await queueActivity(activity);
      await syncOfflineData();
      
      Alert.alert('Success', 'Visit logged successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to log visit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Logging visit for</Text>
        <Text style={styles.farmerName}>{farmerName}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Visit Purpose</Text>
        <View style={styles.purposeContainer}>
          {['Routine', 'Stage Check', 'Pest Attack', 'Emergency'].map(p => (
            <TouchableOpacity 
              key={p} 
              style={[styles.purposeButton, purpose === p && styles.purposeActive]}
              onPress={() => setPurpose(p)}
            >
              <Text style={[styles.purposeText, purpose === p && styles.purposeTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Visit Notes</Text>
        <TextInput
          style={styles.notesInput}
          multiline
          numberOfLines={6}
          placeholder="What did you observe? Any recommendations shared?"
          value={notes}
          onChangeText={setNotes}
          textAlignVertical="top"
        />

        <View style={styles.locationBox}>
            <Text style={styles.locationText}>
                {location ? `📍 GPS Captured: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : '⌛ Capturing GPS...'}
            </Text>
        </View>

        <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={loading}
        >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save & Sync Visit</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  header: { padding: 30, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  farmerName: { fontSize: 24, fontFamily: theme.fonts.heading, fontWeight: 'bold', color: theme.colors.primary },
  form: { padding: 25 },
  label: { fontSize: 13, fontFamily: theme.fonts.heading, color: theme.colors.textMuted, marginBottom: 10, textTransform: 'uppercase' },
  purposeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  purposeButton: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.border },
  purposeActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  purposeText: { fontSize: 14, fontFamily: theme.fonts.body, color: theme.colors.text },
  purposeTextActive: { color: '#fff', fontWeight: 'bold' },
  notesInput: { backgroundColor: '#fff', borderRadius: 15, padding: 15, height: 150, fontSize: 16, fontFamily: theme.fonts.body, borderWidth: 1, borderColor: theme.colors.border },
  locationBox: { marginTop: 20, padding: 15, backgroundColor: '#E8F5E9', borderRadius: 10 },
  locationText: { fontSize: 12, fontFamily: theme.fonts.mono, color: theme.colors.primary },
  saveButton: { backgroundColor: theme.colors.primary, padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 30, elevation: 4 },
  saveButtonText: { color: '#fff', fontSize: 18, fontFamily: theme.fonts.heading, fontWeight: 'bold' }
});
