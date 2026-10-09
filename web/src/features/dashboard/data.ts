export const tokens = [
  { symbol: "USDC", name: "USD Coin", amount: "152.60", usd: "$152.60", color: "#2775ca" },
  { symbol: "EURC", name: "Euro Coin", amount: "87.20", usd: "$94.10", color: "#34d399" },
  { symbol: "WETH", name: "Wrapped ETH", amount: "0.045", usd: "$113.24", color: "#627eea" },
];

export const txs = [
  { name: "farhan", kind: "Sent to", hash: "0x3af2…7dE1", token: "USDC", amount: "-25.00", status: "Completed", time: "Oct 9, 14:32", dir: "out" },
  { name: "zain.id", kind: "Received from", hash: "0x7c51…8e9f", token: "USDC", amount: "+40.00", status: "Completed", time: "Oct 8, 21:10", dir: "in" },
  { name: "ali", kind: "Request to", hash: "0x4e8f…152c", token: "USDC", amount: "25.00", status: "Pending", time: "Oct 8, 12:05", dir: "req" },
  { name: "link", kind: "Link payment from", hash: "0x92…7a1c", token: "USDC", amount: "+15.50", status: "Completed", time: "Oct 7, 18:22", dir: "in" },
  { name: "arcbuilder", kind: "Received from", hash: "0x1b…70c", token: "USDC", amount: "+12.25", status: "Completed", time: "Oct 5, 20:14", dir: "in" },
];

export const contacts = [
  { name: "farhan", color: "#7c5cff" },
  { name: "ali", color: "#38bdf8" },
  { name: "zain.id", color: "#34d399" },
  { name: "arcbuilder", color: "#f472b6" },
  { name: "bila.id", color: "#fbbf24" },
];

export const links = [
  { title: "Project Payment", amount: "25.00 USDC", count: "3 payments", color: "from-indigo-500 to-violet-500" },
  { title: "Hackathon Fee", amount: "50.00 USDC", count: "1 payment", color: "from-emerald-500 to-teal-400" },
  { title: "Freelance Work", amount: "100.00 USDC", count: "0 payments", color: "from-sky-500 to-indigo-400" },
];
