export default function SpeedDrillLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/*
        Inject dark color-scheme so the browser never paints a white
        background between route navigations inside Speed Drill.
        This <meta> overrides the root layout's `color-scheme: light`
        only for this route subtree.
      */}
      <meta name="color-scheme" content="dark" />

      {/*
        The wrapper background must match SD.bg (#0f172a) so that even
        during the brief JS-hydration window the user sees dark, not white.
      */}
      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          /* Prevent any inherited light-mode defaults from bleeding through */
          colorScheme: "dark",
        }}
      >
        {children}
      </div>
    </>
  );
}
