import React, { useEffect, useState } from 'react';
import { C, ff, fs, useIsMobile } from './theme';

export default function Admin() {
  const isMobile = useIsMobile();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Mock additional data for leads
          const enhancedLeads = data.leads.map((lead: any, i: number) => ({
            ...lead,
            cii: Math.floor(Math.random() * 3) + 1, // 1: Green, 2: Yellow, 3: Red
            source: i % 2 === 0 ? 'Organic Search' : 'Referral',
            status: 'Lead',
          }));
          setLeads(enhancedLeads);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['Date', 'Name', 'Email', 'City', 'Note', 'CII', 'Source', 'Status'];
    const csvContent = [
      headers.join(','),
      ...leads.map((lead) =>
        [
          new Date(lead.created_at).toLocaleDateString(),
          `"${lead.name}"`,
          `"${lead.email}"`,
          `"${lead.city || ''}"`,
          `"${(lead.note || '').replace(/"/g, '""')}"`,
          lead.cii,
          `"${lead.source}"`,
          `"${lead.status}"`,
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'coop_leads.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConvertToMember = (id: number) => {
    setLeads(leads.map((lead) => (lead.id === id ? { ...lead, status: 'Member' } : lead)));
  };

  const getCiiColor = (cii: number) => {
    if (cii === 1) return C.sage;
    if (cii === 2) return C.gold;
    return '#d32f2f';
  };

  const getCiiLabel = (cii: number) => {
    if (cii === 1) return 'Green';
    if (cii === 2) return 'Yellow';
    return 'Red';
  };

  return (
    <div
      style={{
        background: C.bg,
        minHeight: '100vh',
        padding: isMobile ? '24px 12px' : '48px 24px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 32,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: ff,
                fontSize: 32,
                fontWeight: 700,
                color: C.dark,
                marginBottom: 8,
              }}
            >
              Admin Portal
            </h1>
            <p style={{ fontFamily: fs, fontSize: 16, color: C.t1, margin: 0 }}>
              Manage leads, members, and platform analytics.
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            style={{
              background: C.sage,
              color: C.w,
              border: 'none',
              padding: '10px 20px',
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export CSV
          </button>
        </div>

        {/* Top-Level Analytics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              background: C.w,
              padding: 24,
              borderRadius: 12,
              border: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: C.t1,
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Total Leads
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: C.dark, fontFamily: ff }}>
              {leads.length}
            </div>
          </div>
          <div
            style={{
              background: C.w,
              padding: 24,
              borderRadius: 12,
              border: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: C.t1,
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Active Members
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: C.sage, fontFamily: ff }}>
              {leads.filter((l) => l.status === 'Member').length}
            </div>
          </div>
          <div
            style={{
              background: C.w,
              padding: 24,
              borderRadius: 12,
              border: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: C.t1,
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Avg CII Score
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: C.gold, fontFamily: ff }}>
              {leads.length
                ? (leads.reduce((acc, l) => acc + l.cii, 0) / leads.length).toFixed(1)
                : '0.0'}
            </div>
          </div>
          <div
            style={{
              background: C.w,
              padding: 24,
              borderRadius: 12,
              border: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: C.t1,
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Active LMNs
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: C.blue, fontFamily: ff }}>
              {leads.filter((l) => l.status === 'Member').length}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ fontFamily: fs, color: C.t1 }}>Loading leads...</div>
        ) : (
          <div
            style={{
              background: C.w,
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr
                    style={{
                      background: C.dk2,
                      color: C.w,
                      fontFamily: fs,
                      fontSize: 13,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Contact</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Source</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>CII</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, textAlign: 'right' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          padding: '24px',
                          textAlign: 'center',
                          fontFamily: fs,
                          color: C.t4,
                        }}
                      >
                        No leads found.
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr
                        key={lead.id}
                        style={{
                          borderBottom: `1px solid ${C.border}`,
                          fontFamily: fs,
                          fontSize: 14,
                          color: C.dark,
                        }}
                      >
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', color: C.t1 }}>
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                          {lead.name}
                          <div style={{ fontSize: 12, color: C.t3, fontWeight: 400, marginTop: 4 }}>
                            {lead.city || 'No city'}
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <a
                            href={`mailto:${lead.email}`}
                            style={{ color: C.sage, textDecoration: 'none' }}
                          >
                            {lead.email}
                          </a>
                        </td>
                        <td style={{ padding: '16px 24px', color: C.t1 }}>{lead.source}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span
                            style={{
                              background: `${getCiiColor(lead.cii)}20`,
                              color: getCiiColor(lead.cii),
                              padding: '4px 8px',
                              borderRadius: 4,
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {getCiiLabel(lead.cii)}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span
                            style={{
                              background: lead.status === 'Member' ? C.sageBg : C.bg,
                              color: lead.status === 'Member' ? C.sage : C.t1,
                              padding: '4px 8px',
                              borderRadius: 4,
                              fontSize: 12,
                              fontWeight: 600,
                              border: `1px solid ${lead.status === 'Member' ? C.sage : C.border}`,
                            }}
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          {lead.status === 'Lead' && (
                            <button
                              onClick={() => handleConvertToMember(lead.id)}
                              style={{
                                background: C.dark,
                                color: C.w,
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: 4,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Convert to Member
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
