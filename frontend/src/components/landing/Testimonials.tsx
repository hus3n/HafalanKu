'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Star, Quote, Heart } from 'lucide-react';

export function Testimonials() {
  const reviews = [
    {
      name: 'KH. Abdullah Syukri',
      role: 'Pengasuh Pesantren Tahfidz Al-Hikmah',
      content:
        'HafalanKu mengubah cara kami memantau 150+ santri. Notifikasi WhatsApp ke wali murid membuat orang tua sangat gembira karena bisa langsung tahu perkembangan hafalan putra-putrinya.',
      rating: 5,
    },
    {
      name: 'Ustadz Ridwan Malik, Lc.',
      role: 'Kepala Rumah Tahfidz Daarul Qur’an',
      content:
        'Fitur otomatisasi jadwal murajaah sangat cerdas. Santri tidak lagi bingung menentukan surat mana yang harus diulang hari ini. Sangat direkomendasikan!',
      rating: 5,
    },
    {
      name: 'Ibu Rahmawati',
      role: 'Wali Santri Ananda Hafiz',
      content:
        'Dulu sering ragu bagaimana perkembangan hafalan anak di pondok. Sekarang setiap kali Hafiz selesai setoran, laporan langsung masuk ke HP saya via WhatsApp.',
      rating: 5,
    },
  ];

  return (
    <section id="testimoni" className="py-32 relative overflow-hidden bg-background">
      {/* Ambient Gradient Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-20 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 text-rose-500 text-xs font-semibold border border-rose-500/20">
            <Heart className="w-4 h-4 fill-rose-500" /> Dipercaya 500+ Lembaga
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-outfit text-foreground tracking-tight">
            Apa Kata Pengasuh & Wali Santri?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground font-light">
            Dengar langsung pengalaman dari kiai, ustadz, dan wali murid yang telah merasakan kemudahan platform ini.
          </p>
        </motion.div>

        {/* Testimonials Grid (Staggered Animation) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: idx * 0.15, type: "spring", bounce: 0.4 }}
              whileHover={{ 
                y: -10, 
                boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
                borderColor: "rgba(16,185,129,0.3)" 
              }}
              className="p-8 rounded-[2rem] border border-border dark:border-emerald-500/20 bg-card dark:bg-[#0c2017] text-card-foreground shadow-lg dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] space-y-6 flex flex-col justify-between relative group transition-all duration-300"
            >
              <Quote className="w-12 h-12 text-emerald-500/10 absolute top-6 right-6 group-hover:scale-110 group-hover:text-emerald-500/20 transition-all duration-500" />

              <div className="space-y-4 relative z-10 pt-4">
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                    >
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-base text-foreground italic leading-relaxed font-normal">
                  &quot;{rev.content}&quot;
                </p>
              </div>

              <div className="pt-6 border-t border-border flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg flex items-center justify-center text-lg font-outfit font-bold">
                  {rev.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm font-outfit">{rev.name}</h4>
                  <p className="text-xs text-muted-foreground">{rev.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
