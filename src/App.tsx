import { AppFooter, AppHeader, AppShell } from './components/shell/index.ts';
import { Note } from './components/ui/index.ts';
import { EstimateScreen } from './features/estimate/EstimateScreen.tsx';

export default function App() {
  return (
    <AppShell
      header={<AppHeader />}
      footer={
        <AppFooter
          links={[
            {
              href: 'https://github.com/yangxdev/agent-spend-cap/issues/new',
              label: 'Suggest a change',
            },
          ]}
        >
          <div className="space-y-1">
            <Note>Nothing leaves your browser. The only thing stored is your theme choice.</Note>
            <Note>It estimates and writes text. It cannot stop a run.</Note>
          </div>
        </AppFooter>
      }
    >
      <EstimateScreen />
    </AppShell>
  );
}
