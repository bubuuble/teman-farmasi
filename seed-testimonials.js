import createClient from '@sanity/client';

const client = createClient({
  projectId: 'dg157s6c', 
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-01-01',
  token: 'skv5ejQyc8EBAKfWucmc1aPnBmNpTqLXBLnp6DkHaMCn2WKOpLD8rwTLUqZr8XHxHVz9WeVCZoavDqjt6Xv9kU3MGlGitimpEoZIzmJVXcuYrF4gleK3RmbUUIQphwwXPZ0BG6amCKuC5oToaOFPbiAEHXPKds0LwMrPyDzcjg5wwO1g3Bf9', 
});

const newTestimonials = [
  {
    _type: 'testimonial',
    name: 'Siti Nurhaliza',
    role: 'Bimbingan Skripsi',
    text: 'Selama ikut kelas, aku bener2 kebantu buanget. Apalagi mentor ku, masyaallah baik nya melebihi mama ku wkwkwk. Bener2 detail dijelasin nya dari yg aku ga tau sama sekali sampe akhirnya paham.',
    cardColor: 'bg-brand-pink',
    featured: true, order: 1
  },
  {
    _type: 'testimonial',
    name: 'Dewi Kusuma',
    role: 'Bimbingan Online',
    text: 'Kaa terus kembangin yaa, mungkin banyak diluar sana yang takut sama skripsian. Tapi bisa dpt bimbel yang murah dan harga merakyat wkwk. Semoga bisa terus sampe nanti anak ku kuliah.',
    cardColor: 'bg-brand-yellow',
    featured: false, order: 2
  },
  {
    _type: 'testimonial',
    name: 'Rani Puspita',
    role: 'Persiapan Sidang',
    text: 'Alhamdullilah kak dan ada beberapa pertanyaan yang sudah kakak jelaskan jadi lebih pede lgi jawabnya. Pokoknya terima kasih banyak kak 🥰🥰',
    cardColor: 'bg-brand-blue',
    featured: true, order: 3
  },
  {
    _type: 'testimonial',
    name: 'Dinda Ayu',
    role: 'Konsultasi Judul',
    text: 'Awal-awall tegangg bangett ehehe, ternyataa kakanyaa baik bangett atusias banget materinya bener-bener gampang dipahami. Seneng deh bisa dapet pencerahan judul kayak gini.',
    cardColor: 'bg-brand-pink',
    featured: false, order: 4
  },
  {
    _type: 'testimonial',
    name: 'Ayu Lestari',
    role: 'Bimbingan Formulasi Kosmetik',
    text: 'Kelasnya sangat menyenangkan, penjelasan kk juga sangat membantu dan mudah dipahami karena ga cuma mendengarkan tetapi juga interaksi 2 arahh 🫶. Pgn daftar kelas privat kk!',
    cardColor: 'bg-brand-yellow',
    featured: false, order: 5
  },
  {
    _type: 'testimonial',
    name: 'Fitri Rahmawati',
    role: 'Kelas Online Zoom',
    text: 'Seruuw kaa apalagi penyampaian materinya buat kita paham. Pas sesi diskusi respon kk baik bngt + antusias jwb pertanyaan kita2 rasanya kya lagi sma temen curhat.',
    cardColor: 'bg-brand-blue',
    featured: false, order: 6
  },
  {
    _type: 'testimonial',
    name: 'Maya Anggraini',
    role: 'Bimbingan Skripsi',
    text: 'Alhamdulilahhh kakk maaf baru kabarinnn baru selesaiii semuaa lancarr semuaa.',
    cardColor: 'bg-brand-pink',
    featured: false, order: 7
  },
  {
    _type: 'testimonial',
    name: 'Nur Azizah',
    role: 'Bimbingan Tugas Akhir',
    text: 'Yaallah ikut bimbingan di mbaknya ini bener2 luar biasaaaa, 2 kali bimbingan lgsg ACC mbak hihi.',
    cardColor: 'bg-brand-yellow',
    featured: true, order: 8
  },
  {
    _type: 'testimonial',
    name: 'Risma Wahyuni',
    role: 'Bimbingan Privat',
    text: 'Terdebestttttttttt, apalagi mentornya masyaallah. Sabar bgt, ngadeppin ibu2 kuliah macem saya 🥹🤣.',
    cardColor: 'bg-brand-blue',
    featured: true, order: 9
  },
  {
    _type: 'testimonial',
    name: 'Indah Permata',
    role: 'Bimbingan S2 Farmasi',
    text: 'Kakak alhamdulillah semhas ku lancar tadi. Makasii ya kak. InsyaAllah minggu depan kompre, mau bimbingan lagi ya kak.',
    cardColor: 'bg-brand-pink',
    featured: true, order: 10
  },
  {
    _type: 'testimonial',
    name: 'Putri Wulandari',
    role: 'Bimbingan Skripsi',
    text: 'Makasii banyak ya kk atas bantuannya, Alhamdulillah bimbel di kk pengurusan skripsi lancar, makasii kk sudah buka bimbel seperti ini 🥰💖.',
    cardColor: 'bg-brand-yellow',
    featured: false, order: 11
  },
  {
    _type: 'testimonial',
    name: 'Laila Sari',
    role: 'Bimbingan Penelitian',
    text: 'Makasih banya ya mab ❤️ Alhamdulillah aku lancarrrrr banget. Nilainya aman.',
    cardColor: 'bg-brand-blue',
    featured: false, order: 12
  },
  {
    _type: 'testimonial',
    name: 'Zahra Amelia',
    role: 'Persiapan Sidang',
    text: 'Mba caca makasih ya udah bantuin akuu. Akhirnya aku udah lewat fase sidang.',
    cardColor: 'bg-brand-pink',
    featured: false, order: 13
  },
  {
    _type: 'testimonial',
    name: 'Nabila Syifa',
    role: 'Bimbingan Fleksibel',
    text: 'Kaa makasihh ya sudah sabar mengaturr jadwal hari ke hari aku yg menyibukann dirii. Kakak tetep mau jelasin, bener" fleksibel dan friendlyy 😍✨.',
    cardColor: 'bg-brand-yellow',
    featured: false, order: 14
  },
  {
    _type: 'testimonial',
    name: 'Anisa Rahma',
    role: 'Member Komunitas',
    text: 'Alhamdulilah dengan adanya komunitas teman farmasi ini bisa membantu aku pas lagi ngerjain penelitian juga skripsii 😍😍.',
    cardColor: 'bg-brand-blue',
    featured: false, order: 15
  },
  {
    _type: 'testimonial',
    name: 'Salma Khairunnisa',
    role: 'Konsultasi Formula',
    text: 'Kak makasii yaaa uda bantuin ak nemu formulaa yg baguss walaupuun ak jarang bgt less tp i did it hahaha 😍. (Skripsi: 90/A+, IP: 4.00)',
    cardColor: 'bg-brand-pink',
    featured: true, order: 16
  },
  {
    _type: 'testimonial',
    name: 'Devi Anggraeni',
    role: 'Persiapan Sempro',
    text: 'Kak szalsa maaf malem" mau ngabarin baru zoom diskusi proposal dan persiapan sempro sama kak khansa 1 jam lebih ngebantu banget 😭🙏. Makasih banyaak kak buat teman farmasiii.',
    cardColor: 'bg-brand-yellow',
    featured: true, order: 17
  }
];

async function seedData() {
  try {
    console.log('--- Menghapus data lama ---');
    await client.delete({ query: '*[_type == "testimonial"]' });
    
    console.log(`--- Mengunggah ${newTestimonials.length} data baru ---`);
    for (const data of newTestimonials) {
      await client.create(data);
      console.log(`✅ Berhasil: ${data.name} (Urutan: ${data.order})`);
    }
    console.log('🚀 SEEDING 17 TESTIMONIAL SELESAI!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

seedData();