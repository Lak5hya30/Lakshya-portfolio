// Project covers drawn from each project's own core idea (no stock imagery). Server-safe: no hooks.

// A tiny top-down level for the game's cover: # wall, p player, z zombie, + pickup, . floor.
const TILE_MAP = [
  "##################",
  "#....#......z....#",
  "#.p..#..##.......#",
  "#....+..##...z...#",
  "#.......##.......#",
  "###..####....##..#",
  "#.z..........##+.#",
  "##################",
];
const TILE_KIND: Record<string, string> = { "#": "wall", p: "player", z: "zombie", "+": "item" };

/** Each cover is drawn from the project's own core idea, not a stock screenshot. */
export function Cover({ slug }: { slug: string }) {
  if (slug === "ai-defense-lab") {
    return (
      <div className="cover cover-loop" aria-hidden="true">
        <span className="cover-label">closed loop</span>
        <ol className="loop-steps">
          {["Discover", "Simulate", "Attack", "Detect", "Adapt"].map((step, index) => (
            <li key={step} style={{ ["--i" as string]: index }}><span>0{index + 1}</span>{step}</li>
          ))}
        </ol>
      </div>
    );
  }
  if (slug === "bobs-world") {
    return (
      <div className="cover cover-tiles" aria-hidden="true">
        <span className="cover-label">level 1 · night</span>
        <span className="tile-map">
          {TILE_MAP.flatMap((row, y) => [...row].map((cell, x) => <i key={`${x}-${y}`} className={`tile tile-${TILE_KIND[cell] ?? "floor"}`} />))}
        </span>
      </div>
    );
  }
  return (
    <div className="cover cover-voice" aria-hidden="true">
      <span className="cover-label">voice / ready</span>
      <span className="wave">{Array.from({ length: 24 }, (_, i) => <i key={i} style={{ ["--i" as string]: i }} />)}</span>
      <span className="cover-quote">“open browser”</span>
    </div>
  );
}

