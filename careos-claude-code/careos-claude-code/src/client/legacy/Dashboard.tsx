import React, { useState } from 'react';
import { C, ff, fs, useIsMobile } from './theme';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const vitalsData = [
  { time: '1', hr: 65, sleep: 7.1, hrv: 26, steps: 3200 },
  { time: '2', hr: 66, sleep: 6.8, hrv: 25, steps: 3100 },
  { time: '3', hr: 64, sleep: 7.0, hrv: 27, steps: 3400 },
  { time: '4', hr: 67, sleep: 6.5, hrv: 24, steps: 2800 },
  { time: '5', hr: 68, sleep: 6.2, hrv: 24, steps: 2340 },
];

export default function Dashboard() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock user data
  const user = {
    name: 'Jane Doe',
    role: 'Founding Family',
    balance: 14.5,
    upcoming: [
      {
        id: 1,
        type: 'Care Visit',
        provider: 'Sarah M. (CNA)',
        date: 'Tomorrow, 9:00 AM',
        duration: '4 hrs',
      },
      {
        id: 2,
        type: 'Time Bank Exchange',
        provider: 'David K. (Neighbor)',
        date: 'Thursday, 2:00 PM',
        duration: '1.5 hrs',
      },
    ],
    team: [
      { id: 1, name: 'Sarah M.', role: 'Primary CNA', avatar: 'S' },
      { id: 2, name: 'Dr. Emdur', role: 'Medical Director', avatar: 'E' },
      { id: 3, name: 'David K.', role: 'Time Bank Neighbor', avatar: 'D' },
    ],
    timeline: [
      {
        id: 1,
        who: 'Maria G.',
        action: 'checked in',
        time: '9:00 AM',
        notes: 'Good appetite at lunch.',
        out: '12:45 PM',
      },
      {
        id: 2,
        who: 'Janet R.',
        action: 'delivered meals',
        time: '11:30 AM',
        notes: 'Time Bank credit: +1.5 hrs',
        out: '',
      },
    ],
    messages: [{ id: 1, from: 'Maria G.', text: 'Mom had a good day today', time: '2:45 PM' }],
  };

  return (
    <div
      style={{
        background: C.bg,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: fs,
      }}
    >
      {/* Dashboard Header */}
      <header
        style={{
          background: C.dark,
          color: C.w,
          padding: isMobile ? '24px 16px' : '32px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              color: C.sage,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 4,
            }}
          >
            Conductor Dashboard
          </div>
          <h1 style={{ fontFamily: ff, fontSize: 24, fontWeight: 600, margin: 0 }}>
            Welcome back, {user.name.split(' ')[0]}
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right', display: isMobile ? 'none' : 'block' }}>
            <div
              style={{
                fontSize: 11,
                color: C.t4,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Time Bank Balance
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.gold }}>{user.balance} hrs</div>
          </div>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              background: C.sage,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 700,
              color: C.w,
            }}
          >
            {user.name.charAt(0)}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: isMobile ? '24px 16px' : '48px',
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Wearable Vitals Section */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: C.dark, marginBottom: 16 }}>
            Wearable Vitals
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: 16,
            }}
          >
            {/* HR */}
            <div
              style={{
                background: C.w,
                padding: 16,
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
                  marginBottom: 4,
                }}
              >
                Resting HR
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: C.dark }}>68</span>
                <span style={{ fontSize: 12, color: C.t3 }}>bpm</span>
                <span style={{ fontSize: 12, color: C.sage, marginLeft: 'auto' }}>Normal</span>
              </div>
              <div style={{ height: 40, marginTop: 8 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalsData}>
                    <Line
                      type="monotone"
                      dataKey="hr"
                      stroke={C.sage}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Sleep */}
            <div
              style={{
                background: '#fff0f0',
                padding: 16,
                borderRadius: 12,
                border: `1px solid #ffcaca`,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: C.t1,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Sleep
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: '#d32f2f' }}>6.2</span>
                <span style={{ fontSize: 12, color: C.t3 }}>hrs</span>
                <span style={{ fontSize: 12, color: '#d32f2f', marginLeft: 'auto' }}>
                  ↓ Flagged
                </span>
              </div>
              <div style={{ height: 40, marginTop: 8 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalsData}>
                    <Line
                      type="monotone"
                      dataKey="sleep"
                      stroke="#d32f2f"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* HRV */}
            <div
              style={{
                background: C.w,
                padding: 16,
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
                  marginBottom: 4,
                }}
              >
                HRV
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: C.dark }}>24</span>
                <span style={{ fontSize: 12, color: C.t3 }}>ms</span>
                <span style={{ fontSize: 12, color: C.sage, marginLeft: 'auto' }}>Stable</span>
              </div>
              <div style={{ height: 40, marginTop: 8 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalsData}>
                    <Line
                      type="monotone"
                      dataKey="hrv"
                      stroke={C.sage}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Steps */}
            <div
              style={{
                background: '#fff0f0',
                padding: 16,
                borderRadius: 12,
                border: `1px solid #ffcaca`,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: C.t1,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Steps
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: '#d32f2f' }}>2,340</span>
                <span style={{ fontSize: 12, color: '#d32f2f', marginLeft: 'auto' }}>
                  ↓ from 3.1k
                </span>
              </div>
              <div style={{ height: 40, marginTop: 8 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalsData}>
                    <Line
                      type="monotone"
                      dataKey="steps"
                      stroke="#d32f2f"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: 32 }}
        >
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Care Timeline */}
            <div
              style={{
                background: C.w,
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: `1px solid ${C.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h2 style={{ fontSize: 18, fontWeight: 600, color: C.dark, margin: 0 }}>
                  Care Timeline
                </h2>
              </div>
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
                {user.timeline.map((item, i) => (
                  <div key={item.id} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                    {i !== user.timeline.length - 1 && (
                      <div
                        style={{
                          position: 'absolute',
                          left: 19,
                          top: 40,
                          bottom: -24,
                          width: 2,
                          background: C.border,
                        }}
                      />
                    )}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        background: C.sageBg,
                        color: C.sage,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        zIndex: 1,
                      }}
                    >
                      {item.who.charAt(0)}
                    </div>
                    <div style={{ flex: 1, background: C.bg, padding: 16, borderRadius: 8 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 8,
                        }}
                      >
                        <div style={{ fontSize: 14, color: C.dark }}>
                          <strong>{item.who}</strong> {item.action}
                        </div>
                        <div style={{ fontSize: 12, color: C.t3 }}>{item.time}</div>
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: C.t1,
                          fontStyle: 'italic',
                          background: C.w,
                          padding: 12,
                          borderRadius: 4,
                          borderLeft: `3px solid ${C.sage}`,
                        }}
                      >
                        "{item.notes}"
                      </div>
                      {item.out && (
                        <div style={{ fontSize: 12, color: C.t3, marginTop: 8 }}>
                          Checked out at {item.out}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Schedule */}
            <div
              style={{
                background: C.w,
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: `1px solid ${C.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h2 style={{ fontSize: 18, fontWeight: 600, color: C.dark, margin: 0 }}>
                  Upcoming Schedule
                </h2>
                <button
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: C.sage,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  View Calendar
                </button>
              </div>
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {user.upcoming.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 16,
                      padding: 16,
                      background: C.bg,
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        background: event.type.includes('Time Bank') ? C.copperBg : C.blueLt,
                        color: event.type.includes('Time Bank') ? C.copper : C.blue,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{ fontSize: 15, fontWeight: 600, color: C.dark, marginBottom: 4 }}
                      >
                        {event.type}
                      </div>
                      <div style={{ fontSize: 13, color: C.t1, marginBottom: 4 }}>
                        with {event.provider}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: C.t4,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <span>{event.date}</span>
                        <span>•</span>
                        <span>{event.duration}</span>
                      </div>
                    </div>
                    <button
                      style={{
                        background: C.w,
                        border: `1px solid ${C.border}`,
                        padding: '6px 12px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: C.t1,
                      }}
                    >
                      Details
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Comfort Card Summary */}
            <div
              style={{
                background: C.w,
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: C.dark, margin: 0 }}>
                  Comfort Card Summary (This Month)
                </h2>
              </div>
              <div style={{ padding: 24 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <tbody>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '12px 0', color: C.t1 }}>
                        HSA (Professional Care + Wellness)
                      </td>
                      <td
                        style={{
                          padding: '12px 0',
                          textAlign: 'right',
                          fontWeight: 600,
                          color: C.dark,
                        }}
                      >
                        $600.00
                      </td>
                    </tr>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '12px 0', color: C.t1 }}>Employer PEPM</td>
                      <td
                        style={{
                          padding: '12px 0',
                          textAlign: 'right',
                          fontWeight: 600,
                          color: C.dark,
                        }}
                      >
                        $5.00
                      </td>
                    </tr>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '12px 0', color: C.t1 }}>Time Bank (1.5 hrs)</td>
                      <td
                        style={{
                          padding: '12px 0',
                          textAlign: 'right',
                          fontWeight: 600,
                          color: C.sage,
                        }}
                      >
                        $0.00
                      </td>
                    </tr>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '12px 0', color: C.t1 }}>Private Pay</td>
                      <td
                        style={{
                          padding: '12px 0',
                          textAlign: 'right',
                          fontWeight: 600,
                          color: C.dark,
                        }}
                      >
                        $308.00
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '16px 0 0', fontWeight: 700, color: C.dark }}>
                        Total Processed
                      </td>
                      <td
                        style={{
                          padding: '16px 0 0',
                          textAlign: 'right',
                          fontWeight: 700,
                          color: C.dark,
                        }}
                      >
                        $913.00
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div
                  style={{
                    marginTop: 16,
                    padding: 12,
                    background: C.sageBg,
                    color: C.sage,
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                >
                  Estimated Tax Savings: $180.00
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* LMN Status Widget */}
            <div
              style={{
                background: C.w,
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: `1px solid ${C.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h2 style={{ fontSize: 16, fontWeight: 600, color: C.dark, margin: 0 }}>
                  LMN Status
                </h2>
                <span
                  style={{
                    background: C.sageBg,
                    color: C.sage,
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  Active
                </span>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ fontSize: 13, color: C.t1, marginBottom: 8 }}>
                  Expires: <strong>Dec 2026</strong>
                </div>
                <div style={{ fontSize: 13, color: C.t1, marginBottom: 8 }}>
                  Eligible Services: <strong>12</strong>
                </div>
                <div style={{ fontSize: 13, color: C.t1, marginBottom: 16 }}>
                  Annual HSA Savings: <strong>$6,211</strong>
                </div>
                <button
                  style={{
                    width: '100%',
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    padding: '8px',
                    borderRadius: 4,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: C.dark,
                  }}
                >
                  View Details
                </button>
              </div>
            </div>

            {/* Time Bank Detail */}
            <div
              style={{
                background: C.w,
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: C.dark, margin: 0 }}>
                  Time Bank
                </h2>
              </div>
              <div style={{ padding: 24 }}>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: C.gold,
                    fontFamily: ff,
                    marginBottom: 16,
                  }}
                >
                  {user.balance}{' '}
                  <span style={{ fontSize: 16, color: C.t3, fontWeight: 400 }}>hrs available</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    fontSize: 13,
                    color: C.t1,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Membership Floor:</span> <strong>40 hrs</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Earned This Month:</span> <strong>+4.5 hrs</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Bought This Month:</span> <strong>0 hrs</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Deficit Available:</span> <strong>-20 hrs</strong>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: `1px solid ${C.border}`,
                    }}
                  >
                    <span>Current Streak:</span>{' '}
                    <strong style={{ color: C.copper }}>4 weeks 🔥</strong>
                  </div>
                </div>
                <div
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}
                >
                  <button
                    style={{
                      background: C.sage,
                      color: C.w,
                      border: 'none',
                      padding: '8px',
                      borderRadius: 4,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Earn
                  </button>
                  <button
                    style={{
                      background: C.bg,
                      color: C.dark,
                      border: `1px solid ${C.border}`,
                      padding: '8px',
                      borderRadius: 4,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Spend
                  </button>
                </div>
              </div>
            </div>

            {/* Messaging */}
            <div
              style={{
                background: C.w,
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: `1px solid ${C.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h2 style={{ fontSize: 16, fontWeight: 600, color: C.dark, margin: 0 }}>
                  Messages
                </h2>
                <span
                  style={{
                    background: C.blue,
                    color: C.w,
                    padding: '2px 6px',
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  1 New
                </span>
              </div>
              <div style={{ padding: 0 }}>
                {user.messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      padding: 16,
                      borderBottom: `1px solid ${C.border}`,
                      display: 'flex',
                      gap: 12,
                      cursor: 'pointer',
                      background: C.blueLt,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        background: C.sageBg,
                        color: C.sage,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        flexShrink: 0,
                        fontSize: 12,
                      }}
                    >
                      {msg.from.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 4,
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>
                          {msg.from}
                        </div>
                        <div style={{ fontSize: 11, color: C.t3 }}>{msg.time}</div>
                      </div>
                      <div style={{ fontSize: 13, color: C.t1 }}>{msg.text}</div>
                    </div>
                  </div>
                ))}
                <div style={{ padding: 16, textAlign: 'center' }}>
                  <button
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: C.sage,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    View All Messages
                  </button>
                </div>
              </div>
            </div>

            {/* CII Status */}
            <div style={{ background: C.dark, color: C.w, borderRadius: 12, padding: 24 }}>
              <div
                style={{
                  fontSize: 12,
                  color: C.sage,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 8,
                }}
              >
                CII Assessment
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, fontFamily: ff, marginBottom: 16 }}>
                Zone: Green
              </div>
              <p style={{ fontSize: 14, color: C.t4, lineHeight: 1.5, marginBottom: 24 }}>
                Your Caregiver Intensity Index is currently stable. Your next check-in is scheduled
                for next month.
              </p>
              <button
                style={{
                  width: '100%',
                  background: C.w,
                  color: C.dark,
                  border: 'none',
                  padding: 12,
                  borderRadius: 4,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Take Assessment Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
