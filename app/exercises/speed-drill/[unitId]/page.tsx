"use client";

import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const SpeedDrillModule = dynamic(
  () => import("../../../../components/exercises/SpeedDrillModule"),
  { ssr: false, loading: () => <LoadingScreen /> }
);

// Dark loading screen to prevent white flash
function LoadingScreen() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#09090b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          border: "4px solid #27272a",
          borderTop: "4px solid #6366f1",
          borderRadius: "50%",
          animation: "sdLoadSpin 0.8s linear infinite",
        }}
      />
      <p style={{ color: "#64748b", fontSize: 14, fontWeight: 600, margin: 0 }}>
        Đang tải bài luyện…
      </p>
      <style>{`@keyframes sdLoadSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function SpeedDrillUnitPage() {
  const params = useParams();
  const router = useRouter();
  const unitId = Number(params.unitId);

  if (!unitId || unitId < 1 || unitId > 16) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#09090b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fca5a5",
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        Unit không hợp lệ. Vui lòng chọn unit từ 1-16.
      </div>
    );
  }

  return (
    <div
      data-sd-route
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        overflowY: "auto",
        background: "#0f172a",
        colorScheme: "dark",
      }}
    >
      <SpeedDrillModule
        unitId={unitId}
        onBackHub={() => router.push("/exercises/speed-drill")}
      />
    </div>
  );
}
