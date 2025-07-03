<script>
  import '../app.css';
</script>

<div class="min-h-screen bg-gray-50">
  <!-- Navigation -->
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <h1 class="text-2xl font-bold text-gray-900">
            🗓️ ChainCal
          </h1>
        </div>
        <div class="flex items-center space-x-4">
          <a href="/" class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
            Dashboard
          </a>
          <a href="/events" class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
            Events
          </a>
          <a href="http://localhost:3002/api/frame" target="_blank" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            View Frame
          </a>
        </div>
      </div>
    </div>
  </nav>

  <!-- Main content -->
  <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <slot />
  </main>
</div> 