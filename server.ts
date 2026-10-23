import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini AI Client instance
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint for AI Clinic & Inventory Advisor using gemini-4-argon with ThinkingLevel.HIGH
app.post('/api/ai/advisor', async (req, res) => {
  try {
    const { branch, stockData, salesSummary, customQuestion } = req.body;

    const systemInstruction = `Anda adalah Direktur Medis & Konsultan Manajemen Bisnis Klinik Kecantikan Senior untuk RCA Skincare.
RCA Skincare memiliki 3 cabang:
1. Springhill (Flagship, perawatan estetik & laser premium)
2. Sudirman (Pusat bisnis, pelanggan eksekutif & dermatology glow)
3. Pangkalan Balai (Regional wellness, resep obat dokter intensif)

Tugas Anda:
- Memberikan analisis performa penjualan, margin obat/skincare, dan perputaran persediaan (fast moving vs slow moving).
- Mendeteksi anomali stok menipis dan memberikan rekomendasi aksi konkret (misal: transfer antar cabang, safety stock, atau reorder quantity).
- Memberikan saran strategis pemasaran dan paket bundling treatment yang relevan untuk meningkatkan omzet klinik.
Gunakan gaya bahasa Indonesia yang profesional, hangat, terstruktur, data-driven, dan langsung dapat dieksekusi oleh manajemen klinik.`;

    const userPrompt = `Analisis performa dan rekomendasi inventaris RCA Skincare untuk cabang: ${branch || 'Semua Cabang'}.

Ringkasan Penjualan:
${JSON.stringify(salesSummary, null, 2)}

Data Sampel Stok & Stok Menipis:
${JSON.stringify(stockData, null, 2)}

${customQuestion ? `Pertanyaan Khusus Manajemen: "${customQuestion}"` : 'Berikan: 1) Analisis Kesehatan Bisnis 3 Cabang, 2) Evaluasi Stok Kritis & Solusi Realokasi Antar Cabang, 3) 3 Strategi Action Plan Minggu Ini.'}`;

    let responseText = '';

    // Attempt with high-thinking gemini-4-argon
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-argon',
        contents: userPrompt,
        config: {
          systemInstruction,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
        },
      });
      responseText = response.text || 'Tidak ada teks yang dihasilkan.';
    } catch (modelErr: any) {
      console.warn('Fallback from gemini-4-argon to gemini-3.8-flash:', modelErr?.message);
      // Graceful fallback to gemini-3.8-flash
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
        },
      });
      responseText = fallbackResponse.text || 'Tidak ada teks yang dihasilkan.';
    }

    res.json({ success: true, advice: responseText });
  } catch (error: any) {
    console.error('AI Advisor error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Gagal memproses analisis AI.',
    });
  }
});

async function main() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RCA Skincare Server] Running on http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
});
