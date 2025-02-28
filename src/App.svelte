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
</script>

<main>
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
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .app-container {
    flex: 1;
    padding: 1rem;
  }
</style>