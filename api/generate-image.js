export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Gunakan method POST" });
  }

  const { activities } = req.body;

  if (!activities) {
    return res.status(400).json({ error: "Data aktivitas kosong" });
  }

  try {
    const prompt = `
Berdasarkan aktivitas berikut:

${activities}

Bayangkan mahasiswa tersebut direpresentasikan sebagai seekor hewan lucu.

Tentukan:
- jenis hewan yang sesuai dengan kepribadian dan pola aktivitasnya
- ekspresi wajah seperti rajin, malas, santai, lelah, fokus, atau ceria
- gaya visual yang lucu, imut, dan menarik

Buat satu gambar saja, single character, bukan banyak adegan.

Ketentuan:
- gaya ilustrasi kartun, chibi, cute
- warna cerah dan menarik
- fokus pada satu karakter utama
- boleh menambahkan properti kecil seperti buku, HP, bantal, laptop, atau tas
- jangan menampilkan teks di dalam gambar
- gambar harus mencerminkan kepribadian berdasarkan aktivitas tersebut
- background sederhana dan estetik
    `.trim();

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;

    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      return res.status(imageResponse.status).json({
        error: "Gagal membuat gambar dari image API gratis"
      });
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    return res.status(200).json({
      image: base64Image
    });

  } catch (error) {
    console.error("Generate image error:", error);

    return res.status(500).json({
      error: "Gagal menghubungi image API"
    });
  }
}
