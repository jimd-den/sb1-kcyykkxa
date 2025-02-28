<script lang="ts">
  import { onMount } from 'svelte';
  import StartSessionPage from './ui/pages/StartSessionPage.svelte';
  import SessionInProgressPage from './ui/pages/SessionInProgressPage.svelte';
  import EndSessionPage from './ui/pages/EndSessionPage.svelte';
  import PastSessionsPage from './ui/pages/PastSessionsPage.svelte';
  import SessionDetailPage from './ui/pages/SessionDetailPage.svelte';

  // Application state
  enum AppPage {
    START_SESSION = 'START_SESSION',
    SESSION_IN_PROGRESS = 'SESSION_IN_PROGRESS',
    END_SESSION = 'END_SESSION',
    PAST_SESSIONS = 'PAST_SESSIONS',
    SESSION_DETAIL = 'SESSION_DETAIL'
  }

  let currentPage = AppPage.PAST_SESSIONS;
  let currentSessionId = '';
  let deferredPrompt: any = null;
  let showInstallPrompt = false;

  // Navigation functions
  function navigateToStartSession() {
    currentPage = AppPage.START_SESSION;
    currentSessionId = '';
  }

  function navigateToSessionInProgress(event: CustomEvent) {
    currentSessionId = event.detail.sessionId;
    currentPage = AppPage.SESSION_IN_PROGRESS;
  }

  function navigateToEndSession(event: CustomEvent) {
    currentSessionId = event.detail.sessionId;
    currentPage = AppPage.END_SESSION;
  }

  function navigateToPastSessions() {
    currentPage = AppPage.PAST_SESSIONS;
    currentSessionId = '';
  }

  function navigateToSessionDetail(event: CustomEvent) {
    currentSessionId = event.detail.sessionId;
    currentPage = AppPage.SESSION_DETAIL;
  }

  function handleSessionEnded() {
    navigateToPastSessions();
  }
  
  function handleContinueSession(event: CustomEvent) {
    currentSessionId = event.detail.sessionId;
    currentPage = AppPage.SESSION_IN_PROGRESS;
  }

  // PWA installation
  onMount(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      showInstallPrompt = true;
    });
  });

  async function installApp() {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    deferredPrompt = null;
    showInstallPrompt = false;
  }

  function dismissInstall() {
    showInstallPrompt = false;
  }
</script>

<main>
  {#if showInstallPrompt}
    <div class="install-prompt">
      <div class="install-content">
        <p>Add this app to your home screen for quick access!</p>
        <div class="install-actions">
          <button class="install-button" on:click={installApp}>Install</button>
          <button class="dismiss-button" on:click={dismissInstall}>Not Now</button>
        </div>
      </div>
    </div>
  {/if}

  <div class="app-container">
    {#if currentPage === AppPage.START_SESSION}
      <StartSessionPage on:sessionStarted={navigateToSessionInProgress} />
    {:else if currentPage === AppPage.SESSION_IN_PROGRESS}
      <SessionInProgressPage 
        sessionId={currentSessionId} 
        on:endSession={navigateToEndSession}
        on:goHome={navigateToPastSessions} 
      />
    {:else if currentPage === AppPage.END_SESSION}
      <EndSessionPage 
        sessionId={currentSessionId} 
        on:sessionEnded={handleSessionEnded} 
        on:continueSession={handleContinueSession}
      />
    {:else if currentPage === AppPage.PAST_SESSIONS}
      <PastSessionsPage 
        on:startNewSession={navigateToStartSession}
        on:viewSession={navigateToSessionDetail}
      />
    {:else if currentPage === AppPage.SESSION_DETAIL}
      <SessionDetailPage 
        sessionId={currentSessionId} 
        on:back={navigateToPastSessions}
        on:continueSession={handleContinueSession}
        on:endSession={navigateToEndSession}
      />
    {/if}
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #f5f5f5;
    color: #333;
  }

  main {
    min-height: 100vh;
    position: relative;
  }

  .app-container {
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .install-prompt {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: white;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    z-index: 1000;
  }

  .install-content {
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .install-content p {
    margin: 0;
    font-size: 1rem;
  }

  .install-actions {
    display: flex;
    gap: 1rem;
  }

  .install-button {
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }

  .dismiss-button {
    background-color: transparent;
    border: 1px solid #666;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }

  .install-button:hover {
    background-color: #45a049;
  }

  .dismiss-button:hover {
    background-color: #f5f5f5;
  }
</style>