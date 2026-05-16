'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Plus, Search, Filter, Phone, Mail,
  MoreHorizontal, DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import { cn, formatCurrency, formatRelativeTime } from '@/lib/utils';

const PIPELINE_STAGES = [
  { key: 'NEW', label: 'New Leads', color: 'border-t-slate-400' },
  { key: 'CONTACTED', label: 'Contacted', color: 'border-t-blue-500' },
  { key: 'QUALIFIED', label: 'Qualified', color: 'border-t-purple-500' },
  { key: 'PROPOSAL', label: 'Proposal', color: 'border-t-orange-500' },
  { key: 'NEGOTIATION', label: 'Negotiation', color: 'border-t-yellow-500' },
  { key: 'WON', label: 'Won', color: 'border-t-green-500' },
  { key: 'LOST', label: 'Lost', color: 'border-t-red-500' },
];

export default function CrmPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['crm-pipeline', search],
    queryFn: () =>
      api.get('/crm/leads/pipeline').then((r) => r.data),
  });

  const pipeline: Record<string, any[]> = data ?? {};

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            CRM Pipeline
          </h1>
          <p className="text-muted-foreground text-sm">Manage leads and sales pipeline</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Add Lead
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search leads..." className="pl-9 h-9" value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" />Filter</Button>
      </div>

      {/* Pipeline stats bar */}
      <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
        {PIPELINE_STAGES.map((stage) => {
          const leads: any[] = pipeline[stage.key] ?? [];
          const total = leads.reduce((sum, l) => sum + (l.value || 0), 0);
          return (
            <Card key={stage.key} className="text-center py-2">
              <p className="text-xs text-muted-foreground">{stage.label}</p>
              <p className="text-lg font-bold">{isLoading ? '-' : leads.length}</p>
              <p className="text-xs text-green-600">{isLoading ? '-' : formatCurrency(total)}</p>
            </Card>
          );
        })}
      </div>

      {/* Kanban pipeline */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
        {PIPELINE_STAGES.map((stage) => {
          const leads: any[] = pipeline[stage.key] ?? [];
          return (
            <div key={stage.key} className="flex-1 min-w-[240px] max-w-xs">
              <div className={cn('bg-muted/40 rounded-xl border-t-4 flex flex-col h-full', stage.color)}>
                <div className="flex items-center justify-between p-3 pb-2">
                  <h3 className="font-semibold text-sm">{stage.label}</h3>
                  <Badge variant="secondary" className="text-xs">{isLoading ? '-' : leads.length}</Badge>
                </div>
                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  {isLoading
                    ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24" />)
                    : leads.map((lead) => (
                        <LeadCard key={lead.id} lead={lead} />
                      ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LeadCard({ lead }: { lead: any }) {
  return (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="cursor-pointer hover:shadow-md transition-shadow group">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
              {lead.title}
            </p>
            <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
          {lead.company && (
            <p className="text-xs text-muted-foreground">{lead.company}</p>
          )}
          {lead.value > 0 && (
            <div className="flex items-center gap-1 text-green-600">
              <DollarSign className="h-3 w-3" />
              <span className="text-xs font-semibold">{formatCurrency(lead.value)}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {lead.email && <Mail className="h-3 w-3" />}
            {lead.phone && <Phone className="h-3 w-3" />}
            <span className="ml-auto">{formatRelativeTime(lead.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
