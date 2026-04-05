/**
 * Conductor Dashboard — Single pane of glass for the family conductor
 *
 * Mobile-first design targeting the Conductor (daughter, 35-60, iPhone user).
 * Displays care timeline, Time Bank wallet, CII gauge, and quick actions.
 */
import { RoleSwitch } from '../../components/layout/RoleSwitch';
import { CareTimeline } from './CareTimeline';
import { TimeBankWallet } from './TimeBankWallet';
import { CIIGauge } from './CIIGauge';
import { QuickActions } from './QuickActions';

export function ConductorDashboard() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">Dashboard</h1>
          <p className="mt-0.5 text-sm text-text-secondary">Your family's care at a glance</p>
        </div>
        <RoleSwitch />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <TimeBankWallet />
        <CIIGauge />
      </div>

      {/* Care Timeline */}
      <CareTimeline />
    </div>
  );
}
