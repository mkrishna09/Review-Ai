import ScoreRing from "./score-ring";
import Panel from "../core/panel";

const metrics = [
  {
    label: "Security",
    value: 88,
  },
  {
    label: "Performance",
    value: 94,
  },
  {
    label: "Maintainability",
    value: 91,
  },
  {
    label: "Documentation",
    value: 83,
  },
];

export default function RepositoryHealth() {
  return (
    <Panel className="p-8">
      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        {/* Left */}

        <div className="flex flex-col items-center justify-center">
          <ScoreRing score={92} />

          <div className="mt-8 text-center">
            <h2 className="text-2xl font-semibold">SecureAuth</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              AI Repository Score
            </p>

            <span className="mt-4 inline-flex rounded-full bg-green-500/10 px-4 py-2 text-sm font-medium text-green-500">
              Excellent
            </span>
          </div>
        </div>

        {/* Right */}

        <div className="flex flex-col justify-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Repository Health
            </p>

            <h3 className="mt-2 text-3xl font-semibold tracking-tight">
              AI Review Summary
            </h3>

            <p className="mt-3 max-w-xl text-muted-foreground">
              SecureAuth shows excellent maintainability, strong performance and
              only a few security improvements are recommended.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-border bg-background/50 p-5"
              >
                <p className="text-sm text-muted-foreground">{metric.label}</p>

                <p className="mt-3 text-3xl font-semibold">{metric.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Last Review</p>

              <p className="mt-1 font-medium">2 minutes ago</p>
            </div>

            <button className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white transition hover:opacity-90">
              View Full Review
            </button>
          </div>
        </div>
      </div>
    </Panel>
  );
}
