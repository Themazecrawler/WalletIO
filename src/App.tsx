import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Chrome, Apple } from 'lucide-react';
import DeviceFrame from './components/DeviceFrame';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import CryptoVault from './components/CryptoVault';
import Transfers from './components/Transfers';
import MarketTerminal from './components/MarketTerminal';
import SecurityHub from './components/SecurityHub';
import FaultyTerminal from './components/FaultyTerminal';
import WelcomeScreen from './screens/WelcomeScreen';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import ResetScreen from './screens/ResetScreen';
import Ledger from './pages/Ledger';
import ErrorBoundary from './components/ErrorBoundary';
import { WalletProvider, useWallet } from './store/walletStore';
import { PriceFeedProvider, usePriceFeed } from './store/priceFeed';
import { ModalManagerProvider, ModalHost, useModalManager } from './modals/ModalManager';
import AppKitModal, { ConnectWalletInfo } from './modals/AppKitModal';
import QRScannerModal from './modals/QRScannerModal';
import TwoFactorOnboardingModal from './modals/TwoFactorOnboardingModal';
import TwoFactorVerificationModal from './modals/TwoFactorVerificationModal';
import { useHashRoute } from './router';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { SecurityHubState } from './types';

// --- Session persistence (auth stage + web3 connection) -------------------

const SESSION_STORAGE_KEY = 'walletio:session:v1';
/** Sessions expire after 7 days of inactivity; the user must re-authenticate. */
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type AuthStage = 'welcome' | 'signin' | 'signup' | 'reset' | 'authenticated';
const AUTH_STAGES: AuthStage[] = ['welcome', 'signin', 'signup', 'reset', 'authenticated'];

interface SessionState {
  authStage: AuthStage;
  isWalletConnected: boolean;
  walletAddress: string | null;
  walletNetwork: string;
  walletName: string | null;
  expiresAt: number;
}

function hydrateSession(): Partial<SessionState> {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    // Sessions without a deadline (pre-hardening records) or past their
    // deadline are discarded so the user is forced back through auth.
    if (typeof parsed.expiresAt !== 'number' || Date.now() > parsed.expiresAt) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return {};
    }
    const out: Partial<SessionState> = {};
    if (parsed.authStage && AUTH_STAGES.includes(parsed.authStage)) out.authStage = parsed.authStage;
    if (typeof parsed.isWalletConnected === 'boolean') out.isWalletConnected = parsed.isWalletConnected;
    if (parsed.walletAddress === null || typeof parsed.walletAddress === 'string') {
      out.walletAddress = parsed.walletAddress;
    }
    if (typeof parsed.walletNetwork === 'string') out.walletNetwork = parsed.walletNetwork;
    if (parsed.walletName === null || typeof parsed.walletName === 'string') {
      out.walletName = parsed.walletName;
    }
    out.expiresAt = parsed.expiresAt;
    return out;
  } catch {
    return {};
  }
}

function WalletApp() {
  const { route, navigate, back } = useHashRoute();
  const { dispatch, assets, securityState } = useWallet();
  const prices = usePriceFeed();
  const modals = useModalManager();

  // Session state (hydrated from localStorage, persisted on change)
  const initialSession = useMemo(() => hydrateSession(), []);
  const [authStage, setAuthStage] = useState<AuthStage>(initialSession.authStage ?? 'welcome');
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(initialSession.isWalletConnected ?? false);
  const [walletAddress, setWalletAddress] = useState<string | null>(initialSession.walletAddress ?? null);
  const [walletNetwork, setWalletNetwork] = useState<string>(initialSession.walletNetwork ?? 'Ethereum');
  const [walletName, setWalletName] = useState<string | null>(initialSession.walletName ?? null);
  // Deadline the live expiry timer enforces; refreshed on every session write.
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(initialSession.expiresAt ?? null);

  useEffect(() => {
    try {
      localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({
          authStage,
          isWalletConnected,
          walletAddress,
          walletNetwork,
          walletName,
          // Deadline is fixed at login and never extended by later activity,
          // so a reload can't reset an authenticated session's expiry clock.
          expiresAt:
            authStage === 'authenticated' && sessionExpiresAt !== null
              ? sessionExpiresAt
              : Date.now() + SESSION_TTL_MS,
        }),
      );
    } catch {
      // Storage unavailable — session just won't persist.
    }
  }, [authStage, isWalletConnected, walletAddress, walletNetwork, walletName, sessionExpiresAt]);

  const isAuthenticated = authStage === 'authenticated';

  // Global Toast Notification message
  const [notification, setNotification] = useState<string | null>(null);
  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  // Live session expiry: an authenticated tab must not stay usable past the
  // deadline. Re-check on a timer and whenever the tab regains focus.
  useEffect(() => {
    if (authStage !== 'authenticated' || sessionExpiresAt === null) return;
    const checkExpiry = () => {
      if (Date.now() >= sessionExpiresAt) {
        setAuthStage('signin');
        setIsWalletConnected(false);
        setWalletAddress(null);
        setWalletName(null);
        void supabase?.auth.signOut();
        showNotification('Session expired. Please sign in again.');
      }
    };
    const timer = setTimeout(checkExpiry, Math.max(0, sessionExpiresAt - Date.now()));
    const onVisibility = () => {
      if (document.visibilityState === 'visible') checkExpiry();
    };
    const onFocus = () => checkExpiry();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, [authStage, sessionExpiresAt, showNotification]);

  // Server-authoritative balance rejections (Supabase RPC) surface here as
  // toasts instead of silently diverging from the server.
  useEffect(() => {
    const onServerError = (event: Event) => {
      showNotification((event as CustomEvent<string>).detail);
    };
    window.addEventListener('walletio:server-error', onServerError);
    return () => window.removeEventListener('walletio:server-error', onServerError);
  }, [showNotification]);

  // Marks the moment authentication begins and fixes the session deadline.
  const beginAuthenticatedSession = useCallback(() => {
    setAuthStage('authenticated');
    setSessionExpiresAt(Date.now() + SESSION_TTL_MS);
  }, []);

  // Social auth overlay
  const [socialAuthLoading, setSocialAuthLoading] = useState<string | null>(null);
  const handleSocialLogin = useCallback(
    (provider: string) => {
      setSocialAuthLoading(provider);
      showNotification(`Initializing handshake with secure ${provider} ID enclave...`);
      setTimeout(() => {
        setSocialAuthLoading(null);
        beginAuthenticatedSession();
        navigate('vault');
        showNotification(`Decrypted profile via secure ${provider} signature.`);
      }, 2000);
    },
    [beginAuthenticatedSession, navigate, showNotification],
  );

  // 2FA orchestration. A pending action can carry an onCancel hook so that
  // canceling a sign-in verification also revokes the Supabase session that
  // was already established (see handleSignIn).
  const [twoFAVerificationTitle, setTwoFAVerificationTitle] = useState('');
  const [twoFARequireCode, setTwoFARequireCode] = useState(false);
  const [pending2FAAction, setPending2FAAction] = useState<(() => void) | null>(null);
  const [pending2FACancel, setPending2FACancel] = useState<(() => void) | null>(null);

  const request2FA = useCallback(
    (action: () => void, title: string, opts?: { requireCode?: boolean; onCancel?: () => void }) => {
      setPending2FAAction(() => action);
      setPending2FACancel(() => opts?.onCancel ?? null);
      setTwoFAVerificationTitle(title);
      setTwoFARequireCode(opts?.requireCode ?? false);
      modals.open('twoFAVerification');
    },
    [modals],
  );

  const handle2FAAuthorized = useCallback(() => {
    const action = pending2FAAction;
    setPending2FAAction(null);
    setPending2FACancel(null);
    modals.close('twoFAVerification');
    action?.();
  }, [pending2FAAction, modals]);

  const handle2FACancel = useCallback(() => {
    const cancel = pending2FACancel;
    setPending2FAAction(null);
    setPending2FACancel(null);
    modals.close('twoFAVerification');
    cancel?.();
    showNotification('Security verification canceled.');
  }, [pending2FACancel, modals, showNotification]);

  // Auth flows
  const handleSignIn = useCallback(
    async (email: string, password: string) => {
      const proceedWithLogin = () => {
        beginAuthenticatedSession();
        navigate('vault');
        showNotification(`Logged in as: ${email}`);
      };

      // Real backend path: verify credentials server-side first.
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          showNotification(`Sign-in failed: ${error.message}`);
          return;
        }
      }

      // Second factor (simulated TOTP/biometric gate until real MFA lands).
      // If the user cancels, the Supabase session started above is revoked so
      // an authenticated server session can't outlive a failed app sign-in.
      if (securityState.twoFactorProtocol) {
        request2FA(proceedWithLogin, 'Verify Sign In Attempt', {
          onCancel: () => {
            if (supabase) void supabase.auth.signOut();
          },
        });
      } else {
        proceedWithLogin();
      }
    },
    [securityState.twoFactorProtocol, request2FA, beginAuthenticatedSession, navigate, showNotification],
  );

  const handleBiometricLogin = useCallback(
    (type: 'fingerprint' | 'face') => {
      beginAuthenticatedSession();
      navigate('vault');
      showNotification(`Session authenticated via ${type === 'face' ? 'Face ID' : 'fingerprint'} scan.`);
    },
    [beginAuthenticatedSession, navigate, showNotification],
  );

  // Sign-up: prefill the email for the next sign-in, then force 2FA onboarding
  const [prefillEmail, setPrefillEmail] = useState<string | null>(null);
  const handleSignUpValid = useCallback(
    async (username: string, email: string, password: string) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: username } },
        });
        if (error) {
          showNotification(`Sign-up failed: ${error.message}`);
          return;
        }
        // When email confirmation is enabled Supabase returns no session, so
        // the account isn't usable yet — don't grant vault access. Send the
        // user to sign-in and wait until the email is confirmed.
        if (!data.session) {
          setPrefillEmail(email);
          setAuthStage('signin');
          showNotification('Check your inbox to confirm your email, then sign in.');
          return;
        }
      }
      setPrefillEmail(email);
      modals.open('twoFAOnboarding');
      showNotification(`Account created successfully for ${username}. Please configure account protection.`);
    },
    [modals, showNotification],
  );

  const handle2FAOnboardingComplete = useCallback(
    (state: SecurityHubState) => {
      dispatch({ type: 'SET_SECURITY', state });
      modals.close('twoFAOnboarding');
      beginAuthenticatedSession();
      navigate('vault');
      const msg = state.biometricUnlock
        ? 'Biometrics linked! Authenticated successfully.'
        : state.twoFactorProtocol
          ? '2FA Authenticator activated! Welcome on board.'
          : 'Account created. Remember to configure 2FA later in Security Hub.';
      showNotification(msg);
    },
    [dispatch, modals, beginAuthenticatedSession, navigate, showNotification],
  );

  // Security preferences toggling.
  // Disabling a protection is a sensitive change: it requires a fresh 2FA
  // verification, so a thief who finds the phone unlocked can't disarm the
  // account. Enabling is harmless and goes straight through.
  const handleToggleSecurity = useCallback(
    (key: keyof SecurityHubState) => {
      const label = key === 'biometricUnlock' ? 'Biometric Unlock' : '2FA Protocol';
      const turningOff = securityState[key];
      if (turningOff) {
        request2FA(
          () => {
            dispatch({ type: 'TOGGLE_SECURITY', key });
            showNotification(`${label} has been DISABLED.`);
          },
          `Disable ${label}`,
          { requireCode: true },
        );
        showNotification(`Confirm your identity to disable ${label}.`);
      } else {
        dispatch({ type: 'TOGGLE_SECURITY', key });
        showNotification(`${label} has been ENABLED.`);
      }
    },
    [dispatch, securityState, request2FA, showNotification],
  );

  // Lock session helper: de-auth also severs the Web3 connection so a
  // "logout" actually logs out everything.
  const handleDeauthenticate = useCallback(() => {
    setAuthStage('signin');
    setIsWalletConnected(false);
    setWalletAddress(null);
    setWalletName(null);
    void supabase?.auth.signOut();
    showNotification('Session successfully de-authenticated. Secure Chip locked.');
  }, [showNotification]);

  // QR scan result usage
  const handleUseScannedAddress = useCallback(
    (handle: string) => {
      modals.close('qrScanner');
      navigate('transfers');
      showNotification(`Populated scanned address in secure beam: ${handle.split(' - ')[0]}`);
    },
    [modals, navigate, showNotification],
  );

  // AppKit (Web3 wallet) connection
  const handleConnectWalletConnect = useCallback(() => {
    showNotification('Generating WalletConnect secure session...');
    setTimeout(() => {
      setIsWalletConnected(true);
      setWalletAddress('0x71C35c1f543e88888e404CcfF497E1fC1b1bF9Ea');
      setWalletName('WalletConnect Mobile');
      setWalletNetwork('Arbitrum One');
      modals.close('appkit');
      showNotification('WalletConnect Mobile session linked via Reown AppKit!');
    }, 1200);
  }, [modals, showNotification]);

  const handleConnectWallet = useCallback(
    (wallet: ConnectWalletInfo) => {
      showNotification(`Connecting to ${wallet.name}...`);
      setTimeout(() => {
        setIsWalletConnected(true);
        setWalletAddress(wallet.address);
        setWalletName(wallet.name);
        setWalletNetwork(wallet.net);
        modals.close('appkit');
        showNotification(`Successfully connected ${wallet.name} Web3 wallet!`);
      }, 1000);
    },
    [modals, showNotification],
  );

  const handleDisconnectWallet = useCallback(() => {
    setIsWalletConnected(false);
    setWalletAddress(null);
    setWalletName(null);
    modals.close('appkit');
    showNotification('Web3 Wallet session disconnected.');
  }, [modals, showNotification]);

  // Live portfolio valuation derived from the shared price feed
  const portfolioValue = assets.reduce(
    (sum, asset) => sum + asset.balance * (prices[asset.symbol] ?? 0),
    0,
  );

  return (
    <DeviceFrame notificationMessage={notification} onCloseNotification={() => setNotification(null)}>
      {!isAuthenticated ? (
        <div className="flex-1 flex flex-col justify-between p-6 bg-[#07080c] relative select-none animate-fade-in h-full overflow-y-auto">
          {/* Subtle grid pattern backing */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* FaultyTerminal background for all auth screens */}
          <div className="absolute inset-0 z-0 opacity-25 pointer-events-none overflow-hidden">
            <FaultyTerminal
              scale={1.4}
              gridMul={[2, 1]}
              digitSize={1.2}
              timeScale={0.6}
              pause={false}
              scanlineIntensity={0.5}
              glitchAmount={1.1}
              flickerAmount={0.4}
              noiseAmp={0.3}
              chromaticAberration={2.0}
              dither={0.1}
              curvature={0.2}
              tint="#00f0ff"
              mouseReact={true}
              mouseStrength={0.4}
              pageLoadAnimation={false}
              brightness={0.8}
            />
          </div>
          {/* Contrast protection vignette */}
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#07080c] via-transparent to-[#07080c]/80 pointer-events-none" />

          {authStage === 'welcome' && (
            <WelcomeScreen
              onSocialLogin={handleSocialLogin}
              onNavigateSignIn={() => setAuthStage('signin')}
              onNavigateSignUp={() => setAuthStage('signup')}
            />
          )}

          {socialAuthLoading && (
            <div className="absolute inset-0 z-50 bg-[#07080c]/95 flex flex-col items-center justify-center p-6 text-center animate-fade-in select-none">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-2 border-cyan-500/25 border-t-[#00f0ff] animate-spin flex items-center justify-center" />
                <div className="absolute inset-0 flex items-center justify-center text-[#00f0ff]">
                  {socialAuthLoading === 'Google' ? <Chrome className="w-6 h-6 animate-pulse" /> : <Apple className="w-6 h-6 animate-pulse" />}
                </div>
              </div>
              <div className="space-y-2 max-w-xs">
                <h3 className="font-display text-sm font-bold tracking-wider text-slate-100 uppercase">
                  Decrypting Vault Profile
                </h3>
                <p className="font-mono text-[9px] text-cyan-400 uppercase tracking-widest animate-pulse">
                  Verifying {socialAuthLoading} Secure Enclave Signature...
                </p>
                <div className="font-mono text-[8px] text-slate-500 uppercase mt-4 p-3 rounded-lg bg-zinc-950/80 border border-zinc-900/80 leading-normal text-left max-h-32 overflow-hidden space-y-1">
                  <div>&gt; INITIALIZING HANDSHAKE</div>
                  <div>&gt; VERIFYING CRYPTOGRAPHIC PROOF</div>
                  <div>&gt; EXCHANGE SESSION LATTICE KEY</div>
                  <div className="animate-pulse text-[#00f0ff]">&gt; INTEGRITY VALIDATED</div>
                </div>
              </div>
            </div>
          )}

          {authStage === 'signin' && (
            <SignInScreen
              onBack={() => setAuthStage('welcome')}
              onForgot={() => setAuthStage('reset')}
              onSignIn={handleSignIn}
              onBiometricLogin={handleBiometricLogin}
              onNavigateSignUp={() => setAuthStage('signup')}
              showNotification={showNotification}
              initialEmail={prefillEmail}
            />
          )}

          {authStage === 'signup' && (
            <SignUpScreen
              onBack={() => setAuthStage('signin')}
              onSignUp={handleSignUpValid}
              onNavigateSignIn={() => setAuthStage('signin')}
            />
          )}

          {authStage === 'reset' && (
            <ResetScreen
              onBack={() => setAuthStage('signin')}
              onReset={async (email) => {
                if (isSupabaseConfigured && supabase) {
                  const { error } = await supabase.auth.resetPasswordForEmail(email);
                  if (error) {
                    showNotification(`Password reset failed: ${error.message}`);
                    return;
                  }
                }
                setAuthStage('signin');
                showNotification('A password reset link has been sent to your email.');
              }}
              showNotification={showNotification}
            />
          )}
        </div>
      ) : (
        /* Authenticated Main App Container */
        <div className="flex-1 flex flex-col h-full min-h-0 relative">
          {/* Main header (Hidden on settings/profile subtab, which features its own back button) */}
          {route !== 'profile' && (
            <Header
              onProfileClick={() => navigate('profile')}
              onAddWallet={() => modals.open('appkit')}
              isWalletConnected={isWalletConnected}
              walletAddress={walletAddress}
              onScanQRCode={() => modals.open('qrScanner')}
            />
          )}

          {/* Primary screen router content view */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
            {route === 'vault' && (
              <Dashboard
                portfolioValue={portfolioValue}
                onAddTransaction={(tx) => {
                  dispatch({ type: 'ADD_TRANSACTION', transaction: tx });
                  showNotification(`Added transaction: ${tx.title}`);
                }}
              />
            )}

            {route === 'transfers' && (
              <Transfers
                onShowNotification={showNotification}
                onScanQRCode={() => modals.open('qrScanner')}
                onRequest2FA={request2FA}
              />
            )}

            {route === 'crypto' && (
              <CryptoVault
                onShowNotification={showNotification}
                onNavigateToHistory={() => navigate('ledger')}
              />
            )}

            {route === 'market' && <MarketTerminal onShowNotification={showNotification} />}

            {route === 'profile' && (
              <SecurityHub
                securityState={securityState}
                onToggleSecurity={handleToggleSecurity}
                onClose={() => back('vault')}
                onDeauthenticate={handleDeauthenticate}
              />
            )}

            {route === 'ledger' && <Ledger onBack={() => back('crypto')} showNotification={showNotification} />}
          </div>

          {/* Sticky Bottom Navigation tabbed bar */}
          <BottomNav activePage={route} onPageChange={navigate} />
        </div>
      )}

      {/* Managed modal stack (layered by open order) */}
      <ModalHost
        modals={{
          appkit: (
            <AppKitModal
              isWalletConnected={isWalletConnected}
              walletAddress={walletAddress}
              walletNetwork={walletNetwork}
              walletName={walletName}
              onConnectWalletConnect={handleConnectWalletConnect}
              onConnectWallet={handleConnectWallet}
              onSwitchNetwork={(net) => {
                setWalletNetwork(net);
                showNotification(`Network switched to ${net}`);
              }}
              onDisconnect={handleDisconnectWallet}
              onClose={() => modals.close('appkit')}
              showNotification={showNotification}
            />
          ),
          qrScanner: (
            <QRScannerModal
              onClose={() => modals.close('qrScanner')}
              onUseAddress={handleUseScannedAddress}
              showNotification={showNotification}
            />
          ),
          twoFAOnboarding: <TwoFactorOnboardingModal onComplete={handle2FAOnboardingComplete} showNotification={showNotification} />,
          twoFAVerification: (
            <TwoFactorVerificationModal
              title={twoFAVerificationTitle}
              requireCode={twoFARequireCode}
              onAuthorized={handle2FAAuthorized}
              onClose={handle2FACancel}
              showNotification={showNotification}
            />
          ),
        }}
      />
    </DeviceFrame>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <WalletProvider
        onServerError={(message) =>
          window.dispatchEvent(new CustomEvent('walletio:server-error', { detail: message }))
        }
      >
        <PriceFeedProvider>
          <ModalManagerProvider>
            <WalletApp />
          </ModalManagerProvider>
        </PriceFeedProvider>
      </WalletProvider>
    </ErrorBoundary>
  );
}
