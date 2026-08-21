'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Bagaimana cara laporan setoran terkirim otomatis ke WhatsApp wali murid?',
      a: 'Anda hanya perlu melakukan Scan QR Code WhatsApp pada menu Pengaturan WhatsApp di dashboard. Setelah terhubung, sistem akan otomatis mengirim pesan setiap ustadz menginput setoran baru.',
    },
    {
      q: 'Apakah data hafalan santri aman & terlindungi?',
      a: 'Sangat aman. Data sensitif terenkripsi menggunakan algoritma AES-256-GCM. Selain itu, kami memiliki fitur Auto-Backup Telegram untuk mencegah kehilangan data.',
    },
    {
      q: 'Apakah HafalanKu bisa digunakan untuk ustadz perorangan?',
      a: 'Tentu. Kami menyediakan Paket Mandiri (Gratis) khusus untuk ustadz perorangan yang mengajar private dengan kuota maksimal 20 santri.',
    },
    {
      q: 'Bagaimana jika perangkat HP ustadz berganti?',
      a: 'Tidak perlu khawatir. HafalanKu adalah Web App berbasis Cloud. Anda cukup login dari browser di perangkat baru, dan seluruh data akan langsung sinkron.',
    },
    {
      q: 'Apakah saya bisa mengunduh laporan ke format Excel?',
      a: 'Ya. Anda dapat mencetak dan mengunduh laporan rekapitulasi capaian hafalan per bulan atau per semester dalam format Excel (.XLSX) dengan satu klik saja.',
    },
  ];

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-32 relative">
      <div className="max-w-3xl mx-auto px-4 md:px-8 space-y-16">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0E8991]/10 text-[#0E8991] dark:text-[#1bb2bd] text-xs font-semibold border border-[#0E8991]/20">
            <MessageCircleQuestion className="w-4 h-4 text-[#EAA27C]" /> Bantuan & FAQ
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-outfit text-foreground tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
        </motion.div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen 
                    ? 'border-[#0E8991]/40 bg-[#0E8991]/10 shadow-[0_10px_30px_rgba(14,137,145,0.15)]' 
                    : 'border-border bg-card dark:bg-[#0C313A] hover:border-[#0E8991]/30'
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold font-outfit text-base md:text-lg text-foreground focus:outline-none cursor-pointer"
                >
                  <span className="flex-1">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isOpen ? 'bg-[#0E8991] text-white' : 'bg-muted text-muted-foreground'}`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <div className="px-6 pb-6 text-muted-foreground leading-relaxed font-light">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
