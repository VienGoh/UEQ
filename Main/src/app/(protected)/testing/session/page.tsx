// app/(protected)/testing/session/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Task, Platform, SUSQuestion } from '@prisma/client';

// Types untuk data session
interface TaskResultInput {
  taskId: number;
  success: boolean;
  timeOnTask: number;
  errorCount: number;
}

// Types untuk UEQ
interface UEQQuestion {
  id: number;
  category: string;
  leftAdjective: string;
  rightAdjective: string;
}

// Types untuk simulasi e-commerce
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  rating: number;
  stock: number;
  brand: string;
  reviews: Review[];
  specifications: Specification[];
}

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

interface Specification {
  key: string;
  value: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: CartItem[];
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  trackingNumber?: string;
}

interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export default function TestingSessionPage() {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date>(new Date());

  const [currentStep, setCurrentStep] = useState<'registrasi' | 'tugas' | 'ecommerce' | 'kuesioner' | 'kuesionerUEQ' | 'selesai'>('registrasi');
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskTime, setTaskTime] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  
  // State untuk data yang diambil dari API
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(true);
  
  const [susQuestions] = useState<SUSQuestion[]>([
    { id: 1, question: 'Saya pikir saya ingin sering menggunakan sistem ini', isPositive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 2, question: 'Saya menemukan sistem ini sangat rumit', isPositive: false, createdAt: new Date(), updatedAt: new Date() },
    { id: 3, question: 'Saya pikir sistem ini mudah digunakan', isPositive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 4, question: 'Saya pikir saya memerlukan bantuan teknis untuk menggunakan sistem ini', isPositive: false, createdAt: new Date(), updatedAt: new Date() },
    { id: 5, question: 'Saya menemukan berbagai fungsi dalam sistem ini terintegrasi dengan baik', isPositive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 6, question: 'Saya pikir ada terlalu banyak inkonsistensi dalam sistem ini', isPositive: false, createdAt: new Date(), updatedAt: new Date() },
    { id: 7, question: 'Saya dapat membayangkan kebanyakan orang akan belajar menggunakan sistem ini dengan cepat', isPositive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 8, question: 'Saya merasa sistem ini sangat menyulitkan', isPositive: false, createdAt: new Date(), updatedAt: new Date() },
    { id: 9, question: 'Saya merasa sangat percaya diri menggunakan sistem ini', isPositive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 10, question: 'Saya harus belajar banyak hal sebelum dapat menggunakan sistem ini', isPositive: false, createdAt: new Date(), updatedAt: new Date() }
  ]);
  const [ueqQuestions, setUeqQuestions] = useState<UEQQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Data responden
  const [respondenData, setRespondenData] = useState({
    nama: '',
    umur: '',
    jenisKelamin: '',
    platformId: '',
    pengalamanECommerce: 'menengah',
  });

  // Data kuesioner
  const [susAnswers, setSusAnswers] = useState<Record<number, number>>({});
  const [ueqAnswers, setUeqAnswers] = useState<Record<number, number>>({});

  // Data hasil task
  const [taskResults, setTaskResults] = useState<TaskResultInput[]>([]);
  
  // ID responden setelah registrasi
  const [respondenId, setRespondenId] = useState<number | null>(null);

  // State untuk simulasi e-commerce
  const [showEcommerceSimulation, setShowEcommerceSimulation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'cart' | 'checkout' | 'tracking'>('search');
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('');

  // Data produk (hardcoded untuk simulasi)
  const [products] = useState<Product[]>([
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
    }
  ]);

  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [categories] = useState(['Semua', 'Smartphone', 'Laptop']);

  const currentTask = tasks[currentTaskIndex];
  const totalTasks = tasks.length;
  
  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const shippingCost = cart.length > 0 ? 15000 : 0;
  const totalAmount = cartTotal + shippingCost;

  // ========== FETCH TASKS ==========
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks');
        if (!res.ok) throw new Error('Gagal mengambil data tasks');
        const result = await res.json();
        if (result.success && result.data && result.data.length > 0) {
          setTasks(result.data);
        } else {
          // Fallback hardcoded jika API gagal atau data kosong
          setTasks([
            { id: 13, namaTask: 'Mencari produk', deskripsi: 'Temukan produk smartphone dengan harga di bawah Rp 20.000.000', createdAt: new Date(), updatedAt: new Date() },
            { id: 14, namaTask: 'Melihat detail produk', deskripsi: 'Periksa spesifikasi dan review produk yang dipilih', createdAt: new Date(), updatedAt: new Date() },
            { id: 15, namaTask: 'Menambahkan ke keranjang', deskripsi: 'Tambahkan produk pilihan ke dalam keranjang belanja', createdAt: new Date(), updatedAt: new Date() },
            { id: 16, namaTask: 'Melakukan checkout', deskripsi: 'Selesaikan proses checkout dengan data pengiriman yang valid', createdAt: new Date(), updatedAt: new Date() },
            { id: 17, namaTask: 'Melacak pesanan', deskripsi: 'Lacak status pesanan yang sudah dibuat', createdAt: new Date(), updatedAt: new Date() },
            { id: 18, namaTask: 'Proses Belanja Online lengkap', deskripsi: 'Lakukan proses belanja online dari awal hingga selesai', createdAt: new Date(), updatedAt: new Date() }
          ]);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks([
          { id: 13, namaTask: 'Mencari produk', deskripsi: 'Temukan produk smartphone dengan harga di bawah Rp 20.000.000', createdAt: new Date(), updatedAt: new Date() },
          { id: 14, namaTask: 'Melihat detail produk', deskripsi: 'Periksa spesifikasi dan review produk yang dipilih', createdAt: new Date(), updatedAt: new Date() },
          { id: 15, namaTask: 'Menambahkan ke keranjang', deskripsi: 'Tambahkan produk pilihan ke dalam keranjang belanja', createdAt: new Date(), updatedAt: new Date() },
          { id: 16, namaTask: 'Melakukan checkout', deskripsi: 'Selesaikan proses checkout dengan data pengiriman yang valid', createdAt: new Date(), updatedAt: new Date() },
          { id: 17, namaTask: 'Melacak pesanan', deskripsi: 'Lacak status pesanan yang sudah dibuat', createdAt: new Date(), updatedAt: new Date() },
          { id: 18, namaTask: 'Proses Belanja Online lengkap', deskripsi: 'Lakukan proses belanja online dari awal hingga selesai', createdAt: new Date(), updatedAt: new Date() }
        ]);
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchTasks();
  }, []);

  // ========== FETCH PLATFORMS ==========
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const res = await fetch('/api/platform');
        if (!res.ok) throw new Error('Gagal mengambil data platform');
        const result = await res.json();
        if (result.success && result.data) {
          setPlatforms(result.data);
        } else {
          throw new Error('Data platform tidak valid');
        }
      } catch (error) {
        console.error('Error fetching platforms:', error);
        alert('Gagal memuat data platform. Silakan refresh halaman.');
      } finally {
        setLoadingPlatforms(false);
      }
    };
    fetchPlatforms();
  }, []);

  // Inisialisasi jawaban SUS
  useEffect(() => {
    const initialAnswers: Record<number, number> = {};
    susQuestions.forEach((q) => {
      initialAnswers[q.id] = 3;
    });
    setSusAnswers(initialAnswers);
  }, [susQuestions]);

  // Set data UEQ (dummy)
  useEffect(() => {
    setUeqQuestions([
      { id: 1, category: 'Attractiveness', leftAdjective: 'Tidak menarik', rightAdjective: 'Menarik' },
      { id: 2, category: 'Attractiveness', leftAdjective: 'Tidak menyenangkan', rightAdjective: 'Menyenangkan' },
      { id: 3, category: 'Attractiveness', leftAdjective: 'Tidak disukai', rightAdjective: 'Disukai' },
      { id: 4, category: 'Attractiveness', leftAdjective: 'Buruk', rightAdjective: 'Baik' },
      { id: 5, category: 'Attractiveness', leftAdjective: 'Tidak nyaman', rightAdjective: 'Nyaman' },
      { id: 6, category: 'Perspicuity', leftAdjective: 'Membingungkan', rightAdjective: 'Jelas' },
      { id: 7, category: 'Perspicuity', leftAdjective: 'Sulit dipahami', rightAdjective: 'Mudah dipahami' },
      { id: 8, category: 'Perspicuity', leftAdjective: 'Sulit dipelajari', rightAdjective: 'Mudah dipelajari' },
      { id: 9, category: 'Perspicuity', leftAdjective: 'Tidak intuitif', rightAdjective: 'Intuitif' },
      { id: 10, category: 'Efficiency', leftAdjective: 'Lambat', rightAdjective: 'Cepat' },
      { id: 11, category: 'Efficiency', leftAdjective: 'Tidak efisien', rightAdjective: 'Efisien' },
      { id: 12, category: 'Efficiency', leftAdjective: 'Rumit', rightAdjective: 'Sederhana' },
      { id: 13, category: 'Efficiency', leftAdjective: 'Tidak praktis', rightAdjective: 'Praktis' },
      { id: 14, category: 'Dependability', leftAdjective: 'Tidak dapat diprediksi', rightAdjective: 'Dapat diprediksi' },
      { id: 15, category: 'Dependability', leftAdjective: 'Tidak aman', rightAdjective: 'Aman' },
      { id: 16, category: 'Dependability', leftAdjective: 'Tidak konsisten', rightAdjective: 'Konsisten' },
      { id: 17, category: 'Dependability', leftAdjective: 'Tidak responsif', rightAdjective: 'Responsif' },
      { id: 18, category: 'Stimulation', leftAdjective: 'Membosankan', rightAdjective: 'Menarik' },
      { id: 19, category: 'Stimulation', leftAdjective: 'Tidak memotivasi', rightAdjective: 'Memotivasi' },
      { id: 20, category: 'Stimulation', leftAdjective: 'Monoton', rightAdjective: 'Menyenangkan' },
      { id: 21, category: 'Stimulation', leftAdjective: 'Tidak kreatif', rightAdjective: 'Kreatif' },
      { id: 22, category: 'Novelty', leftAdjective: 'Kuno', rightAdjective: 'Modern' },
      { id: 23, category: 'Novelty', leftAdjective: 'Umum', rightAdjective: 'Inovatif' },
      { id: 24, category: 'Novelty', leftAdjective: 'Konvensional', rightAdjective: 'Unik' },
      { id: 25, category: 'Novelty', leftAdjective: 'Biasa saja', rightAdjective: 'Berbeda' },
    ]);
  }, []);

  // Timer untuk mengukur waktu tugas
  useEffect(() => {
    if (currentStep === 'tugas' || currentStep === 'ecommerce') {
      startTimeRef.current = new Date();
      timerRef.current = setInterval(() => {
        const now = new Date();
        const diff = (now.getTime() - startTimeRef.current.getTime()) / 1000;
        setTaskTime(Math.round(diff));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentStep]);

  // Filter produk
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  // ========== API FUNCTIONS ==========
  const saveResponden = async (data: any): Promise<number> => {
    const res = await fetch('/api/responden', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Gagal menyimpan responden');
    const result = await res.json();
    return result.id;
  };

  const saveTaskResult = async (respondenId: number, taskResult: TaskResultInput) => {
    const res = await fetch('/api/task-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ respondenId, ...taskResult }),
    });
    if (!res.ok) throw new Error('Gagal menyimpan task result');
  };

  const saveSUSAnswers = async (respondenId: number, answers: Record<number, number>) => {
    const res = await fetch('/api/sus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ respondenId, answers }),
    });
    if (!res.ok) throw new Error('Gagal menyimpan SUS');
  };

  const saveUEQAnswers = async (respondenId: number, answers: Record<number, number>) => {
    const res = await fetch('/api/ueq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ respondenId, answers }),
    });
    if (!res.ok) throw new Error('Gagal menyimpan UEQ');
  };

  // ========== HANDLERS ==========
  const handleRegistrasiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondenData.nama || !respondenData.umur || !respondenData.jenisKelamin || !respondenData.platformId) {
      alert('Harap isi semua data yang diperlukan');
      return;
    }
    setLoading(true);
    try {
      const newRespondenId = await saveResponden(respondenData);
      setRespondenId(newRespondenId);
      localStorage.setItem('currentTestingSession', JSON.stringify({
        respondenId: newRespondenId,
        respondenData: respondenData,
        startedAt: new Date().toISOString(),
      }));
      setCurrentStep('tugas');
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat menyimpan data responden');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskComplete = async (success: boolean) => {
    if (!respondenId || !currentTask) return;
    const taskResult: TaskResultInput = {
      taskId: currentTask.id,
      success,
      timeOnTask: taskTime,
      errorCount,
    };
    setLoading(true);
    try {
      await saveTaskResult(respondenId, taskResult);
      setTaskResults([...taskResults, taskResult]);
      setTaskTime(0);
      setErrorCount(0);
      setShowEcommerceSimulation(false);
      if (currentTaskIndex < totalTasks - 1) {
        setCurrentTaskIndex(prev => prev + 1);
        setCurrentStep('tugas');
      } else {
        setCurrentStep('kuesioner');
      }
    } catch (error) {
      console.error(error);
      alert('Gagal menyimpan hasil task');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEcommerceSimulation = () => {
    if (!respondenId || !currentTask) return;
    let targetTab: 'search' | 'cart' | 'checkout' | 'tracking' = 'search';
    switch (currentTask.id) {
      case 13: targetTab = 'search'; break;
      case 14: targetTab = 'search'; if (products.length) setSelectedProduct(products[0]); break;
      case 15: targetTab = 'search'; break;
      case 16:
        targetTab = 'checkout';
        if (cart.length === 0 && products.length) handleAddToCart(products[0]);
        setCheckoutStep(1);
        break;
      case 17:
        targetTab = 'tracking';
        if (!order && products.length) {
          const dummyOrder: Order = {
            id: `ORD${Date.now().toString().slice(-8)}`,
            date: new Date().toISOString(),
            status: 'shipped',
            items: cart.length ? cart : [{ product: products[0], quantity: 1 }],
            total: cart.length ? totalAmount : products[0].price + 15000,
            shippingAddress: {
              name: 'Contoh Nama',
              phone: '081234567890',
              address: 'Jl. Contoh No. 123',
              city: 'Jakarta',
              postalCode: '12345'
            },
            paymentMethod: 'bank_transfer',
            trackingNumber: `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`
          };
          setOrder(dummyOrder);
        }
        break;
      case 18: targetTab = 'search'; break;
      default: targetTab = 'search';
    }
    setActiveTab(targetTab);
    setShowEcommerceSimulation(true);
    setCurrentStep('ecommerce');
  };

  const handleCompleteSimulation = async () => {
    if (!respondenId || !currentTask) return;
    const taskResult: TaskResultInput = {
      taskId: currentTask.id,
      success: true,
      timeOnTask: taskTime,
      errorCount,
    };
    setLoading(true);
    try {
      await saveTaskResult(respondenId, taskResult);
      setTaskResults([...taskResults, taskResult]);
      setTaskTime(0);
      setErrorCount(0);
      setShowEcommerceSimulation(false);
      setActiveTab('search');
      if (currentTask.id === 18) {
        setCart([]);
        setOrder(null);
      }
      setSelectedProduct(null);
      if (currentTaskIndex < totalTasks - 1) {
        setCurrentTaskIndex(prev => prev + 1);
        setCurrentStep('tugas');
      } else {
        setCurrentStep('kuesioner');
      }
    } catch (error) {
      console.error(error);
      alert('Gagal menyimpan hasil simulasi');
    } finally {
      setLoading(false);
    }
  };

  // E-commerce functions
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveTab('search');
  };
  const handleProductClick = (product: Product) => setSelectedProduct(product);
  const handleAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
    setActiveTab('cart');
    alert(`${product.name} telah ditambahkan ke keranjang!`);
  };
  const handleRemoveFromCart = (productId: number) => setCart(prev => prev.filter(item => item.product.id !== productId));
  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
  };
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Keranjang kosong. Tambahkan produk terlebih dahulu.');
      return;
    }
    setActiveTab('checkout');
    setCheckoutStep(1);
  };
  const handleNextCheckoutStep = () => checkoutStep < 4 && setCheckoutStep(prev => prev + 1);
  const handlePrevCheckoutStep = () => checkoutStep > 1 && setCheckoutStep(prev => prev - 1);
  const handlePlaceOrder = () => {
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address || !paymentMethod) {
      alert('Harap lengkapi semua informasi pengiriman dan pembayaran.');
      return;
    }
    const newOrder: Order = {
      id: `ORD${Date.now().toString().slice(-8)}`,
      date: new Date().toISOString(),
      status: 'pending',
      items: [...cart],
      total: totalAmount,
      shippingAddress: { ...shippingAddress },
      paymentMethod,
      trackingNumber: `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
    setOrder(newOrder);
    setActiveTab('tracking');
    const sessionData = JSON.parse(localStorage.getItem('currentTestingSession') || '{}');
    sessionData.orders = sessionData.orders || [];
    sessionData.orders.push(newOrder);
    localStorage.setItem('currentTestingSession', JSON.stringify(sessionData));
    alert('Pesanan berhasil dibuat! Silakan cek status pesanan.');
  };

  const handleSUSAnswer = (questionId: number, score: number) => setSusAnswers(prev => ({ ...prev, [questionId]: score }));
  const handleSubmitSUS = async () => {
    if (!respondenId) { alert('Tidak ada data responden'); return; }
    if (Object.keys(susAnswers).length !== susQuestions.length) { alert('Harap jawab semua pertanyaan'); return; }
    setLoading(true);
    try {
      await saveSUSAnswers(respondenId, susAnswers);
      setCurrentStep('kuesionerUEQ');
    } catch (error) {
      alert('Gagal menyimpan kuesioner SUS');
    } finally {
      setLoading(false);
    }
  };
  const handleUEQAnswer = (questionId: number, score: number) => setUeqAnswers(prev => ({ ...prev, [questionId]: score }));
  const handleSubmitUEQ = async () => {
    if (!respondenId) { alert('Tidak ada data responden'); return; }
    if (Object.keys(ueqAnswers).length !== ueqQuestions.length) { alert('Harap jawab semua pertanyaan UEQ'); return; }
    setLoading(true);
    try {
      await saveUEQAnswers(respondenId, ueqAnswers);
      const sessionData = { respondenId, respondenData, taskResults, susAnswers, ueqAnswers, completedAt: new Date().toISOString() };
      const history = JSON.parse(localStorage.getItem('testingSessionHistory') || '[]');
      history.push(sessionData);
      localStorage.setItem('testingSessionHistory', JSON.stringify(history));
      localStorage.removeItem('currentTestingSession');
      setCurrentStep('selesai');
    } catch (error) {
      alert('Gagal menyimpan kuesioner UEQ');
    } finally {
      setLoading(false);
    }
  };
  const handleAddError = () => setErrorCount(prev => prev + 1);
  const handleResetSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentStep('registrasi');
    setCurrentTaskIndex(0);
    setTaskTime(0);
    setErrorCount(0);
    setRespondenData({ nama: '', umur: '', jenisKelamin: '', platformId: '', pengalamanECommerce: 'menengah' });
    const initialAnswers: Record<number, number> = {};
    susQuestions.forEach(q => { initialAnswers[q.id] = 3; });
    setSusAnswers(initialAnswers);
    setUeqAnswers({});
    setTaskResults([]);
    setRespondenId(null);
    setCart([]);
    setOrder(null);
    setShowEcommerceSimulation(false);
    localStorage.removeItem('currentTestingSession');
  };

  useEffect(() => {
    const savedSession = localStorage.getItem('currentTestingSession');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setRespondenId(session.respondenId);
      setRespondenData(session.respondenData);
      setCurrentStep('tugas');
    }
  }, []);

  // Loading state
  if (loadingPlatforms || loadingTasks) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memproses...</p>
        </div>
      </div>
    );
  }

  // ========== REGISTRASI ==========
  if (currentStep === 'registrasi') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Registrasi Peserta Testing Session</h1>
              <p className="text-gray-600">Silakan isi data diri Anda sebelum memulai pengujian sistem e-commerce</p>
            </div>
            <div className="text-sm text-gray-500">Total Tasks: {tasks.length}</div>
          </div>
          <form onSubmit={handleRegistrasiSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <input type="text" value={respondenData.nama} onChange={(e) => setRespondenData({ ...respondenData, nama: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required placeholder="Masukkan nama lengkap" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Umur (18-40) *</label>
                <input type="number" min="18" max="40" value={respondenData.umur} onChange={(e) => setRespondenData({ ...respondenData, umur: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required placeholder="Contoh: 25" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin *</label>
              <div className="flex space-x-4">
                {['Laki-laki', 'Perempuan'].map(gender => (
                  <label key={gender} className="flex items-center">
                    <input type="radio" name="jenisKelamin" value={gender} checked={respondenData.jenisKelamin === gender} onChange={(e) => setRespondenData({ ...respondenData, jenisKelamin: e.target.value })} className="mr-2 h-4 w-4 text-blue-600" required />
                    <span>{gender}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform E-commerce yang Dites *</label>
              <select value={respondenData.platformId} onChange={(e) => setRespondenData({ ...respondenData, platformId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
                <option value="">Pilih Platform</option>
                {platforms.map(platform => <option key={platform.id} value={platform.id}>{platform.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pengalaman Menggunakan E-commerce</label>
              <select value={respondenData.pengalamanECommerce} onChange={(e) => setRespondenData({ ...respondenData, pengalamanECommerce: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="pemula">Pemula (1-6 bulan)</option>
                <option value="menengah">Menengah (6 bulan - 2 tahun)</option>
                <option value="mahir">Mahir (lebih dari 2 tahun)</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50">
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> : <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 10v4a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
              Mulai Pengujian
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Daftar Task yang Akan Diuji:</h3>
            <div className="space-y-2">
              {tasks.map((task, index) => (
                <div key={task.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-3 font-medium">{index + 1}</div>
                  <div><div className="font-medium text-gray-800">{task.namaTask}</div><div className="text-sm text-gray-600">{task.deskripsi}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== TUGAS (tanpa simulasi) ==========
  if (currentStep === 'tugas' && !showEcommerceSimulation) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Skenario Usability Testing</h1>
                <p className="text-gray-600">Platform: {platforms.find(p => p.id.toString() === respondenData.platformId)?.name}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="text-center"><div className="text-sm text-gray-500">Progress</div><div className="text-2xl font-bold">{currentTaskIndex + 1} <span className="text-gray-400">/</span> {totalTasks}</div></div>
                <div className="text-center"><div className="text-sm text-gray-500">Waktu</div><div className="text-2xl font-mono font-bold text-gray-800">{Math.floor(taskTime / 60)}:{String(taskTime % 60).padStart(2, '0')}</div></div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6"><div className="bg-blue-600 h-2.5 rounded-full transition-all" style={{ width: `${((currentTaskIndex + 1) / totalTasks) * 100}%` }}></div></div>
            {currentTask && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2"><span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-semibold mr-3">{currentTaskIndex + 1}</span><h2 className="text-xl font-semibold text-gray-800">{currentTask.namaTask}</h2></div>
                    <p className="text-gray-700 pl-11">{currentTask.deskripsi}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-100 min-w-[200px]">
                    <div className="text-sm text-gray-500 mb-2">Task Stats</div>
                    <div className="space-y-2"><div className="flex justify-between"><span className="text-gray-600">Errors:</span><span className="font-medium text-red-600">{errorCount}</span></div><div className="flex justify-between"><span className="text-gray-600">Status:</span><span className="font-medium text-yellow-600">Sedang Berjalan</span></div></div>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <button onClick={handleAddError} className="bg-red-50 border border-red-200 text-red-700 py-4 px-6 rounded-lg font-medium hover:bg-red-100 flex items-center justify-center">Laporkan Error <span className="ml-3 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm">{errorCount}</span></button>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4"><div className="flex items-center text-gray-700 mb-2"><svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span className="font-medium">Instruksi:</span></div><ul className="list-disc pl-5 text-gray-600 space-y-1"><li>Selesaikan tugas sesuai deskripsi di atas</li><li>Klik "Laporkan Error" jika mengalami kesulitan</li><li>Gunakan aplikasi e-commerce yang ditentukan</li><li>Perhatikan waktu yang digunakan</li></ul></div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4"><div className="flex items-center text-gray-700 mb-2"><svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span className="font-medium">Tips:</span></div><ul className="list-disc pl-5 text-gray-600 space-y-1"><li>Usahakan selesaikan tanpa error</li><li>Gunakan aplikasi asli, bukan simulasi</li><li>Catat kesulitan yang ditemui</li></ul></div>
            </div>
            <div className="space-y-4">
              <button onClick={handleStartEcommerceSimulation} className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-purple-700 flex items-center justify-center text-lg"><svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>Buka Simulasi E-commerce</button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => handleTaskComplete(true)} disabled={loading} className="bg-green-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center text-lg disabled:opacity-50">{loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> : <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>}Tugas Selesai (Berhasil)</button>
                <button onClick={() => handleTaskComplete(false)} disabled={loading} className="bg-yellow-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-yellow-700 flex items-center justify-center text-lg disabled:opacity-50">{loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> : <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>}Tugas Gagal</button>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200"><button onClick={handleResetSession} className="text-gray-600 hover:text-gray-800 flex items-center text-sm"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"/></svg>Batalkan & Mulai Ulang Session</button></div>
          </div>
        </div>
      </div>
    );
  }

  // ========== SIMULASI E-COMMERCE (konten lengkap) ==========
  if (currentStep === 'ecommerce' && showEcommerceSimulation) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Simulasi E-commerce</h1>
                <p className="text-gray-600">{currentTask?.namaTask || 'Proses Belanja Online'}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="text-center"><div className="text-sm text-gray-500">Waktu Tugas</div><div className="text-2xl font-mono font-bold text-gray-800">{Math.floor(taskTime / 60)}:{String(taskTime % 60).padStart(2, '0')}</div></div>
                <div className="text-center"><div className="text-sm text-gray-500">Errors</div><div className="text-2xl font-bold text-red-600">{errorCount}</div></div>
              </div>
            </div>
            {/* Tabs */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 border-b border-gray-200">
                <button onClick={() => setActiveTab('search')} className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === 'search' ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}>🔍 Pencarian Produk</button>
                <button onClick={() => setActiveTab('cart')} className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === 'cart' ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}>🛒 Keranjang ({cart.length})</button>
                <button onClick={() => setActiveTab('checkout')} className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === 'checkout' ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}>💳 Checkout</button>
                <button onClick={() => setActiveTab('tracking')} className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === 'tracking' ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}>📦 Tracking Pesanan</button>
              </div>
            </div>
            {/* Content Area */}
            <div className="bg-white rounded-xl border border-gray-200">
              {/* Search Tab */}
              {activeTab === 'search' && (
                <div className="p-6">
                  <div className="mb-6">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg></div>
                      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari produk (nama, merek, kategori)..." className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {categories.map(category => <button key={category} onClick={() => handleSearch(category === 'Semua' ? '' : category)} className={`px-4 py-2 rounded-full text-sm font-medium ${searchQuery === (category === 'Semua' ? '' : category) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{category}</button>)}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(product => (
                      <div key={product.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4"><div className="text-5xl">{product.image}</div><div className="text-right"><div className="text-lg font-bold text-blue-600">Rp {product.price.toLocaleString('id-ID')}</div><div className="text-sm text-gray-500">Stok: {product.stock}</div></div></div>
                        <h3 className="font-bold text-lg text-gray-800 mb-2">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between mb-4"><div className="flex items-center"><div className="flex items-center">{[...Array(5)].map((_, i) => <svg key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}</div><span className="ml-2 text-sm text-gray-600">({product.rating})</span></div><span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">{product.brand}</span></div>
                        <div className="flex gap-2"><button onClick={() => handleProductClick(product)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">Lihat Detail</button><button onClick={() => handleAddToCart(product)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>Tambah</button></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Cart Tab */}
              {activeTab === 'cart' && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">🛒 Keranjang Belanja</h2>
                  {cart.length === 0 ? (
                    <div className="text-center py-12"><div className="text-6xl mb-4">🛒</div><h3 className="text-xl font-semibold text-gray-600 mb-2">Keranjang Kosong</h3><p className="text-gray-500 mb-6">Tambahkan produk terlebih dahulu</p><button onClick={() => setActiveTab('search')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Mulai Belanja</button></div>
                  ) : (
                    <div className="space-y-6">
                      {cart.map(item => (
                        <div key={item.product.id} className="flex items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <div className="text-4xl mr-4">{item.product.image}</div>
                          <div className="flex-1"><h4 className="font-semibold text-gray-800">{item.product.name}</h4><p className="text-sm text-gray-600">{item.product.brand} • {item.product.category}</p><div className="text-lg font-bold text-blue-600 mt-1">Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}</div></div>
                          <div className="flex items-center space-x-4"><div className="flex items-center border border-gray-300 rounded-lg"><button onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-100 rounded-l-lg">-</button><span className="px-3 py-1 min-w-[40px] text-center">{item.quantity}</span><button onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-100 rounded-r-lg">+</button></div><button onClick={() => handleRemoveFromCart(item.product.id)} className="text-red-600 hover:text-red-800"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button></div>
                        </div>
                      ))}
                      <div className="bg-white p-6 rounded-xl border border-gray-200"><h4 className="font-bold text-gray-800 mb-4">Ringkasan Belanja</h4><div className="space-y-3 mb-4"><div className="flex justify-between"><span className="text-gray-600">Subtotal ({cart.length} item)</span><span className="font-semibold">Rp {cartTotal.toLocaleString('id-ID')}</span></div><div className="flex justify-between"><span className="text-gray-600">Biaya Pengiriman</span><span className="font-semibold">Rp {shippingCost.toLocaleString('id-ID')}</span></div></div><div className="border-t pt-4"><div className="flex justify-between items-center"><span className="text-lg font-bold text-gray-800">Total</span><span className="text-2xl font-bold text-blue-600">Rp {totalAmount.toLocaleString('id-ID')}</span></div></div><div className="mt-6"><button onClick={handleCheckout} className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">Lanjut ke Checkout</button></div></div>
                    </div>
                  )}
                </div>
              )}
              {/* Checkout Tab */}
              {activeTab === 'checkout' && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">💳 Checkout</h2>
                  <div className="mb-8"><div className="flex justify-between items-center mb-4">{[1,2,3,4].map(step => (<div key={step} className="flex items-center"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{step}</div>{step < 4 && <div className={`w-16 h-1 mx-2 ${checkoutStep > step ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}</div>))}</div></div>
                  {checkoutStep === 1 && (
                    <div className="space-y-6"><h3 className="text-xl font-semibold text-gray-800">Informasi Pengiriman</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-sm font-medium text-gray-700 mb-2">Nama Penerima *</label><input type="text" value={shippingAddress.name} onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Nama lengkap" /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon *</label><input type="tel" value={shippingAddress.phone} onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="0812-3456-7890" /></div><div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap *</label><textarea value={shippingAddress.address} onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg" rows={3} placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan" /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Kota *</label><input type="text" value={shippingAddress.city} onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Jakarta Selatan" /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Kode Pos *</label><input type="text" value={shippingAddress.postalCode} onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="12345" /></div></div></div>
                  )}
                  {checkoutStep === 2 && (
                    <div className="space-y-6"><h3 className="text-xl font-semibold text-gray-800">Metode Pengiriman</h3><div className="space-y-4">{['regular','express','same-day'].map(m => (<label key={m} className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-400"><input type="radio" name="shipping" className="mr-4" defaultChecked={m==='regular'} /><div className="flex-1"><div className="font-semibold text-gray-800">{m==='regular'?'Reguler':m==='express'?'Express':'Same Day'}</div><div className="text-sm text-gray-600">Estimasi: {m==='regular'?'3-5 hari':m==='express'?'1-2 hari':'Hari ini'}</div></div><div className="font-bold">Rp {m==='regular'?15000:m==='express'?30000:50000}</div></label>))}</div></div>
                  )}
                  {checkoutStep === 3 && (
                    <div className="space-y-6"><h3 className="text-xl font-semibold text-gray-800">Metode Pembayaran</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{['bank_transfer','credit_card','ewallet','cod'].map(m => (<label key={m} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === m ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}><input type="radio" name="paymentMethod" value={m} checked={paymentMethod === m} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3" /><div className="text-2xl mr-3">{m==='bank_transfer'?'🏦':m==='credit_card'?'💳':m==='ewallet'?'📱':'💰'}</div><div className="font-semibold text-gray-800">{m==='bank_transfer'?'Transfer Bank':m==='credit_card'?'Kartu Kredit':m==='ewallet'?'E-Wallet':'COD'}</div></label>))}</div></div>
                  )}
                  {checkoutStep === 4 && (
                    <div className="space-y-6"><h3 className="text-xl font-semibold text-gray-800">Ringkasan Pesanan</h3><div className="bg-gray-50 p-6 rounded-xl"><div className="mb-6"><h4 className="font-bold text-gray-800 mb-3">Produk</h4>{cart.map(item => (<div key={item.product.id} className="flex items-center justify-between py-2 border-b border-gray-200"><div className="flex items-center"><div className="text-2xl mr-3">{item.product.image}</div><div><div className="font-medium">{item.product.name}</div><div className="text-sm text-gray-600">{item.quantity} × Rp {item.product.price.toLocaleString('id-ID')}</div></div></div><div className="font-semibold">Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}</div></div>))}</div><div className="space-y-3"><div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>Rp {cartTotal.toLocaleString('id-ID')}</span></div><div className="flex justify-between"><span className="text-gray-600">Pengiriman</span><span>Rp {shippingCost.toLocaleString('id-ID')}</span></div><div className="border-t pt-3"><div className="flex justify-between items-center"><span className="text-lg font-bold text-gray-800">Total</span><span className="text-2xl font-bold text-blue-600">Rp {totalAmount.toLocaleString('id-ID')}</span></div></div></div></div></div>
                  )}
                  <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                    {checkoutStep > 1 && <button onClick={handlePrevCheckoutStep} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">Kembali</button>}
                    {checkoutStep < 4 ? <button onClick={handleNextCheckoutStep} className="ml-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">Lanjut</button> : <button onClick={handlePlaceOrder} className="ml-auto px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">Buat Pesanan</button>}
                  </div>
                </div>
              )}
              {/* Tracking Tab */}
              {activeTab === 'tracking' && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">📦 Tracking Pesanan</h2>
                  {order ? (
                    <div className="space-y-8">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl"><div className="flex justify-between items-start"><div><h3 className="text-xl font-bold mb-2">Pesanan #{order.id}</h3><p className="opacity-90">Tanggal: {new Date(order.date).toLocaleDateString('id-ID')}</p><p className="opacity-90">Total: Rp {order.total.toLocaleString('id-ID')}</p></div><span className={`px-4 py-2 rounded-full text-sm font-bold ${order.status === 'delivered' ? 'bg-green-500' : order.status === 'shipped' ? 'bg-yellow-500' : 'bg-orange-500'}`}>{order.status === 'pending' ? 'Menunggu' : order.status === 'processing' ? 'Diproses' : order.status === 'shipped' ? 'Dikirim' : 'Selesai'}</span></div>{order.trackingNumber && <div className="mt-4 p-3 bg-white/20 rounded-lg"><p className="font-medium">No. Tracking: {order.trackingNumber}</p><p className="text-sm opacity-90">Gunakan nomor ini untuk melacak pengiriman</p></div>}</div>
                      <div className="bg-white border border-gray-200 rounded-xl p-6"><h4 className="font-bold text-gray-800 mb-6">Status Pengiriman</h4><div className="relative">{[
                        { status: 'pending', label: 'Pesanan Diterima', date: 'Hari ini, 10:30', icon: '📝' },
                        { status: 'processing', label: 'Pesanan Diproses', date: 'Hari ini, 11:45', icon: '⚙️' },
                        { status: 'shipped', label: 'Pesanan Dikirim', date: 'Besok, 09:00', icon: '🚚' },
                        { status: 'delivered', label: 'Pesanan Diterima', date: '2 hari lagi', icon: '✅' }
                      ].map((step, idx) => (<div key={step.status} className="flex items-start mb-8 last:mb-0"><div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${idx <= 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>{step.icon}</div><div className="flex-1"><div className="font-medium text-gray-800">{step.label}</div><div className="text-sm text-gray-600">{step.date}</div></div>{idx < 3 && <div className={`absolute left-5 top-10 w-0.5 h-12 ${idx < 1 ? 'bg-green-500' : 'bg-gray-200'}`}></div>}</div>))}</div></div>
                      <div className="flex gap-4"><button onClick={handleCompleteSimulation} disabled={loading} className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50">{loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div> : 'Selesaikan Task'}</button><button onClick={() => setActiveTab('search')} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">Lanjut Belanja</button></div>
                    </div>
                  ) : (
                    <div className="text-center py-12"><div className="text-6xl mb-4">📦</div><h3 className="text-xl font-semibold text-gray-600 mb-2">Belum Ada Pesanan</h3><p className="text-gray-500 mb-6">Silakan buat pesanan terlebih dahulu</p><button onClick={() => setActiveTab('search')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Mulai Belanja</button></div>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Product Detail Modal */}
          {selectedProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-start mb-6"><h2 className="text-2xl font-bold text-gray-800">{selectedProduct.name}</h2><button onClick={() => setSelectedProduct(null)} className="text-gray-500 hover:text-gray-700"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
                <div className="flex flex-col md:flex-row gap-6 mb-6"><div className="md:w-1/3"><div className="text-8xl flex items-center justify-center bg-gray-100 rounded-2xl p-8 mb-4">{selectedProduct.image}</div><div className="text-center"><div className="text-3xl font-bold text-blue-600 mb-2">Rp {selectedProduct.price.toLocaleString('id-ID')}</div><div className="text-sm text-gray-600">Stok: {selectedProduct.stock} unit</div></div></div><div className="md:w-2/3"><div className="mb-4"><span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium mr-2">{selectedProduct.brand}</span><span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">{selectedProduct.category}</span></div><div className="flex items-center mb-4"><div className="flex items-center mr-2">{[...Array(5)].map((_,i) => <svg key={i} className={`w-5 h-5 ${i < Math.floor(selectedProduct.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}</div><span className="text-gray-700 font-medium">{selectedProduct.rating}/5.0</span><span className="text-gray-500 text-sm ml-2">({selectedProduct.reviews.length} review)</span></div><p className="text-gray-700 mb-6">{selectedProduct.description}</p><div className="mb-6"><h4 className="font-semibold text-gray-800 mb-3">Spesifikasi</h4><div className="grid grid-cols-2 gap-3">{selectedProduct.specifications.map((spec,idx) => (<div key={idx} className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-600">{spec.key}</span><span className="font-medium">{spec.value}</span></div>))}</div></div></div></div>
                {selectedProduct.reviews.length > 0 && (<div className="mb-6"><h4 className="font-semibold text-gray-800 mb-3">Ulasan Pelanggan</h4><div className="space-y-4">{selectedProduct.reviews.map(review => (<div key={review.id} className="border border-gray-200 rounded-lg p-4"><div className="flex items-center justify-between mb-2"><div className="font-medium">{review.name}</div><div className="flex items-center">{[...Array(5)].map((_,i) => <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}</div></div><p className="text-gray-600 text-sm mb-2">{review.comment}</p><div className="text-xs text-gray-500">{review.date}</div></div>))}</div></div>)}
                <div className="flex gap-4"><button onClick={() => { handleAddToCart(selectedProduct); setSelectedProduct(null); }} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">Tambah ke Keranjang</button><button onClick={() => setSelectedProduct(null)} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">Kembali</button></div>
              </div>
            </div>
          )}
          <div className="mt-6"><button onClick={() => { setShowEcommerceSimulation(false); setCurrentStep('tugas'); }} className="text-gray-600 hover:text-gray-800 flex items-center"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>Kembali ke Task List</button></div>
        </div>
      </div>
    );
  }

  // ========== KUESIONER SUS ==========
  if (currentStep === 'kuesioner') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl md:text-3xl font-bold text-gray-800">Kuesioner System Usability Scale (SUS)</h1><p className="text-gray-600">Berikan penilaian Anda berdasarkan pengalaman menggunakan sistem</p></div><div className="text-right"><div className="text-sm text-gray-500">Responden ID</div><div className="font-mono text-lg font-bold text-gray-800">#{respondenId?.toString().padStart(4,'0')}</div></div></div>
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg"><div className="flex items-start"><svg className="w-6 h-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><div><p className="text-blue-800 font-medium mb-1">Petunjuk Pengisian:</p><ul className="list-disc pl-5 text-blue-700 text-sm"><li>Berdasarkan pengalaman Anda menggunakan sistem selama testing session</li><li>Berikan nilai 1-5 untuk setiap pernyataan</li></ul><div className="mt-3 grid grid-cols-5 gap-2">{[
              { value: 1, label: 'Sangat Tidak Setuju', color: 'bg-red-100' }, { value: 2, label: 'Tidak Setuju', color: 'bg-orange-100' }, { value: 3, label: 'Netral', color: 'bg-yellow-100' }, { value: 4, label: 'Setuju', color: 'bg-green-100' }, { value: 5, label: 'Sangat Setuju', color: 'bg-blue-100' }
            ].map(item => (<div key={item.value} className={`p-2 rounded text-center ${item.color}`}><div className="font-bold text-lg">{item.value}</div><div className="text-xs">{item.label}</div></div>))}</div></div></div></div>
            <div className="space-y-8">
              {susQuestions.map((q, idx) => (
                <div key={q.id} className="border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition">
                  <div className="flex items-start mb-6"><div className="mr-4"><span className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-800 rounded-full font-bold text-lg">{idx+1}</span></div><div className="flex-1"><p className="text-lg font-medium text-gray-800 mb-2">{q.question}</p>{q.isPositive ? <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Pernyataan Positif</span> : <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Pernyataan Negatif</span>}</div></div>
                  <div className="flex justify-center space-x-2">{[1,2,3,4,5].map(score => (<button key={score} onClick={() => handleSUSAnswer(q.id, score)} className={`w-12 h-12 rounded-full flex items-center justify-center border-2 text-lg font-medium transition-all hover:scale-105 ${susAnswers[q.id] === score ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'}`}>{score}</button>))}</div>
                  {susAnswers[q.id] && <div className="mt-4 pt-4 border-t border-gray-100 text-center"><span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">Dipilih: {susAnswers[q.id]} - {susAnswers[q.id]===1?'Sangat Tidak Setuju':susAnswers[q.id]===2?'Tidak Setuju':susAnswers[q.id]===3?'Netral':susAnswers[q.id]===4?'Setuju':'Sangat Setuju'}</span></div>}
                </div>
              ))}
            </div>
            <div className="mt-10 pt-8 border-t border-gray-200 flex justify-between"><div className="text-gray-600"><p className="font-medium">Status Pengisian:</p><p className="text-sm">{Object.keys(susAnswers).filter(k=>susAnswers[parseInt(k)]).length} dari {susQuestions.length} terjawab</p></div><div className="flex gap-4"><button onClick={() => setCurrentStep('tugas')} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Kembali ke Tugas</button><button onClick={handleSubmitSUS} disabled={loading} className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center disabled:opacity-50">{loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> : <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>}Submit Kuesioner</button></div></div>
          </div>
        </div>
      </div>
    );
  }

  // ========== KUESIONER UEQ ==========
  if (currentStep === 'kuesionerUEQ') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl md:text-3xl font-bold text-gray-800">Kuesioner User Experience Questionnaire (UEQ)</h1><p className="text-gray-600">Berikan penilaian Anda dengan memilih nilai -3 hingga +3</p></div><div className="text-right"><div className="text-sm text-gray-500">Responden ID</div><div className="font-mono text-lg font-bold text-gray-800">#{respondenId?.toString().padStart(4,'0')}</div></div></div>
            <div className="mb-8 p-4 bg-purple-50 border border-purple-200 rounded-lg"><div className="flex items-start"><svg className="w-6 h-6 text-purple-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><div><p className="text-purple-800 font-medium mb-1">Petunjuk Pengisian:</p><p className="text-purple-700 text-sm">-3 = sangat setuju dengan kata kiri, 0 = netral, +3 = sangat setuju dengan kata kanan.</p></div></div></div>
            <div className="space-y-8">
              {Array.from(new Set(ueqQuestions.map(q => q.category))).map(cat => (<div key={cat} className="border border-gray-200 rounded-xl p-6"><h2 className="text-xl font-semibold text-gray-800 mb-6">{cat}</h2>{ueqQuestions.filter(q => q.category === cat).map(q => (<div key={q.id} className="flex flex-col mb-6"><div className="flex justify-between text-xs text-gray-500 mb-2"><span>{q.leftAdjective}</span><span>{q.rightAdjective}</span></div><div className="flex items-center justify-between gap-2"><span className="text-sm text-gray-600 w-1/4 text-right">{q.leftAdjective}</span><div className="flex gap-1 flex-1 justify-center">{[ -3,-2,-1,0,1,2,3 ].map(val => (<button key={val} onClick={() => handleUEQAnswer(q.id, val)} className={`w-10 h-10 rounded-md flex items-center justify-center border text-sm font-medium transition-all hover:scale-105 ${ueqAnswers[q.id] === val ? 'bg-purple-600 border-purple-600 text-white shadow-lg' : 'border-gray-300 text-gray-700 hover:border-purple-400 hover:bg-purple-50'}`}>{val > 0 ? `+${val}` : val}</button>))}</div><span className="text-sm text-gray-600 w-1/4 text-left">{q.rightAdjective}</span></div>{ueqAnswers[q.id] !== undefined && <div className="mt-2 text-center"><span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Dipilih: {ueqAnswers[q.id]} ({ueqAnswers[q.id] < 0 ? 'cenderung ' + q.leftAdjective : ueqAnswers[q.id] > 0 ? 'cenderung ' + q.rightAdjective : 'netral'})</span></div>}</div>))}</div>))}
            </div>
            <div className="mt-10 pt-8 border-t border-gray-200 flex justify-between"><div className="text-gray-600"><p className="font-medium">Status Pengisian:</p><p className="text-sm">{Object.keys(ueqAnswers).length} dari {ueqQuestions.length} pertanyaan terjawab</p></div><div className="flex gap-4"><button onClick={() => setCurrentStep('kuesioner')} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Kembali ke SUS</button><button onClick={handleSubmitUEQ} disabled={loading} className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center disabled:opacity-50">{loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> : <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>}Submit Kuesioner</button></div></div>
          </div>
        </div>
      </div>
    );
  }

  // ========== SELESAI (tombol history dihapus) ==========
  if (currentStep === 'selesai') {
    const totalTasksCompleted = taskResults.length;
    const successfulTasks = taskResults.filter(t => t.success).length;
    const successRate = totalTasksCompleted > 0 ? (successfulTasks / totalTasksCompleted) * 100 : 0;
    const totalTime = taskResults.reduce((sum, t) => sum + t.timeOnTask, 0);
    const totalErrors = taskResults.reduce((sum, t) => sum + t.errorCount, 0);
    const averageSUS = Object.values(susAnswers).reduce((a,b)=>a+b,0)/susQuestions.length;
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white"><div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-6"><svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg></div><h1 className="text-3xl md:text-4xl font-bold mb-4">Testing Session Selesai!</h1><p className="text-lg opacity-90 max-w-2xl mx-auto">Terima kasih telah berpartisipasi. Data Anda telah berhasil direkam.</p></div>
            <div className="p-8">
              <div className="mb-8"><h2 className="text-2xl font-bold text-gray-800 mb-6">Ringkasan Session</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"><div className="bg-blue-50 p-6 rounded-xl"><div className="text-sm text-blue-600 font-medium mb-2">Total Tasks</div><div className="text-3xl font-bold text-gray-800">{totalTasksCompleted}</div></div><div className="bg-green-50 p-6 rounded-xl"><div className="text-sm text-green-600 font-medium mb-2">Success Rate</div><div className="text-3xl font-bold text-gray-800">{successRate.toFixed(1)}%</div></div><div className="bg-purple-50 p-6 rounded-xl"><div className="text-sm text-purple-600 font-medium mb-2">Total Waktu</div><div className="text-3xl font-bold text-gray-800">{Math.floor(totalTime/60)}:{String(totalTime%60).padStart(2,'0')}</div></div><div className="bg-red-50 p-6 rounded-xl"><div className="text-sm text-red-600 font-medium mb-2">Total Errors</div><div className="text-3xl font-bold text-gray-800">{totalErrors}</div></div></div><div className="bg-gray-50 rounded-xl p-6"><h3 className="font-medium text-gray-700 mb-4">Detail Session</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><div className="text-sm text-gray-500">Responden ID</div><div className="font-mono text-lg font-bold">#{respondenId?.toString().padStart(4,'0')}</div></div><div><div className="text-sm text-gray-500">Platform</div><div className="font-medium">{platforms.find(p=>p.id.toString()===respondenData.platformId)?.name}</div></div><div><div className="text-sm text-gray-500">Rata-rata Skor SUS</div><div className="font-bold text-xl">{averageSUS.toFixed(1)} <span className="text-gray-400">/ 5.0</span></div></div><div><div className="text-sm text-gray-500">Kuesioner UEQ</div><div className="font-medium">Telah diisi ({Object.keys(ueqAnswers).length} pertanyaan)</div></div><div><div className="text-sm text-gray-500">Selesai Pada</div><div className="font-medium">{new Date().toLocaleString('id-ID')}</div></div></div></div></div>
              <div className="pt-6 border-t border-gray-200"><div className="flex flex-col sm:flex-row gap-4"><button onClick={() => router.push('/dashboard')} className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center">Ke Dashboard</button><button onClick={handleResetSession} className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center">Mulai Session Baru</button></div><div className="mt-6 text-center"><p className="text-sm text-gray-500">Data penelitian ini akan digunakan untuk evaluasi User Experience (UX). Terima kasih!</p></div></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}