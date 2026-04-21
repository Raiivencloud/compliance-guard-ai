import { motion } from 'framer-motion';
const useTranslation = () => ({ 
  t: (key: string) => {
    const texts: any = {
      'hero.title': 'Auditoría Legal de IA en Segundos',
      'hero.subtitle': 'Analizá términos y condiciones con nuestra IA experta. Detectá riesgos críticos y asegurá el cumplimiento normativo en TikTok y más.',
      'hero.badge': 'Nueva Era de Cumplimiento'
    };
    return texts[key] || key;
  }
});
export default function Hero() {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="w-12 h-[2px] bg-blue-600 rounded-full"></span>
        <span className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-600">Enterprise Security Center</span>
      </div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] tracking-tighter"
      >
        {t('heroTitle') || 'Auditoría Legal de IA en Segundos'}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-slate-600 text-lg max-w-lg leading-relaxed font-medium opacity-90"
      >
        {t('heroSub') || 'Analiza términos y condiciones con nuestra IA experta. Detecta riesgos críticos y asegura el cumplimiento normativo de tu organización.'}
      </motion.p>
    </div>
  );
}

