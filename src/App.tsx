import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Fingerprint, 
  ScanFace,
  Shield, 
  Activity,
  History,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ChevronLeft,
  X,
  Wallet,
  ExternalLink,
  Copy,
  LogOut,
  Globe,
  Check,
  Mail,
  User,
  ArrowRight,
  Chrome,
  Apple,
  QrCode,
  Camera,
  Smartphone,
  Key
} from 'lucide-react';
import DeviceFrame from './components/DeviceFrame';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import CryptoVault from './components/CryptoVault';
import Transfers from './components/Transfers';
import MarketTerminal from './components/MarketTerminal';
import SecurityHub from './components/SecurityHub';
import FaultyTerminal from './components/FaultyTerminal';
import Shuffle from './components/Shuffle';
import { Page, Transaction, CryptoAsset, SecurityHubState } from './types';
import { INITIAL_TRANSACTIONS, INITIAL_ASSETS } from './data';

export default function App() {
  // Page Navigation State
  const [activePage, setActivePage] = useState<Page>('vault');

  // Ledger Search/Filter States
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerAssetFilter, setLedgerAssetFilter] = useState('all');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  // Reown AppKit Web3 Wallet States
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletNetwork, setWalletNetwork] = useState<string>('Ethereum');
  const [walletName, setWalletName] = useState<string | null>(null);
  const [isAppKitOpen, setIsAppKitOpen] = useState<boolean>(false);

  // Core synchronized application states
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [assets, setAssets] = useState<CryptoAsset[]>(INITIAL_ASSETS);
  const [liquidityBalance, setLiquidityBalance] = useState<number>(42069.00);
  const [securityState, setSecurityState] = useState<SecurityHubState>({
    biometricUnlock: true,
    twoFactorProtocol: true
  });

  // Welcome and Auth Screens stages: 'welcome' | 'signin' | 'signup' | 'reset' | 'authenticated'
  const [authStage, setAuthStage] = useState<'welcome' | 'signin' | 'signup' | 'reset' | 'authenticated'>('welcome');
  const isAuthenticated = authStage === 'authenticated';
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanningType, setScanningType] = useState<'fingerprint' | 'face' | null>(null);
  const [isBiometricActive, setIsBiometricActive] = useState<boolean>(false);

  // Form input states
  const [signInEmail, setSignInEmail] = useState<string>('');
  const [signInPassword, setSignInPassword] = useState<string>('');
  const [signUpUsername, setSignUpUsername] = useState<string>('');
  const [signUpEmail, setSignUpEmail] = useState<string>('');
  const [signUpPassword, setSignUpPassword] = useState<string>('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState<string>('');
  const [signUpErrors, setSignUpErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [resetEmail, setResetEmail] = useState<string>('');
  const [socialAuthLoading, setSocialAuthLoading] = useState<string | null>(null);

  // Global Toast Notification message
  const [notification, setNotification] = useState<string | null>(null);

  // QR Code Scanner State
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);
  const [qrScanResult, setQrScanResult] = useState<string | null>(null);

  // 2FA / Biometrics Modal States
  const [show2FAOnboardingModal, setShow2FAOnboardingModal] = useState<boolean>(false);
  const [show2FAVerificationModal, setShow2FAVerificationModal] = useState<boolean>(false);
  const [twoFAVerificationTitle, setTwoFAVerificationTitle] = useState<string>("");
  const [pending2FAAction, setPending2FAAction] = useState<(() => void) | null>(null);

  // Request 2FA authorization before sensitive actions
  const request2FA = (action: () => void, title: string) => {
    setPending2FAAction(() => action);
    setTwoFAVerificationTitle(title);
    setShow2FAVerificationModal(true);
  };

  // Simulated social authentication handler
  const handleSocialLogin = (provider: string) => {
    setSocialAuthLoading(provider);
    showNotification(`Initializing handshake with secure ${provider} ID enclave...`);
    setTimeout(() => {
      setSocialAuthLoading(null);
      setAuthStage('authenticated');
      setActivePage('vault');
      showNotification(`Decrypted profile via secure ${provider} signature.`);
    }, 2000);
  };

  // Trigger global toast helper
  const showNotification = (msg: string) => {
    setNotification(msg);
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setNotification(prev => prev === msg ? null : prev);
    }, 4000);
  };

  // Transaction action handlers
  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
    showNotification(`Added transaction: ${newTx.title}`);
  };

  // Transfers settlement handler (deducts from standard liquidity cash)
  const handleSettleTransfer = (amount: number) => {
    setLiquidityBalance(prev => {
      const newBal = prev - amount;
      if (newBal < 0) {
        showNotification("Warning: Cash balance is negative, system overdrawn limit adjusted.");
      }
      return newBal;
    });
  };

  // Market Terminal trade balance updater (updates liquidity cash balance)
  const handleUpdateLiquidity = (newVal: number) => {
    setLiquidityBalance(newVal);
  };

  // Vault updates (modifies individual crypto balances in real-time)
  const handleUpdateAssetBalance = (assetId: string, newBalance: number) => {
    setAssets(prev => prev.map(asset => {
      if (asset.id === assetId) {
        return { ...asset, balance: newBalance };
      }
      return asset;
    }));
  };

  // Security preferences toggling
  const handleToggleSecurity = (key: keyof SecurityHubState) => {
    setSecurityState(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      showNotification(`${key.replace(/([A-Z])/g, ' $1')} has been ${updated[key] ? 'ENABLED' : 'DISABLED'}.`);
      return updated;
    });
  };

  // Lock session helper
  const handleDeauthenticate = () => {
    setAuthStage('signin');
    showNotification("Session successfully de-authenticated. Secure Chip locked.");
  };

  // Header biometric icon click (Simulates a fast quickscan security check)
  const handleHeaderScanBiometric = () => {
    setIsBiometricActive(true);
    showNotification("Biometric quick-scan initialized. Verifying lattice key...");
    setTimeout(() => {
      setIsBiometricActive(false);
      showNotification("Identity re-verified. Integrity score: 994.");
    }, 1500);
  };

  // Lock Screen Authenticate button trigger
  const triggerUnlockBiometric = (type: 'fingerprint' | 'face') => {
    setIsScanning(true);
    setScanningType(type);
    showNotification(`Initializing device ${type === 'face' ? 'Face ID' : 'fingerprint'} scan...`);
    setTimeout(() => {
      setIsScanning(false);
      setScanningType(null);
      setAuthStage('authenticated');
      setActivePage('vault');
      showNotification(`Session authenticated via ${type === 'face' ? 'Face ID' : 'fingerprint'} scan.`);
    }, 1800);
  };

  // Custom simulation to export the CSV ledger
  const triggerLedgerExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      showNotification("Secure audit ledger exported to CSV file successfully!");
    }, 1500);
  };

  // Filtering ledger transactions list
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.title.toLowerCase().includes(ledgerSearch.toLowerCase()) || 
                          tx.subtitle.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
                          tx.category.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
                          (tx.currencySymbol && tx.currencySymbol.toLowerCase().includes(ledgerSearch.toLowerCase()));
    
    const matchesAsset = ledgerAssetFilter === 'all' || (tx.currencySymbol && tx.currencySymbol.toLowerCase() === ledgerAssetFilter.toLowerCase());
    const matchesType = ledgerTypeFilter === 'all' || tx.type === ledgerTypeFilter;

    return matchesSearch && matchesAsset && matchesType;
  });

  return (
    <DeviceFrame 
      notificationMessage={notification} 
      onCloseNotification={() => setNotification(null)}
    >
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
            <div className="flex-1 flex flex-col z-10 py-4 h-full relative justify-end">
              {/* Welcome text - slightly above the center of the page */}
              <div className="flex-1 flex flex-col items-center justify-center -translate-y-10 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-[#00f0ff] animate-pulse backdrop-blur-md">
                  <Wallet className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <Shuffle
                    text="WELCOME TO WALLETIO"
                    shuffleDirection="right"
                    duration={0.35}
                    animationMode="evenodd"
                    shuffleTimes={3}
                    ease="power3.out"
                    stagger={0.03}
                    threshold={0.1}
                    triggerOnce={false}
                    triggerOnHover={false}
                    loop={true}
                    loopDelay={4}
                    scrambleCharset="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$"
                    respectReducedMotion={true}
                    tag="h1"
                    className="font-display text-2xl font-bold tracking-tight text-slate-100"
                  />
                  <p className="font-sans text-xs text-slate-400">Your secure digital crypto wallet</p>
                </div>
              </div>

              {/* Authentication Providers - moved lower on the screen */}
              <div className="space-y-3.5 w-full mb-6">
                {/* Google Button */}
                <button
                  onClick={() => handleSocialLogin('Google')}
                  className="w-full py-3.5 px-4 rounded-xl bg-zinc-950/70 border border-zinc-800/60 hover:border-cyan-500/40 text-slate-200 font-display text-xs font-medium tracking-wider active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer backdrop-blur-md uppercase"
                >
                  <Chrome className="w-4.5 h-4.5 text-[#ea4335]" />
                  <span>Sign In with Google</span>
                </button>

                {/* Apple Button */}
                <button
                  onClick={() => handleSocialLogin('Apple')}
                  className="w-full py-3.5 px-4 rounded-xl bg-zinc-950/70 border border-zinc-800/60 hover:border-cyan-500/40 text-slate-200 font-display text-xs font-medium tracking-wider active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer backdrop-blur-md uppercase"
                >
                  <Apple className="w-4.5 h-4.5 text-white" />
                  <span>Sign In with Apple</span>
                </button>

                {/* Email Button */}
                <button
                  onClick={() => setAuthStage('signin')}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#00f0ff] text-slate-950 font-display text-xs font-bold tracking-wider hover:bg-cyan-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 uppercase shadow-[0_0_20px_rgba(0,240,255,0.25)] cursor-pointer"
                >
                  <Mail className="w-4.5 h-4.5" />
                  <span>Sign In with Email</span>
                </button>
              </div>

              {/* Footer navigation */}
              <div className="text-center mb-2">
                <button 
                  onClick={() => setAuthStage('signup')}
                  className="font-mono text-[10px] text-slate-400 hover:text-cyan-400 uppercase tracking-widest cursor-pointer transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
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
            <div className="flex-1 flex flex-col z-10 py-2 h-full">
              {/* Back Arrow */}
              <div className="flex items-center mb-4">
                <button 
                  onClick={() => setAuthStage('welcome')}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80 hover:border-cyan-400/40 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title="Back to Welcome"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-[9px] text-slate-500 uppercase ml-3 tracking-widest">SIGN IN</span>
              </div>

              {/* Heading */}
              <div className="text-center mb-6">
                <h2 className="font-display text-xl font-bold text-slate-100">SIGN IN</h2>
                <p className="font-sans text-xs text-slate-400 mt-1">Access your digital assets secure wallet.</p>
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9px] text-slate-400 tracking-wider uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] outline-none text-xs text-slate-100 placeholder-slate-600 transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-mono text-[9px] text-slate-400 tracking-wider uppercase">Password</label>
                    <button 
                      onClick={() => setAuthStage('reset')}
                      className="font-mono text-[9px] text-cyan-400 hover:text-cyan-300 uppercase tracking-wide focus:outline-none cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] outline-none text-xs text-slate-100 placeholder-slate-600 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Primary Button */}
                <button
                  onClick={() => {
                    if (!signInEmail.includes('@') || signInPassword.length < 4) {
                      showNotification("Please enter a valid email address and password.");
                    } else {
                      const proceedWithLogin = () => {
                        setAuthStage('authenticated');
                        setActivePage('vault');
                        showNotification(`Logged in as: ${signInEmail}`);
                      };

                      if (securityState.twoFactorProtocol) {
                        request2FA(proceedWithLogin, "Verify Sign In Attempt");
                      } else {
                        proceedWithLogin();
                      }
                    }
                  }}
                  className="w-full py-2.5 px-4 mt-1 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 font-display text-xs font-bold tracking-wider hover:border-[#00f0ff] hover:text-[#00f0ff] active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase cursor-pointer"
                >
                  Sign In
                </button>
              </div>

              {/* Biometric login option */}
              <div className="mt-6 pt-5 border-t border-zinc-900 grid grid-cols-2 justify-items-center w-full relative">
                <span className="col-span-2 font-mono text-[9px] text-slate-500 uppercase tracking-widest mb-4 text-center">Biometric Login</span>
                
                {/* Fingerprint / Touch ID Button */}
                <button 
                  onClick={() => triggerUnlockBiometric('fingerprint')}
                  disabled={isScanning}
                  className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isScanning && scanningType === 'fingerprint'
                      ? 'bg-[#00f0ff]/10 border-2 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.3)] scale-105' 
                      : 'bg-zinc-900/60 border border-zinc-800/80 hover:border-cyan-500/40 hover:bg-zinc-900 shadow-md cursor-pointer'
                  }`}
                  title="Trigger Fingerprint Scan"
                >
                  {isScanning && scanningType === 'fingerprint' ? (
                    <>
                      <Fingerprint className="w-8 h-8 text-[#00f0ff] animate-pulse" />
                      <div className="absolute inset-0 border-2 border-transparent border-t-cyan-400 rounded-full animate-spin" />
                    </>
                  ) : (
                    <Fingerprint className="w-8 h-8 text-slate-400 hover:text-[#00f0ff] transition-colors" />
                  )}
                </button>

                {/* Face ID Button */}
                <button 
                  onClick={() => triggerUnlockBiometric('face')}
                  disabled={isScanning}
                  className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isScanning && scanningType === 'face'
                      ? 'bg-[#00f0ff]/10 border-2 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.3)] scale-105' 
                      : 'bg-zinc-900/60 border border-zinc-800/80 hover:border-cyan-500/40 hover:bg-zinc-900 shadow-md cursor-pointer'
                  }`}
                  title="Trigger Face ID Scan"
                >
                  {isScanning && scanningType === 'face' ? (
                    <>
                      <ScanFace className="w-8 h-8 text-[#00f0ff] animate-pulse" />
                      <div className="absolute inset-0 border-2 border-transparent border-t-cyan-400 rounded-full animate-spin" />
                    </>
                  ) : (
                    <ScanFace className="w-8 h-8 text-slate-400 hover:text-[#00f0ff] transition-colors" />
                  )}
                </button>

                {/* Label Touch ID */}
                <span className="font-mono text-[8px] text-slate-500 text-center mt-2.5 uppercase tracking-wide">
                  {isScanning && scanningType === 'fingerprint' ? "Scanning..." : "Touch ID"}
                </span>

                {/* Label Face ID */}
                <span className="font-mono text-[8px] text-slate-500 text-center mt-2.5 uppercase tracking-wide">
                  {isScanning && scanningType === 'face' ? "Scanning..." : "Face ID"}
                </span>
              </div>

              {/* Footer link */}
              <div className="text-center mt-auto pt-4">
                <button 
                  onClick={() => setAuthStage('signup')}
                  className="font-mono text-[9px] text-slate-500 hover:text-slate-300 uppercase tracking-wide transition-colors cursor-pointer focus:outline-none"
                >
                  Don't have an account? Sign Up
                </button>
              </div>
            </div>
          )}

          {authStage === 'signup' && (
            <div className="flex-1 flex flex-col z-10 py-2 h-full">
              {/* Back Arrow */}
              <div className="flex items-center mb-4">
                <button 
                  onClick={() => setAuthStage('signin')}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80 hover:border-cyan-400/40 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title="Back to Sign In"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-[9px] text-slate-500 uppercase ml-3 tracking-widest">SIGN UP</span>
              </div>

              {/* Heading */}
              <div className="text-center mb-5">
                <h2 className="font-display text-xl font-bold text-slate-100">SIGN UP</h2>
                <p className="font-sans text-xs text-slate-400 mt-1">Create an account to start managing your assets.</p>
              </div>

              {/* Form fields */}
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9px] text-slate-400 tracking-wider uppercase">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text"
                      value={signUpUsername}
                      onChange={(e) => {
                        setSignUpUsername(e.target.value);
                        setSignUpErrors(prev => ({ ...prev, username: undefined }));
                      }}
                      placeholder="e.g. Alex Rivera"
                      className={`w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/50 border outline-none text-xs text-slate-100 placeholder-slate-600 transition-all font-sans ${
                        signUpErrors.username 
                          ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/50' 
                          : 'border-zinc-800 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]'
                      }`}
                    />
                  </div>
                  {signUpErrors.username && (
                    <span className="font-mono text-[9px] text-red-400 uppercase tracking-wider pl-1">
                      {signUpErrors.username}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9px] text-slate-400 tracking-wider uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="email"
                      value={signUpEmail}
                      onChange={(e) => {
                        setSignUpEmail(e.target.value);
                        setSignUpErrors(prev => ({ ...prev, email: undefined }));
                      }}
                      placeholder="name@example.com"
                      className={`w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/50 border outline-none text-xs text-slate-100 placeholder-slate-600 transition-all font-sans ${
                        signUpErrors.email 
                          ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/50' 
                          : 'border-zinc-800 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]'
                      }`}
                    />
                  </div>
                  {signUpErrors.email && (
                    <span className="font-mono text-[9px] text-red-400 uppercase tracking-wider pl-1">
                      {signUpErrors.email}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9px] text-slate-400 tracking-wider uppercase">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="password"
                      value={signUpPassword}
                      onChange={(e) => {
                        setSignUpPassword(e.target.value);
                        setSignUpErrors(prev => ({ ...prev, password: undefined }));
                      }}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/50 border outline-none text-xs text-slate-100 placeholder-slate-600 transition-all font-sans ${
                        signUpErrors.password 
                          ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/50' 
                          : 'border-zinc-800 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]'
                      }`}
                    />
                  </div>
                  {signUpErrors.password && (
                    <span className="font-mono text-[9px] text-red-400 uppercase tracking-wider pl-1">
                      {signUpErrors.password}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9px] text-slate-400 tracking-wider uppercase">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="password"
                      value={signUpConfirmPassword}
                      onChange={(e) => {
                        setSignUpConfirmPassword(e.target.value);
                        setSignUpErrors(prev => ({ ...prev, confirmPassword: undefined }));
                      }}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/50 border outline-none text-xs text-slate-100 placeholder-slate-600 transition-all font-sans ${
                        signUpErrors.confirmPassword 
                          ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/50' 
                          : 'border-zinc-800 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]'
                      }`}
                    />
                  </div>
                  {signUpErrors.confirmPassword && (
                    <span className="font-mono text-[9px] text-red-400 uppercase tracking-wider pl-1">
                      {signUpErrors.confirmPassword}
                    </span>
                  )}
                </div>

                {/* Primary Button */}
                <button
                  onClick={() => {
                    const errors: typeof signUpErrors = {};
                    if (!signUpUsername.trim()) {
                      errors.username = "Full name is required.";
                    }
                    if (!signUpEmail.trim()) {
                      errors.email = "Email address is required.";
                    } else if (!signUpEmail.includes('@')) {
                      errors.email = "Please enter a valid email address.";
                    }
                    if (!signUpPassword) {
                      errors.password = "Password is required.";
                    } else if (signUpPassword.length < 6) {
                      errors.password = "Password must be at least 6 characters.";
                    }
                    if (signUpPassword !== signUpConfirmPassword) {
                      errors.confirmPassword = "Passwords do not match.";
                    }

                    if (Object.keys(errors).length > 0) {
                      setSignUpErrors(errors);
                    } else {
                      setSignUpErrors({});
                      setSignInEmail(signUpEmail);
                      setShow2FAOnboardingModal(true);
                      showNotification(`Account created successfully for ${signUpUsername}. Please configure account protection.`);
                    }
                  }}
                  className="w-full py-2.5 px-4 mt-3 rounded-xl bg-[#00f0ff] text-slate-950 font-display text-xs font-bold tracking-wider hover:bg-cyan-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase shadow-[0_0_15px_rgba(0,240,255,0.2)] cursor-pointer"
                >
                  Sign Up
                </button>
              </div>

              {/* Footer link */}
              <div className="text-center mt-auto pt-5">
                <button 
                  onClick={() => setAuthStage('signin')}
                  className="font-mono text-[9px] text-slate-500 hover:text-slate-300 uppercase tracking-wide transition-colors cursor-pointer focus:outline-none"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </div>
          )}

          {authStage === 'reset' && (
            <div className="flex-1 flex flex-col z-10 py-2 h-full">
              {/* Back Arrow */}
              <div className="flex items-center mb-4">
                <button 
                  onClick={() => setAuthStage('signin')}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80 hover:border-cyan-400/40 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title="Back to Sign In"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-[9px] text-slate-500 uppercase ml-3 tracking-widest">PASSWORD RESET</span>
              </div>

              {/* Heading */}
              <div className="text-center mb-6">
                <h2 className="font-display text-xl font-bold text-slate-100">RESET PASSWORD</h2>
                <p className="font-sans text-xs text-slate-400 mt-1 leading-relaxed px-4">
                  Enter your email address below, and we will send you a secure link to reset your password and restore access to your account.
                </p>
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9px] text-slate-400 tracking-wider uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] outline-none text-xs text-slate-100 placeholder-slate-600 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Primary Button */}
                <button
                  onClick={() => {
                    if (!resetEmail.includes('@')) {
                      showNotification("Please enter a valid email address.");
                    } else {
                      setAuthStage('signin');
                      showNotification("A password reset link has been sent to your email.");
                    }
                  }}
                  className="w-full py-2.5 px-4 mt-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 font-display text-xs font-bold tracking-wider hover:border-[#00f0ff] hover:text-[#00f0ff] active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase cursor-pointer"
                >
                  Send Reset Link
                </button>
              </div>

              {/* Footer link */}
              <div className="text-center mt-auto pt-6">
                <button 
                  onClick={() => setAuthStage('signin')}
                  className="font-mono text-[9px] text-slate-500 hover:text-slate-300 uppercase tracking-wide transition-colors cursor-pointer focus:outline-none"
                >
                  Remember your password? Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Authenticated Main App Container */
        <div className="flex-1 flex flex-col h-full min-h-0 relative">
          
          {/* Main header (Hidden on settings/profile subtab, which features its own back button) */}
          {activePage !== 'profile' && (
            <Header 
              onProfileClick={() => setActivePage('profile')} 
              onAddWallet={() => setIsAppKitOpen(true)}
              isWalletConnected={isWalletConnected}
              walletAddress={walletAddress}
              onScanQRCode={() => setIsQRScannerOpen(true)}
            />
          )}

          {/* Primary screen router content view */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
            {activePage === 'vault' && (
              <Dashboard 
                transactions={transactions} 
                portfolioValue={assets.reduce((sum, asset) => sum + (asset.balance * asset.priceUsd), 0)}
                onAddTransaction={handleAddTransaction} 
                onNavigateToHistory={() => setActivePage('ledger')}
                isBiometricAuthenticated={isAuthenticated}
              />
            )}

            {activePage === 'transfers' && (
              <Transfers 
                onAddTransaction={handleAddTransaction} 
                onShowNotification={showNotification} 
                onSettleTransfer={handleSettleTransfer}
                onScanQRCode={() => setIsQRScannerOpen(true)}
                is2FAActive={securityState.twoFactorProtocol}
                onRequest2FA={request2FA}
              />
            )}

            {activePage === 'crypto' && (
              <CryptoVault 
                assets={assets} 
                transactions={transactions}
                onUpdateAssetBalance={handleUpdateAssetBalance} 
                onShowNotification={showNotification}
                onNavigateToHistory={() => setActivePage('ledger')}
              />
            )}

            {activePage === 'market' && (
              <MarketTerminal 
                onShowNotification={showNotification} 
                liquidityBalance={liquidityBalance} 
                onUpdateLiquidity={handleUpdateLiquidity}
              />
            )}

            {activePage === 'profile' && (
              <SecurityHub 
                securityState={securityState} 
                onToggleSecurity={handleToggleSecurity} 
                onClose={() => setActivePage('vault')} 
                onDeauthenticate={handleDeauthenticate}
              />
            )}

            {activePage === 'ledger' && (
              /* Custom Implemented Full-scale Audit Ledger page */
              <div className="flex flex-col gap-6 p-6 animate-fade-in pb-10">
                
                {/* Title block with back button */}
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setActivePage('crypto')}
                      className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-cyan-400/40 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Back to Crypto"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h2 className="font-display text-xl font-bold text-slate-100">Transaction History</h2>
                      <p className="font-mono text-[9px] text-slate-500 uppercase mt-0.5 tracking-wider">SECURE TRACE HISTORY</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={triggerLedgerExport}
                    disabled={isExporting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-cyan-400/40 hover:bg-zinc-800 text-xs font-mono text-cyan-400 transition-all focus:outline-none"
                  >
                    {isExporting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    )}
                    <span>EXPORT CSV</span>
                  </button>
                </div>

                {/* Filtering controls panel */}
                <div className="glass-card p-4 rounded-xl space-y-3 bg-zinc-900/20">
                  {/* Search Input bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      value={ledgerSearch}
                      onChange={(e) => setLedgerSearch(e.target.value)}
                      placeholder="Search transactions, tags..."
                      className="w-full bg-zinc-950/70 border border-zinc-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>

                  {/* Multi filters row */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-mono text-[8px] text-slate-500 uppercase mb-1">Type</label>
                      <select 
                        value={ledgerTypeFilter} 
                        onChange={(e) => setLedgerTypeFilter(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg p-2 text-[11px] font-mono text-slate-300 focus:outline-none"
                      >
                        <option value="all">All directions</option>
                        <option value="inbound">Inbound</option>
                        <option value="outbound">Outbound</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-mono text-[8px] text-slate-500 uppercase mb-1">Asset Filter</label>
                      <select 
                        value={ledgerAssetFilter} 
                        onChange={(e) => setLedgerAssetFilter(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg p-2 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="all">All assets</option>
                        <option value="BTC">BTC (Bitcoin)</option>
                        <option value="ETH">ETH (Ethereum)</option>
                        <option value="WIO">WIO (WalletIO Coin)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Ledger dynamic lists block */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 px-1">
                    <span>RECORD ({filteredTransactions.length} items)</span>
                    <span>SECURED LEVEL</span>
                  </div>

                  {filteredTransactions.length === 0 ? (
                    <div className="p-8 text-center rounded-xl border border-dashed border-zinc-800">
                      <AlertTriangle className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-mono">No transaction traces found for queries.</p>
                    </div>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const isNegative = tx.amount < 0;
                      return (
                        <div 
                          key={tx.id} 
                          className="glass-card p-3.5 rounded-xl flex items-center justify-between hover:bg-zinc-800/10 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs ${
                              tx.category === 'Stock' ? 'bg-purple-950/20 border-purple-800/20 text-purple-400' :
                              tx.category === 'Rent' ? 'bg-emerald-950/20 border-emerald-800/20 text-emerald-400' :
                              tx.category === 'Coffee' ? 'bg-amber-950/20 border-amber-800/20 text-amber-500' :
                              'bg-cyan-950/20 border-cyan-800/20 text-cyan-400'
                            }`}>
                              {tx.type === 'inbound' ? (
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                              ) : (
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              )}
                            </div>
                            
                            <div>
                              <p className="text-xs font-semibold text-slate-100">{tx.title}</p>
                              <p className="font-mono text-[9px] text-slate-400">{tx.subtitle} • {tx.time}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className={`font-mono text-xs font-bold ${isNegative ? 'text-slate-200' : 'text-[#00f0ff]'}`}>
                              {isNegative ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                            </p>
                            <span className="inline-block px-1.5 py-0.5 rounded text-[8px] bg-cyan-950/40 text-[#00f0ff] border border-cyan-500/20 font-mono tracking-wider font-semibold uppercase mt-1">
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Sticky Bottom Navigation tabbed bar */}
          <BottomNav activePage={activePage} onPageChange={setActivePage} />

        </div>
      )}

      {/* Reown AppKit Web3 Interactive Modal */}
      {isAppKitOpen && (
        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
          {/* Modal Container */}
          <div className="bg-[#191a22] border border-zinc-800 rounded-t-[28px] sm:rounded-[28px] w-full max-w-sm p-5 relative text-slate-100 shadow-[0_24px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                {/* Simulated Reown AppKit Sphere logo */}
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 p-0.5 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                  <div className="w-full h-full bg-[#191a22] rounded-full flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  </div>
                </div>
                <h3 className="font-display font-bold text-sm text-slate-100 tracking-wide flex items-center gap-1.5">
                  <span>AppKit</span>
                  <span className="text-[10px] bg-cyan-950/40 text-[#00f0ff] border border-cyan-800/40 px-1.5 py-0.5 rounded-md font-mono tracking-wider font-semibold">
                    v4.1.8
                  </span>
                </h3>
              </div>
              <button 
                onClick={() => setIsAppKitOpen(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-slate-400 hover:text-slate-100 transition-colors"
                title="Close AppKit"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content: Not connected state vs Connected state */}
            {!isWalletConnected ? (
              <div className="pt-4 space-y-4">
                <div className="text-center pb-2">
                  <p className="text-xs text-slate-400 font-mono">Connect your Web3 crypto wallet to unlock real-time blockchain tracking and smart contract operations on WalletIO.</p>
                </div>

                {/* Simulated Web3 Wallet options */}
                <div className="space-y-2">
                  <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest px-1">Connect Methods</div>
                  
                  {/* Option 1: Simulated QR Code connection scanner */}
                  <div className="p-3.5 rounded-2xl bg-zinc-900/35 border border-zinc-800/50 hover:border-cyan-500/30 transition-all duration-300 flex items-center justify-between group cursor-pointer"
                       onClick={() => {
                         showNotification("Generating WalletConnect secure session...");
                         setTimeout(() => {
                           setIsWalletConnected(true);
                           setWalletAddress("0x71C35c1f543e88888e404CcfF497E1fC1b1bF9Ea");
                           setWalletName("WalletConnect Mobile");
                           setWalletNetwork("Arbitrum One");
                           setIsAppKitOpen(false);
                           showNotification("WalletConnect Mobile session linked via Reown AppKit!");
                         }, 1200);
                       }}>
                    <div className="flex items-center gap-3">
                      {/* Interactive mock QR Code block */}
                      <div className="w-9 h-9 rounded-lg bg-white p-1 flex items-center justify-center relative">
                        <div className="w-full h-full bg-zinc-950 rounded flex flex-wrap p-0.5 relative overflow-hidden">
                          {/* Simulated QR blocks */}
                          <div className="w-2.5 h-2.5 bg-white m-0.5 rounded-sm" />
                          <div className="w-1.5 h-1.5 bg-cyan-400 m-0.5 rounded-sm" />
                          <div className="w-2.5 h-2.5 bg-white m-0.5 rounded-sm" />
                          <div className="w-1.5 h-1.5 bg-fuchsia-400 m-0.5 rounded-sm" />
                          {/* Animated scanning laser beam */}
                          <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 top-1/2 -translate-y-1/2 animate-bounce" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">WalletConnect Mobile</h4>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">Scan dynamic QR code inside mobile app</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/20 px-2 py-0.5 rounded-full border border-cyan-800/20 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/40 transition-all font-bold">SCAN QR</span>
                  </div>

                  {/* Desktop / Core wallet list */}
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {[
                      { name: 'MetaMask', symbol: 'MM', color: 'from-[#F6851B] to-[#E2761B]', address: '0x71C35c1f543e88888e404CcfF497E1fC1b1bF9Ea', net: 'Ethereum' },
                      { name: 'Phantom', symbol: 'PH', color: 'from-[#AB9FF2] to-[#512DA8]', address: '0x8bF91F793EaF9Ea543e8888804CcfF497E1fC1b1', net: 'Solana Mainnet' },
                      { name: 'Coinbase', symbol: 'CB', color: 'from-[#0052FF] to-[#003BFF]', address: '0x32A35c1f1fc1b1bF9Ea543e888888e404CcfF497', net: 'Base Network' },
                      { name: 'Trust Wallet', symbol: 'TW', color: 'from-[#3375BB] to-[#14498C]', address: '0x04CCffF497E1fC1b1bF9Ea543e88888804Cc21Fa', net: 'Optimism' }
                    ].map((w) => (
                      <button
                        key={w.name}
                        onClick={() => {
                          showNotification(`Connecting to ${w.name}...`);
                          setTimeout(() => {
                            setIsWalletConnected(true);
                            setWalletAddress(w.address);
                            setWalletName(w.name);
                            setWalletNetwork(w.net);
                            setIsAppKitOpen(false);
                            showNotification(`Successfully connected ${w.name} Web3 wallet!`);
                          }, 1000);
                        }}
                        className="p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/80 hover:border-cyan-500/30 hover:bg-zinc-800/40 text-left transition-all flex flex-col gap-2 group active:scale-95 text-slate-200"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${w.color} flex items-center justify-center font-bold text-xs text-white`}>
                          {w.symbol}
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-400 transition-colors block">{w.name}</span>
                          <span className="text-[9px] font-mono text-slate-500">Browser Extension</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-zinc-800/80 pt-3 text-center">
                  <p className="text-[9px] font-mono text-slate-500 flex items-center justify-center gap-1">
                    <span>Secured by Reown AppKit technology.</span>
                    <Globe className="w-2.5 h-2.5 text-[#00f0ff] animate-spin" style={{ animationDuration: '6s' }} />
                  </p>
                </div>
              </div>
            ) : (
              /* Connected user view */
              <div className="pt-4 space-y-4">
                
                {/* Active Wallet status */}
                <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 relative">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">{walletName || 'Connected Wallet'}</h4>
                        <p className="font-mono text-[9px] text-emerald-400 flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Active Connection</span>
                        </p>
                      </div>
                    </div>
                    
                    <span className="text-[9px] font-mono bg-zinc-800 text-slate-300 border border-zinc-700 px-2 py-0.5 rounded">
                      {walletNetwork}
                    </span>
                  </div>

                  {/* Connected address copyable row */}
                  <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-300 select-all" title="Click to Select All">
                      {walletAddress ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}` : ''}
                    </span>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => {
                          if (walletAddress) {
                            navigator.clipboard.writeText(walletAddress);
                            showNotification("Wallet address copied to clipboard!");
                          }
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-400 hover:text-slate-100 transition-all active:scale-90"
                        title="Copy Address"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <a 
                        href={`https://etherscan.io/address/${walletAddress}`}
                        target="_blank" 
                        rel="noreferrer noopener"
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-400 hover:text-slate-100 transition-all flex items-center justify-center"
                        title="View on Etherscan"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Network Switcher inside AppKit */}
                <div className="space-y-2">
                  <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest px-1">Switch Chain Network</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { name: 'Ethereum', color: 'border-cyan-500/10' },
                      { name: 'Arbitrum One', color: 'border-blue-500/10' },
                      { name: 'Base Network', color: 'border-indigo-500/10' },
                      { name: 'Optimism', color: 'border-red-500/10' },
                      { name: 'Polygon', color: 'border-purple-500/10' },
                      { name: 'Solana', color: 'border-violet-500/10' }
                    ].map((network) => {
                      const isActive = walletNetwork === network.name;
                      return (
                        <button
                          key={network.name}
                          onClick={() => {
                            setWalletNetwork(network.name);
                            showNotification(`Network switched to ${network.name}`);
                          }}
                          className={`py-2 px-1 text-[9px] font-mono rounded-lg border text-center transition-all ${
                            isActive
                              ? 'bg-[#00f0ff]/10 border-cyan-400 text-cyan-400 font-bold'
                              : 'bg-zinc-900 border-zinc-800/80 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {network.name.split(' ')[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions: Disconnect */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsWalletConnected(false);
                      setWalletAddress(null);
                      setWalletName(null);
                      setIsAppKitOpen(false);
                      showNotification("Web3 Wallet session disconnected.");
                    }}
                    className="w-full py-3 rounded-xl bg-rose-950/20 hover:bg-rose-900/20 border border-rose-500/30 hover:border-rose-400 text-rose-400 font-mono text-[11px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect Wallet</span>
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* 1. QR Code Scanner Modal */}
      {isQRScannerOpen && (
        <div className="absolute inset-0 z-[100] bg-zinc-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 select-none animate-fade-in">
          <div className="w-full max-w-sm bg-zinc-900 border border-cyan-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.15)] flex flex-col gap-4">
            
            {/* Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-cyan-400">
                <QrCode className="w-5 h-5" />
                <span className="font-display text-sm font-bold tracking-wide uppercase">QR Scanner</span>
              </div>
              <button 
                onClick={() => {
                  setIsQRScannerOpen(false);
                  setQrScanResult(null);
                }}
                className="p-1 rounded-lg border border-zinc-800 bg-zinc-950/50 hover:bg-zinc-800 text-slate-400 hover:text-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction */}
            <p className="font-sans text-xs text-slate-400 text-center">
              Scan recipient's public key address to prepopulate inbound transfers.
            </p>

            {/* Scanner Area */}
            <div className="relative aspect-square w-full rounded-xl bg-zinc-950 border border-zinc-800/80 overflow-hidden flex flex-col items-center justify-center p-4">
              
              {/* Target bracket overlays */}
              <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-cyan-400 rounded-tl" />
              <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-cyan-400 rounded-tr" />
              <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-cyan-400 rounded-bl" />
              <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-cyan-400 rounded-br" />

              {/* Animating laser line */}
              <div className="absolute left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_rgba(0,240,255,0.8)] animate-bounce" style={{ animationDuration: '3s' }} />

              {/* Scanning visual states */}
              {!qrScanResult ? (
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="relative">
                    <Camera className="w-12 h-12 text-zinc-700 animate-pulse" />
                    <QrCode className="w-6 h-6 text-cyan-500/40 absolute -bottom-1 -right-1" />
                  </div>
                  <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                    ALIGN CODE WITHIN BRACKETS
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center p-2 animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <CheckCircle2 className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] text-cyan-400 uppercase tracking-widest font-bold">
                      DECODED SUCCESS
                    </span>
                    <p className="font-mono text-[10px] text-slate-300 bg-zinc-900/80 px-2 py-1 rounded border border-zinc-800 select-all max-w-[220px] truncate">
                      {qrScanResult}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Presets and Simulator Actions */}
            <div className="flex flex-col gap-2">
              {!qrScanResult ? (
                <>
                  <button
                    onClick={() => {
                      const mockAddresses = [
                        'alex.opt - 0x71C...49a1',
                        'jamie.eth - 0x3Fd...c092',
                        'morgan.sol - 0x9aA...a112',
                        'taylor.base - 0x51E...0a87'
                      ];
                      const chosen = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
                      setQrScanResult(chosen);
                      showNotification("QR scan simulation completed!");
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-cyan-400 hover:border-cyan-400 font-mono text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Scan Mock Public Key</span>
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setQrScanResult('alex.opt - 0x71C...49a1');
                        showNotification("Scanned Alex Rivera's public key.");
                      }}
                      className="py-1.5 px-2 rounded-lg bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 text-slate-300 font-mono text-[9px] uppercase tracking-wide transition-all cursor-pointer"
                    >
                      Scan Alex Rivera
                    </button>
                    <button
                      onClick={() => {
                        setQrScanResult('jamie.eth - 0x3Fd...c092');
                        showNotification("Scanned Jamie Vance's public key.");
                      }}
                      className="py-1.5 px-2 rounded-lg bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 text-slate-300 font-mono text-[9px] uppercase tracking-wide transition-all cursor-pointer"
                    >
                      Scan Jamie Vance
                    </button>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsQRScannerOpen(false);
                      setQrScanResult(null);
                      setActivePage('transfers');
                      showNotification(`Populated scanned address in secure beam: ${qrScanResult.split(' - ')[0]}`);
                    }}
                    className="py-2 px-3 rounded-xl bg-cyan-500 text-slate-950 font-display text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-cyan-400 text-center cursor-pointer"
                  >
                    Use Address
                  </button>
                  <button
                    onClick={() => setQrScanResult(null)}
                    className="py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-slate-300 font-mono text-[10px] uppercase tracking-wider transition-all text-center cursor-pointer"
                  >
                    Rescan
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 2. 2FA Onboarding Modal */}
      {show2FAOnboardingModal && (
        <div className="absolute inset-0 z-[120] bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 select-none animate-fade-in">
          <div className="w-full max-w-sm bg-zinc-900 border border-cyan-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.15)] flex flex-col gap-4">
            
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="inline-flex p-2.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 mb-1">
                <Shield className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-display text-base font-bold text-slate-100 uppercase tracking-wide">Secure Your Account</h3>
              <p className="font-sans text-xs text-slate-400 max-w-[280px] mx-auto">
                Set up an extra layer of defense for your cryptographically sealed assets.
              </p>
            </div>

            {/* Core Onboarding Options */}
            <div className="space-y-3">
              
              {/* Option A: Biometric Face ID / Fingerprint */}
              <button
                onClick={() => {
                  setIsScanning(true);
                  showNotification("Initializing Secure Enclave biometric scan...");
                  setTimeout(() => {
                    setIsScanning(false);
                    setSecurityState({
                      biometricUnlock: true,
                      twoFactorProtocol: true
                    });
                    setShow2FAOnboardingModal(false);
                    setAuthStage('authenticated');
                    setActivePage('vault');
                    showNotification("Biometrics linked! Authenticated successfully.");
                  }, 1800);
                }}
                className="w-full text-left p-3.5 rounded-xl border border-zinc-800 hover:border-cyan-500/40 bg-zinc-950/40 hover:bg-zinc-900/60 transition-all flex items-center gap-3.5 cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-zinc-900 group-hover:bg-cyan-950/30 group-hover:text-cyan-400 text-slate-400 transition-colors">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-xs font-bold text-slate-200 uppercase tracking-wider">Use Biometric Protection</h4>
                  <p className="font-sans text-[10px] text-slate-500 mt-0.5">Use Face ID or Fingerprint for immediate verification</p>
                </div>
              </button>

              {/* Option B: Authenticator App */}
              <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/40 flex flex-col gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="p-2 rounded-lg bg-zinc-900 text-slate-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-xs font-bold text-slate-200 uppercase tracking-wider">Authenticator App</h4>
                    <p className="font-sans text-[10px] text-slate-500 mt-0.5">Verify via Google Authenticator or Duo</p>
                  </div>
                </div>

                {/* QR Code and code validation view */}
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-900 flex flex-col items-center gap-3">
                  <div className="relative p-1.5 bg-white rounded-lg">
                    <QrCode className="w-24 h-24 text-zinc-950" />
                    <div className="absolute inset-0 bg-transparent flex items-center justify-center pointer-events-none" />
                  </div>
                  <div className="text-center">
                    <span className="font-mono text-[8px] text-slate-500 uppercase">Secret Setup Key</span>
                    <p className="font-mono text-[9px] text-cyan-400 font-bold select-all tracking-wider">WIO-SEC-8849-CYBER</p>
                  </div>
                  
                  {/* Enter Code input */}
                  <div className="w-full flex gap-1.5">
                    <input 
                      type="text" 
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-center font-mono text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 outline-none transition-all"
                      id="onboarding-2fa-code"
                    />
                    <button
                      onClick={() => {
                        const inputVal = (document.getElementById('onboarding-2fa-code') as HTMLInputElement)?.value;
                        if (!inputVal || inputVal.length < 6) {
                          showNotification("Enter a valid 6-digit authenticator code.");
                          return;
                        }
                        setSecurityState({
                          biometricUnlock: false,
                          twoFactorProtocol: true
                        });
                        setShow2FAOnboardingModal(false);
                        setAuthStage('authenticated');
                        setActivePage('vault');
                        showNotification("2FA Authenticator activated! Welcome on board.");
                      }}
                      className="px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-[10px] font-bold uppercase transition-all cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Skip for now options */}
            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setSecurityState({
                    biometricUnlock: false,
                    twoFactorProtocol: false
                  });
                  setShow2FAOnboardingModal(false);
                  setAuthStage('authenticated');
                  setActivePage('vault');
                  showNotification("Account created. Remember to configure 2FA later in Security Hub.");
                }}
                className="font-mono text-[9px] text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors cursor-pointer focus:outline-none"
              >
                Skip account protection (Not Recommended)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3. 2FA Verification Prompt Modal */}
      {show2FAVerificationModal && (
        <div className="absolute inset-0 z-[150] bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 select-none animate-fade-in">
          <div className="w-full max-w-sm bg-zinc-900 border border-cyan-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.15)] flex flex-col gap-4">
            
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="inline-flex p-2 rounded-full bg-zinc-950 border border-zinc-800 text-cyan-400 mb-1">
                <Lock className="w-5 h-5 animate-pulse" />
              </div>
              <h3 className="font-display text-sm font-bold text-slate-100 uppercase tracking-wide">
                {twoFAVerificationTitle || "Security Verification"}
              </h3>
              <p className="font-sans text-[11px] text-slate-400">
                Confirm your identity to authorize this important action.
              </p>
            </div>

            {/* Dynamic UI depending on biometric status */}
            <div className="py-2 flex flex-col items-center justify-center">
              {securityState.biometricUnlock ? (
                /* Biometric Scanning Prompter */
                <div className="flex flex-col items-center gap-4 text-center w-full">
                  <button 
                    onClick={() => {
                      setIsScanning(true);
                      showNotification("Scanning fingerprint...");
                      setTimeout(() => {
                        setIsScanning(false);
                        setShow2FAVerificationModal(false);
                        showNotification("Biometric verification verified.");
                        if (pending2FAAction) {
                          pending2FAAction();
                          setPending2FAAction(null);
                        }
                      }, 1600);
                    }}
                    disabled={isScanning}
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isScanning 
                        ? 'bg-cyan-500/10 border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)] scale-105' 
                        : 'bg-zinc-950 border border-zinc-800 hover:border-cyan-500/40 hover:bg-zinc-900 cursor-pointer shadow-md'
                    }`}
                    title="Tap to verify biometric credentials"
                  >
                    {isScanning ? (
                      <>
                        <Fingerprint className="w-9 h-9 text-[#00f0ff] animate-pulse" />
                        <div className="absolute inset-0 border-2 border-transparent border-t-cyan-400 rounded-full animate-spin" />
                      </>
                    ) : (
                      <Fingerprint className="w-9 h-9 text-slate-400 hover:text-cyan-400 transition-colors" />
                    )}
                  </button>
                  <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">
                    {isScanning ? "VERIFYING BIO-LATTICE..." : "TAP TO COMPLETE BIOMETRIC SCAN"}
                  </p>
                  
                  {/* Option to use Google Authenticator instead */}
                  <button
                    onClick={() => {
                      setSecurityState(prev => ({ ...prev, biometricUnlock: false }));
                    }}
                    className="font-mono text-[8px] text-cyan-500 hover:text-cyan-400 uppercase tracking-widest mt-1 focus:outline-none cursor-pointer"
                  >
                    Use Authenticator Code Instead
                  </button>
                </div>
              ) : (
                /* Authenticator 6-digit Code Prompter */
                <div className="w-full flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5 text-center">
                    <span className="font-mono text-[9px] text-slate-500 uppercase tracking-wider">6-DIGIT VERIFICATION CODE</span>
                    <input 
                      type="text" 
                      placeholder="••••••"
                      maxLength={6}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-center font-mono text-lg text-cyan-400 tracking-[0.4em] placeholder-slate-800 outline-none focus:border-cyan-500/60 transition-all"
                      id="verification-2fa-code"
                      autoFocus
                    />
                  </div>

                  <button
                    onClick={() => {
                      const inputVal = (document.getElementById('verification-2fa-code') as HTMLInputElement)?.value;
                      if (!inputVal || inputVal.length < 6) {
                        showNotification("Enter a valid 6-digit authenticator code.");
                        return;
                      }
                      
                      setShow2FAVerificationModal(false);
                      showNotification("Authenticator code verified successfully.");
                      if (pending2FAAction) {
                        pending2FAAction();
                        setPending2FAAction(null);
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Authorize Transaction</span>
                  </button>

                  {/* Quick autofill codes to assist testing */}
                  <div className="flex gap-2 justify-center items-center">
                    <span className="font-mono text-[8px] text-slate-600 uppercase">Test Codes:</span>
                    <button 
                      onClick={() => {
                        const inp = document.getElementById('verification-2fa-code') as HTMLInputElement;
                        if (inp) inp.value = "123456";
                      }}
                      className="px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-950/60 font-mono text-[8px] text-slate-400 hover:text-slate-200"
                    >
                      123456
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cancel Button */}
            <div className="border-t border-zinc-900 pt-4 text-center">
              <button
                onClick={() => {
                  setShow2FAVerificationModal(false);
                  setPending2FAAction(null);
                  showNotification("Security verification canceled.");
                }}
                className="font-mono text-[9px] text-rose-500 hover:text-rose-400 uppercase tracking-widest transition-colors cursor-pointer"
              >
                Cancel Authorized Action
              </button>
            </div>

          </div>
        </div>
      )}

    </DeviceFrame>
  );
}
