import { DashboardLayout } from '@features/dashboard';
import { SettingsProvider, useSettings, SettingsPage } from '@features/settings';
import { VectorStoreProvider } from '@features/vector-store';
import { ChatWindow, useChat } from '@features/chat';
import { useState } from 'react';

/**
 * Navigation tabs
 */
type NavTab = 'chat' | 'dashboard' | 'settings';

/**
 * Main content component
 * Renders content based on active tab and feature flags
 */
function MainContent(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<NavTab>('chat');
  const { settings, isLoading } = useSettings();
  const chat = useChat();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  const isDashboardEnabled = settings.features.dashboard;

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Navigation sidebar */}
      <nav className="w-16 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-4 gap-2">
        {/* Chat tab */}
        <button
          onClick={() => setActiveTab('chat')}
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            transition-colors
            ${activeTab === 'chat' 
              ? 'bg-blue-600 text-white' 
              : 'text-slate-400 hover:bg-slate-800'}
          `}
          title="Chat"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>

        {/* Dashboard tab (conditionally shown) */}
        {isDashboardEnabled && (
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center
              transition-colors
              ${activeTab === 'dashboard' 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:bg-slate-800'}
            `}
            title="Dashboard"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        )}

        {/* Settings tab */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`
            mt-auto w-10 h-10 rounded-lg flex items-center justify-center
            transition-colors
            ${activeTab === 'settings' 
              ? 'bg-blue-600 text-white' 
              : 'text-slate-400 hover:bg-slate-800'}
          `}
          title="Settings"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </nav>

      {/* Main content area */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <ChatWindow
            messages={chat.messages}
            isGenerating={chat.isGenerating}
            error={chat.error}
            onSendMessage={chat.sendMessage}
            onNewConversation={chat.newConversation}
            onClearError={chat.clearError}
            title={chat.conversation?.title ?? 'New Chat'}
          />
        )}
        
        {activeTab === 'dashboard' && isDashboardEnabled && (
          <DashboardLayout />
        )}
        
        {activeTab === 'settings' && (
          <div className="h-full overflow-auto">
            <SettingsPage settingsContext={useSettings()} />
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * Main application component
 * Wraps the app with required providers
 */
export function App(): React.ReactElement {
  return (
    <SettingsProvider>
      <VectorStoreProvider>
        <MainContent />
      </VectorStoreProvider>
    </SettingsProvider>
  );
}