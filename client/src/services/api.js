const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('ai_decoder_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  },

  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('ai_decoder_token', data.token);
      localStorage.setItem('ai_decoder_user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(name, email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('ai_decoder_token', data.token);
      localStorage.setItem('ai_decoder_user', JSON.stringify(data.user));
    }
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    return await res.json();
  },

  logout() {
    localStorage.removeItem('ai_decoder_token');
    localStorage.removeItem('ai_decoder_user');
  },

  // Decoders
  async decodeText(payload) {
    const res = await fetch(`${API_BASE}/decode/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async decodeCode(payload) {
    const res = await fetch(`${API_BASE}/decode/code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async decodeCipher(payload) {
    const res = await fetch(`${API_BASE}/decode/cipher`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async decodeQR(payload) {
    const res = await fetch(`${API_BASE}/decode/qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async decodeImage(formData) {
    const res = await fetch(`${API_BASE}/decode/image`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData
    });
    return await res.json();
  },

  async optimizePrompt(payload) {
    const res = await fetch(`${API_BASE}/decode/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  // Chat
  async sendMessage(payload) {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async getMessages(decodeId) {
    const res = await fetch(`${API_BASE}/chat/${decodeId}`);
    return await res.json();
  },

  // History
  async getHistory(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/history?${query}`, {
      headers: { ...getAuthHeader() }
    });
    return await res.json();
  },

  async toggleBookmark(id) {
    const res = await fetch(`${API_BASE}/history/${id}/bookmark`, {
      method: 'PATCH',
      headers: { ...getAuthHeader() }
    });
    return await res.json();
  },

  async deleteHistoryItem(id) {
    const res = await fetch(`${API_BASE}/history/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return await res.json();
  }
};
