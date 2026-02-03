/**
 * Settings Page Component
 * Main settings page with API keys, feature toggles, and preferences
 */

import { memo, useCallback } from 'react';
import { ApiKeyForm } from './ApiKeyForm';
import { FeatureToggles } from './FeatureToggles';
import type { ApiKeyName, FeatureFlagName, ISettingsContext } from '../types/settings.types';

/**
 * Props for SettingsPage component
 */
interface ISettingsPageProps {
  /** Settings context (from useSettings hook or context) */
  settingsContext: ISettingsContext;
  /** Optional CSS class */
  className?: string;
}

/**
 * Main settings page component
 */
function SettingsPageComponent({
  settingsContext,
  className = '',
}: ISettingsPageProps): React.ReactElement {
  const {
    settings,
    isLoading,
    isSaving,
    error,
    updateApiKey,
    removeApiKey,
    toggleFeature,
    hasApiKey,
    resetToDefaults,
  } = settingsContext;

  const apiKeys: ApiKeyName[] = ['groq', 'openai', 'anthropic', 'tavily', 'github'];

  /**
   * Handle API key save
   */
  const handleSaveApiKey = useCallback(async (key: ApiKeyName, value: string) => {
    await updateApiKey(key, value);
  }, [updateApiKey]);

  /**
   * Handle API key removal
   */
  const handleRemoveApiKey = useCallback(async (key: ApiKeyName) => {
    await removeApiKey(key);
  }, [removeApiKey]);

  /**
   * Handle feature toggle
   */
  const handleToggleFeature = useCallback((feature: FeatureFlagName, enabled: boolean) => {
    toggleFeature(feature, enabled);
  }, [toggleFeature]);

  /**
   * Handle reset to defaults
   */
  const handleReset = useCallback(async () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This will remove all API keys.')) {
      await resetToDefaults();
    }
  }, [resetToDefaults]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-slate-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className={`max-w-2xl mx-auto p-6 ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-200">Settings</h1>
        <button
          onClick={handleReset}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset to Defaults
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-900 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* API Keys Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          API Keys
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          API keys are stored securely on your device using encrypted storage.
        </p>
        <div className="space-y-3">
          {apiKeys.map((key) => (
            <ApiKeyForm
              key={key}
              keyName={key}
              isSet={hasApiKey(key)}
              disabled={isSaving}
              onSave={handleSaveApiKey}
              onRemove={handleRemoveApiKey}
            />
          ))}
        </div>
      </section>

      {/* Feature Toggles Section */}
      <section className="mb-8">
        <FeatureToggles
          features={settings.features}
          onToggle={handleToggleFeature}
          disabled={isSaving}
        />
      </section>

      {/* Preferences Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          Preferences
        </h2>
        <div className="space-y-4">
          {/* Theme Selection */}
          <div className="p-4 bg-slate-800 rounded-lg">
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Theme
            </label>
            <select
              value={settings.preferences.theme}
              onChange={(e) => {
                settingsContext.updatePreferences({
                  theme: e.target.value as 'light' | 'dark' | 'system',
                });
              }}
              disabled={isSaving}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded
                         text-slate-200 focus:outline-none focus:border-blue-500
                         disabled:opacity-50"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          {/* Embedding Model Selection */}
          <div className="p-4 bg-slate-800 rounded-lg">
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Embedding Model
            </label>
            <select
              value={settings.preferences.embeddingModel}
              onChange={(e) => {
                settingsContext.updatePreferences({
                  embeddingModel: e.target.value as 'groq' | 'openai' | 'local',
                });
              }}
              disabled={isSaving}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded
                         text-slate-200 focus:outline-none focus:border-blue-500
                         disabled:opacity-50"
            >
              <option value="openai">OpenAI (text-embedding-3-small)</option>
              <option value="groq">Groq</option>
              <option value="local">Local (offline)</option>
            </select>
            <p className="mt-1 text-xs text-slate-400">
              Select the model to use for generating text embeddings
            </p>
          </div>

          {/* Auto-sync Interval */}
          <div className="p-4 bg-slate-800 rounded-lg">
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Auto-sync Interval
            </label>
            <select
              value={settings.preferences.autoSyncInterval}
              onChange={(e) => {
                settingsContext.updatePreferences({
                  autoSyncInterval: parseInt(e.target.value, 10),
                });
              }}
              disabled={isSaving}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded
                         text-slate-200 focus:outline-none focus:border-blue-500
                         disabled:opacity-50"
            >
              <option value="0">Disabled</option>
              <option value="60000">1 minute</option>
              <option value="300000">5 minutes</option>
              <option value="600000">10 minutes</option>
              <option value="1800000">30 minutes</option>
            </select>
            <p className="mt-1 text-xs text-slate-400">
              How often to sync data to persistent storage
            </p>
          </div>
        </div>
      </section>

      {/* Status Footer */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg">
          Saving...
        </div>
      )}
    </div>
  );
}

export const SettingsPage = memo(SettingsPageComponent);
