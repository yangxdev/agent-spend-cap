import { Section } from '../../components/shell/index.ts';
import { DetailList } from '../../components/ui/index.ts';

const LIMITS = [
  {
    label: 'Tokens per turn',
    value: 'They are averages. Context that grows over a long run is not modelled.',
  },
  {
    label: 'Discounts',
    value:
      'No prompt-caching discounts and no batch pricing. Costs here can be higher than a real bill.',
  },
  {
    label: 'Retries',
    value:
      'A retry is a whole extra pass over every agent. Partial retries and loops are not modelled.',
  },
  {
    label: 'Enforcement',
    value: 'The estimate does not stop anything. The config text is yours to wire in and test.',
  },
  {
    label: 'Prices',
    value: 'Vendor prices change. Check the current price page before you trust a figure.',
  },
];

export function LimitsSection() {
  return (
    <Section
      id="limits"
      index="03"
      label="Limits"
      title="What the numbers leave out"
      lede="Check these before relying on an estimate."
    >
      <DetailList items={LIMITS} />
    </Section>
  );
}
