import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-center bg-oep-slate px-6 pt-16 text-center text-white">
        <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-slate-400">error 404</p>
        <h1 className="oep-headline mt-4 max-w-xl text-[40px] leading-tight tracking-tight">
          Esta página no tiene RCA.
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-7 text-slate-300">
          El expediente que buscas no existe, fue desistido o nunca se presentó ante este observatorio.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-md bg-oep-emerald px-5 py-3 text-[15px] font-semibold text-oep-slate transition-colors duration-nav hover:bg-emerald-300"
        >
          Volver al inicio
        </Link>
      </main>
      <Footer />
    </>
  );
}
