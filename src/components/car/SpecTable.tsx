import { formatKm } from '@/lib/format';
import { FUEL_LABEL, GEARBOX_LABEL, type Car } from '@/types/car';

export function SpecTable({ car }: { car: Car }) {
  const rows: [string, string | number | null | undefined][] = [
    ['Marka', car.brand],
    ['Model', car.model],
    ['Buraxılış ili', car.year],
    ['Mühərrik', car.engine_l ? `${car.engine_l.toFixed(1)} L` : null],
    ['Güc', car.engine_hp ? `${car.engine_hp} a.g.` : null],
    ['Yanacaq', FUEL_LABEL[car.fuel]],
    ['Sürətlər qutusu', GEARBOX_LABEL[car.gearbox]],
    ['Yürüş', car.mileage_km != null ? formatKm(car.mileage_km) : null],
    ['Ban növü', car.body_type],
    ['Ötürücü', car.drive],
    ['Rəng', car.color],
  ];
  return (
    <dl className="divide-y divide-white/5 overflow-hidden rounded-2xl bg-coal ring-1 ring-white/5">
      {rows
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 px-4 py-3 text-[15px]">
            <dt className="text-white/55">{k}</dt>
            <dd className="text-right font-semibold">{v}</dd>
          </div>
        ))}
    </dl>
  );
}
