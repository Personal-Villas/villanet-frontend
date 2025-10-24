import { useEffect, useState } from 'react';
import { api } from '../api/api';
import { useAuth } from '../auth/useAuth';

type Inquiry = {
  id:number; createdAt:string; status:'new'|'responded';
  propertyId:string; propertyName:string;
  dates:{ checkIn:string; checkOut:string };
  guest:{ name:string; pax:number };
  travelAgent:{ name:string; email:string; phone:string };
  notes?:string; respondedAt?:string;
};

export default function PMCInbox() {
  const { accessToken } = useAuth();
  const headers = { Authorization: `Bearer ${accessToken}` };
  const [tab, setTab] = useState<'all'|'new'|'responded'>('new');
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const q = new URLSearchParams();
    if (tab !== 'all') q.set('status', tab);
    const data = await api<{results: Inquiry[]}>('/pmc/inquiries?'+q.toString(), { headers });
    setItems(data.results || []);
    setLoading(false);
  };

  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, [tab]);

  const mark = async (id:number) => {
    await api(`/pmc/inquiries/${id}/respond`, { method:'PATCH', headers });
    await load();
  };

  const counters = {
    all: items.length,
    new: items.filter(i=>i.status==='new').length,
    responded: items.filter(i=>i.status==='responded').length
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">PMC – Inquiries</h1>
      <div className="flex gap-2 mb-4">
        {(['new','all','responded'] as const).map(k => (
          <button key={k}
            className={`px-4 py-2 rounded-full border ${tab===k?'bg-black text-white':'bg-white'}`}
            onClick={()=>setTab(k)}>
            {k[0].toUpperCase()+k.slice(1)} ({k==='all'?counters.all:k==='new'?counters.new:counters.responded})
          </button>
        ))}
      </div>

      {loading ? 'Loading…' : (
        <div className="space-y-3">
          {items.map(i => (
            <article key={i.id} className="bg-white border rounded-xl p-4 flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium">{i.propertyName}</div>
                <div className={`text-xs px-2 py-1 rounded-full ${i.status==='new'?'bg-amber-100 text-amber-800':'bg-emerald-100 text-emerald-800'}`}>{i.status}</div>
              </div>
              <div className="text-sm text-neutral-700">
                <div>Dates: {i.dates.checkIn} → {i.dates.checkOut} • Guest: {i.guest.name} ({i.guest.pax})</div>
                <div>TA: {i.travelAgent.name} • <a className="underline" href={`mailto:${i.travelAgent.email}`}>{i.travelAgent.email}</a> • <a className="underline" href={`tel:${i.travelAgent.phone}`}>{i.travelAgent.phone}</a></div>
                {i.notes ? <div>Notes: {i.notes}</div> : null}
              </div>
              <div className="flex justify-end gap-2">
                {i.status==='new' && (
                  <button onClick={()=>mark(i.id)} className="px-3 py-2 rounded-lg bg-black text-white text-sm">
                    Mark Responded
                  </button>
                )}
              </div>
            </article>
          ))}
          {items.length===0 && <div className="text-sm text-neutral-600">No inquiries</div>}
        </div>
      )}
    </div>
  );
}
