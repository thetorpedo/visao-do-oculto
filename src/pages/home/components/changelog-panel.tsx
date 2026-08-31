export interface ChangelogEntry {
    version: string;
    date: string;
    changes: string[];
}

export default function ChangelogList({ entries }: { entries: ChangelogEntry[] }) {
    return (
        <div className="flex flex-col gap-4">
            {entries.map((entry) => (
                <div key={entry.version} className="border-b border-dashed border-gray-400/60 pb-3 last:border-b-0 last:pb-0">
                    <div className="mb-1.5 flex flex-wrap items-baseline gap-2">
                        <span className="font-bold px-1 font-special text-gray-900">
                            {entry.version}
                        </span>
                        <span className="font-daisy text-sm text-gray-500">({entry.date})</span>
                    </div>
                    <ul className="list-outside list-disc space-y-1 pl-5 text-sm text-gray-800 marker:text-gray-500">
                        {entry.changes.map((change, i) => (
                            <li key={i} className="leading-snug">
                                {change}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}