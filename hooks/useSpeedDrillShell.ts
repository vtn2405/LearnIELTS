import { useEffect } from "react";

export default function useSpeedDrillShell() {
  useEffect(() => {
    document.body.classList.add("speed-drill-fullscreen");
    // Inject CSS once
    const id = "sd-hide-shell";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `
        body.speed-drill-fullscreen header { display: none !important; }
        body.speed-drill-fullscreen aside { display: none !important; }
        body.speed-drill-fullscreen main { height: 100vh !important; }
      `;
      document.head.appendChild(style);
    }
    return () => { document.body.classList.remove("speed-drill-fullscreen"); };
  }, []);
}
