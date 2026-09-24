import { formatKm } from '@/lib/format';
import { FUEL_LABEL, GEARBOX_LABEL, type Car } from '@/types/car';

type Row = [label: string, value: string | number | null | undefined];

function Column({ rows }: { rows: Row[] }) {
  return (
    <dl className="space-y-2">
      {rows
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => (
          <div key={k} className="grid grid-cols-[120px_1fr] items-baseline gap-2">
            <dt className="text-white/50">{k}</dt>
            <dd className="font-semibold">{v}</dd>
          </div>
        ))}
    </dl>
  );
}

/** Turbo.az üslubunda 2 sütunlu xüsusiyyətlər cədvəli (mobildə 1 sütun). */
export function SpecTable({ car, className = '' }: { car: Car; className?: string }) {
  const engine = [
    car.engine_l ? `${car.engine_l.toFixed(1)} L` : null,
    car.engine_hp ? `${car.engine_hp} a.g.` : null,
    FUEL_LABEL[car.fuel],
  ]
    .filter(Boolean)
    .join(' / ');

  return (
    <div className={`grid grid-cols-1 gap-x-10 gap-y-2 text-sm md:grid-cols-2 ${className}`}>
      <Column
        rows={[
          ['Şəhər', 'Bakı'],
          ['Marka', car.brand],
          ['Model', car.model],
          ['Buraxılış ili', car.year],
          ['Ban növü', car.body_type],
          ['Rəng', car.color],
        ]}
      />
      <Column
        rows={[
          ['Mühərrik', engine],
          ['Yürüş', car.mileage_km != null ? formatKm(car.mileage_km) : null],
          ['Sürətlər qutusu', GEARBOX_LABEL[car.gearbox]],
          ['Ötürücü', car.drive],
        ]}
      />
    </div>
  );
}
