import { DashboardLayout } from '@features/dashboard';
import { SettingsProvider, useSettings, SettingsPage } from '@features/settings';
import { VectorStoreProvider } from '@features/vector-store';
import { ChatWindow, useChat } from '@features/chat';
import { FileUploader, UploadProgress, useFileIngestion } from '@features/ingestion';
import { SearchBar, SearchResults, useWebSearch } from '@features/web-search';
import { RepoCloneForm, RepoList, useGitHub } from '@features/github';
import { ImageUploader, ImageGallery, useImages } from '@features/images';
import { VoiceRecorder, VoiceNotesList, useVoiceRecorder, useVoiceNotes } from '@features/voice';
import { NoteEditor, NotesList, useNotes } from '@features/notes';
import { useState } from 'react';

/**
 * Navigation tabs
 */
type NavTab = 'chat' | 'documents' | 'web' | 'github' | 'images' | 'voice' | 'notes' | 'dashboard' | 'settings';

/**
 * Navigation button component
 */
function NavButton({
  active,
  onClick,
  title,
  children,
  className = '',
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className={`
        w-10 h-10 rounded-lg flex items-center justify-center
        transition-colors
        ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}
        ${className}
      `}
      title={title}
    >
      {children}
    </button>
  );
}

/**
 * Documents page component
 */
function DocumentsPage(): React.ReactElement {
  const ingestion = useFileIngestion();

  return (
    <div className="h-full overflow-auto p-6 bg-slate-900">
      <h1 className="text-2xl font-bold text-slate-200 mb-6">Document Upload</h1>
      <p className="text-slate-400 mb-6">Upload documents to add them to your knowledge base for RAG.</p>
      
      <div className="max-w-2xl">
        {ingestion.isUploading && ingestion.progress ? (
          <UploadProgress
            progress={ingestion.progress}
            results={ingestion.results}
          />
        ) : (
          <FileUploader
            onFilesSelected={ingestion.uploadFiles}
            disabled={ingestion.isUploading}
          />
        )}

        {ingestion.error && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-900 rounded-lg text-red-400">
            {ingestion.error}
          </div>
        )}

        {ingestion.results.length > 0 && !ingestion.isUploading && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-slate-200 mb-3">Recent Uploads</h2>
            <div className="space-y-2">
              {ingestion.results.map((result, i) => (
                <div key={i} className={`p-3 rounded-lg ${result.success ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                  <span className={result.success ? 'text-green-400' : 'text-red-400'}>
                    {result.fileName}: {result.success ? `${result.chunkCount} chunks created` : result.error}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Web Search page component
 */
function WebSearchPage(): React.ReactElement {
  const webSearch = useWebSearch();

  return (
    <div className="h-full overflow-auto p-6 bg-slate-900">
      <h1 className="text-2xl font-bold text-slate-200 mb-6">Web Search</h1>
      <p className="text-slate-400 mb-6">Search the web and add results to your knowledge base.</p>
      
      <div className="max-w-3xl">
        <SearchBar
          onSearch={webSearch.search}
          isSearching={webSearch.isSearching}
        />

        {webSearch.error && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-900 rounded-lg text-red-400">
            {webSearch.error}
          </div>
        )}

        {(webSearch.results.length > 0 || webSearch.answer) && (
          <SearchResults
            results={webSearch.results}
            answer={webSearch.answer}
            onIngest={webSearch.ingestResult}
            isIngesting={webSearch.isIngesting}
          />
        )}
      </div>
    </div>
  );
}

/**
 * GitHub page component
 */
function GitHubPage(): React.ReactElement {
  const github = useGitHub();

  return (
    <div className="h-full overflow-auto p-6 bg-slate-900">
      <h1 className="text-2xl font-bold text-slate-200 mb-6">GitHub Repositories</h1>
      <p className="text-slate-400 mb-6">Clone repositories to add code to your knowledge base.</p>
      
      <div className="max-w-2xl space-y-6">
        <RepoCloneForm
          onClone={github.cloneRepository}
          isCloning={github.isCloning}
          progress={github.progress}
          onCancel={github.cancelClone}
        />

        {github.error && (
          <div className="p-3 bg-red-900/30 border border-red-900 rounded-lg text-red-400">
            {github.error}
          </div>
        )}

        <RepoList
          repositories={github.repositories}
          onRemove={github.removeRepository}
        />
      </div>
    </div>
  );
}

/**
 * Images page component
 */
function ImagesPage(): React.ReactElement {
  const images = useImages();

  return (
    <div className="h-full overflow-auto p-6 bg-slate-900">
      <h1 className="text-2xl font-bold text-slate-200 mb-6">Images</h1>
      <p className="text-slate-400 mb-6">Upload images for AI description and OCR text extraction.</p>
      
      <div className="space-y-6">
        <ImageUploader
          onUpload={images.processImages}
          isProcessing={images.isProcessing}
          progress={images.progress}
        />

        {images.error && (
          <div className="p-3 bg-red-900/30 border border-red-900 rounded-lg text-red-400">
            {images.error}
          </div>
        )}

        <ImageGallery
          images={images.images}
          onDelete={images.deleteImage}
          onVectorize={images.vectorizeImage}
        />
      </div>
    </div>
  );
}

/**
 * Voice Notes page component
 */
function VoiceNotesPage(): React.ReactElement {
  const recorder = useVoiceRecorder();
  const voiceNotes = useVoiceNotes();

  const handleStop = async () => {
    const note = await recorder.stopRecording();
    if (note) {
      voiceNotes.addNote(note);
    }
  };

  return (
    <div className="h-full overflow-auto p-6 bg-slate-900">
      <h1 className="text-2xl font-bold text-slate-200 mb-6">Voice Notes</h1>
      <p className="text-slate-400 mb-6">Record voice notes and transcribe them with Whisper AI.</p>
      
      <div className="max-w-2xl space-y-6">
        <VoiceRecorder
          recordingState={recorder.recordingState}
          duration={recorder.duration}
          audioLevel={recorder.audioLevel}
          onStart={recorder.startRecording}
          onStop={handleStop}
          onPause={recorder.pauseRecording}
          onResume={recorder.resumeRecording}
          onCancel={recorder.cancelRecording}
          error={recorder.error}
        />

        {voiceNotes.error && (
          <div className="p-3 bg-red-900/30 border border-red-900 rounded-lg text-red-400">
            {voiceNotes.error}
          </div>
        )}

        <VoiceNotesList
          notes={voiceNotes.notes}
          isTranscribing={voiceNotes.isTranscribing}
          onTranscribe={voiceNotes.transcribeNote}
          onVectorize={voiceNotes.vectorizeNote}
          onDelete={voiceNotes.deleteNote}
        />
      </div>
    </div>
  );
}

/**
 * Notes page component
 */
function NotesPage(): React.ReactElement {
  const notes = useNotes();

  const handleSave = (input: { title: string; content: string; tags?: string[] }) => {
    if (notes.selectedNote) {
      notes.updateNote(notes.selectedNote.id, input);
    } else {
      notes.createNote(input);
    }
  };

  return (
    <div className="flex h-full bg-slate-900">
      {/* Notes list sidebar */}
      <div className="w-80 border-r border-slate-800">
        <NotesList
          notes={notes.notes}
          selectedId={notes.selectedNote?.id ?? null}
          onSelect={notes.selectNote}
          onNew={() => notes.createNote()}
          availableTags={notes.allTags}
          filterNotes={notes.filterNotes}
        />
      </div>

      {/* Note editor */}
      <div className="flex-1">
        <NoteEditor
          note={notes.selectedNote}
          onSave={handleSave}
          onVectorize={notes.selectedNote ? () => notes.vectorizeNote(notes.selectedNote!.id) : undefined}
          isSaving={notes.isSaving}
        />
      </div>
    </div>
  );
}

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
        {/* Chat */}
        <NavButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} title="Chat">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </NavButton>

        {/* Documents */}
        <NavButton active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} title="Documents">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </NavButton>

        {/* Web Search */}
        <NavButton active={activeTab === 'web'} onClick={() => setActiveTab('web')} title="Web Search">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        </NavButton>

        {/* GitHub */}
        <NavButton active={activeTab === 'github'} onClick={() => setActiveTab('github')} title="GitHub">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </NavButton>

        {/* Images */}
        <NavButton active={activeTab === 'images'} onClick={() => setActiveTab('images')} title="Images">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </NavButton>

        {/* Voice Notes */}
        <NavButton active={activeTab === 'voice'} onClick={() => setActiveTab('voice')} title="Voice Notes">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </NavButton>

        {/* Notes */}
        <NavButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} title="Notes">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </NavButton>

        {/* Dashboard (conditional) */}
        {isDashboardEnabled && (
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} title="Dashboard">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </NavButton>
        )}

        {/* Settings - at bottom */}
        <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} title="Settings" className="mt-auto">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </NavButton>
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
        
        {activeTab === 'documents' && <DocumentsPage />}
        {activeTab === 'web' && <WebSearchPage />}
        {activeTab === 'github' && <GitHubPage />}
        {activeTab === 'images' && <ImagesPage />}
        {activeTab === 'voice' && <VoiceNotesPage />}
        {activeTab === 'notes' && <NotesPage />}
        
        {activeTab === 'dashboard' && isDashboardEnabled && <DashboardLayout />}
        
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