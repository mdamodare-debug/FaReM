import * as SecureStore from 'expo-secure-store';

const API_BASE = 'http://localhost:8000/api'; // Update for production

class ApiService {
  async getTokens() {
    return {
      access: await SecureStore.getItemAsync('ffma_access_token'),
      refresh: await SecureStore.getItemAsync('ffma_refresh_token'),
    };
  }

  async setTokens(access, refresh) {
    await SecureStore.setItemAsync('ffma_access_token', access);
    await SecureStore.setItemAsync('ffma_refresh_token', refresh);
  }

  async clearTokens() {
    await SecureStore.deleteItemAsync('ffma_access_token');
    await SecureStore.deleteItemAsync('ffma_refresh_token');
    await SecureStore.deleteItemAsync('ffma_role');
  }

  async request(endpoint, options = {}) {
    const { access } = await this.getTokens();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (access) {
      headers['Authorization'] = `Bearer ${access}`;
    }

    let response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      const refreshed = await this.refreshTokens();
      if (refreshed) {
        const { access: newAccess } = await this.getTokens();
        headers['Authorization'] = `Bearer ${newAccess}`;
        response = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers,
        });
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw error;
    }

    return response.json();
  }

  async refreshTokens() {
    const { refresh } = await this.getTokens();
    if (!refresh) return false;

    try {
      const res = await fetch(`${API_BASE}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });

      if (res.ok) {
        const data = await res.json();
        await this.setTokens(data.access, data.refresh || refresh);
        return true;
      }
    } catch (e) {
      console.error('Refresh failed', e);
    }
    return false;
  }

  // Auth
  sendOtp(mobile_number) {
    return fetch(`${API_BASE}/auth/send-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile_number }),
    });
  }

  async verifyOtp(mobile_number, otp) {
    const res = await fetch(`${API_BASE}/auth/verify-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile_number, otp }),
    });
    const data = await res.json();
    if (res.ok) {
      await this.setTokens(data.access, data.refresh);
      await SecureStore.setItemAsync('ffma_role', data.role);
    } else {
      throw data;
    }
    return data;
  }

  // Modules
  getDailyPlan() { return this.request('/planner/daily_plan/'); }
  getFarmers(params = '') { return this.request(`/farmers/?${params}`); }
  getFarmer(id) { return this.request(`/farmers/${id}/`); }
  getActivities(farmerId) { return this.request(`/activities/?farmer=${farmerId}`); }
  logActivity(data) { return this.request('/activities/', { method: 'POST', body: JSON.stringify(data) }); }
  getRecommendations(farmerId) { return this.request(`/recommendations/?farmer=${farmerId}`); }
  advanceStage(seasonId, notes) { return this.request(`/crop-seasons/${seasonId}/advance_stage/`, { method: 'POST', body: JSON.stringify({ notes }) }); }
}

export default new ApiService();
