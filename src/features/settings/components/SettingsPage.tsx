/**
 * Settings Page Component
 * Main settings page with API keys, feature toggles, and preferences
 */

import { memo, useCallback, useState } from 'react';
import { ApiKeyForm } from './ApiKeyForm';
import { FeatureToggles } from './FeatureToggles';
import type { 
  ApiKeyName, 
  FeatureFlagName, 
  ISettingsContext, 
  AIProvider 
} from '../types/settings.types';
import {
  AI_PROVIDER_LABELS,
  AI_PROVIDER_DESCRIPTIONS,
  PROVIDER_MODELS,
} from '../types/settings.types';

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

  const [ollamaUrl, setOllamaUrl] = useState(settings.ollama?.baseUrl || 'http://localhost:11434');
  const [isTestingOllama, setIsTestingOllama] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  const apiKeysAI: ApiKeyName[] = ['groq', 'openai', 'anthropic', 'together', 'openrouter', 'mistral', 'moonshot', 'perplexity', 'deepseek'];
  const apiKeysOther: ApiKeyName[] = ['tavily', 'github'];

  const allProviders: AIProvider[] = ['groq', 'openai', 'anthropic', 'ollama', 'together', 'openrouter', 'mistral', 'moonshot', 'perplexity', 'deepseek'];

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

  /**
   * Test Ollama connection
   */
  const handleTestOllama = useCallback(async () => {
    setIsTestingOllama(true);
    setOllamaStatus('unknown');
    
    try {
      const response = await fetch(`${ollamaUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        setOllamaStatus('connected');
      } else {
        setOllamaStatus('error');
      }
    } catch {
      setOllamaStatus('error');
    } finally {
      setIsTestingOllama(false);
    }
  }, [ollamaUrl]);

  /**
   * Handle provider change
   */
  const handleProviderChange = useCallback((provider: AIProvider) => {
    const models = PROVIDER_MODELS[provider];
    const defaultModel = models?.[0]?.id || '';
    
    settingsContext.updatePreferences({
      aiProvider: provider,
      aiModel: defaultModel,
    });
  }, [settingsContext]);

  /**
   * Handle model change
   */
  const handleModelChange = useCallback((model: string) => {
    settingsContext.updatePreferences({ aiModel: model });
  }, [settingsContext]);

  /**
   * Get current provider's models
   */
  const currentModels = PROVIDER_MODELS[settings.preferences.aiProvider] || [];

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

      {/* AI Provider & Model Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          AI Provider & Model
        </h2>
        <div className="space-y-4">
          {/* Provider Selection */}
          <div className="p-4 bg-slate-800 rounded-lg">
            <label className="block text-sm font-medium text-slate-200 mb-2">
              AI Provider
            </label>
            <select
              value={settings.preferences.aiProvider}
              onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
              disabled={isSaving}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded
                         text-slate-200 focus:outline-none focus:border-blue-500
                         disabled:opacity-50"
            >
              {allProviders.map((provider) => (
                <option key={provider} value={provider}>
                  {AI_PROVIDER_LABELS[provider]}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-400">
              {AI_PROVIDER_DESCRIPTIONS[settings.preferences.aiProvider]}
            </p>
          </div>

          {/* Model Selection */}
          <div className="p-4 bg-slate-800 rounded-lg">
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Model
            </label>
            <select
              value={settings.preferences.aiModel}
              onChange={(e) => handleModelChange(e.target.value)}
              disabled={isSaving}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded
                         text-slate-200 focus:outline-none focus:border-blue-500
                         disabled:opacity-50"
            >
              {currentModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} {model.description ? `- ${model.description}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Ollama Configuration (shown only when Ollama is selected) */}
          {settings.preferences.aiProvider === 'ollama' && (
            <div className="p-4 bg-slate-800 rounded-lg border border-purple-800/50">
              <h3 className="text-sm font-medium text-slate-200 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Ollama Configuration
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Server URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={ollamaUrl}
                      onChange={(e) => setOllamaUrl(e.target.value)}
                      placeholder="http://localhost:11434"
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded
                                text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleTestOllama}
                      disabled={isTestingOllama}
                      className="px-4 py-2 bg-purple-600 text-white text-sm rounded
                                hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isTestingOllama ? 'Testing...' : 'Test'}
                    </button>
                  </div>
                  {ollamaStatus === 'connected' && (
                    <p className="mt-1 text-xs text-green-400">✓ Connected to Ollama</p>
                  )}
                  {ollamaStatus === 'error' && (
                    <p className="mt-1 text-xs text-red-400">✗ Could not connect. Make sure Ollama is running.</p>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Run <code className="px-1 bg-slate-700 rounded">ollama serve</code> to start the Ollama server locally.
                  Pull models with <code className="px-1 bg-slate-700 rounded">ollama pull llama3.2</code>
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* AI API Keys Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          AI Provider API Keys
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Add API keys for the providers you want to use. Keys are stored securely using encrypted storage.
        </p>
        <div className="space-y-3">
          {apiKeysAI.map((key) => (
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

      {/* Other API Keys Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          Other API Keys
        </h2>
        <div className="space-y-3">
          {apiKeysOther.map((key) => (
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
