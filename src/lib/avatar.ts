/**
 * 12x12 pixel-art avatar (dev with headphones).
 * Edit the rows to redraw — each char maps to a colour below.
 */
const PALETTE: Record<string, string> = {
  H: "#2b2118", // hair
  S: "#eab584", // skin
  s: "#d29760", // skin shadow
  E: "#15130e", // eyes
  P: "#c0392b", // headphone cup
  B: "#15130e", // headphone band
  C: "#2e7d32", // hoodie
  W: "#f3ead2", // collar shine
  ".": "transparent",
};

const ROWS = [
  "....HHHH....",
  "..HHHHHHHH..",
  ".HHHHHHHHHH.",
  ".HHSSSSSSHH.",
  "BPSSSSSSSSPB",
  "BPSEESSEESPB",
  "BPSSSSSSSSPB",
  ".PSSSssSSSP.",
  "..SSSssSSS..",
  "...sSSSSs...",
  "..CCCCCCCC..",
  ".CWCCCCCCWC.",
];

export const avatarCells: string[] = ROWS.flatMap((row) =>
  [...row].map((ch) => PALETTE[ch] ?? "transparent"),
);
