import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Question } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON body parser
app.use(express.json());

// Path to low-overhead file database
const DB_FILE = path.join(process.cwd(), "db.json");

// Helper to format date consistent with mock screenshot: "30 Mei 2026, 15.11"
function formatIndonesianDate(date: Date): string {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  // Pad hours and minutes
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  
  return `${day} ${month} ${year}, ${hours}.${minutes}`;
}

// Initial mockup data
const initialQuestions: Question[] = [
  {
    id: "q-1",
    name: "Andi_Test",
    email: "andi@email.com",
    questionText: "apakah anda bisa membantu saya menyelesaikan masalah ?",
    status: "Terjawab",
    createdAt: "30 Mei 2026, 15.13",
    aiDraft: "Halo Andi_Test,\n\nTentu saja, kami di Jadimaju selalu siap membantu menyelesaikan masalah Anda. Silakan jelaskan kendala yang Anda alami secara lebih detail agar kami bisa memberikan solusi yang paling tepat.\n\nSalam hangat,\nTim Jadimaju",
    humanAnswer: "Halo Andi_Test,\n\nTentu saja, kami di Jadimaju selalu siap membantu menyelesaikan masalah Anda. Silakan jelaskan kendala yang Anda alami secara lebih detail agar kami bisa memberikan solusi yang paling tepat.\n\nSalam hangat,\nTim Jadimaju",
    isDraftSaved: false,
    answeredAt: "30 Mei 2026, 15.15"
  },
  {
    id: "q-2",
    name: "TEST_User",
    email: "test_user@example.com",
    questionText: "Bagaimana cara melakukan pembayaran di Jadimaju?",
    status: "Terjawab",
    createdAt: "30 Mei 2026, 15.11",
    aiDraft: "Halo TEST_User,\n\nPembayaran di Jadimaju dapat dilakukan melalui beberapa metode aman, termasuk Transfer Bank (VA), Kartu Kredit, atau e-Wallet (GoPay, OVO, Dana). Anda dapat memilih metode pembayaran yang paling nyaman saat melakukan checkout di aplikasi atau website kami.\n\nSalam hangat,\nTim Jadimaju",
    humanAnswer: "Halo TEST_User,\n\nPembayaran di Jadimaju dapat dilakukan melalui beberapa metode aman, termasuk Transfer Bank (VA), Kartu Kredit, atau e-Wallet (GoPay, OVO, Dana). Anda dapat memilih metode pembayaran yang paling nyaman saat melakukan checkout di aplikasi atau website kami.\n\nSalam hangat,\nTim Jadimaju",
    isDraftSaved: false,
    answeredAt: "30 Mei 2026, 15.14"
  },
  {
    id: "q-3",
    name: "TEST_Budi",
    email: "budi_test@example.com",
    questionText: "Apakah Jadimaju buka pada hari Minggu?",
    status: "Menunggu",
    createdAt: "30 Mei 2026, 15.11",
    aiDraft: "Halo TEST_Budi,\n\nTerima kasih atas pertanyaan Anda. Mengenai jam operasional Jadimaju pada hari Minggu, kami sarankan Anda untuk memeriksa informasi terkini melalui situs web resmi kami atau aplikasi Jadimaju. Jam operasional dapat bervariasi tergantung pada lokasi atau jenis layanan yang Anda butuhkan.\n\nJika Anda memiliki lokasi spesifik dalam pikiran, mohon informasikan kepada kami agar kami dapat membantu Anda mencari informasinya lebih lanjut.\n\nJangan ragu untuk menghubungi kami kembali jika ada pertanyaan lain yang bisa kami bantu.\n\nSalam hangat,\nTim Jadimaju",
    humanAnswer: "",
    isDraftSaved: false
  },
  {
    id: "q-4",
    name: "Andi Pratama",
    email: "andi@example.com",
    questionText: "Bagaimana cara mengembalikan produk yang sudah beli?",
    status: "Menunggu",
    createdAt: "30 Mei 2026, 15.09",
    aiDraft: "Halo Andi Pratama,\n\nTerima kasih atas pertanyaannya. Untuk melakukan pengembalian produk yang telah Anda beli di Jadimaju, Anda dapat mengikuti langkah-langkah berikut:\n\n1. Pastikan produk masih dalam segel asli dan kondisi semula.\n2. Ajukan permohonan melalui menu 'Riwayat Transaksi' di akun Anda, lalu klik 'Ajukan Pengembalian'.\n3. Kirimkan produk ke gudang kami sesuai dengan petunjuk yang diberikan.\n\nTim kami akan melakukan pengecekan dalam waktu 3 hari kerja setelah barang diterima.\n\nSalam hangat,\nTim Jadimaju",
    humanAnswer: "",
    isDraftSaved: false
  }
];

// Read Questions from DB
function readDb(): Question[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error("Error reading database file, using in-memory fallback:", error);
  }
  
  // Write initial structure if no database file exists
  writeDb(initialQuestions);
  return initialQuestions;
}

// Write Questions to DB
function writeDb(questions: Question[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(questions, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database file:", error);
  }
}

// Lazy Initialize GoogleGenAI client (robust design)
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      try {
        genAIClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "faq-system-build",
            }
          }
        });
        console.log("Successfully initialized server-side GoogleGenAI client.");
      } catch (err) {
        console.error("Failed to initialize GoogleGenAI client:", err);
      }
    } else {
      console.warn("GEMINI_API_KEY is not defined or is placeholder. Using smart offline logic fallback for drafting answers.");
    }
  }
  return genAIClient;
}

// Generate Response using Gemini 3.5 Flash or Smart Fallback
async function generateAIDraft(name: string, question: string): Promise<string> {
  const aiClient = getGenAI();
  if (aiClient) {
    try {
      console.log(`Querying Gemini (gemini-3.5-flash) to draft response for: ${name}...`);
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Nama Pelanggan: ${name}\nPertanyaan: ${question}`,
        config: {
          systemInstruction: "Anda adalah asisten Customer Service AI profesional dari perusahaan Jadimaju. Tugas Anda adalah menyusun draft jawaban resmi, sopan, ramah, dan sangat membantu dalam Bahasa Indonesia untuk pertanyaan pelanggan. Pastikan draft jawaban menggunakan format sapaan hangat 'Halo [Nama Pelanggan]', jelaskan jawaban dengan format paragraf atau poin yang rapi dan terstruktur, dan diakhiri dengan salam penutup 'Salam hangat,\nTim Jadimaju'. Jangan gunakan meta-komentar lainnya."
        }
      });
      
      const text = response.text;
      if (text && text.trim().length > 0) {
        return text.trim();
      }
    } catch (err) {
      console.error("Gemini Generation failed. Falling back to offline draft.", err);
    }
  }

  // Smart Offline Fallback Logic using keywords for Indonesian customer questions
  const qLower = question.toLowerCase();
  let content = "";

  if (qLower.includes("minggu") || qLower.includes("buka") || qLower.includes("jam") || qLower.includes("operasional")) {
    content = "Terima kasih atas pertanyaan Anda. Mengenai jam operasional Jadimaju pada hari Minggu, saat ini tim Customer Service kami memang libur, namun sistem pemesanan online tetap aktif 24 jam. Kami beroperasi dari Senin hingga Sabtu pukul 09.00 - 17.00 WIB untuk penanganan layanan & helpdesk pelanggan.\n\nJangan ragu untuk menghubungi kami kembali di hari kerja jika ada hal yang mendesak yang bisa kami bantu.";
  } else if (qLower.includes("bayar") || qLower.includes("pembayaran") || qLower.includes("metode")) {
    content = "Terima kasih telah bertanya tentang metode pembayaran di Jadimaju. Kami menyediakan berbagai pilihan pembayaran online yang aman dan terpercaya:\n\n1. Transfer Bank / Virtual Account (Mandiri, BCA, BRI, BNI)\n2. Dompet Digital / e-Wallet (GoPay, OVO, Dana, LinkAja)\n3. Kartu Kredit / Debit Online\n\nPembayaran Anda akan terverifikasi secara instan setelah transaksi sukses dilakukan pada menu checkout.";
  } else if (qLower.includes("kembali") || qLower.includes("produk") || qLower.includes("beli") || qLower.includes("retur")) {
    content = "Kami mohon maaf atas ketidaknyamanan yang Anda alami terkait produk yang telah dibeli. Di Jadimaju, kepuasan pelanggan adalah prioritas utama. Anda dapat mengajukan refund atau penukaran produk dengan syarat berikut:\n\n1. Ajukan klaim maksimal 3 hari sejak barang diterima.\n2. Pastikan kemasan produk masih dalam segel asli dan belum digunakan.\n3. Lampirkan foto kondisi barang serta bukti video unboxing produk.\n\nSilakan mengisi form pengembalian produk di menu Riwayat Transaksi agar dapat diperiksa segera oleh tim logistik kami.";
  } else {
    content = "Kami sangat menghargai pertanyaan yang Anda ajukan. Pertanyaan Anda mengenai kendala ini sedang kami koordinasikan langsung dengan tim teknis internal kami agar bisa diberikan panduan yang menyeluruh dan tepat sasaran.\n\nMohon kesediaannya menunggu sementara kami mempersiapkan penjelasan terbaik untuk Anda. Kami akan segera mengirimkan update balasan lengkap ke email Anda secepatnya.";
  }

  return `Halo ${name},\n\n${content}\n\nSalam hangat,\nTim Jadimaju`;
}

// --- API ENDPOINTS ---

// Admin Login Route
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    return res.json({ success: true, token: "demo-admin-token", username: "admin" });
  }
  return res.status(401).json({ success: false, message: "Kredensial tidak valid. Silakan coba kembali." });
});

// Get List of Questions (with filtering & search option handled server-side optionally, but can be done client-side too)
app.get("/api/questions", (req, res) => {
  const questions = readDb();
  res.json(questions);
});

// Create Customer Question (Form Submission on Home Page)
app.post("/api/questions", async (req, res) => {
  const { name, email, questionText } = req.body;
  
  if (!name || !email || !questionText) {
    return res.status(400).json({ error: "Mohon isi semua field (Nama Lengkap, Email, dan Pertanyaan)." });
  }

  const questions = readDb();
  const id = `q-${Date.now()}`;
  const createdAt = formatIndonesianDate(new Date());

  // Generate the AI automated draft immediately in background or wait
  // Since we want draft to be ready, we generate it directly.
  let aiDraftAnswer = "";
  try {
    aiDraftAnswer = await generateAIDraft(name, questionText);
  } catch (e) {
    aiDraftAnswer = `Halo ${name},\n\nTerima kasih atas pertanyaan Anda. Kami akan segera membalasnya.\n\nSalam hangat,\nTim Jadimaju`;
  }

  const newQuestion: Question = {
    id,
    name,
    email,
    questionText,
    status: "Menunggu",
    createdAt,
    aiDraft: aiDraftAnswer,
    humanAnswer: "",
    isDraftSaved: false
  };

  questions.unshift(newQuestion); // Prepend to show latest first
  writeDb(questions);

  res.status(201).json({ success: true, question: newQuestion });
});

// Regenerate AI Draft for Question
app.post("/api/questions/:id/draft", async (req, res) => {
  const questions = readDb();
  const questionIndex = questions.findIndex(q => q.id === req.params.id);
  
  if (questionIndex === -1) {
    return res.status(404).json({ error: "Pertanyaan tidak ditemukan" });
  }

  const question = questions[questionIndex];
  try {
    const rawDraft = await generateAIDraft(question.name, question.questionText);
    question.aiDraft = rawDraft;
    questions[questionIndex] = question;
    writeDb(questions);
    res.json({ success: true, aiDraft: rawDraft });
  } catch (err) {
    res.status(500).json({ error: "Gagal melakukan regenerasi draf AI." });
  }
});

// Save human's input as temporary draft
app.put("/api/questions/:id/save-draft", (req, res) => {
  const { humanAnswer } = req.body;
  const questions = readDb();
  const questionIndex = questions.findIndex(q => q.id === req.params.id);

  if (questionIndex === -1) {
    return res.status(404).json({ error: "Pertanyaan tidak ditemukan" });
  }

  questions[questionIndex].humanAnswer = humanAnswer || "";
  questions[questionIndex].isDraftSaved = true;
  writeDb(questions);

  res.json({ success: true, question: questions[questionIndex] });
});

// Submit final human answer & Mark as answered
app.post("/api/questions/:id/answer", (req, res) => {
  const { humanAnswer } = req.body;
  
  if (!humanAnswer || humanAnswer.trim().length === 0) {
    return res.status(400).json({ error: "Balasan jawaban tidak boleh kosong." });
  }

  const questions = readDb();
  const questionIndex = questions.findIndex(q => q.id === req.params.id);

  if (questionIndex === -1) {
    return res.status(404).json({ error: "Pertanyaan tidak ditemukan" });
  }

  const now = new Date();
  questions[questionIndex].humanAnswer = humanAnswer;
  questions[questionIndex].status = "Terjawab";
  questions[questionIndex].isDraftSaved = false;
  questions[questionIndex].answeredAt = formatIndonesianDate(now);
  
  writeDb(questions);

  res.json({ success: true, question: questions[questionIndex] });
});

// Delete customer question
app.delete("/api/questions/:id", (req, res) => {
  const questions = readDb();
  const filtered = questions.filter(q => q.id !== req.params.id);
  
  if (filtered.length === questions.length) {
    return res.status(404).json({ error: "Pertanyaan tidak ditemukan." });
  }

  writeDb(filtered);
  res.json({ success: true, message: "Pertanyaan berhasil dihapus dari sistem." });
});

// Express route mapping for index asset or router if running Vite Node env
async function startServer() {
  // Vite integration in development mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
