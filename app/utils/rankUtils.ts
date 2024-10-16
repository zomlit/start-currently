export const ROCKET_LEAGUE_RANKS = [
  { name: "SSL", iconUrl: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-22.png" },
  {
    name: "GC3",
    iconUrl: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s15rank21.png",
  },
  {
    name: "GC2",
    iconUrl: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s15rank20.png",
  },
  {
    name: "GC1",
    iconUrl: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s15rank19.png",
  },
  { name: "C3", iconUrl: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-18.png" },
  { name: "C2", iconUrl: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-17.png" },
  { name: "C1", iconUrl: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-16.png" },
  { name: "D3", iconUrl: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-15.png" },
  { name: "D2", iconUrl: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-14.png" },
  { name: "D1", iconUrl: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-13.png" },
  { name: "P3", iconUrl: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-12.png" },
  { name: "P2", iconUrl: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-11.png" },
  { name: "P1", iconUrl: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-10.png" },
  { name: "G3", iconUrl: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-9.png" },
  { name: "G2", iconUrl: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-8.png" },
  { name: "G1", iconUrl: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-7.png" },
  { name: "S3", iconUrl: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-6.png" },
  { name: "S2", iconUrl: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-5.png" },
  { name: "S1", iconUrl: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-4.png" },
  { name: "B3", iconUrl: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-3.png" },
  { name: "B2", iconUrl: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-2.png" },
  { name: "B1", iconUrl: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-1.png" },
];

export const RANK_IMAGES = {
  B1: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-1.png",
  B2: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-2.png",
  B3: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-3.png",
  S1: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-4.png",
  S2: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-5.png",
  S3: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-6.png",
  G1: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-7.png",
  G2: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-8.png",
  G3: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-9.png",
  P1: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-10.png",
  P2: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-11.png",
  P3: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-12.png",
  D1: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-13.png",
  D2: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-14.png",
  D3: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-15.png",
  C1: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-16.png",
  C2: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-17.png",
  C3: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-18.png",
  GC1: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s15rank19.png",
  GC2: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s15rank20.png",
  GC3: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s15rank21.png",
  SSL: "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/s4-22.png",
};

export const RANK_ORDER = [
  "B1",
  "B2",
  "B3",
  "S1",
  "S2",
  "S3",
  "G1",
  "G2",
  "G3",
  "P1",
  "P2",
  "P3",
  "D1",
  "D2",
  "D3",
  "C1",
  "C2",
  "C3",
  "GC1",
  "GC2",
  "GC3",
  "SSL",
];

export const getFullRankName = (rank) => {
  if (!rank) return "Unknown";

  if (rank === "SSL") return "Supersonic Legend";

  const [letter, number] = rank.split("");
  const ranks = {
    B: "Bronze",
    S: "Silver",
    G: "Gold",
    P: "Platinum",
    D: "Diamond",
    C: "Champion",
    GC: "Grand Champion",
  };

  if (rank.startsWith("GC")) {
    return `${ranks["GC"]} ${rank.slice(2)}`;
  }

  return `${ranks[letter] || "Unknown"} ${number || ""}`;
};

export const getRankColor = (rank) => {
  if (rank.startsWith("GC")) return "#ff5b5b"; // Check for GC first
  if (rank.startsWith("B")) return "#955a39";
  if (rank.startsWith("S")) return "#a1a1a1";
  if (rank.startsWith("G")) return "#e4a229";
  if (rank.startsWith("P")) return "#96c1e3";
  if (rank.startsWith("D")) return "#4cc0ff";
  if (rank.startsWith("C")) return "#b444ff";
  if (rank === "SSL") return "#ffce30";
  return "#2c2c2c"; // Default dark background
};

export const abbreviateRank = (rank) => {
  if (rank === "Supersonic Legend") return "SSL";

  const [tierName, division] = rank.split(" ");

  const abbreviations = {
    Bronze: "B",
    Silver: "S",
    Gold: "G",
    Platinum: "P",
    Diamond: "D",
    Champion: "C",
    Grand: "GC",
  };

  const romanToArabic = {
    I: "1",
    II: "2",
    III: "3",
    IV: "4",
  };

  let tierAbbr = abbreviations[tierName];

  // Special handling for Grand Champion
  if (tierName === "Grand") {
    const gcNumber = romanToArabic[rank.split(" ")[2]] || "1";
    return `GC${gcNumber}`;
  }

  const divisionNumber = romanToArabic[division] || division;

  return `${tierAbbr}${divisionNumber}`;
};

export const sortPlayersByRank = (players) => {
  return [...players].sort((a, b) => {
    const rankA = RANK_ORDER.indexOf(a.abbreviatedRank);
    const rankB = RANK_ORDER.indexOf(b.abbreviatedRank);
    return rankB - rankA; // Sort in ascending order (lowest rank first)
  });
};
