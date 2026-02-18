// lib/constants.ts

export const API_ROUTES = {
  TASKS: '/api/tasks',
  PLATFORM: '/api/platform',
  SUS_QUESTION: '/api/sus-question',
  RESPONDEN: '/api/responden',
  TASK_RESULTS: '/api/task-results',
  SUS_ANSWERS_BATCH: '/api/sus-answers/batch',
  SESSIONS: '/api/sessions',
  HISTORY: '/api/sessions/history',
} as const;

export const SESSION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const TASK_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_METHODS = {
  BANK_TRANSFER: 'bank_transfer',
  CREDIT_CARD: 'credit_card',
  E_WALLET: 'e_wallet',
  COD: 'cod',
} as const;

export const SHIPPING_METHODS = {
  REGULAR: 'regular',
  EXPRESS: 'express',
  SAME_DAY: 'same_day',
} as const;

export const USER_EXPERIENCE_LEVEL = {
  BEGINNER: 'pemula',
  INTERMEDIATE: 'menengah',
  ADVANCED: 'mahir',
} as const;

export const GENDER = {
  MALE: 'Laki-laki',
  FEMALE: 'Perempuan',
} as const;

export const SUS_SCALE = {
  STRONGLY_DISAGREE: 1,
  DISAGREE: 2,
  NEUTRAL: 3,
  AGREE: 4,
  STRONGLY_AGREE: 5,
} as const;

export const PLATFORMS = {
  SHOPEE: 1,
  TOKOPEDIA: 2,
  BUKALAPAK: 3,
  LAZADA: 4,
  BLIBLI: 5,
} as const;

// Default produk untuk simulasi e-commerce
export const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    price: 24999000,
    category: 'Smartphone',
    image: '📱',
    description: 'iPhone 15 Pro Max dengan chip A17 Pro, kamera 48MP, dan baterai tahan lama.',
    rating: 4.8,
    stock: 15,
    brand: 'Apple',
    reviews: [
      { id: 1, name: 'Budi Santoso', rating: 5, comment: 'Sangat cepat dan kamera luar biasa!', date: '2024-01-15' },
      { id: 2, name: 'Sari Wijaya', rating: 4, comment: 'Bagus tapi harganya mahal', date: '2024-01-10' }
    ],
    specifications: [
      { key: 'RAM', value: '8GB' },
      { key: 'Storage', value: '256GB' },
      { key: 'Battery', value: '4422 mAh' },
      { key: 'Camera', value: '48MP + 12MP + 12MP' }
    ]
  },
  {
    id: 2,
    name: 'MacBook Air M2',
    price: 18999000,
    category: 'Laptop',
    image: '💻',
    description: 'Laptop tipis dan ringan dengan chip Apple M2, layar Liquid Retina 13.6 inci.',
    rating: 4.9,
    stock: 8,
    brand: 'Apple',
    reviews: [
      { id: 1, name: 'Andi Pratama', rating: 5, comment: 'Performanya luar biasa, sangat ringan', date: '2024-01-12' }
    ],
    specifications: [
      { key: 'Processor', value: 'Apple M2' },
      { key: 'RAM', value: '16GB' },
      { key: 'Storage', value: '512GB SSD' },
      { key: 'Display', value: '13.6 inch Liquid Retina' }
    ]
  },
  {
    id: 3,
    name: 'Samsung Galaxy S24 Ultra',
    price: 21999000,
    category: 'Smartphone',
    image: '📱',
    description: 'Smartphone premium dengan kamera 200MP, S Pen, dan AI features canggih.',
    rating: 4.7,
    stock: 12,
    brand: 'Samsung',
    reviews: [
      { id: 1, name: 'Rina Dewi', rating: 5, comment: 'Kamera sangat tajam dan AI features membantu sekali', date: '2024-01-14' }
    ],
    specifications: [
      { key: 'RAM', value: '12GB' },
      { key: 'Storage', value: '512GB' },
      { key: 'Battery', value: '5000 mAh' },
      { key: 'Camera', value: '200MP + 50MP + 12MP + 10MP' }
    ]
  },
  {
    id: 4,
    name: 'Nike Air Jordan 1',
    price: 2899000,
    category: 'Sepatu',
    image: '👟',
    description: 'Sepatu basket iconic dengan desain klasik, nyaman untuk sehari-hari maupun olahraga.',
    rating: 4.6,
    stock: 25,
    brand: 'Nike',
    reviews: [
      { id: 1, name: 'Toni Gunawan', rating: 4, comment: 'Nyaman dipakai, ukuran pas', date: '2024-01-08' }
    ],
    specifications: [
      { key: 'Material', value: 'Leather' },
      { key: 'Color', value: 'Black/White/Red' },
      { key: 'Size', value: 'EU 38-45' },
      { key: 'Type', value: 'High Top' }
    ]
  },
  {
    id: 5,
    name: 'Sony WH-1000XM5',
    price: 5499000,
    category: 'Headphone',
    image: '🎧',
    description: 'Headphone noise cancelling terbaik dengan kualitas suara tinggi dan baterai 30 jam.',
    rating: 4.8,
    stock: 10,
    brand: 'Sony',
    reviews: [
      { id: 1, name: 'Maya Sari', rating: 5, comment: 'Noise cancellingnya amazing!', date: '2024-01-05' }
    ],
    specifications: [
      { key: 'Battery', value: '30 hours' },
      { key: 'Noise Cancelling', value: 'Yes' },
      { key: 'Bluetooth', value: '5.2' },
      { key: 'Weight', value: '250g' }
    ]
  },
  {
    id: 6,
    name: 'Dell XPS 13',
    price: 16999000,
    category: 'Laptop',
    image: '💻',
    description: 'Laptop premium dengan prosesor Intel Core i7, layar InfinityEdge, dan desain aluminium.',
    rating: 4.5,
    stock: 6,
    brand: 'Dell',
    reviews: [],
    specifications: [
      { key: 'Processor', value: 'Intel Core i7' },
      { key: 'RAM', value: '16GB' },
      { key: 'Storage', value: '1TB SSD' },
      { key: 'Display', value: '13.4 inch FHD+' }
    ]
  }
];

// Categories untuk filter produk
export const PRODUCT_CATEGORIES = [
  { id: 'all', name: 'Semua' },
  { id: 'smartphone', name: 'Smartphone' },
  { id: 'laptop', name: 'Laptop' },
  { id: 'sepatu', name: 'Sepatu' },
  { id: 'headphone', name: 'Headphone' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'electronics', name: 'Elektronik' },
  { id: 'home', name: 'Rumah Tangga' },
  { id: 'sports', name: 'Olahraga' },
  { id: 'books', name: 'Buku' }
];

// Shipping methods
export const SHIPPING_OPTIONS = [
  { id: 'regular', name: 'Reguler', duration: '3-5 hari', cost: 15000 },
  { id: 'express', name: 'Express', duration: '1-2 hari', cost: 30000 },
  { id: 'same-day', name: 'Same Day', duration: 'Hari ini', cost: 50000 }
];

// Payment methods
export const PAYMENT_OPTIONS = [
  { id: 'bank_transfer', name: 'Transfer Bank', icon: '🏦', description: 'Transfer ke rekening bank' },
  { id: 'credit_card', name: 'Kartu Kredit', icon: '💳', description: 'MasterCard, Visa, JCB' },
  { id: 'ewallet', name: 'E-Wallet', icon: '📱', description: 'GoPay, OVO, Dana, ShopeePay' },
  { id: 'cod', name: 'COD (Bayar di Tempat)', icon: '💰', description: 'Bayar saat barang diterima' }
];

// Order status timeline
export const ORDER_TIMELINE = [
  { status: 'pending', label: 'Pesanan Diterima', icon: '📝', description: 'Pesanan telah diterima sistem' },
  { status: 'processing', label: 'Pesanan Diproses', icon: '⚙️', description: 'Pesanan sedang diproses oleh penjual' },
  { status: 'shipped', label: 'Pesanan Dikirim', icon: '🚚', description: 'Pesanan telah dikirim kurir' },
  { status: 'delivered', label: 'Pesanan Diterima', icon: '✅', description: 'Pesanan telah sampai di tujuan' }
];

// Local storage keys
export const STORAGE_KEYS = {
  CURRENT_SESSION: 'currentTestingSession',
  SESSION_HISTORY: 'testingSessionHistory',
  ECOMMERCE_CART: 'ecommerceCart',
  USER_PREFERENCES: 'userPreferences'
};

// Testing session configuration
export const SESSION_CONFIG = {
  MAX_TASK_TIME: 300, // 5 menit dalam detik
  MIN_AGE: 18,
  MAX_AGE: 40,
  MAX_ERRORS_PER_TASK: 10
};

// SUS Questions (jika tidak diambil dari database)
export const DEFAULT_SUS_QUESTIONS = [
  {
    id: 1,
    question: 'Saya merasa saya ingin sering menggunakan sistem ini',
    isPositive: true,
    order: 1
  },
  {
    id: 2,
    question: 'Saya menemukan sistem ini tidak perlu rumit',
    isPositive: false,
    order: 2
  },
  {
    id: 3,
    question: 'Saya merasa sistem ini mudah digunakan',
    isPositive: true,
    order: 3
  },
  {
    id: 4,
    question: 'Saya merasa saya membutuhkan bantuan teknis untuk menggunakan sistem ini',
    isPositive: false,
    order: 4
  },
  {
    id: 5,
    question: 'Saya merasa berbagai fungsi dalam sistem ini terintegrasi dengan baik',
    isPositive: true,
    order: 5
  },
  {
    id: 6,
    question: 'Saya merasa terlalu banyak ketidakkonsistenan dalam sistem ini',
    isPositive: false,
    order: 6
  },
  {
    id: 7,
    question: 'Saya bisa membayangkan kebanyakan orang akan belajar menggunakan sistem ini dengan cepat',
    isPositive: true,
    order: 7
  },
  {
    id: 8,
    question: 'Saya merasa sistem ini sangat rumit untuk digunakan',
    isPositive: false,
    order: 8
  },
  {
    id: 9,
    question: 'Saya merasa sangat percaya diri menggunakan sistem ini',
    isPositive: true,
    order: 9
  },
  {
    id: 10,
    question: 'Saya perlu belajar banyak hal sebelum bisa menggunakan sistem ini',
    isPositive: false,
    order: 10
  }
];

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Field ini wajib diisi',
  INVALID_EMAIL: 'Format email tidak valid',
  INVALID_PHONE: 'Format nomor telepon tidak valid',
  MIN_AGE: 'Umur minimal 18 tahun',
  MAX_AGE: 'Umur maksimal 40 tahun',
  SESSION_NOT_FOUND: 'Session tidak ditemukan',
  TASK_NOT_FOUND: 'Task tidak ditemukan',
  PRODUCT_NOT_FOUND: 'Produk tidak ditemukan',
  CART_EMPTY: 'Keranjang belanja kosong',
  PAYMENT_REQUIRED: 'Pilih metode pembayaran terlebih dahulu',
  SHIPPING_REQUIRED: 'Lengkapi alamat pengiriman terlebih dahulu'
};

// Success messages
export const SUCCESS_MESSAGES = {
  SESSION_STARTED: 'Testing session berhasil dimulai',
  TASK_COMPLETED: 'Task berhasil diselesaikan',
  CART_UPDATED: 'Keranjang berhasil diperbarui',
  ORDER_CREATED: 'Pesanan berhasil dibuat',
  SUS_SUBMITTED: 'Kuesioner SUS berhasil dikirim',
  SESSION_COMPLETED: 'Testing session berhasil diselesaikan'
};