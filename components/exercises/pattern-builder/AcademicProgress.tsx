"use client";

interface AcademicProgressProps {
  completedModules: number;
  totalModules: number;
  progressPercent: number;
  nextUnit: string;
}

export function AcademicProgress({
  completedModules,
  totalModules,
  progressPercent,
  nextUnit,
}: AcademicProgressProps) {
  return (
    <div
      id="academic-progress-bar"
      style={{
        borderRadius: 10,
        padding: "18px 24px",
        background: "#ffffff",
        border: "1px solid #e4e8ed",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#8594a3",
            }}
          >
            Academic Progress
          </p>
          <p
            style={{
              margin: "3px 0 0",
              fontSize: 13,
              fontWeight: 600,
              color: "#1a2f3f",
            }}
          >
            {progressPercent}%{" "}
            <span style={{ fontWeight: 400, color: "#6b7a87" }}>
              · {completedModules} of {totalModules} modules completed
            </span>
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#8594a3",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Next:
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#0d9488",
            }}
          >
            {nextUnit}
          </span>
        </div>
      </div>

      {/* Progress track */}
      <div
        style={{
          height: 4,
          borderRadius: 9999,
          background: "#edf0f3",
          overflow: "hidden",
        }}
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${progressPercent}% completed`}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPercent}%`,
            background: "#0d9488",
            borderRadius: 9999,
            transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
    </div>
  );
}
