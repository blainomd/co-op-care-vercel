/**
 * TimeBankWallet — Balance display with earn/spend/buy CTAs
 *
 * Shows the 6-field balance breakdown with visual indicators.
 */

// Placeholder balance until API integration
const PLACEHOLDER_BALANCE = {
  earned: 24.5,
  spent: 12.0,
  bought: 10.0,
  donated: 0,
  expired: 0,
  deficit: 0,
  available: 22.5,
};

export function TimeBankWallet() {
  const balance = PLACEHOLDER_BALANCE;

  return (
    <div className="col-span-1 rounded-xl border border-border bg-white p-4 md:col-span-2 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-text-primary">Time Bank</h2>
        <a href="#/timebank" className="text-sm font-medium text-sage hover:text-sage-dark">
          View all
        </a>
      </div>

      {/* Available balance — large display */}
      <div className="mb-4 text-center">
        <p className="text-4xl font-bold text-sage">{balance.available}</p>
        <p className="text-sm text-text-secondary">hours available</p>
      </div>

      {/* Breakdown grid */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-sage/5 p-2">
          <p className="text-lg font-semibold text-sage">{balance.earned}</p>
          <p className="text-xs text-text-muted">Earned</p>
        </div>
        <div className="rounded-lg bg-copper/5 p-2">
          <p className="text-lg font-semibold text-copper">{balance.spent}</p>
          <p className="text-xs text-text-muted">Spent</p>
        </div>
        <div className="rounded-lg bg-gold/5 p-2">
          <p className="text-lg font-semibold text-gold">{balance.bought}</p>
          <p className="text-xs text-text-muted">Bought</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex gap-2">
        <a
          href="#/timebank"
          className="flex-1 rounded-lg bg-sage px-3 py-2 text-center text-sm font-medium text-white hover:bg-sage-dark"
        >
          Find Tasks
        </a>
        <a
          href="#/timebank/buy"
          className="flex-1 rounded-lg border border-sage px-3 py-2 text-center text-sm font-medium text-sage hover:bg-sage/5"
        >
          Buy Credits
        </a>
      </div>
    </div>
  );
}
