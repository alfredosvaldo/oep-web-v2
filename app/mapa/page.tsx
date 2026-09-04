import Header from '@/components/Header';
import MapExplorer from '@/components/MapExplorer';

export default function Mapa() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <MapExplorer />
      </main>
    </>
  );
}
