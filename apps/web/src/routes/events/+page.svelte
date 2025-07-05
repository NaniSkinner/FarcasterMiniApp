<script lang="ts">
  import { onMount } from 'svelte';
  
  let events: any[] = [];
  let loading = true;
  let error: string | null = null;
  let showAddForm = false;
  
  // Form data
  let formData: {
    contractAddress: string;
    eventSignature: string;
    nextTimestamp: string;
  } = {
    contractAddress: '',
    eventSignature: '',
    nextTimestamp: ''
  };
  
  const API_BASE = 'http://localhost:3001';
  
  // Preset events for easy setup
  const presets = [
    {
      name: 'ERC-20 Transfer',
      contractAddress: '0xA0b86a33E6441e6e80A3E4e2B6F6b0Dc3A6b1c6a',
      eventSignature: 'Transfer(address,address,uint256)'
    },
    {
      name: 'Uniswap V2 Pair Created',
      contractAddress: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
      eventSignature: 'PairCreated(address,address,address,uint256)'
    },
    {
      name: 'ERC-721 Transfer',
      contractAddress: '0x60E4d786628Fea6478F785A6d7e704777c86a7c6',
      eventSignature: 'Transfer(address,address,uint256)'
    }
  ];
  
  async function loadEvents() {
    try {
      loading = true;
      const response = await fetch(`${API_BASE}/events`);
      if (!response.ok) throw new Error('Failed to load events');
      const data = await response.json();
      events = data.events;
      error = null;
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error loading events:', err);
    } finally {
      loading = false;
    }
  }
  
  async function addEvent() {
    try {
      const response = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add event');
      }
      
      // Reset form and reload events
      formData = { contractAddress: '', eventSignature: '', nextTimestamp: '' };
      showAddForm = false;
      await loadEvents();
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
    }
  }
  
  function usePreset(preset: { contractAddress: string; eventSignature: string; name: string }) {
    formData.contractAddress = preset.contractAddress;
    formData.eventSignature = preset.eventSignature;
    // Set default to 1 hour from now
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    formData.nextTimestamp = oneHourFromNow.toISOString().slice(0, 16);
  }
  
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  function formatContract(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  
  function getEventName(signature: string) {
    return signature.split('(')[0];
  }
  
  // Load events when component mounts with fallback for reliability
  onMount(() => {
    loadEvents();
  });
  
  // Fallback: Ensure data loads even if onMount has timing issues
  setTimeout(() => {
    if (loading) {
      loadEvents();
    }
  }, 1000);
</script>

<svelte:head>
  <title>Events - ChainCal</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
  <!-- Header -->
  <div class="flex justify-between items-center mb-8">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Events</h1>
      <p class="mt-2 text-gray-600">Manage your contract event subscriptions</p>
    </div>
    <button
      on:click={() => showAddForm = !showAddForm}
      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
    >
      {showAddForm ? 'Cancel' : 'Add Event'}
    </button>
  </div>

  {#if error}
    <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <div class="flex">
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error</h3>
          <div class="mt-2 text-sm text-red-700">{error}</div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Add Event Form -->
  {#if showAddForm}
    <div class="bg-white shadow rounded-lg p-6 mb-8">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Add New Event Subscription</h3>
      
      <!-- Presets -->
      <div class="mb-6">
        <p class="block text-sm font-medium text-gray-700 mb-2">Quick Setup (Optional)</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          {#each presets as preset}
            <button
              on:click={() => usePreset(preset)}
              class="text-left p-3 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <div class="font-medium text-gray-900">{preset.name}</div>
              <div class="text-sm text-gray-500">{formatContract(preset.contractAddress)}</div>
            </button>
          {/each}
        </div>
      </div>

      <form on:submit|preventDefault={addEvent} class="space-y-4">
        <div>
          <label for="contractAddress" class="block text-sm font-medium text-gray-700">
            Contract Address
          </label>
          <input
            type="text"
            id="contractAddress"
            bind:value={formData.contractAddress}
            placeholder="0x..."
            required
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
          />
        </div>

        <div>
          <label for="eventSignature" class="block text-sm font-medium text-gray-700">
            Event Signature
          </label>
          <input
            type="text"
            id="eventSignature"
            bind:value={formData.eventSignature}
            placeholder="Transfer(address,address,uint256)"
            required
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
          />
        </div>

        <div>
          <label for="nextTimestamp" class="block text-sm font-medium text-gray-700">
            Next Reminder Time (Optional)
          </label>
          <input
            type="datetime-local"
            id="nextTimestamp"
            bind:value={formData.nextTimestamp}
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
          />
          <p class="mt-1 text-sm text-gray-500">
            Leave empty to set reminder for 1 hour from now
          </p>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            type="button"
            on:click={() => showAddForm = false}
            class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium"
          >
            Add Event
          </button>
        </div>
      </form>
    </div>
  {/if}

  <!-- Events List -->
  {#if loading}
    <div class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  {:else if events.length === 0}
    <div class="text-center py-12">
      <div class="text-4xl mb-4">📋</div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
      <p class="text-gray-600 mb-4">Add your first contract event subscription to get started.</p>
      <button
        on:click={() => showAddForm = true}
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
      >
        Add Event
      </button>
    </div>
  {:else}
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Event
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contract
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Next Reminder
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each events as event (event.id)}
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {getEventName(event.eventSignature)}
                </div>
                <div class="text-sm text-gray-500">
                  {event.eventSignature}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {formatContract(event.contractAddress)}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {formatDate(event.nextTimestamp)}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {formatDate(event.createdAt)}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div> 