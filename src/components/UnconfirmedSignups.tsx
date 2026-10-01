import SendReminderButton from '@/components/SendReminderButton';
import ReminderPreviewButton from '@/components/ReminderPreviewButton';

export type UnconfirmedRow = {
  id: string;
  email: string;
  name: string;
  signedUp: string;
  lastReminder: string | null;
  reminders: number;
  kind: 'never confirmed' | 'link eaten by mail security' | 'confirmed, never signed in';
};

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Europe/Brussels',
});

function daysAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
  return days === 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`;
}

// People who started signing up but never clicked the link in their email, so
// they never got a profile and show up nowhere else in the admin.
export default function UnconfirmedSignups({ rows }: { rows: UnconfirmedRow[] }) {
  return (
    <div>
      <p className="text-sm text-ink/55 mb-3 max-w-2xl">
        Everybody with an account who has never got into it. Some never clicked the link. Others had
        their address confirmed within seconds by their own mail security, which used up the link and
        locked them out, and the Why column says which. &ldquo;Send final reminder&rdquo; emails them
        once, with the date they signed up and a fresh link that a scanner cannot spend: whoever never
        confirmed is asked to confirm, and whoever was locked out is told their account is ready and
        that the fault was ours. Each person gets one reminder only. Some of these are bots, so check
        the address before you send. &ldquo;Send me a preview&rdquo; emails you the same message first.
      </p>
      <div className="mb-4">
        <ReminderPreviewButton signedUpAt={rows[0]?.signedUp ?? new Date().toISOString()} />
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-ink/60">No unconfirmed signups right now.</p>
      ) : (
        <div className="overflow-x-auto rounded-[2px] border border-rule/20">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-rule/20 text-left text-xs font-semibold uppercase tracking-wider text-ink/45">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Signed up</th>
                <th className="px-4 py-3">Why</th>
                <th className="px-4 py-3">Last reminder</th>
                <th className="px-4 py-3">Remind</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/10">
              {rows.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="px-4 py-3 font-medium text-ink">{r.email}</td>
                  <td className="px-4 py-3 text-ink/60">
                    <span
                      className={
                        r.kind === 'link eaten by mail security'
                          ? 'text-[#dd3c13]'
                          : undefined
                      }
                    >
                      {r.kind}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink/75">{r.name || '—'}</td>
                  <td className="px-4 py-3 text-ink/75">
                    {dateFmt.format(new Date(r.signedUp))}
                    <span className="block text-xs text-ink/45">{daysAgo(r.signedUp)}</span>
                  </td>
                  <td className="px-4 py-3 text-ink/75">
                    {r.lastReminder ? dateFmt.format(new Date(r.lastReminder)) : 'Never'}
                    {r.reminders > 1 && <span className="block text-xs text-ink/45">{r.reminders} sent</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-start gap-3">
                      <SendReminderButton userId={r.id} alreadyReminded={Boolean(r.lastReminder)} />
                      <a
                        href={`mailto:${r.email}?subject=${encodeURIComponent('Finish setting up your european campaign playbook account')}`}
                        className="pt-1.5 text-xs text-ink underline underline-offset-2 hover:no-underline"
                      >
                        Email personally
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
