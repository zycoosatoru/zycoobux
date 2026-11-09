import { RedeemCode, TriviaQuestion, TycoonUpgrade } from '../types';

export const POPULAR_GAMES = [
  'Blox Fruits',
  'Blade Ball',
  'Pet Simulator 99',
  'Brookhaven RP',
  'Toilet Tower Defense',
  'Murder Mystery 2',
  'King Legacy',
  'Anime Defenders',
] as const;

export const INITIAL_REDEEM_CODES: RedeemCode[] = [
  {
    id: 'bf-1',
    game: 'Blox Fruits',
    code: 'ADMINFIGHT',
    reward: '2x EXP Boost (20 Menit)',
    status: 'new',
    updatedAt: 'Hari ini',
    likes: 1240,
  },
  {
    id: 'bf-2',
    game: 'Blox Fruits',
    code: 'SUB2FER999',
    reward: '2x EXP Boost & Reset Stat',
    status: 'active',
    updatedAt: 'Kemarin',
    likes: 890,
  },
  {
    id: 'bb-1',
    game: 'Blade Ball',
    code: 'FROSTFIRE',
    reward: 'Free Spin + 500 Coins',
    status: 'new',
    updatedAt: 'Hari ini',
    likes: 2150,
  },
  {
    id: 'bb-2',
    game: 'Blade Ball',
    code: 'DELAYBALL',
    reward: 'Free Sword Skin Crate',
    status: 'active',
    updatedAt: '3 hari lalu',
    likes: 1420,
  },
  {
    id: 'ps99-1',
    game: 'Pet Simulator 99',
    code: 'PETS99STASH',
    reward: '10,000 Diamonds + Triple Egg Potion',
    status: 'new',
    updatedAt: 'Hari ini',
    likes: 3100,
  },
  {
    id: 'ps99-2',
    game: 'Pet Simulator 99',
    code: 'FREEGEMS2026',
    reward: '5,000 Diamonds & Boosts',
    status: 'active',
    updatedAt: 'Minggu ini',
    likes: 1820,
  },
  {
    id: 'bh-1',
    game: 'Brookhaven RP',
    code: 'BROOKHAVEN2026',
    reward: 'Special Exclusive Car Skin',
    status: 'active',
    updatedAt: 'Aktif',
    likes: 950,
  },
  {
    id: 'ttd-1',
    game: 'Toilet Tower Defense',
    code: 'TITANUPGRADE',
    reward: '300 Coins + 1 Summon Ticket',
    status: 'active',
    updatedAt: 'Aktif',
    likes: 1720,
  },
  {
    id: 'mm2-1',
    game: 'Murder Mystery 2',
    code: 'CORRUPT2026',
    reward: 'Free Corrupt Blade Pet',
    status: 'active',
    updatedAt: 'Aktif',
    likes: 4200,
  },
  {
    id: 'kl-1',
    game: 'King Legacy',
    code: 'UPDATE7HYPED',
    reward: '3 Gem + 100,000 Beli',
    status: 'new',
    updatedAt: 'Hari ini',
    likes: 880,
  },
];

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 1,
    question: {
      id: 'Apa nama mata uang resmi di dalam platform Roblox?',
      en: 'What is the official currency of the Roblox platform?',
    },
    options: {
      id: ['Robux', 'Tix (Tickets)', 'Minecoins', 'V-Bucks'],
      en: ['Robux', 'Tix (Tickets)', 'Minecoins', 'V-Bucks'],
    },
    correctIndex: 0,
    explanation: {
      id: 'Robux adalah mata uang utama Roblox sejak diluncurkan. Sebelumnya pernah ada Tix (Tickets) yang dihapus pada tahun 2016.',
      en: 'Robux is the primary currency in Roblox. Tickets (Tix) used to exist but were discontinued in 2016.',
    },
  },
  {
    id: 2,
    question: {
      id: 'Berapa persen potongan pajak (tax) yang diambil Roblox saat menjual Gamepass atau Pakaian?',
      en: 'What percentage tax cut does Roblox take when selling a Gamepass or Clothing item?',
    },
    options: {
      id: ['30%', '50%', '20%', '10%'],
      en: ['30%', '50%', '20%', '10%'],
    },
    correctIndex: 0,
    explanation: {
      id: 'Roblox mengenakan potongan marketplace sebesar 30%, sehingga penjual menerima 70% dari harga barang.',
      en: 'Roblox takes a 30% marketplace cut, leaving the creator with 70% of the sale price.',
    },
  },
  {
    id: 3,
    question: {
      id: 'Berapa jumlah minimum Robux yang dibutuhkan developer untuk melakukan cash out via DevEx?',
      en: 'What is the minimum amount of Robux required for developers to cash out via DevEx?',
    },
    options: {
      id: ['50.000 Robux', '10.000 Robux', '100.000 Robux', '25.000 Robux'],
      en: ['50,000 Robux', '10,000 Robux', '100,000 Robux', '25,000 Robux'],
    },
    correctIndex: 0,
    explanation: {
      id: 'Syarat minimum Developer Exchange (DevEx) saat ini adalah 50.000 Robux (sekitar $175 USD).',
      en: 'The current minimum threshold for Developer Exchange (DevEx) is 50,000 Robux (approx $175 USD).',
    },
  },
  {
    id: 4,
    question: {
      id: 'Siapakah salah satu pendiri utama Roblox yang meninggal pada tahun 2013?',
      en: 'Who is the co-founder of Roblox who passed away in 2013?',
    },
    options: {
      id: ['Erik Cassel', 'David Baszucki (Builderman)', 'John Shedletsky', 'Matt Dusek'],
      en: ['Erik Cassel', 'David Baszucki (Builderman)', 'John Shedletsky', 'Matt Dusek'],
    },
    correctIndex: 0,
    explanation: {
      id: 'Erik Cassel mendirikan Roblox bersama David Baszucki dan dikenang dengan tumpukan tugu memorial di Roblox.',
      en: 'Erik Cassel co-founded Roblox with David Baszucki and is honored across the platform.',
    },
  },
  {
    id: 5,
    question: {
      id: 'Apa nama helm/topi legendaris berharga puluhan juta Robux yang sangat diburu kolektor?',
      en: 'What is the legendary series of crowned hoods worth millions of Robux among collectors?',
    },
    options: {
      id: ['Dominus Series', 'Fedora Series', 'Valkyrie Helm', 'Sparkle Time Fedora'],
      en: ['Dominus Series', 'Fedora Series', 'Valkyrie Helm', 'Sparkle Time Fedora'],
    },
    correctIndex: 0,
    explanation: {
      id: 'Dominus (seperti Dominus Frigidus, Infernus, Empyreus) adalah item Limited paling prestisius di Roblox.',
      en: 'The Dominus series is considered one of the most prestigious limited items in Roblox history.',
    },
  },
];

export const INITIAL_TYCOON_UPGRADES: TycoonUpgrade[] = [
  {
    id: 'worker-noob',
    name: { id: 'Noob Auto-Clicker', en: 'Noob Auto-Clicker' },
    cost: 20,
    cps: 1,
    owned: 0,
    icon: 'Pickaxe',
    description: { id: 'Pemain baru yang membantu menambang Robux.', en: 'Newbie helping you mine Robux.' },
  },
  {
    id: 'bacon-hair',
    name: { id: 'Bacon Hair Bot', en: 'Bacon Hair Bot' },
    cost: 100,
    cps: 5,
    owned: 0,
    icon: 'Bot',
    description: { id: 'Bot otomatis pencari koin Robux.', en: 'Automated Robux coin gatherer.' },
  },
  {
    id: 'gamepass-studio',
    name: { id: 'Studio Gamepass', en: 'Gamepass Studio' },
    cost: 500,
    cps: 25,
    owned: 0,
    icon: 'Gamepad2',
    description: { id: 'Menghasilkan passive income dari penjualan gamepass.', en: 'Generates passive income from gamepasses.' },
  },
  {
    id: 'server-farm',
    name: { id: 'Server Farm VIP', en: 'VIP Server Farm' },
    cost: 2500,
    cps: 150,
    owned: 0,
    icon: 'Server',
    description: { id: 'Jaringan server dengan kapasitas tinggi.', en: 'High capacity automated game servers.' },
  },
  {
    id: 'dominus-shrine',
    name: { id: 'Kuil Dominus Emas', en: 'Golden Dominus Shrine' },
    cost: 12000,
    cps: 800,
    owned: 0,
    icon: 'Crown',
    description: { id: 'Kekuatan magis Dominus melipatgandakan Robux!', en: 'Ancient Dominus powers boosting output!' },
  },
];
