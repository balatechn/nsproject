'use client';

export const dynamic = 'force-dynamic';

import { motion } from 'framer-motion';
import {
  Activity, Flame, Footprints, Car, CheckCircle2, Truck,
  Handshake, XCircle, ChevronRight, Calendar, Plus,
  MessageCircle, BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';

// ---- Static demo data matching the reference screenshot ----
const metrics = [
  { key: 'totalLeads', label: 'Total Leads', value: 2, Icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'hotLeads', label: 'Hot Leads', value: 0, Icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' },
  { key: 'walkIns', label: 'Walk-Ins', value: 1, Icon: Footprints, color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'testDrives', label: 'Test Drives', value: 1, Icon: Car, color: 'text-sky-600', bg: 'bg-sky-50' },
  { key: 'bookings', label: 'Bookings', value: 0, Icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'deliveries', label: 'Deliveries', value: 0, Icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { key: 'negotiation', label: 'In Negotiation', value: 0, Icon: Handshake, color: 'text-purple-600', bg: 'bg-purple-50' },
  { key: 'lost', label: 'Lost', value: 0, Icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
];

const funnel = [
  { label: 'Leads', value: 2, color: 'bg-emerald-500 text-white' },
  { label: 'Test Drive', value: 1, color: 'bg-sky-500 text-white' },
  { label: 'Booking', value: 0, color: 'bg-indigo-500 text-white' },
  { label: 'Delivery', value: 0, color: 'bg-violet-500 text-white' },
];

const followUps = [
  {
    initials: 'NK',
    name: 'Naveen Kotian',
    phone: '9945754445',
    leadId: 'LEAD-000019',
    status: 'Test Drive Scheduled',
    time: '09:12 PM',
  },
];

const brandPerformance = [
  { name: 'ISUZU', leads: 4, bookings: 0, walkIns: 4, lost: 0, convPct: 0 },
];

const myPerformance = [
  { id: 1, name: 'Venitha', branch: 'Main Branch', leads: 2, followUps: 1, walkIns: 1, bookings: 0, convPct: 0 },
];

const dateFilters = ['Today', 'This Week', 'This Month', 'Last 30 Days'];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const displayName = user?.firstName || 'Guest';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      {/* Page header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold tracking-tight">
            My Dashboard — <span className="text-foreground/90">{displayName}</span>
          </h1>
          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0 rounded-full px-2.5">● 1 Open</Badge>
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 rounded-full px-2.5">● 1 Active</Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 rounded-full bg-muted p-1 text-xs">
            {dateFilters.map((f, i) => (
              <button
                key={f}
                className={`px-3 py-1 rounded-full transition ${
                  i === 2 ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:bg-background/60'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="rounded-full text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100">
            <MessageCircle className="h-3.5 w-3.5 mr-1.5" /> WhatsApp · Live
          </Button>
          <Button size="sm" className="rounded-full bg-rose-600 hover:bg-rose-700 text-white">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Lead
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <Card className="border-muted">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-600" /> Performance Overview
          </CardTitle>
          <span className="text-xs text-muted-foreground">01 May – 31 May 2026</span>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {metrics.map(({ key, label, value, Icon, color, bg }) => (
              <div
                key={key}
                className="rounded-xl border bg-card p-3 flex items-center gap-3 hover:shadow-sm transition"
              >
                <div className={`${bg} ${color} rounded-lg p-2 shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold leading-none">{value}</div>
                  <div className="text-[11px] text-muted-foreground mt-1 truncate">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Conversion funnel */}
          <div className="mt-4 rounded-xl border bg-muted/30 p-3 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 pr-4 border-r">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
              <div>
                <div className="text-xl font-bold leading-none">0.0%</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Lead → Booking Conversion</div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {funnel.map((s, i) => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium ${s.color}`}>
                    <span className="font-bold">{s.value}</span>
                    <span>{s.label}</span>
                  </div>
                  {i < funnel.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
              ))}
            </div>
            <div className="ml-auto text-xs text-muted-foreground">Avg close: —</div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Follow-Ups */}
      <Card className="border-muted">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-600" /> Today&apos;s Follow-Ups
          </CardTitle>
          <span className="text-xs text-muted-foreground">{followUps.length} pending</span>
        </CardHeader>
        <CardContent className="space-y-2">
          {followUps.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border bg-card p-3 hover:bg-muted/40 transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-semibold">
                  {f.initials}
                </div>
                <div>
                  <div className="text-sm font-medium">{f.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {f.phone} · {f.leadId}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-0 rounded-full">
                  {f.status}
                </Badge>
                <span className="text-xs text-muted-foreground tabular-nums">{f.time}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Brand Performance */}
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Car className="h-4 w-4 text-emerald-600" /> Brand Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {brandPerformance.map((b) => (
              <div key={b.name} className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-bold">{b.name}</div>
                    <div className="text-[11px] text-muted-foreground">{b.leads} leads</div>
                  </div>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-[11px] text-muted-foreground">Bookings</div>
                    <div className="text-sm font-semibold">{b.bookings}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">Walk-Ins</div>
                    <div className="text-sm font-semibold">{b.walkIns}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">Lost</div>
                    <div className="text-sm font-semibold">{b.lost}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">Conv %</div>
                    <div className="text-sm font-semibold">{b.convPct}%</div>
                  </div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${b.convPct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* My Performance Table */}
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-600" /> My Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground border-b">
                  <th className="px-4 py-2 font-medium">#</th>
                  <th className="px-4 py-2 font-medium">Executive</th>
                  <th className="px-4 py-2 font-medium">Branch</th>
                  <th className="px-4 py-2 font-medium">Leads</th>
                  <th className="px-4 py-2 font-medium">Follow-ups</th>
                  <th className="px-4 py-2 font-medium">Walk-Ins</th>
                  <th className="px-4 py-2 font-medium">Bookings</th>
                  <th className="px-4 py-2 font-medium">Conv %</th>
                </tr>
              </thead>
              <tbody>
                {myPerformance.map((row, i) => (
                  <tr key={row.id} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-semibold">
                          {row.name.charAt(0)}
                        </div>
                        <span className="font-medium">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.branch}</td>
                    <td className="px-4 py-3 font-medium">{row.leads}</td>
                    <td className="px-4 py-3 font-medium">{row.followUps}</td>
                    <td className="px-4 py-3 font-medium">{row.walkIns}</td>
                    <td className="px-4 py-3 font-medium">{row.bookings}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="rounded-full text-[11px]">
                        {row.convPct}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
