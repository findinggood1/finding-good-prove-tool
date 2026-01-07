import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';

// Pages
import Landing from './pages/Landing';
import SelfMode from './pages/SelfMode';
import OtherMode from './pages/OtherMode';
import RequestMode from './pages/RequestMode';
import RecipientView from './pages/RecipientView';
import SenderView from './pages/SenderView';
import ProofRequestView from './pages/ProofRequestView';
import History from './pages/History';

/**
 * CRITICAL: Provider hierarchy must be:
 * BrowserRouter > AuthProvider > AppProvider > Routes
 * 
 * This order ensures:
 * 1. Router context is available to all providers
 * 2. Auth context is available before app state needs it
 * 3. App context can access auth if needed
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            {/* Landing / Home */}
            <Route path="/" element={<Landing />} />
            
            {/* Self Mode */}
            <Route path="/self" element={<SelfMode />} />
            
            {/* Other Mode (Send to Others) */}
            <Route path="/other" element={<OtherMode />} />
            
            {/* Request Mode (Ask for perspective on yourself) */}
            <Route path="/request" element={<RequestMode />} />
            
            {/* Recipient View (from Other mode invitation link) */}
            <Route path="/v/:shareId" element={<RecipientView />} />

            {/* Sender View (view Other mode recipient's response) */}
            <Route path="/r/:shareId" element={<SenderView />} />

            {/* Proof Request View (respond to Request mode) */}
            <Route path="/p/:shareId" element={<ProofRequestView />} />

            {/* History */}
            <Route path="/history" element={<History />} />
            
            {/* 404 fallback */}
            <Route path="*" element={<Landing />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
