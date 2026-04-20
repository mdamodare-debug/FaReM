import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import api from '../services/api';
import { theme } from '../theme';

export default function FarmerProfile({ route, navigation }) {
  const { farmerId } = route.params;
  const [farmer, setFarmer] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [f, a] = await Promise.all([
        api.getFarmer(farmerId),
        api.getActivities(farmerId)
      ]);
      setFarmer(f);
      setActivities(a.results || a);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to fetch farmer details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [farmerId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!farmer) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{farmer.full_name?.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{farmer.full_name}</Text>
        <Text style={styles.contact}>{farmer.primary_mobile}</Text>
        <Text style={styles.village}>{farmer.village}, {farmer.taluka}</Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
            style={styles.btnPrimary}
            onPress={() => navigation.navigate('LogVisit', { farmerId: farmer.id, farmerName: farmer.full_name })}
        >
            <Text style={styles.btnText}>Log Visit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary}>
            <Text style={styles.btnTextSecondary}>Call Farmer</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Plots & Crops</Text>
      {farmer.plots?.length > 0 ? (
        farmer.plots.map(plot => (
          <View key={plot.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{plot.plot_name || 'Plot'} - {plot.area_acres} Acres</Text>
            </View>
            {plot.active_season ? (
              <View>
                <Text style={styles.detail}>Crop: {plot.active_season.crop_name}</Text>
                <Text style={styles.detail}>Stage: {plot.active_season.current_stage}</Text>
                <Text style={styles.detail}>Next Stage: {new Date(plot.active_season.expected_next_stage_date).toDateString()}</Text>
              </View>
            ) : (
              <Text style={styles.detail}>No active crop session</Text>
            )}
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No plots recorded for this farmer.</Text>
      )}
      
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.timeline}>
        {activities.length > 0 ? (
          activities.slice(0, 5).map((activity, index) => (
            <View key={activity.id} style={[styles.timelineItem, index === 4 && { borderLeftWidth: 0 }]}>
              <Text style={styles.timelineDate}>{new Date(activity.date).toDateString()} · {activity.activity_type}</Text>
              <Text style={styles.timelineText}>{activity.notes || 'No notes provided.'}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent activities.</Text>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  centered: { justifyContent: 'center', alignItems: 'center' },
  profileHeader: { alignItems: 'center', padding: 30, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.accent, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { fontSize: 32, fontFamily: theme.fonts.heading, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 22, fontFamily: theme.fonts.heading, fontWeight: 'bold', color: theme.colors.text },
  contact: { fontSize: 16, fontFamily: theme.fonts.mono, color: theme.colors.textMuted, marginTop: 5 },
  village: { fontSize: 14, fontFamily: theme.fonts.body, color: theme.colors.textMuted, marginTop: 5 },
  actions: { flexDirection: 'row', padding: 20, justifyContent: 'space-between' },
  btnPrimary: { backgroundColor: theme.colors.primary, padding: 15, borderRadius: 12, flex: 0.48, alignItems: 'center', elevation: 2 },
  btnSecondary: { backgroundColor: '#fff', padding: 15, borderRadius: 12, flex: 0.48, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.primary },
  btnText: { color: '#fff', fontSize: 16, fontFamily: theme.fonts.heading, fontWeight: 'bold' },
  btnTextSecondary: { color: theme.colors.primary, fontSize: 16, fontFamily: theme.fonts.heading, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontFamily: theme.fonts.heading, fontWeight: 'bold', padding: 20, paddingBottom: 10, color: theme.colors.text },
  card: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 15, padding: 18, borderRadius: 15, elevation: 1, borderLeftWidth: 4, borderLeftColor: theme.colors.accent },
  cardHeader: { marginBottom: 10 },
  cardTitle: { fontSize: 16, fontFamily: theme.fonts.heading, fontWeight: 'bold', color: theme.colors.text },
  detail: { fontSize: 14, fontFamily: theme.fonts.body, color: theme.colors.textMuted, marginBottom: 5 },
  timeline: { padding: 20, backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 15, marginBottom: 30 },
  timelineItem: { borderLeftWidth: 2, borderLeftColor: theme.colors.border, paddingLeft: 20, marginBottom: 20 },
  timelineDate: { fontSize: 12, fontFamily: theme.fonts.heading, color: theme.colors.accent, marginBottom: 5, textTransform: 'uppercase' },
  timelineText: { fontSize: 14, fontFamily: theme.fonts.body, color: theme.colors.text },
  emptyText: { paddingHorizontal: 20, fontSize: 14, fontFamily: theme.fonts.body, color: theme.colors.textMuted }
});
