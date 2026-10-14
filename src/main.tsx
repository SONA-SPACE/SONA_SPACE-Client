import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.tsx";
import 'antd/dist/reset.css';

const ChatBot = lazy(() => import("./components/ChatBot/index.tsx"));
const PopupAd = lazy(() => import("./components/PopupAd/index.tsx"));

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <StrictMode>
      <App />
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
      <Suspense fallback={null}>
        <PopupAd />
      </Suspense>
    </StrictMode>
  </GoogleOAuthProvider>
);
