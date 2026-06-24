import React, { useEffect } from "react";
import { socket } from "../socket";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { urlBase64ToUint8Array } from "../utils/webpushHelpers";
import axiosInstance from "../utils/axiosInstance";

export const useNotifications = (adminId, onNewNotification) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminId) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("registerAdmin", adminId);

    const subscribeToPush = async () => {
      try {
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.register("/sw.js");
          
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
          });

          await axiosInstance.post("/notifications/save-subscription", subscription);
          console.log("Web Push Subscription successfully registered for Offline Notifications.");
        }
      } catch (error) {
        console.error("Service worker registration or subscription failed:", error);
      }
    };

    // If permission already granted, seamlessly link Service Worker
    if (Notification.permission === "granted") {
      subscribeToPush();
    }

    const playSound = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } catch (e) {
        console.error("Audio playback error:", e);
      }
    };

    const showBrowserNotification = (data) => {
      // Re-enabled foreground native notification for absolute reliability while open.
      if (Notification.permission === "granted") {
        const notif = new Notification(data.title, {
          body: data.message,
          icon: "/vite.svg", 
          tag: "foreground-notif-" + Date.now() // Prevents duplicate stacking if SW also fires
        });
        notif.onclick = () => {
          window.focus();
          if (data.redirectUrl) navigate(data.redirectUrl);
          notif.close();
        };
      }
    };

    const showToast = (data) => {
      toast.info(
        <div onClick={() => data.redirectUrl && navigate(data.redirectUrl)} className="cursor-pointer">
          <strong className="block text-sm font-bold mb-1">{data.title}</strong>
          <p className="text-xs">{data.message}</p>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          theme: "dark", // Sleek dark theme requirement
        }
      );
    };

    const handleNewNotification = (data) => {
      console.log("New Notification Received:", data);
      showToast(data);
      playSound();
      showBrowserNotification(data);
      
      if (onNewNotification) onNewNotification(data);
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [adminId, navigate, onNewNotification]);
};
