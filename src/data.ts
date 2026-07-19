import { Transaction, CryptoAsset, Contact } from './types';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    title: 'Stock Purchase',
    subtitle: 'Nasdaq',
    amount: -1240.00,
    time: '14:02',
    date: 'Today',
    category: 'Stock',
    status: 'PENDING',
    type: 'outbound',
    iconName: 'monitoring',
    currencySymbol: 'WIO'
  },
  {
    id: 'tx-2',
    title: 'Rent',
    subtitle: 'Housing Corp',
    amount: -2800.00,
    time: 'Yesterday',
    date: 'Yesterday',
    category: 'Rent',
    status: 'SETTLED',
    type: 'outbound',
    iconName: 'home',
    currencySymbol: 'ETH'
  },
  {
    id: 'tx-3',
    title: 'Coffee',
    subtitle: 'Cyber Beans',
    amount: -6.50,
    time: '08:30',
    date: 'Yesterday',
    category: 'Coffee',
    status: 'SETTLED',
    type: 'outbound',
    iconName: 'coffee',
    currencySymbol: 'ETH'
  },
  {
    id: 'tx-4',
    title: 'WalletIO Transfer',
    subtitle: 'From: @neocyber',
    amount: 2400.00,
    time: '14:22',
    date: 'Today',
    category: 'P2P',
    status: 'SECURED',
    type: 'inbound',
    iconName: 'bolt',
    currencySymbol: 'WIO'
  },
  {
    id: 'tx-5',
    title: 'Market Trade: BTC/USDT',
    subtitle: 'Executed Order',
    amount: -0.0450,
    time: '09:15',
    date: 'Today',
    category: 'Market',
    status: 'SETTLED',
    type: 'outbound',
    iconName: 'monitoring',
    currencySymbol: 'BTC'
  },
  {
    id: 'tx-6',
    title: 'Vault Deposit',
    subtitle: 'External Node',
    amount: 12500.00,
    time: '21:04',
    date: 'Yesterday',
    category: 'Vault',
    status: 'PENDING',
    type: 'inbound',
    iconName: 'account_balance_wallet',
    currencySymbol: 'WIO'
  },
  {
    id: 'tx-7',
    title: 'To: @lunarmod',
    subtitle: 'Outbound Beam',
    amount: -450.00,
    time: '18:30',
    date: 'Yesterday',
    category: 'P2P',
    status: 'SETTLED',
    type: 'outbound',
    iconName: 'bolt',
    currencySymbol: 'ETH'
  },
  {
    id: 'tx-8',
    title: 'Cloud Render Subscription',
    subtitle: 'Oct 12 • Recurring',
    amount: -89.99,
    time: '10:15',
    date: 'Last Week',
    category: 'Subscription',
    status: 'SETTLED',
    type: 'outbound',
    iconName: 'autorenew',
    currencySymbol: 'WIO'
  }
];

export const INITIAL_ASSETS: CryptoAsset[] = [
  {
    id: 'asset-btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    balance: 1.248,
    priceUsd: 53878.30, // 1.248 BTC * 53,878.3 = $67,240.12
    change24h: 2.15,
    sparkline: [30, 10, 25, 15, 35, 10, 20],
    icon: 'currency_bitcoin',
    bgClass: 'bg-[#F7931A]/10',
    borderClass: 'border-[#F7931A]/30',
    textClass: 'text-[#F7931A]'
  },
  {
    id: 'asset-eth',
    name: 'Ethereum',
    symbol: 'ETH',
    balance: 18.52,
    priceUsd: 3412.80, // 18.52 ETH * 3412.8 = $63,205.05
    change24h: -0.45,
    sparkline: [20, 35, 10, 25, 5, 15, 10],
    icon: 'token',
    bgClass: 'bg-[#00f0ff]/10',
    borderClass: 'border-[#00f0ff]/30',
    textClass: 'text-[#00f0ff]'
  },
  {
    id: 'asset-aur',
    name: 'WalletIO Coin',
    symbol: 'WIO',
    balance: 66998,
    priceUsd: 0.18, // 66,998 WIO * 0.18 = $12,059.64
    change24h: 12.4,
    sparkline: [35, 32, 30, 22, 25, 15, 18, 10, 12, 2, 5],
    icon: 'stream',
    bgClass: 'bg-[#b600f8]/10',
    borderClass: 'border-[#b600f8]/30',
    textClass: 'text-[#b600f8]'
  }
];

export const CONTACTS: Contact[] = [
  {
    id: 'c-1',
    name: 'Kaelen',
    username: '@kaelen',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDax-wEA8xw4I-Cgxyn50oDvI5xU0X_qF_Gg2sEf8azPyneCV8tiV3sCjYTIc5gXHL7m_r0-ZxBAAZInNJBpPaxO_HX5JhOZEvZGEOSklCWIfydudX7vQqB-Xpx2Sjt1zq_NGBRpmgRwfrTqj_FnjlWoYkndNKmoar5MGKc2JMK-28MxNG8LQ7r_xMsVEyu0jSeLKqICOhbBIQx0QA4oIS9bRR_DXD7T2aMoSC3A6uh6mOoJYxkIE64jBJFfunJqRsZzlEeGnsfOE',
    active: true
  },
  {
    id: 'c-2',
    name: 'Sora',
    username: '@sora_dev',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZ6VRga-eFInjmYJ6ZGm2kiT7cW2D1Qwwxce-0y2n5NsydI3sLqfe4M3O_EswKqPNW8WGewzKi0IukeJ9yl6f_tFL4KG5bmzf3rVsgcqpSOudqlPsx9NzwP7e4PDqTCZpQYzxOO4NbssCwaHSxmkMCjONWES19xf5h6CUmV4zl8jStjf6FotxOEnBcevygesuG6nPJYfwNeyJVBif_awrFqJXCKEfa5J9HIfkWJ2E2MkFX9irJHPXSY6_LY5FeniB2282DfF_oJDk',
    active: false
  },
  {
    id: 'c-3',
    name: 'Elena',
    username: '@elena_c',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5VAiKQNIe1Upb09Q0TiBqGIMWLDrhdpB9na4xRU9bEzIdPy_0gMoDlxiicv82L4EVb3UfGmIe7_hvSVVE8f3KZ-z0j0dq6mT6A571hg_KbEeUb-Pjk0qrVIZw2MByj5fz4zzwzNWzOlulfTHFs4hdTlnalEfR6SCygJ453fUf90vW376i6sg7JEBUf-lErxNv-BTy4vP0wujjJLJna09EEy-xOyDr_czYZFvBKL-9F6V3TJCYo3oEvKYQardJeI61CbFh-25DfRU',
    active: true
  },
  {
    id: 'c-4',
    name: 'Marcus',
    username: '@marcus_t',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9LMZfIbDHMF1HQx_2XB4cp9NsKWmDaeojRVFybwWQwEJ_T3cqcPVa0dPhdZKaXSIt4b-udAYoDHnCBnZxBO4MGFd7FDl_Z24SSNvxP67Kn1bvOhB7gExxFSEgXIOkMeA34AAsWal3Xbmnu_El9pSxoCmSXWGvXTR_i5ud_fwyWBtEYE8j3cydgyerKCUCWesO544DzhgTVTuA8h1bdbem36GTgpBoEyNtDEC0ksB8WzcCyPp1tSx0I24qoBQJC13lq3rd-BLlDhY',
    active: false
  }
];
