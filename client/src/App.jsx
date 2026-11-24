import React, { useState, useEffect } from 'react';
import HUDHeader from './components/layout/HUDHeader';
import Sidebar from './components/layout/Sidebar';
import TextDecoder from './components/decoders/TextDecoder';
import PromptDecoder from './components/decoders/PromptDecoder';
import CodeDecoder from './components/decoders/CodeDecoder';
import CipherDecoder from './components/decoders/CipherDecoder';
import QRDecoder from './components/decoders/QRDecoder';
import ImageDecoder from './components/decoders/ImageDecoder';
import HistoryView from './components/history/HistoryView';
import ChatSidecar from './components/chat/ChatSidecar';
import AuthModal from './components/layout/AuthModal';
import ArchitectureModal from './components/layout/ArchitectureModal';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('text');
  const [chatOpen, setChatOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [archModalOpen, setArchModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [healthData, setHealthData] = useState(null);

  // Load user from storage and check health
  useEffect(() => {
    const savedUser = localStorage.getItem('ai_decoder_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }

    api.getHealth()
      .then((data) => setHealthData(data))
      .catch((err) => console.warn('Backend offline or health unreachable:', err));
  }, []);

  const handleAskChat = (record) => {
    setActiveRecord(record);
    setChatOpen(true);
  };

  const handleSelectVaultRecord = (record) => {
    setActiveRecord(record);
    // Switch to corresponding tab if appropriate or open chat
    if (['text', 'code', 'cipher', 'qr', 'image', 'prompt'].includes(record.decoderType)) {
      setActiveTab(record.decoderType);
    }
    setChatOpen(true);
  };

  const handleToggleBookmark = async (id) => {
    try {
      await api.toggleBookmark(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-cyber-darkest text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Cyber Grid */}
      <div className="fixed inset-0 bg-grid-cyber pointer-events-none opacity-40 z-0" />

      {/* Top HUD Header */}
      <HUDHeader
        healthData={healthData}
        activeTab={activeTab}
        onToggleChat={() => setChatOpen(!chatOpen)}
        chatOpen={chatOpen}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenArchitecture={() => setArchModalOpen(true)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex relative z-10 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
          }}
        />

        {/* Central Display Pane */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-6xl mx-auto w-full space-y-6">
          {activeTab === 'text' && (
            <TextDecoder
              onAskChat={handleAskChat}
              onBookmark={handleToggleBookmark}
            />
          )}

          {activeTab === 'prompt' && (
            <PromptDecoder
              onAskChat={handleAskChat}
              onBookmark={handleToggleBookmark}
            />
          )}

          {activeTab === 'code' && (
            <CodeDecoder
              onAskChat={handleAskChat}
              onBookmark={handleToggleBookmark}
            />
          )}

          {activeTab === 'cipher' && (
            <CipherDecoder
              onAskChat={handleAskChat}
              onBookmark={handleToggleBookmark}
            />
          )}

          {activeTab === 'qr' && (
            <QRDecoder
              onAskChat={handleAskChat}
              onBookmark={handleToggleBookmark}
            />
          )}

          {activeTab === 'image' && (
            <ImageDecoder
              onAskChat={handleAskChat}
              onBookmark={handleToggleBookmark}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              onSelectRecord={handleSelectVaultRecord}
              onAskChat={handleAskChat}
            />
          )}
        </main>
      </div>

      {/* Contextual AI Copilot Drawer */}
      <ChatSidecar
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        activeRecord={activeRecord}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(u) => setUser(u)}
      />

      {/* Architecture & Roadmap Matrix Modal */}
      <ArchitectureModal
        isOpen={archModalOpen}
        onClose={() => setArchModalOpen(false)}
      />
    </div>
  );
}
