self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.message,
      icon: "/vite.svg", // Fallback to React icon
      badge: "/vite.svg",
      data: {
        url: data.url,
      },
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  // Opens the tab in the background if the user clicked
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, just focus it and navigate
      const targetUrl = new URL(event.notification.data.url, self.location.origin).href;

      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Alternatively, open a completely new window/tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
