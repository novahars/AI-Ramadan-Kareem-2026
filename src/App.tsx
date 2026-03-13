/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from '@supabase/supabase-js';
import {
  Utensils,
  Heart,
  Copy,
  Check,
  Sparkles,
  Moon,
  Coins,
  Zap,
  BookOpen,
  Quote,
  CheckCircle2,
  XCircle,
  Search,
  ArrowRight,
  Headphones,
  LogIn,
  LogOut,
  User,
  Play,
  Pause,
  Volume2,
  Loader2,
  Clock,
  Fingerprint,
  Share2,
  ChevronRight,
  X,
  Calendar
} from 'lucide-react';

// --- Supabase Initialization ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

// --- Data & Types ---

interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string;
  time: string;
}

const RECIPES: Recipe[] = [
  {
    id: '1',
    name: 'Omelet Sayur Kilat',
    ingredients: ['telur', 'bayam', 'bawang', 'egg', 'spinach', 'onion'],
    instructions: 'Kocok telur, masukkan bayam dan bawang cincang. Goreng di teflon panas selama 5 menit. Sajikan hangat.',
    time: '5 min'
  },
  {
    id: '2',
    name: 'Ayam Tumis Kecap Cepat',
    ingredients: ['ayam', 'kecap', 'bawang putih', 'chicken', 'soy sauce', 'garlic'],
    instructions: 'Potong ayam kecil-kecil. Tumis bawang putih, masukkan ayam. Tambahkan kecap manis dan sedikit air. Masak hingga matang (10 menit).',
    time: '12 min'
  },
  {
    id: '3',
    name: 'Smoothie Kurma Pisang',
    ingredients: ['kurma', 'pisang', 'susu', 'dates', 'banana', 'milk'],
    instructions: 'Blender semua bahan hingga halus. Cocok untuk energi instan saat sahur.',
    time: '3 min'
  },
  {
    id: '4',
    name: 'Nasi Goreng Telur Sederhana',
    ingredients: ['nasi', 'telur', 'bawang', 'rice', 'egg', 'onion'],
    instructions: 'Tumis bawang, masukkan telur orak-arik. Masukkan nasi, beri garam dan merica. Aduk rata.',
    time: '8 min'
  },
  {
    id: '5',
    name: 'Sayur Bening Bayam Jagung',
    ingredients: ['bayam', 'jagung', 'bawang merah', 'spinach', 'corn', 'shallot'],
    instructions: 'Rebus air, masukkan bawang merah dan jagung. Setelah jagung empuk, masukkan bayam. Beri garam dan gula.',
    time: '10 min'
  }
];

const MOODS = [
  { emoji: '⚡', label: 'Semangat', color: 'text-yellow-400', message: '"Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya." (QS. Al-Baqarah: 286)', quote: 'Teruslah bersemangat, pahala besar menantimu!' },
  { emoji: '😴', label: 'Lemas', color: 'text-blue-300', message: '"Maka sesungguhnya bersama kesulitan ada kemudahan." (QS. Al-Insyirah: 5)', quote: 'Istirahat sejenak itu perlu, niatkan tidurmu sebagai ibadah.' },
  { emoji: '🎯', label: 'Fokus', color: 'text-emerald-400', message: '"Dan barangsiapa bertawakal kepada Allah, niscaya Allah akan mencukupkan (keperluan)nya." (QS. At-Talaq: 3)', quote: 'Gunakan fokusmu untuk memperbanyak tilawah hari ini.' },
  { emoji: '🙏', label: 'Tenang', color: 'text-purple-300', message: '"Ingatlah, hanya dengan mengingati Allah hati menjadi tenteram." (QS. Ar-Ra\'d: 28)', quote: 'Pertahankan ketenangan ini dengan dzikir pagi dan petang.' },
];

const HADITHS = [
  {
    arabic: 'خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ',
    latin: 'Khairun-naasi anfa\'uhum lin-naas',
    translation: '"Sebaik-baik manusia adalah yang paling bermanfaat bagi orang lain."',
    source: 'HR. Ahmad',
    topic: 'manfaat puasa ramadan kebaikan',
  },
  {
    arabic: 'مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ',
    latin: 'Man shaama ramadhaana iimaanan wahtisaaban ghufira lahu maa taqaddama min dzanbih',
    translation: '"Barangsiapa yang berpuasa Ramadan karena iman dan mengharap pahala, maka diampuni dosa-dosanya yang telah lalu."',
    source: 'HR. Bukhari & Muslim',
    topic: 'puasa'
  },
  {
    arabic: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
    latin: 'Tabassumuka fii wajhi akhiika laka shadaqah',
    translation: '"Senyummu di hadapan saudaramu adalah sedekah."',
    source: 'HR. Tirmidzi',
    topic: 'sedekah'
  },
  {
    arabic: 'الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى',
    latin: 'Al-yadul \'ulya khairun minal-yadis sufla',
    translation: '"Tangan di atas lebih baik daripada tangan di bawah."',
    source: 'HR. Bukhari',
    topic: 'sedekah'
  },
  {
    arabic: 'أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ تَرَاهُ فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ',
    latin: 'An ta\'budallaaha ka-annaka taraahu fa-in lam takun taraahu fa-innahu yaraak',
    translation: '"Beribadahlah seolah-olah kamu melihat Allah, jika tidak melihat-Nya, sesungguhnya Dia melihatmu."',
    source: 'HR. Muslim',
    topic: 'ibadah'
  },
  {
    arabic: 'الصِّيَامُ جُنَّةٌ فَلاَ يَرْفُثْ وَلاَ يَجْهَلْ',
    latin: 'Ash-shiyaamu junnatun falaa yarfuts walaa yajhal',
    translation: '"Puasa itu perisai, maka janganlah berkata kotor dan jangan berbuat jahil."',
    source: 'HR. Bukhari',
    topic: 'puasa'
  }
];

const MUROTTAL_LINKS: Record<number, string> = {
  1: "https://j.mp/2b8SiNO",
  2: "https://j.mp/2b8RJmQ",
  3: "https://j.mp/2bFSrtF",
  4: "https://j.mp/2b8SXi3",
  5: "https://j.mp/2b8RZm3",
  6: "https://j.mp/28MBohs",
  7: "https://j.mp/2bFRIZC",
  8: "https://j.mp/2bufF7o",
  9: "https://j.mp/2byr1bu",
  10: "https://j.mp/2bHfyUH",
  11: "https://j.mp/2bHf80y",
  12: "https://j.mp/2bWnTby",
  13: "https://j.mp/2bFTiKQ",
  14: "https://j.mp/2b8SUTA",
  15: "https://j.mp/2bFRQIM",
  16: "https://j.mp/2b8SegG",
  17: "https://j.mp/2brHsFz",
  18: "https://j.mp/2b8SCfc",
  19: "https://j.mp/2bFSq95",
  20: "https://j.mp/2brI1zc",
  21: "https://j.mp/2b8VcBO",
  22: "https://j.mp/2bFRxNP",
  23: "https://j.mp/2brItxm",
  24: "https://j.mp/2brHKw5",
  25: "https://j.mp/2brImlf",
  26: "https://j.mp/2bFRHF2",
  27: "https://j.mp/2bFRXno",
  28: "https://j.mp/2brI3ai",
  29: "https://j.mp/2bFRyBF",
  30: "https://j.mp/2bFREcc"
};

const DOA_RAMADAN = [
  { title: "Doa Buka Puasa", arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ", translation: "Telah hilang rasa haus, telah basah urat-urat, dan telah tetap pahala, insya Allah." },
  { title: "Niat Puasa Ramadan", arabic: "نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانَ هَذِهِ السَّنَةِ لِلَّهِ تَعَالَى", translation: "Aku niat berpuasa esok hari untuk menunaikan kewajiban bulan Ramadan tahun ini karena Allah Ta'ala." },
  { title: "Doa Lailatul Qadar", arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي", translation: "Ya Allah, sesungguhnya Engkau Maha Pengampun dan menyukai ampunan, maka ampunilah aku." },
  { title: "Doa Berbuka (Versi Lain)", arabic: "اَللّهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ", translation: "Ya Allah, untuk-Mu aku berpuasa, kepada-Mu aku beriman, dan dengan rezeki-Mu aku berbuka." },
];

const PRAYER_TIMES = {
  imsak: "04:32",
  subuh: "04:42",
  dzuhur: "12:05",
  ashar: "15:15",
  maghrib: "18:08",
  isya: "19:17"
};

const DEFAULT_NISAB_GOLD = 258825000; // Fallback nisab

// --- AI Service ---
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const ramadanAISystemInstruction = `
Kamu adalah LisanulHaq Intelligence.
Misi Utama: Menjadi asisten spiritual & kesehatan yang empati, ringkas, dan akurat.

Response Protocols (Strict):

1. Kategori EMOSI (Priority):
   - Deteksi kata kunci: sedih, marah, kesal, gagal, stres.
   - Alur: [Empati] + [1 Hadits Pendek] + [1 Tips Sunnah Praktis].
   - Nada: Menenangkan & suportif (Warm).
   - Mapping JSON: Masukkan [Empati] dan [Tips Sunnah] ke field "explanation". Hadits ke field "arabic" dan "translation".

2. Kategori HADITS:
   - Format Konten: [Perawi] | [Teks Arab (Gunakan harakat)] | [Terjemahan] | [Syarah Singkat (Max 2 kalimat)].
   - Anti-Halusinasi: Jika tidak ditemukan/ragu, gunakan pesan: "Mohon maaf Kak, saya tidak menemukan referensi hadits yang cukup kuat untuk hal tersebut."
   - Mapping JSON: "source"=[Perawi], "arabic"=[Teks Arab], "translation"=[Terjemahan], "explanation"=[Syarah Singkat].

3. Kategori RESEP THAYYIB:
   - Format Konten: [Nama Menu] | [Bahan Utama] | [Cara Singkat] | [Sisi Medis & Sunnah].
   - Syarat: Sehat (minim gula pasir/minyak jenuh).
   - Mapping JSON: "arabic"=[Nama Menu], "latin"=[Bahan Utama], "translation"=[Cara Singkat], "source"=[Sisi Medis & Sunnah].

Aturan Teknis:
- Max Words: 150 kata per respons.
- Language: Bahasa Indonesia modern (Kak/Saudaraku).
- Formatting: Gunakan Bold untuk poin penting dan Bullet Points.
- Out-of-Scope: Jika user tanya di luar Islam, kesehatan, atau motivasi, jawab: "Mohon maaf Kak, LisanulHaq fokus pada kesehatan dan spiritualitas Islam. Ada yang bisa saya bantu terkait hal tersebut?" (Masukkan pesan ini ke field "explanation" dan set "type" ke "hadith").
- No Chatty: Jangan bertele-tele di pembukaan. Langsung ke solusi.

FORMAT OUTPUT (WAJIB JSON):
{
  "type": "recipe" atau "hadith",
  "content": {
    "arabic": "string",
    "latin": "string",
    "translation": "string",
    "source": "string",
    "explanation": "string"
  }
}
`;

// --- Components ---

const Card = ({ children, title, icon: Icon, delay = 0 }: { children: React.ReactNode, title: string, icon: any, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="glass-card rounded-[2rem] p-8 flex flex-col h-full relative overflow-hidden group border border-gold/20 shadow-2xl"
  >
    <div className="absolute -right-6 -top-6 w-32 h-32 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/15 transition-all duration-700" />
    <div className="flex items-center gap-4 mb-8">
      <div className="p-4 bg-gold/15 rounded-2xl text-gold shadow-inner">
        <Icon size={28} />
      </div>
      <h2 className="text-2xl font-bold text-[#F5F5F5] tracking-tight">{title}</h2>
    </div>
    <div className="flex-1 flex flex-col">
      {children}
    </div>
  </motion.div>
);

export default function App() {
  // Auth State
  const [user, setUser] = useState<any>(null);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  // Ref to track if we are currently loading data from cloud to prevent writing it back immediately
  const isInitialLoadRef = useRef(true);

  // AI State
  const [isHadithLoading, setIsHadithLoading] = useState(false);
  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Murottal State
  const [isPlayingMurottal, setIsPlayingMurottal] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [murottalError, setMurottalError] = useState<string | null>(null);
  const murottalRef = useRef<HTMLAudioElement | null>(null);
  const [murottalLink, setMurottalLink] = useState('');

  // Favorites State
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Recipe State
  const [ingredients, setIngredients] = useState('');
  const [matchedRecipe, setMatchedRecipe] = useState<{
    name: string;
    instructions: string;
    time: string;
    source: string;
    reason: string;
  } | null>(null);
  const [copiedRecipe, setCopiedRecipe] = useState(false);

  // Zakat State
  const [savingsInput, setSavingsInput] = useState<string>('');
  const [copiedZakat, setCopiedZakat] = useState(false);
  const [goldPrice, setGoldPrice] = useState<number>(0);
  const [isGoldLoading, setIsGoldLoading] = useState(true);

  // Vibe State
  const [selectedMood, setSelectedMood] = useState<typeof MOODS[0] | null>(null);

  // Ibadah Tracker State
  const [currentJuz, setCurrentJuz] = useState<number>(() => {
    const saved = localStorage.getItem('ramadan_juz');
    return saved ? Number(saved) : 0;
  });
  const [tarawihNights, setTarawihNights] = useState<number>(() => {
    const saved = localStorage.getItem('ramadan_tarawih');
    return saved ? Number(saved) : 0;
  });

  // New Features State
  const [showTasbih, setShowTasbih] = useState(false);
  const [tasbihCount, setTasbihCount] = useState(0);
  const [showDoa, setShowDoa] = useState(false);
  const [showImsakiyahDetails, setShowImsakiyahDetails] = useState(false);

  // --- Global Hijriah Sync ---
  const hijriDate = useMemo(() => {
    const today = new Date();
    
    // Get Hijriah parts (day, month index, year)
    const numericFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-uma-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    const numericParts = numericFormatter.formatToParts(today);
    const day = parseInt(numericParts.find(p => p.type === 'day')?.value || '1');
    const monthIndex = parseInt(numericParts.find(p => p.type === 'month')?.value || '1');
    const year = parseInt(numericParts.find(p => p.type === 'year')?.value || '1447');

    // Get Hijriah month name in Indonesian
    const nameFormatter = new Intl.DateTimeFormat('id-u-ca-islamic-uma-nu-latn', {
      month: 'long'
    });
    const monthName = nameFormatter.format(today);

    return { day, monthName, monthIndex, year };
  }, []);

  const hijriGreeting = useMemo(() => {
    const { day, monthIndex, year, monthName } = hijriDate;
    
    if (monthIndex === 9) { // Ramadan
      return {
        title: `Ramadan Kareem ${year}H`,
        subtitle: "Selamat Menunaikan Ibadah Puasa"
      };
    } else if (monthIndex === 10 && day >= 1 && day <= 3) { // Syawal 1-3
      return {
        title: `Selamat Hari Raya Idul Fitri ${year}H`,
        subtitle: "Taqabbalallahu Minna Wa Minkum"
      };
    } else if (monthIndex === 12 && day >= 10 && day <= 13) { // Dzulhijjah 10-13
      return {
        title: "Selamat Hari Raya Idul Adha",
        subtitle: `10-13 ${monthName} ${year}H`
      };
    } else {
      return {
        title: `Selamat Menjalani Aktivitas`,
        subtitle: `Bulan ${monthName} ${year}H`
      };
    }
  }, [hijriDate]);

  const scheduleTitle = useMemo(() => {
    return hijriDate.monthIndex === 9 ? "Jadwal Imsakiyah" : "Jadwal Shalat Harian";
  }, [hijriDate]);

  // Hadith State
  const [hadithSearch, setHadithSearch] = useState('');
  const [randomHadith, setRandomHadith] = useState(HADITHS[0]);
  const [aiHadith, setAiHadith] = useState<{
    arabic: string;
    latin: string;
    translation: string;
    source: string;
    reason: string;
  } | null>(null);

  // --- Auth & Sync Logic ---

  useEffect(() => {
    if (!supabase) return;

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);

      if (event === 'SIGNED_IN' && newUser) {
        // Reset fetch state to trigger a fresh fetch from cloud.
        // The fetchCloudData effect will handle the "Cloud Wins" logic.
        setIsDataFetched(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    if (!supabase) {
      alert("Supabase belum dikonfigurasi. Silakan atur VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di environment variables.");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const logout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Logout error:", err);
      }
    }
    // Clear local data on logout for privacy/security
    localStorage.removeItem('ramadan_juz');
    localStorage.removeItem('ramadan_tarawih');
    setCurrentJuz(0);
    setTarawihNights(0);
    setSelectedMood(null);

    setUser(null);
    setIsDataFetched(false);
  };

  const syncDataToCloud = async (activeUserOverride?: any) => {
    const activeUser = activeUserOverride || user || (supabase ? (await supabase.auth.getUser()).data.user : null);
    if (!activeUser || !supabase) return;

    // Read directly from state or localstorage to get most recent values
    const juzToSync = activeUserOverride ? Number(localStorage.getItem('ramadan_juz') || 0) : currentJuz;
    const tarawihToSync = activeUserOverride ? Number(localStorage.getItem('ramadan_tarawih') || 0) : tarawihNights;

    try {
      await supabase
        .from('user_data')
        .upsert({
          id: activeUser.id,
          juz: juzToSync,
          tarawih: tarawihToSync,
          mood: selectedMood?.label,
          updated_at: new Date().toISOString()
        });
    } catch (e) {
      console.error("Sync catch error:", e);
    }
  };

  // Fetch Cloud Data
  useEffect(() => {
    const fetchCloudData = async () => {
      if (!user?.id || !supabase || isDataFetched || isFetchingData) return;

      setIsFetchingData(true);
      isInitialLoadRef.current = true; // Mark as initial load to block auto-sync

      try {
        const { data, error } = await supabase
          .from('user_data')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          // CLOUD WINS: Update local state from cloud
          setCurrentJuz(data.juz);
          setTarawihNights(data.tarawih);
          if (data.mood) {
            const moodObj = MOODS.find(m => m.label === data.mood);
            if (moodObj) setSelectedMood(moodObj);
          }
          setIsDataFetched(true);
        } else if (error && (error.code === 'PGRST116' || error.message?.includes('0 rows'))) {
          // NEW USER: No data in cloud yet. Sync local data to cloud for the first time.
          await syncDataToCloud(user);
          setIsDataFetched(true);
        }
      } catch (e) {
        console.error("Fetch error:", e);
      } finally {
        setIsFetchingData(false);
        // Allow sync after a delay to let state settle
        setTimeout(() => {
          isInitialLoadRef.current = false;
        }, 1000);
      }
    };
    fetchCloudData();
  }, [user?.id, isDataFetched, isFetchingData]);

  // Persist Ibadah to LocalStorage and Cloud
  useEffect(() => {
    localStorage.setItem('ramadan_juz', currentJuz.toString());
    localStorage.setItem('ramadan_tarawih', tarawihNights.toString());

    // Only sync to cloud if logged in AND not currently performing initial load/fetch
    if (user?.id && supabase && !isInitialLoadRef.current && !isFetchingData) {
      const timer = setTimeout(() => {
        syncDataToCloud();
      }, 3000); // Debounce sync to 3 seconds to be more conservative with API usage
      return () => clearTimeout(timer);
    }
  }, [currentJuz, tarawihNights, selectedMood, user?.id, isFetchingData]);

  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * HADITHS.length);
    setRandomHadith(HADITHS[randomIdx]);
  }, []);

  useEffect(() => {
    const fetchGoldPrice = async () => {
      setIsGoldLoading(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        // Try primary API
        try {
          const res = await fetch('https://logam-mulia-api.vercel.app/prices/antam', {
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            if (data?.data?.[0]?.price) {
              setGoldPrice(data.data[0].price);
              setIsGoldLoading(false);
              return;
            }
          }
        } catch (primaryError) {
          console.log("Primary gold API failed, trying secondary...");
        }

        // Secondary API or Fallback
        setGoldPrice(3171000);
      } catch (e) {
        // Silent fallback to avoid console noise if it's a common network issue
        setGoldPrice(3171000);
      } finally {
        setIsGoldLoading(false);
      }
    };
    fetchGoldPrice();
  }, []);

  // --- Logic ---

  const formatNumber = (val: string) => {
    const num = val.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleSavingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value);
    setSavingsInput(formatted);
  };

  const savingsValue = useMemo(() => {
    return Number(savingsInput.replace(/\./g, '')) || 0;
  }, [savingsInput]);

  // Fetch Favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user?.id || !supabase) return;
      setIsFavoritesLoading(true);
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data && !error) {
          setFavorites(data);
        }
      } catch (e) {
        console.error("Fetch favorites error:", e);
      } finally {
        setIsFavoritesLoading(false);
      }
    };
    fetchFavorites();
  }, [user?.id]);

  const toggleFavorite = async (type: 'hadith' | 'recipe', content: any) => {
    if (!user?.id || !supabase) {
      alert("Silakan login untuk menyimpan favorit.");
      return;
    }

    const existing = favorites.find(f => f.type === type && JSON.stringify(f.content) === JSON.stringify(content));

    if (existing) {
      // Remove
      const { error } = await supabase.from('favorites').delete().eq('id', existing.id);
      if (!error) {
        setFavorites(favorites.filter(f => f.id !== existing.id));
      }
    } else {
      // Add
      const { data, error } = await supabase.from('favorites').insert({
        user_id: user.id,
        type,
        content,
        created_at: new Date().toISOString()
      }).select().single();

      if (data && !error) {
        setFavorites([data, ...favorites]);
      }
    }
  };

  const isFavorited = (type: 'hadith' | 'recipe', content: any) => {
    return favorites.some(f => f.type === type && JSON.stringify(f.content) === JSON.stringify(content));
  };

  const speakSequence = (arabic: string, translation: string, source: string, onFinish?: () => void) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const arabicUtterance = new SpeechSynthesisUtterance(arabic);
      arabicUtterance.lang = 'ar-SA';
      arabicUtterance.rate = 0.64; // Normal speed for Arabic

      const translationUtterance = new SpeechSynthesisUtterance(`${translation}. Hadits Riwayat ${source}`);
      translationUtterance.lang = 'id-ID';
      translationUtterance.rate = 1.05; // Keep Indonesian speed

      if (onFinish) {
        translationUtterance.onend = onFinish;
      }

      window.speechSynthesis.speak(arabicUtterance);
      window.speechSynthesis.speak(translationUtterance);
    } else {
      alert("Maaf, browser Anda tidak mendukung fitur suara.");
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
  };

  const callRamadanAI = async (prompt: string, setLoading: (l: boolean) => void) => {
    setLoading(true);
    setAiError(null);
    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: ramadanAISystemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              content: {
                type: Type.OBJECT,
                properties: {
                  "arabic": { type: Type.STRING },
                  "latin": { type: Type.STRING },
                  "translation": { type: Type.STRING },
                  "source": { type: Type.STRING },
                  "explanation": { type: Type.STRING }
                },
                required: ["arabic", "latin", "translation", "source", "explanation"]
              }
            },
            required: ["type", "content"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from AI");
      return JSON.parse(text);
    } catch (error) {
      console.error("AI Error:", error);
      setAiError("Gagal menghubungi Ramadan Intelligence Engine. Coba lagi nanti.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const findRecipe = async () => {
    if (!ingredients.trim()) return;
    const moodContext = selectedMood ? `User sedang merasa ${selectedMood.label}. ` : "";
    const data = await callRamadanAI(`${moodContext}Berikan resep sahur/buka berdasarkan input ini: ${ingredients}`, setIsRecipeLoading);
    if (data && data.type === 'recipe') {
      const newRecipe = {
        name: data.content["arabic"],
        instructions: data.content["translation"],
        time: "< 20 min",
        source: data.content["source"],
        reason: data.content["explanation"]
      };
      setMatchedRecipe(newRecipe);
      speakSequence(newRecipe.name, newRecipe.instructions, data.content["source"], () => {
        if (!user) setShowLoginPrompt(true);
      });
    }
  };

  const searchHadithAI = async () => {
    if (!hadithSearch.trim()) return;
    const moodContext = selectedMood ? `User sedang merasa ${selectedMood.label}. ` : "";
    const data = await callRamadanAI(`${moodContext}Cari hadits shahih yang relevan dengan topik: ${hadithSearch}`, setIsHadithLoading);
    if (data && data.type === 'hadith') {
      const newHadith = {
        arabic: data.content["arabic"],
        latin: data.content["latin"],
        translation: data.content["translation"],
        source: data.content["source"],
        reason: data.content["explanation"]
      };
      setAiHadith(newHadith);
      speakSequence(newHadith.arabic, newHadith.translation, newHadith.source, () => {
        if (!user) setShowLoginPrompt(true);
      });
    }
  };

  const toggleMurottal = () => {
    if (!murottalRef.current) return;
    if (isPlayingMurottal) {
      murottalRef.current.pause();
    } else {
      murottalRef.current.play();
    }
    setIsPlayingMurottal(!isPlayingMurottal);
  };

  const playJuz = async (juz: number) => {
    const link = MUROTTAL_LINKS[juz];
    if (!link || !murottalRef.current) return;

    // Jika klik juz yang sama, cukup toggle play/pause tanpa reload (agar tidak kembali ke awal)
    if (murottalLink === link) {
      if (isPlayingMurottal) {
        murottalRef.current.pause();
        setIsPlayingMurottal(false);
      } else {
        try {
          await murottalRef.current.play();
          setIsPlayingMurottal(true);
        } catch (err) {
          console.error("Resume failed:", err);
          // Jika gagal resume, coba load ulang
          await startNewPlayback(link);
        }
      }
      return;
    }

    // Jika juz berbeda, mulai playback baru
    await startNewPlayback(link);
  };

  const startNewPlayback = async (link: string) => {
    if (!murottalRef.current) return;
    try {
      setIsBuffering(true);
      setMurottalLink(link);

      // 1. Set source secara manual ke element
      murottalRef.current.src = link;

      // 2. Load audio secara eksplisit
      murottalRef.current.load();

      // 3. Tunggu sebentar agar browser memproses load sebelum play
      await new Promise((resolve) => setTimeout(resolve, 100));

      await murottalRef.current.play();
      setIsPlayingMurottal(true);
      setMurottalError(null);
    } catch (err: any) {
      console.error("Playback failed:", err);
      if (err.name !== 'AbortError') {
        setMurottalError("Gagal memutar audio.");
      }
      setIsPlayingMurottal(false);
    }
  };

  const nisabValue = useMemo(() => {
    return goldPrice > 0 ? goldPrice * 85 : DEFAULT_NISAB_GOLD;
  }, [goldPrice]);

  // Modifikasi di sini:
  const zakatMaal = useMemo(() => {
    // Jika tabungan kurang dari nisab, maka zakatnya 0
    if (savingsValue < nisabValue) {
      return 0;
    }
    // Jika sudah mencapai atau lebih, hitung 2.5%
    return savingsValue * 0.025;
  }, [savingsValue, nisabValue]);

  const dailySedekah = useMemo(() => savingsValue > 0 ? (savingsValue * 0.01) / 30 : 0, [savingsValue]);

  const isWajibZakat = savingsValue >= nisabValue;

  const ramadanPhase = useMemo(() => {
    if (tarawihNights <= 10) return { title: "Fase Rahmah", color: "text-emerald-400" };
    if (tarawihNights <= 20) return { title: "Fase Maghfirah", color: "text-[#FFD700]" };
    return { title: "Itqum minannar", color: "text-orange-400" };
  }, [tarawihNights]);

  const filteredHadith = useMemo(() => {
    if (!hadithSearch.trim()) return randomHadith;

    const searchWords = hadithSearch.toLowerCase().split(/\s+/); // Pecah input jadi kata-kata (manfaat, bulan, puasa)

    // Gunakan .filter() lalu ambil yang paling atas supaya lebih akurat
    const results = HADITHS.filter(h => {
      const textContent = (h.topic + " " + h.translation.toLowerCase() + " " + h.source.toLowerCase());

      // Cek apakah SETIDAKNYA ada satu kata kunci yang cocok (Or use .every if you want stricter)
      return searchWords.some(word => textContent.includes(word));
    });

    return results.length > 0 ? results[0] : randomHadith;
  }, [hadithSearch, randomHadith]);
  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-islamic-green-dark text-[#F5F5F5] font-sans selection:bg-gold/30 scroll-smooth">

      {/* Imsakiyah Bar (Now includes Auth) */}
      <div className="sticky top-0 z-[100] w-full bg-islamic-green-dark/95 backdrop-blur-2xl border-b border-gold/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between overflow-x-auto no-scrollbar gap-8">
          <div className="flex items-center gap-3 whitespace-nowrap">
            <Clock size={24} className="text-gold" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/80 leading-none">Waktu</span>
              <span className="text-sm font-black uppercase tracking-widest text-gold leading-none mt-1">{scheduleTitle}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-10">
            {Object.entries(PRAYER_TIMES).map(([name, time]) => (
              <div key={name} className="flex flex-col items-center min-w-[60px]">
                <span className="text-[10px] uppercase font-black text-islamic-green-dark bg-gold px-3 py-1 rounded-full tracking-widest leading-none mb-2 shadow-lg shadow-gold/20">{name}</span>
                <span className="text-xl font-black text-white leading-none tracking-tighter">{time}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Auth Section Inside Nav */}
            <div className="flex items-center gap-3">
              {user && (
                <button
                  onClick={() => setShowFavorites(!showFavorites)}
                  className="p-2.5 bg-white/5 border border-gold/20 rounded-full text-gold hover:bg-gold/10 transition-all"
                  title="Favorit Saya"
                >
                  <Heart size={18} fill={showFavorites ? "currentColor" : "none"} />
                </button>
              )}
              {user ? (
                <div className="flex items-center gap-2 bg-white/5 border border-gold/20 p-1.5 pl-3 rounded-full">
                  <div className="text-right hidden lg:block">
                    <p className="text-[9px] uppercase font-black text-gold tracking-widest leading-none">Connected</p>
                    <p className="text-[11px] font-bold text-white truncate max-w-[80px] leading-none mt-1">{user.user_metadata?.full_name || user.email}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-gold overflow-hidden bg-gold/20 flex items-center justify-center">
                    {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} className="text-gold" />
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      logout();
                    }}
                    className="p-2 hover:bg-red-500/20 text-white hover:text-red-400 rounded-full transition-all"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={loginWithGoogle}
                  className="flex items-center gap-2 bg-gold text-islamic-green-dark px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gold-light transition-all shadow-lg"
                >
                  <LogIn size={14} />
                  Login
                </button>
              )}
            </div>

            <button 
              onClick={() => setShowImsakiyahDetails(true)}
              className="p-2.5 bg-white/5 hover:bg-gold/10 rounded-2xl text-gold transition-all border border-gold/20"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 1. Hero Section: Branding (Separate Section) */}
      <section className="relative pt-24 pb-12 flex flex-col items-center justify-center px-4 overflow-hidden bg-gradient-to-b from-islamic-green-dark to-islamic-green-dark/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl w-full text-center space-y-6 relative z-10"
        >
          <div className="space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <Moon className="text-gold w-12 h-12 gold-glow" />
            </motion.div>
            <div className="space-y-1">
              <h2 className="text-3xl md:text-4xl font-serif text-[#FFD700] tracking-tight italic">
                LisanulHaq
              </h2>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
                {hijriGreeting.title}
              </h1>
            </div>
            <p className="text-gold-light font-bold tracking-[0.4em] uppercase text-sm md:text-base">
              {hijriGreeting.subtitle}
            </p>
          </div>
        </motion.div>
      </section>

      {/* 2. Main Content Section: Quick Menu & Search */}
      <section className="relative pt-12 pb-20 flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 border border-gold rounded-full animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 border border-gold rounded-full animate-pulse delay-700" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl w-full text-center space-y-12 relative z-10"
        >
          {/* Quick Menu Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto w-full">
            <button 
              onClick={() => document.getElementById('juz-tracker')?.scrollIntoView({ behavior: 'smooth' })}
              className="glass-card p-5 rounded-[2rem] border border-gold/20 flex flex-col items-center gap-3 hover:bg-gold/10 transition-all group shadow-xl"
            >
              <div className="p-3 bg-gold/10 rounded-2xl text-gold group-hover:scale-110 transition-transform">
                <BookOpen size={20} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80">Juz Tracker</span>
            </button>
            <button 
              onClick={() => document.getElementById('tarawih-tracker')?.scrollIntoView({ behavior: 'smooth' })}
              className="glass-card p-5 rounded-[2rem] border border-gold/20 flex flex-col items-center gap-3 hover:bg-gold/10 transition-all group shadow-xl"
            >
              <div className="p-3 bg-gold/10 rounded-2xl text-gold group-hover:scale-110 transition-transform">
                <Moon size={20} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80">Tarawih</span>
            </button>
            <button 
              onClick={() => setShowDoa(true)}
              className="glass-card p-5 rounded-[2rem] border border-gold/20 flex flex-col items-center gap-3 hover:bg-gold/10 transition-all group shadow-xl"
            >
              <div className="p-3 bg-gold/10 rounded-2xl text-gold group-hover:scale-110 transition-transform">
                <Sparkles size={20} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80">Kumpulan Doa</span>
            </button>
            <button 
              onClick={() => setShowTasbih(true)}
              className="glass-card p-5 rounded-[2rem] border border-gold/20 flex flex-col items-center gap-3 hover:bg-gold/10 transition-all group shadow-xl"
            >
              <div className="p-3 bg-gold/10 rounded-2xl text-gold group-hover:scale-110 transition-transform">
                <Fingerprint size={20} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80">Tasbih Digital</span>
            </button>
          </div>

          {/* Hadith Search */}
          <div className="max-w-md mx-auto relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50 group-focus-within:text-gold transition-colors" size={20} />
            <input
              type="text"
              value={hadithSearch}
              onChange={(e) => setHadithSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchHadithAI()}
              placeholder="Cari topik hadits (misal: puasa, sedekah)..."
              className="w-full bg-white/5 border border-gold/20 rounded-full py-4 pl-12 pr-20 text-[#F5F5F5] placeholder:text-white/20 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all shadow-xl"
            />
            <button
              onClick={searchHadithAI}
              disabled={isHadithLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gold text-islamic-green-dark rounded-full hover:bg-gold-light transition-all disabled:opacity-50"
            >
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Hadith Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={aiHadith ? aiHadith.arabic : randomHadith.arabic}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-gold/10 shadow-2xl relative"
            >
              {isHadithLoading && (
                <div className="absolute inset-0 bg-islamic-green-dark/40 backdrop-blur-sm rounded-[3rem] flex items-center justify-center z-20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                    <p className="text-gold font-black uppercase tracking-widest text-xs">Intelligence Engine Thinking...</p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="flex justify-center gap-4 mb-4">
                  <button
                    onClick={() => {
                      const h = aiHadith || randomHadith;
                      speakSequence(h.arabic, h.translation, h.source);
                    }}
                    className="p-2 bg-gold/10 text-gold rounded-full hover:bg-gold/20 transition-all"
                    title="Dengarkan"
                  >
                    <Headphones size={20} />
                  </button>
                  <button
                    onClick={stopSpeaking}
                    className="p-2 bg-red-500/10 text-red-400 rounded-full hover:bg-red-500/20 transition-all"
                    title="Berhenti"
                  >
                    <XCircle size={20} />
                  </button>
                  {user && (
                    <button
                      onClick={() => toggleFavorite('hadith', aiHadith || randomHadith)}
                      className="p-2 bg-gold/10 text-gold rounded-full hover:bg-gold/20 transition-all"
                      title="Simpan ke Favorit"
                    >
                      <Heart size={20} fill={isFavorited('hadith', aiHadith || randomHadith) ? "currentColor" : "none"} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const h = aiHadith || randomHadith;
                      copyToClipboard(`${h.arabic}\n\n${h.translation}\n\nSumber: ${h.source}`, () => {});
                    }}
                    className="p-2 bg-gold/10 text-gold rounded-full hover:bg-gold/20 transition-all"
                    title="Bagikan Kebaikan"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
                <p className="text-4xl md:text-5xl font-serif text-gold leading-loose dir-rtl text-center">
                  {aiHadith ? aiHadith.arabic : randomHadith.arabic}
                </p>
                <p className="text-lg md:text-xl text-gold-light italic font-medium">
                  {aiHadith ? aiHadith.latin : randomHadith.latin}
                </p>
                <div className="h-px w-24 bg-gold/30 mx-auto" />
                <p className="text-xl md:text-2xl text-[#F5F5F5] font-bold leading-relaxed max-w-2xl mx-auto">
                  {aiHadith ? (
                    <Markdown>{aiHadith.translation}</Markdown>
                  ) : randomHadith.translation}
                </p>
                <p className="text-sm text-gold font-bold mt-2">
                  ( {aiHadith ? aiHadith.source : randomHadith.source})
                </p>
                {aiHadith && (
                  <div className="bg-gold/10 p-4 rounded-2xl border border-gold/20 max-w-xl mx-auto text-left">
                    <p className="text-xs text-gold font-black uppercase tracking-widest mb-2">Hikmah & Penjelasan Ulama</p>
                    <div className="text-sm text-[#F5F5F5] leading-relaxed markdown-body">
                      <Markdown>{aiHadith.reason}</Markdown>
                    </div>
                  </div>
                )}
                <p className="text-sm text-gold font-black uppercase tracking-[0.2em]">
                  — {aiHadith ? "Ramadan Intelligence Engine" : randomHadith.source}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="pt-10"
          >
            <p className="text-[10px] uppercase font-black tracking-[0.5em] text-gold/40">Scroll Explore</p>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. Features Grid Section */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* 1. AI Smart Recipe */}
          <Card title="Healthy Sunnah Food" icon={Utensils} delay={0.1}>
            <p className="text-[#F5F5F5]/80 text-base mb-6">Punya bahan apa saja? Biar Kami yang carikan resep kilat ala baginda Rasulullah.</p>
            <div className="space-y-6 relative">
              {isRecipeLoading && (
                <div className="absolute inset-0 bg-islamic-green-dark/40 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-3 border-gold border-t-transparent rounded-full animate-spin" />
                    <p className="text-gold font-black uppercase tracking-widest text-[10px]">Thinking...</p>
                  </div>
                </div>
              )}
              <div className="relative group">
                <textarea
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="Misal: telur, bayam, ayam... atau curhat kondisi tubuhmu saat ini."
                  className="w-full bg-islamic-green-dark/50 border border-gold/20 rounded-2xl px-6 py-4 pr-20 text-[#F5F5F5] placeholder:text-white/20 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all min-h-[100px] resize-none"
                />
                <button
                  onClick={findRecipe}
                  disabled={isRecipeLoading}
                  className="absolute right-3 bottom-3 p-2.5 bg-gold text-islamic-green-dark rounded-xl hover:bg-gold-light hover:scale-110 active:scale-95 transition-all shadow-lg disabled:opacity-50"
                >
                  <Zap size={20} fill="currentColor" />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {matchedRecipe ? (
                  <motion.div
                    key={matchedRecipe.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white/5 rounded-3xl p-6 border border-white/10 shadow-inner space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-gold-light">{matchedRecipe.name}</h3>
                      <div className="flex items-center gap-2">
                        {user && (
                          <button
                            onClick={() => toggleFavorite('recipe', matchedRecipe)}
                            className="p-2 bg-gold/10 text-gold rounded-full hover:bg-gold/20 transition-all"
                            title="Simpan ke Favorit"
                          >
                            <Heart size={16} fill={isFavorited('recipe', matchedRecipe) ? "currentColor" : "none"} />
                          </button>
                        )}
                        <span className="text-xs bg-gold/20 text-gold px-3 py-1 rounded-full uppercase font-black tracking-wider">
                          {matchedRecipe.time}
                        </span>
                      </div>
                    </div>
                    <div className="text-base text-[#F5F5F5] leading-relaxed markdown-body">
                      <Markdown>{matchedRecipe.instructions}</Markdown>
                    </div>
                    <div className="bg-gold/10 p-4 rounded-2xl border border-gold/20">
                      <p className="text-xs text-gold font-black uppercase tracking-widest mb-1">Hikmah & Penjelasan Ulama</p>
                      <div className="text-sm text-[#F5F5F5] leading-relaxed markdown-body">
                        <Markdown>{matchedRecipe.reason}</Markdown>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`${matchedRecipe.name}\n\n${matchedRecipe.instructions}\n\nAI Reason: ${matchedRecipe.reason}`, setCopiedRecipe)}
                      className="flex items-center gap-2 text-xs font-black text-gold hover:text-gold-light transition-all uppercase tracking-widest group"
                    >
                      {copiedRecipe ? <Check size={16} /> : <Copy size={16} className="group-hover:rotate-12 transition-transform" />}
                      {copiedRecipe ? 'Tersalin!' : 'Salin Resep'}
                    </button>
                  </motion.div>
                ) : ingredients && !isRecipeLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-10 text-[#F5F5F5]/40 italic text-sm"
                  >
                    Tekan Enter atau klik petir untuk hasil cerdas...
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>

          {/* 2. Zakat & Sedekah Planner */}
          <Card title="Zakat Calculator " icon={Coins} delay={0.2}>
            <p className="text-[#F5F5F5]/80 text-base mb-6">Hitung kewajiban zakat maal.</p>
            <div className="space-y-6">
              <div>
                <label className="text-xs uppercase font-black text-gold-light tracking-[0.2em] mb-3 block">Total Tabungan (IDR)</label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gold font-black text-xl">Rp</span>
                  <input
                    type="text"
                    value={savingsInput}
                    onChange={handleSavingsChange}
                    placeholder="0"
                    className="w-full bg-islamic-green-dark/50 border border-gold/20 rounded-2xl pl-16 pr-6 py-4 text-[#F5F5F5] placeholder:text-white/20 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all text-2xl font-mono font-bold"
                  />
                </div>
                <div className="mt-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[11px] text-[#F5F5F5] italic leading-relaxed">
                    Nisab Zakat Maal setara 85g emas. {isGoldLoading ? 'Mengambil harga emas...' : `Harga emas: Rp ${goldPrice.toLocaleString('id-ID')}/gram.`}
                  </p>
                  <p className="text-[11px] text-[#FFD700] font-bold mt-1">
                    Total Nisab: Rp {nisabValue.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              <AnimatePresence>
                {savingsValue > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl p-4 flex items-center gap-4 border shadow-lg ${isWajibZakat ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'}`}
                  >
                    {isWajibZakat ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight">
                        {isWajibZakat ? 'Anda Wajib Zakat' : 'Belum Wajib Zakat'}
                      </p>
                      <p className="text-xs opacity-90">
                        {isWajibZakat ? 'Tabungan Anda telah mencapai nisab.' : 'Tetaplah bersedekah untuk keberkahan harta.'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className=" grid grid-cols-1 gap-6">
                <div className="bg-white/5 rounded-3xl p-5 border border-white/10 shadow-inner">
                  <p className="text-xs uppercase font-black text-gold-light mb-2 tracking-wider">Zakat Maal</p>
                  <p className="text-xl font-mono font-bold text-gold break-all ">Rp {zakatMaal.toLocaleString('id-ID')}</p>
                </div>
              </div>


              {savingsValue > 0 && (
                <button
                  onClick={() => copyToClipboard(`Simulasi Zakat & Sedekah Ramadan 2026:\nTotal Tabungan: Rp ${savingsInput}\nZakat Maal (2.5%): Rp ${zakatMaal.toLocaleString('id-ID')}\nTarget Sedekah Harian: Rp ${dailySedekah.toLocaleString('id-ID')}`, setCopiedZakat)}
                  className="w-full py-4 bg-gold text-islamic-green-dark hover:bg-gold-light rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] shadow-xl active:scale-95"
                >
                  {copiedZakat ? <Check size={18} /> : <Copy size={18} />}
                  {copiedZakat ? 'Hasil Tersalin!' : 'Salin Simulasi'}
                </button>
              )}
            </div>
          </Card>

          {/* 3. Ibadah Tracker */}
          <Card title="Ibadah Tracker" icon={BookOpen} delay={0.3}>
            <div id="juz-tracker" className="absolute -top-24" />
            <p className="text-[#F5F5F5]/80 text-base mb-8">Catat kemajuan tilawah dan tarawihmu. Targetkan khatam di bulan suci.</p>
            <div className="space-y-10 flex-1 flex flex-col justify-center">
              {/* Quran Tracker */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-[#FFD700]" />
                    <label className="text-sm uppercase font-black text-[#FFD700] tracking-[0.2em]">Progress Juz</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={currentJuz}
                      onChange={(e) => setCurrentJuz(Math.min(30, Math.max(0, Number(e.target.value))))}
                      className="w-16 bg-white/5 border border-[#FFD700]/30 rounded-lg py-1 px-2 text-center text-[#FFD700] font-bold focus:outline-none focus:border-[#FFD700]"
                    />
                    <span className="text-xl font-mono font-black text-[#FFD700]">/ 30</span>
                  </div>
                </div>

                <div className="relative">
                  <div className="bg-white/5 rounded-full h-4 p-1 border border-white/10 shadow-inner overflow-hidden">
                    <motion.div
                      className="h-full bg-[#FFD700] rounded-full shadow-[0_0_20px_rgba(255,215,0,0.6)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentJuz / 30) * 100}%` }}
                      transition={{ type: "spring", stiffness: 50 }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={currentJuz}
                    onChange={(e) => setCurrentJuz(Number(e.target.value))}
                    className="absolute inset-0 w-full h-4 opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex justify-between mt-3 px-1">
                    <span className="text-[10px] font-black text-[#FFD700]/40 uppercase">Awal</span>
                    <span className="text-[10px] font-black text-[#FFD700]/40 uppercase">Khatam</span>
                  </div>
                </div>

                {currentJuz > 0 && (
                  <div className="space-y-4">
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => playJuz(currentJuz)}
                      disabled={isBuffering}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-gold text-islamic-green-dark rounded-xl text-xs font-black hover:bg-gold-light transition-all uppercase tracking-widest shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isBuffering ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (murottalLink === MUROTTAL_LINKS[currentJuz] && isPlayingMurottal) ? (
                        <Pause size={14} />
                      ) : (
                        <Headphones size={14} />
                      )}
                      {isBuffering ? 'Memuat...' : 
                       (murottalLink === MUROTTAL_LINKS[currentJuz] && isPlayingMurottal) ? `Jeda Murottal Juz ${currentJuz}` :
                       (murottalLink === MUROTTAL_LINKS[currentJuz] && !isPlayingMurottal) ? `Lanjutkan Juz ${currentJuz}` :
                       `Putar Murottal Juz ${currentJuz}`}
                    </motion.button>

                    {/* Integrated Murottal Player */}
                    <AnimatePresence>
                      {(murottalLink || murottalError) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className={`bg-white/5 border ${murottalError ? 'border-red-500/50' : 'border-gold/20'} p-4 rounded-2xl flex flex-col gap-3`}
                        >
                          <div className="flex items-center gap-4">
                            <button
                              onClick={toggleMurottal}
                              disabled={!!murottalError}
                              className={`p-3 ${murottalError ? 'bg-gray-500' : 'bg-gold'} text-islamic-green-dark rounded-full hover:scale-110 transition-all shadow-lg`}
                            >
                              {isPlayingMurottal ? <Pause size={18} /> : <Play size={18} />}
                            </button>
                            <div className="flex-1 flex flex-col min-w-0">
                              <span className="text-[10px] text-gold uppercase font-black tracking-widest mb-1">
                                {murottalError ? 'Error' : 'Sedang Diputar'}
                              </span>
                              <p className="text-white text-xs truncate font-medium">
                                {murottalError ? murottalError : (currentJuz > 0 ? `Juz ${currentJuz}` : 'Custom Audio')}
                              </p>
                            </div>
                            {!murottalError && <Volume2 size={16} className="text-gold/50" />}
                          </div>
                          {murottalError && (
                            <p className="text-[10px] text-red-400 italic">
                              Tips: Pastikan browser mengizinkan audio dari sumber luar atau coba Juz lain.
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Tarawih Tracker */}
              <div id="tarawih-tracker" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Moon size={18} className="text-[#FFD700]" />
                    <label className="text-sm uppercase font-black text-[#FFD700] tracking-[0.2em]">Tarawih Malam</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={tarawihNights}
                      onChange={(e) => setTarawihNights(Math.min(30, Math.max(0, Number(e.target.value))))}
                      className="w-16 bg-white/5 border border-[#FFD700]/30 rounded-lg py-1 px-2 text-center text-[#FFD700] font-bold focus:outline-none focus:border-[#FFD700]"
                    />
                    <span className="text-xl font-mono font-black text-[#FFD700]">/ 30</span>
                  </div>
                </div>

                <div className="relative">
                  <div className="bg-white/5 rounded-full h-4 p-1 border border-white/10 shadow-inner overflow-hidden">
                    <motion.div
                      className="h-full bg-[#FFD700] rounded-full shadow-[0_0_20px_rgba(255,215,0,0.6)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(tarawihNights / 30) * 100}%` }}
                      transition={{ type: "spring", stiffness: 50 }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={tarawihNights}
                    onChange={(e) => setTarawihNights(Number(e.target.value))}
                    className="absolute inset-0 w-full h-4 opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex justify-between mt-3 px-1">
                    <span className="text-[10px] font-black text-[#FFD700]/40 uppercase">Malam 1</span>
                    <span className="text-[10px] font-black text-[#FFD700]/40 uppercase">Malam 30</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#FFD700]/10 rounded-3xl p-6 border border-[#FFD700]/20 text-center mt-auto">
                <p className={`text-sm font-black uppercase tracking-widest mb-2 ${ramadanPhase.color}`}>
                  {ramadanPhase.title}
                </p>
                <p className="text-xs text-[#F5F5F5] font-bold">
                  {currentJuz === 30 ? 'Maa Shaa Allah! Anda telah khatam.' : `Tinggal ${30 - currentJuz} Juz lagi untuk khatam.`}
                </p>
              </div>
            </div>
          </Card>

          {/* 4. Vibe Tracker */}
          <Card title="Vibe Tracker" icon={Heart} delay={0.4}>
            <p className="text-[#F5F5F5]/80 text-base mb-8">Bagaimana perasaanmu hari ini? Temukan motivasi yang tepat.</p>
            <div className="flex justify-between mb-10 px-4">
              {MOODS.map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => setSelectedMood(mood)}
                  className={`flex flex-col items-center gap-3 transition-all duration-500 group ${selectedMood?.label === mood.label ? 'scale-125' : 'opacity-30 grayscale hover:opacity-100 hover:grayscale-0'}`}
                >
                  <span className="text-4xl filter drop-shadow-lg group-hover:scale-110 transition-transform">{mood.emoji}</span>
                  <span className={`text-xs font-black uppercase tracking-widest ${selectedMood?.label === mood.label ? mood.color : 'text-white'}`}>{mood.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {selectedMood ? (
                <motion.div
                  key={selectedMood.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex-1 flex flex-col justify-center text-center space-y-6 bg-white/5 rounded-[2rem] p-8 border border-white/10"
                >
                  <p className="text-lg text-[#F5F5F5] font-bold italic leading-relaxed">
                    {selectedMood.message}
                  </p>
                  <div className="h-px w-16 bg-gold/40 mx-auto" />
                  <p className="text-sm text-gold font-black uppercase tracking-[0.2em]">
                    {selectedMood.quote}
                  </p>
                </motion.div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-[#F5F5F5]/30 text-sm italic border-2 border-dashed border-white/5 rounded-[2rem]">
                  Pilih mood untuk mendapatkan motivasi...
                </div>
              )}
            </AnimatePresence>
          </Card>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 text-center border-t border-gold/10 bg-black/20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="flex justify-center gap-4">
            <Moon className="text-gold/40 w-6 h-6" />
            <Sparkles className="text-gold/40 w-6 h-6" />
            <Heart className="text-red-500/40 w-6 h-6" />
          </div>
          <p className="text-gold-light/40 text-xs font-black uppercase tracking-[0.5em]">
            Ramadan Kareem 1447H • 2026
          </p>
          <p className="text-[#F5F5F5]/20 text-[10px] uppercase font-bold tracking-widest">
            Designed for Spiritual Excellence
          </p>
        </motion.div>
      </footer>

      {/* Favorites Modal/Overlay */}
      <AnimatePresence>
        {showFavorites && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-islamic-green-dark/95 backdrop-blur-xl p-6 overflow-y-auto custom-scrollbar"
          >
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex justify-between items-center border-b border-gold/20 pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gold/20 rounded-2xl text-gold">
                    <Heart size={32} fill="currentColor" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">Favorit Saya</h2>
                    <p className="text-gold/60 text-sm">Koleksi hadits dan resep pilihanmu.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFavorites(false)}
                  className="p-3 hover:bg-white/10 rounded-full text-white transition-all"
                >
                  <XCircle size={32} />
                </button>
              </div>

              {isFavoritesLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                  <p className="text-gold font-black uppercase tracking-widest text-xs">Memuat Favorit...</p>
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <Sparkles size={48} className="mx-auto text-gold/20" />
                  <p className="text-white/40 italic">Belum ada favorit yang disimpan.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                  {favorites.map((fav) => (
                    <motion.div
                      key={fav.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/5 border border-gold/20 rounded-[2rem] p-6 space-y-4 relative group"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] bg-gold/20 text-gold px-3 py-1 rounded-full uppercase font-black tracking-widest">
                          {fav.type === 'hadith' ? 'Hadits' : 'Resep'}
                        </span>
                        <button
                          onClick={() => toggleFavorite(fav.type, fav.content)}
                          className="text-red-400 hover:text-red-500 transition-all"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>

                      {fav.type === 'hadith' ? (
                        <div className="space-y-4">
                          <p className="text-2xl font-serif text-gold dir-rtl text-right">{fav.content.arabic}</p>
                          <p className="text-sm text-white font-bold">{fav.content.translation}</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-gold-light">{fav.content.name}</h3>
                          <p className="text-sm text-white/80 line-clamp-3">{fav.content.instructions}</p>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          if (fav.type === 'hadith') {
                            setAiHadith(fav.content);
                            setHadithSearch('');
                          } else {
                            setMatchedRecipe(fav.content);
                            setIngredients('');
                          }
                          setShowFavorites(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full py-3 bg-gold/10 hover:bg-gold/20 text-gold rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                      >
                        Lihat Detail
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <audio
        ref={murottalRef}
        // Gunakan null jika murottalLink kosong, jangan string ""
        src={murottalLink || null}
        onEnded={() => setIsPlayingMurottal(false)}
        onCanPlay={() => setIsBuffering(false)} // Matikan loading saat siap putar
        hidden
      />

      {/* Login Prompt Popup */}
      <AnimatePresence>
        {showLoginPrompt && !user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] w-[90%] max-w-md"
          >
            <div className="glass-card bg-islamic-green-dark/90 border-gold/40 p-6 rounded-[2rem] shadow-2xl flex flex-col items-center text-center gap-4">
              <div className="p-3 bg-gold/20 rounded-full text-gold">
                <Sparkles size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Suka dengan hasil ini?</h3>
                <p className="text-gold-light/80 text-sm mt-2">
                  Yuk login dulu Kak, biar hadits dan resep penuh berkah ini bisa Kakak simpan di koleksi favorit! ✨
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={loginWithGoogle}
                  className="flex-1 py-3 bg-gold text-islamic-green-dark rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gold-light transition-all shadow-lg"
                >
                  Login Sekarang
                </button>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="px-6 py-3 bg-white/5 text-white/60 rounded-xl font-bold text-xs hover:bg-white/10 transition-all"
                >
                  Nanti Saja
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasbih Overlay */}
      <AnimatePresence>
        {showTasbih && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-islamic-green-dark flex flex-col items-center justify-center p-6"
          >
            <button 
              onClick={() => setShowTasbih(false)}
              className="absolute top-8 right-8 p-4 text-gold hover:bg-gold/10 rounded-full transition-all"
            >
              <X size={32} />
            </button>
            
            <div className="text-center space-y-12 w-full max-w-md">
              <div className="space-y-2">
                <h2 className="text-gold font-black uppercase tracking-[0.3em] text-sm">Tasbih Digital</h2>
                <p className="text-white/40 text-xs italic">Ketuk di mana saja untuk menghitung</p>
              </div>

              <motion.div 
                key={tasbihCount}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[12rem] font-black text-gold leading-none tracking-tighter select-none"
              >
                {tasbihCount}
              </motion.div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setTasbihCount(0)}
                  className="flex-1 py-4 bg-white/5 border border-gold/20 text-gold rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gold/10 transition-all"
                >
                  Reset
                </button>
                <button 
                  onClick={() => {
                    setTasbihCount(prev => prev + 1);
                    if ('vibrate' in navigator) navigator.vibrate(50);
                  }}
                  className="flex-[2] py-4 bg-gold text-islamic-green-dark rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gold-light transition-all shadow-2xl"
                >
                  Hitung
                </button>
              </div>
            </div>

            {/* Full screen invisible click area for easier counting */}
            <div 
              className="absolute inset-0 z-[-1]" 
              onClick={() => {
                setTasbihCount(prev => prev + 1);
                if ('vibrate' in navigator) navigator.vibrate(50);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Doa Drawer */}
      <AnimatePresence>
        {showDoa && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDoa(false)}
              className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[160] bg-islamic-green-dark border-t border-gold/30 rounded-t-[3rem] max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-8 border-b border-gold/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gold/10 rounded-2xl text-gold">
                    <Sparkles size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Doa Ramadan</h2>
                </div>
                <button onClick={() => setShowDoa(false)} className="p-2 text-gold/40 hover:text-gold transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
                {DOA_RAMADAN.map((doa, idx) => (
                  <div key={idx} className="glass-card p-6 rounded-3xl border border-gold/10 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-gold font-black uppercase tracking-widest text-xs">{doa.title}</h3>
                      <button 
                        onClick={() => copyToClipboard(`${doa.title}\n\n${doa.arabic}\n\n${doa.translation}`, () => {})}
                        className="p-2 text-gold/40 hover:text-gold transition-colors"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                    <p className="text-3xl font-serif text-white leading-loose dir-rtl text-right">{doa.arabic}</p>
                    <p className="text-sm text-gold-light/80 italic leading-relaxed">{doa.translation}</p>
                    <button 
                      onClick={() => speakSequence(doa.arabic, doa.translation, 'Doa Ramadan')}
                      className="flex items-center gap-2 text-[10px] font-black text-gold uppercase tracking-widest"
                    >
                      <Volume2 size={14} /> Dengarkan
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Imsakiyah Details Drawer */}
      <AnimatePresence>
        {showImsakiyahDetails && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowImsakiyahDetails(false)}
              className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 bottom-0 z-[160] w-full max-w-md bg-islamic-green-dark border-l border-gold/30 shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-gold/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gold/10 rounded-2xl text-gold">
                    <Calendar size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">{scheduleTitle}</h2>
                </div>
                <button onClick={() => setShowImsakiyahDetails(false)} className="p-2 text-gold/40 hover:text-gold transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar">
                <div className="bg-gold/5 border border-gold/20 p-6 rounded-3xl text-center space-y-2">
                  <p className="text-gold font-black uppercase tracking-widest text-[10px]">Hari Ini</p>
                  <h3 className="text-xl font-bold text-white">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                  <p className="text-gold-light text-xs">{hijriDate.day} {hijriDate.monthName} {hijriDate.year} H</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(PRAYER_TIMES).map(([name, time]) => (
                    <div key={name} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-xs font-black uppercase tracking-widest text-gold/60">{name}</span>
                      <span className="text-lg font-black text-white">{time}</span>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                  <p className="text-[10px] text-white/40 italic text-center">
                    *Jadwal berdasarkan koordinat lokasi Kakak saat ini. Pastikan GPS aktif untuk akurasi maksimal.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
