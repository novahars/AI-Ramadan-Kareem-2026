/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  User
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
  1: "http://j.mp/2b8SiNO",
  2: "http://j.mp/2b8RJmQ",
  3: "http://j.mp/2bFSrtF",
  4: "http://j.mp/2b8SXi3",
  5: "http://j.mp/2b8RZm3",
  6: "http://j.mp/28MBohs",
  7: "http://j.mp/2bFRIZC",
  8: "http://j.mp/2bufF7o",
  9: "http://j.mp/2byr1bu",
  10: "http://j.mp/2bHfyUH",
  11: "http://j.mp/2bHf80y",
  12: "http://j.mp/2bWnTby",
  13: "http://j.mp/2bFTiKQ",
  14: "http://j.mp/2b8SUTA",
  15: "http://j.mp/2bFRQIM",
  16: "http://j.mp/2b8SegG",
  17: "http://j.mp/2brHsFz",
  18: "http://j.mp/2b8SCfc",
  19: "http://j.mp/2bFSq95",
  20: "http://j.mp/2brI1zc",
  21: "http://j.mp/2b8VcBO",
  22: "http://j.mp/2bFRxNP",
  23: "http://j.mp/2brItxm",
  24: "http://j.mp/2brHKw5",
  25: "http://j.mp/2brImlf",
  26: "http://j.mp/2bFRHF2",
  27: "http://j.mp/2bFRXno",
  28: "http://j.mp/2brI3ai",
  29: "http://j.mp/2bFRyBF",
  30: "http://j.mp/2bFREcc"
};

const DEFAULT_NISAB_GOLD = 258825000; // Fallback nisab

// --- AI Service ---
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const ramadanAISystemInstruction = `
Kamu adalah Ramadan Intelligence Engine. Kamu memiliki dua mode fungsi:

1. Search Hadits: Jika user mencari topik, berikan hadits shahih yang relevan secara SEMANTIK (pahami makna, bukan cuma kata kunci).
2. AI Recipe: Jika user input bahan atau kondisi fisik, berikan resep sahur/buka yang sehat, cepat (<20 menit), dan jelaskan alasan logisnya (Agentic Reasoning).

FORMAT OUTPUT (WAJIB JSON):
{
  "type": "recipe" atau "hadith",
  "content": {
    "arabic": "Teks Arab (atau Judul Resep)",
    "latin": "Transliterasi (atau Langkah Singkat)",
    "translation": "Arti (atau Instruksi Lengkap)",
    "source": "Riwayat (atau Kategori Resep)",
    "explanation": "Tuliskan penjelasan mendalam (Syarah) mengenai hadits atau resep ini. Gunakan gaya bahasa 'Pendapat para ulama' atau 'Intisari hikmah'. Jelaskan makna dalam konteks kehidupan sehari-hari, terutama di bulan Ramadan. Hindari kata 'AI mengidentifikasi', gunakan kata seperti 'Para ulama menjelaskan bahwa...' atau 'Hikmah dari hal ini adalah...'"
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
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Recipe State
  const [ingredients, setIngredients] = useState('');
  const [matchedRecipe, setMatchedRecipe] = useState<{
    name: string;
    instructions: string;
    time: string;
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

  // Hadith State
  const [hadithSearch, setHadithSearch] = useState('');
  const [randomHadith, setRandomHadith] = useState(HADITHS[0]);
  const [aiHadith, setAiHadith] = useState<{
    arabic: string;
    latin: string;
    translation: string;
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

  const callRamadanAI = async (prompt: string) => {
    setIsAiLoading(true);
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
      setIsAiLoading(false);
    }
  };

  const findRecipe = async () => {
    if (!ingredients.trim()) return;
    const data = await callRamadanAI(`Berikan resep sahur/buka berdasarkan input ini: ${ingredients}`);
    if (data && data.type === 'recipe') {
      setMatchedRecipe({
        name: data.content["arabic"],
        instructions: data.content["translation"],
        time: "< 20 min",
        reason: data.content["explanation"]
      });
    }
  };

  const searchHadithAI = async () => {
    if (!hadithSearch.trim()) return;
    const data = await callRamadanAI(`Cari hadits shahih yang relevan dengan topik: ${hadithSearch}`);
    if (data && data.type === 'hadith') {
      setAiHadith({
        arabic: data.content["arabic"],
        latin: data.content["latin"],
        translation: data.content["translation"],
        reason: data.content["explanation"]
      });
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
      
      {/* Auth Button */}
      <div className="fixed top-6 right-6 z-50">
        {user ? (
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-gold/20 p-2 pl-4 rounded-full shadow-xl">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase font-black text-gold tracking-widest">Connected</p>
              <p className="text-xs font-bold text-white truncate max-w-[120px]">{user.user_metadata?.full_name || user.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-gold overflow-hidden bg-gold/20 flex items-center justify-center">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={20} className="text-gold" />
              )}
            </div>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                logout();
              }}
              className="p-2.5 hover:bg-red-500/20 text-white hover:text-red-400 rounded-full transition-all cursor-pointer relative z-[60]"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button 
            onClick={loginWithGoogle}
            className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-gold/20 px-6 py-3 rounded-full text-sm font-black text-white hover:bg-gold/10 hover:border-gold/50 transition-all shadow-xl group"
          >
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center p-1">
              <svg viewBox="0 0 24 24" className="w-full h-full"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            </div>
            Masuk dengan Google
          </button>
        )}
      </div>

      {/* 1. Hero Section: Hadith */}
      <section className="relative min-h-[65vh] flex flex-col items-center justify-center px-4 py-16 border-b border-gold/10 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 border border-gold rounded-full animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 border border-gold rounded-full animate-pulse delay-700" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl w-full text-center space-y-12 relative z-10"
        >
          {/* Header Branding */}
          <div className="space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <Moon className="text-gold w-16 h-16 gold-glow" />
            </motion.div>
            <div className="space-y-1">
              <h2 className="text-3xl md:text-4xl font-serif text-[#FFD700] tracking-tight italic">
                LisanulHaq
              </h2>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
                Ramadan <span className="text-gold">Kareem</span> 2026
              </h1>
            </div>
            <p className="text-gold-light font-bold tracking-[0.4em] uppercase text-sm md:text-base">
              Selamat Menunaikan Ibadah Puasa 1447H
            </p>
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
              disabled={isAiLoading}
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
              {isAiLoading && (
                <div className="absolute inset-0 bg-islamic-green-dark/40 backdrop-blur-sm rounded-[3rem] flex items-center justify-center z-20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                    <p className="text-gold font-black uppercase tracking-widest text-xs">Intelligence Engine Thinking...</p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <p className="text-4xl md:text-5xl font-serif text-gold leading-loose dir-rtl text-center">
                  {aiHadith ? aiHadith.arabic : randomHadith.arabic}
                </p>
                <p className="text-lg md:text-xl text-gold-light italic font-medium">
                  {aiHadith ? aiHadith.latin : randomHadith.latin}
                </p>
                <div className="h-px w-24 bg-gold/30 mx-auto" />
                <p className="text-xl md:text-2xl text-[#F5F5F5] font-bold leading-relaxed max-w-2xl mx-auto">
                  {aiHadith ? aiHadith.translation : randomHadith.translation}
                </p>
                {aiHadith && (
                  <div className="bg-gold/10 p-4 rounded-2xl border border-gold/20 max-w-xl mx-auto text-left">
                    <p className="text-xs text-gold font-black uppercase tracking-widest mb-2">Hikmah & Penjelasan Ulama</p>
                    <p className="text-sm text-[#F5F5F5] leading-relaxed">{aiHadith.reason}</p>
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
            <div className="space-y-6">
              <div className="relative group">
                <textarea
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="Misal: telur, bayam, ayam... atau curhat kondisi tubuhmu saat ini."
                  className="w-full bg-islamic-green-dark/50 border border-gold/20 rounded-2xl px-6 py-4 pr-20 text-[#F5F5F5] placeholder:text-white/20 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all min-h-[100px] resize-none"
                />
                <button
                  onClick={findRecipe}
                  disabled={isAiLoading}
                  className="absolute right-3 bottom-3 p-2.5 bg-gold text-islamic-green-dark rounded-xl hover:bg-gold-light hover:scale-110 active:scale-95 transition-all shadow-lg disabled:opacity-50"
                >
                  {isAiLoading ? <div className="w-5 h-5 border-2 border-islamic-green-dark border-t-transparent rounded-full animate-spin" /> : <Zap size={20} fill="currentColor" />}
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
                      <span className="text-xs bg-gold/20 text-gold px-3 py-1 rounded-full uppercase font-black tracking-wider">
                        {matchedRecipe.time}
                      </span>
                    </div>
                    <p className="text-base text-[#F5F5F5] leading-relaxed">
                      {matchedRecipe.instructions}
                    </p>
                    <div className="bg-gold/10 p-4 rounded-2xl border border-gold/20">
                      <p className="text-xs text-gold font-black uppercase tracking-widest mb-1">Hikmah & Penjelasan Ulama</p>
                      <p className="text-sm text-[#F5F5F5] leading-relaxed">{matchedRecipe.reason}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`${matchedRecipe.name}\n\n${matchedRecipe.instructions}\n\nAI Reason: ${matchedRecipe.reason}`, setCopiedRecipe)}
                      className="flex items-center gap-2 text-xs font-black text-gold hover:text-gold-light transition-all uppercase tracking-widest group"
                    >
                      {copiedRecipe ? <Check size={16} /> : <Copy size={16} className="group-hover:rotate-12 transition-transform" />}
                      {copiedRecipe ? 'Tersalin!' : 'Salin Resep'}
                    </button>
                  </motion.div>
                ) : ingredients && !isAiLoading && (
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
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => window.open(MUROTTAL_LINKS[currentJuz], '_blank')}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 border border-[#FFD700]/20 rounded-xl text-xs font-black text-[#FFD700] hover:bg-[#FFD700]/10 transition-all uppercase tracking-widest"
                  >
                    <Headphones size={14} />
                    Putar Murottal Juz {currentJuz}
                  </motion.button>
                )}
              </div>

              {/* Tarawih Tracker */}
              <div className="space-y-6">
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
    </div>
  );
}
