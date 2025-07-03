<script>
  import { onMount } from 'svelte';
  
  let upcomingEvents = [];
  let allEvents = [];
  let loading = true;
  let error = null;
  
  const API_BASE = 'http://localhost:3001';
  
  async function loadData() {
    try {
      loading = true;
      
      // Load upcoming events
      const upcomingResponse = await fetch(`${API_BASE}/events/upcoming?limit=5`);
      if (!upcomingResponse.ok) throw new Error('Failed to load upcoming events');
      const upcomingData = await upcomingResponse.json();
      upcomingEvents = upcomingData.events;
      
      // Load all events for stats
      const allResponse = await fetch(`${API_BASE}/events?limit=10`);
      if (!allResponse.ok) throw new Error('Failed to load events');
      const allData = await allResponse.json();
      allEvents = allData.events;
      
      error = null;
    } catch (err) {
      error = err.message;
      console.error('Error loading data:', err);
    } finally {
      loading = false;
    }
  }
  
  function formatDate(dateString) {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  function formatContract(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  
  function getEventName(signature) {
    return signature.split('(')[0];
  }
  
  async function snoozeEvent(eventId, duration) {
    try {
      const response = await fetch(`${API_BASE}/events/${eventId}/snooze`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration })
      });
      
      if (!response.ok) throw new Error('Failed to snooze event');
      
      // Reload data
      await loadData();
    } catch (err) {
      error = err.message;
    }
  }
  
  onMount(loadData);
</script>

<svelte:head>
  <title>ChainCal Dashboard</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
    <p class="mt-2 text-gray-600">Your on-chain calendar and event reminders</p>
  </div>

  {#if loading}
    <div class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  {:else if error}
    <div class="bg-red-50 border border-red-200 rounded-md p-4">
      <div class="flex">
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error</h3>
          <div class="mt-2 text-sm text-red-700">{error}</div>
          <div class="mt-4">
            <button
              on:click={loadData}
              class="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="text-2xl">🔔</div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Upcoming Events</dt>
                <dd class="text-lg font-medium text-gray-900">{upcomingEvents.length}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="text-2xl">📊</div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Events</dt>
                <dd class="text-lg font-medium text-gray-900">{allEvents.length}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="text-2xl">🚀</div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Services</dt>
                <dd class="text-lg font-medium text-gray-900">Active</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upcoming Events -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Upcoming Events</h3>
        
        {#if upcomingEvents.length === 0}
          <div class="text-center py-12">
            <div class="text-4xl mb-4">📅</div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
            <p class="text-gray-600 mb-4">Create your first event subscription to get started.</p>
            <a
              href="/events"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Add Event
            </a>
          </div>
        {:else}
          <div class="space-y-4">
            {#each upcomingEvents as event (event.id)}
              <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h4 class="text-lg font-medium text-gray-900">
                      {getEventName(event.eventSignature)}
                    </h4>
                    <p class="text-sm text-gray-600">
                      Contract: {formatContract(event.contractAddress)}
                    </p>
                    <p class="text-sm text-gray-500">
                      Scheduled: {formatDate(event.nextTimestamp)}
                    </p>
                  </div>
                  <div class="flex space-x-2">
                    <button
                      on:click={() => snoozeEvent(event.id, 60 * 60 * 1000)}
                      class="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-sm"
                    >
                      Snooze 1h
                    </button>
                    <button
                      on:click={() => snoozeEvent(event.id, 6 * 60 * 60 * 1000)}
                      class="bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1 rounded text-sm"
                    >
                      Snooze 6h
                    </button>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mt-8 bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/events"
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
          >
            <div class="text-3xl mb-2">➕</div>
            <h4 class="text-lg font-medium text-gray-900">Add Event</h4>
            <p class="text-gray-600">Subscribe to a new contract event</p>
          </a>
          
          <a
            href="http://localhost:3002/api/frame"
            target="_blank"
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
          >
            <div class="text-3xl mb-2">🖼️</div>
            <h4 class="text-lg font-medium text-gray-900">View Frame</h4>
            <p class="text-gray-600">Open Farcaster Frame interface</p>
          </a>
          
          <a
            href="http://localhost:3001/calendar.ics"
            target="_blank"
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
          >
            <div class="text-3xl mb-2">📅</div>
            <h4 class="text-lg font-medium text-gray-900">iCal Feed</h4>
            <p class="text-gray-600">Subscribe to calendar feed</p>
          </a>
        </div>
      </div>
    </div>
  {/if}
</div> 