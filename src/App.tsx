import { Accent, Hero, SiteFooter, SiteHeader } from './components/shell/index.ts';
import { Note } from './components/ui/index.ts';
import { CapConfigSection } from './features/cap-config/CapConfigSection.tsx';
import { EstimateSection } from './features/estimate/EstimateSection.tsx';
import { LimitsSection } from './features/limits/LimitsSection.tsx';

export default function App() {
  return (
    <div className="min-h-dvh">
      <SiteHeader
        nav={[
          { href: '#estimate', label: 'Estimate' },
          { href: '#cap-config', label: 'Cap config' },
          { href: '#limits', label: 'Limits' },
        ]}
      />

      <main>
        <Hero
          title={
            <>
              Know the worst case before the agents <Accent>start</Accent>.
            </>
          }
          lede="Type your model prices and the shape of the run. You get typical and worst-case cost, and a cap config to copy."
        />
        <EstimateSection />
        <CapConfigSection />
        <LimitsSection />
      </main>

      <SiteFooter>
        <Note>Nothing leaves your browser. The only thing stored is your theme choice.</Note>
        <Note>It estimates and writes text. It cannot stop a run.</Note>
      </SiteFooter>
    </div>
  );
}
