import { assigneeMatchesUser } from '../lib/stage';
import type { StageDurum } from '../types';

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PendingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function AssigneeStatusList({
  assignees,
  durum,
  completedBy,
}: {
  assignees: readonly string[];
  durum: StageDurum;
  completedBy: readonly string[] | undefined;
}) {
  const list = [...assignees].filter(Boolean);
  const cb = completedBy ?? [];

  function isAssigneeMarkedDone(name: string): boolean {
    if (durum === 'yesil' || durum === 'mavi') return true;
    return cb.some((c) => assigneeMatchesUser(c, name));
  }

  if (list.length === 0) {
    return <div className="text-[10px] text-slate-500">Atanan yok</div>;
  }

  return (
    <ul className="flex max-w-[15rem] flex-col gap-1.5" aria-label="Atanan sorumlular ve tamamlanma durumu">
      {list.map((name) => {
        const done = isAssigneeMarkedDone(name);
        return (
          <li key={name} className="flex items-center justify-end gap-2">
            {done ? (
              <>
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-400/40"
                  title="Tamamlandı"
                >
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 truncate text-xs font-semibold text-emerald-300" title={`${name} — tamamladı`}>
                  {name}
                </span>
              </>
            ) : (
              <>
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-500/15 text-slate-500 ring-1 ring-white/10"
                  title="Bekliyor"
                >
                  <PendingIcon className="h-3.5 w-3.5 opacity-90" />
                </span>
                <span className="min-w-0 truncate text-xs font-medium text-slate-500" title={`${name} — bekliyor`}>
                  {name}
                </span>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}
