// Diari Kasturi — service worker (notifikasi)
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("push", e => {
  let p = {};
  try { p = e.data ? e.data.json() : {}; } catch (_) { p = { body: e.data ? e.data.text() : "" }; }
  const title = p.title || "Diari Kasturi";
  e.waitUntil(Promise.all([
    self.registration.showNotification(title, {
      body: p.body || "",
      icon: "icon-192.png",
      badge: "icon-192.png",
      tag: p.tab === "chat" ? "chat" : undefined,
      renotify: p.tab === "chat",
      data: { tab: p.tab || "kita" }
    }),
    self.navigator && self.navigator.setAppBadge ? self.navigator.setAppBadge().catch(() => {}) : null
  ]));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const tab = (e.notification.data && e.notification.data.tab) || "kita";
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) {
      if ("focus" in c) { c.postMessage({ open: tab }); return c.focus(); }
    }
    return self.clients.openWindow(self.registration.scope + "?open=" + encodeURIComponent(tab));
  })());
});
