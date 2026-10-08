// Deterministic mock dataset for the Spark Pixel sales dashboard.
// Evaluated on both server and client, so it MUST be byte-identical every run:
// no Math.random(), no Date.now()/new Date() at module scope — a seeded PRNG only.

// ---------------------------------------------------------------------------
// Helpers (seeded PRNG + formatters)
// ---------------------------------------------------------------------------

// mulberry32: tiny deterministic PRNG. One shared instance, fixed seed.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(0x53504b58); // fixed seed -> byte-identical output every run

function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pad2(n: number): string {
  return n < 10 ? "0" + n : "" + n;
}

function pad3(n: number): string {
  return n < 10 ? "00" + n : n < 100 ? "0" + n : "" + n;
}

// Locale-independent thousands grouping (Number.toLocaleString would vary by env).
function group(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function money(n: number): string {
  return "₹" + group(n);
}

// European-style percent, e.g. 4.2 -> "4,2%". toFixed always uses ".", spec-stable.
function pct(n: number): string {
  return n.toFixed(1).replace(".", ",") + "%";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

// dayNum 1..91 across Sep(30)/Oct(31)/Nov(30) 2025 -> "6 Nov 2025" style.
function seasonDate(dayNum: number): string {
  if (dayNum <= 30) return `${dayNum} Sep 2025`;
  if (dayNum <= 61) return `${dayNum - 30} Oct 2025`;
  return `${dayNum - 61} Nov 2025`;
}

function orderDate(): string {
  return `${randInt(1, 28)} ${pick(["Oct", "Nov"])} 2025`;
}

// ---------------------------------------------------------------------------
// Exported types (page components code against these shapes)
// ---------------------------------------------------------------------------

export type Transaction = {
  id: string;
  customer: string;
  product: string;
  status: "Success" | "Pending" | "Refunded";
  qty: number;
  unitPrice: string;
  totalRevenue: string;
  date: string;
};

export type Product = {
  name: string;
  sku: string;
  category: "Furniture" | "Accessories" | "Lighting" | "Office Kits";
  price: string;
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  sold: string;
};

export type Customer = {
  name: string;
  email: string;
  location: string;
  orders: number;
  totalSpent: string;
  status: "Active" | "Inactive";
};

export type Order = {
  id: string;
  customer: string;
  items: number;
  total: string;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  date: string;
};

export type Campaign = {
  name: string;
  channel: "Email" | "Instagram" | "Google Ads" | "Facebook" | "TikTok" | "Marketplace";
  status: "Active" | "Paused" | "Ended";
  budget: string;
  spent: string;
  clicks: string;
  ctr: string;
};

export type Ticket = {
  id: string;
  customer: string;
  subject: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "Pending" | "Resolved";
  updated: string;
};

export type Member = {
  name: string;
  role: "Devops Engg." | "Account Exec" | "Sales Rep" | "SDR";
  deals: number;
  revenue: string;
  attainment: number;
};

export type Invoice = {
  id: string;
  date: string;
  amount: string;
  status: "Paid" | "Overdue";
};

export type Conversation = {
  id: number;
  name: string;
  preview: string;
  time: string;
  unread: number;
};

export type ChatMessage = {
  from: "me" | "them";
  text: string;
  time: string;
};

export type MonthPoint = { month: string; revenue: number; lastYear: number };

export type DayBar = { h: number; o: number; b: number };

// ---------------------------------------------------------------------------
// Literal pools
// ---------------------------------------------------------------------------

const NAMES: readonly string[] = [
  "Kaylee Vetrovs", "Ryan Korsgaard", "Omar Dias", "Alena Baptista", "Marcus Chen",
  "Priya Sharma", "Madelyn Lubin", "Abram Bergson", "Phillip Mango", "Aditi Rao",
  "Jonas Weber", "Mei Lin", "Tom Okafor", "Sara Kim", "Leo Martins",
  "Nina Petrova", "Hana Suzuki", "Diego Alvarez", "Fatima Noor", "Lucas Silva",
  "Emma Johansson", "Noah Meyer", "Olivia Brooks", "Liam Murphy", "Sophia Rossi",
  "Ethan Clarke", "Ava Nowak", "Mason Reed", "Isabella Costa", "James Bauer",
  "Amara Okeke", "Daniel Park", "Chloe Dubois", "Henrik Larsen", "Yuki Tanaka",
  "Carlos Mendez", "Layla Hassan", "Oscar Lindqvist", "Grace Wong", "Felix Braun",
  "Zara Malik", "Victor Popescu", "Ingrid Hansen", "Rahul Gupta", "Maya Ferreira",
  "Sven Eriksson", "Nadia Volkova", "Andre Santos", "Elena Ricci", "Kwame Mensah",
  "Julia Novak", "Tariq Aziz", "Camila Reyes", "Bjorn Nilsson", "Anika Patel",
  "Pedro Gomez", "Lena Fischer", "Hugo Moreau", "Sana Iqbal", "Matteo Bianchi",
  "Freya Andersen", "Ravi Menon", "Clara Vogel", "Simon Bakker", "Aisha Rahman",
  "Nikolai Ivanov", "Beatriz Lopes", "Adam Kowalski", "Mira Sato", "Theo Nguyen",
  "Selina Haas", "Owen Fisher",
];

const CITIES: readonly string[] = [
  "Jakarta, ID", "Berlin, DE", "Bandung, ID", "London, GB", "Paris, FR",
  "Madrid, ES", "Lisbon, PT", "Amsterdam, NL", "Toronto, CA", "Austin, US",
  "Seattle, US", "Singapore, SG", "Tokyo, JP", "Seoul, KR", "Sydney, AU",
  "Mumbai, IN", "Dubai, AE", "Sao Paulo, BR", "Mexico City, MX", "Milan, IT",
  "Vienna, AT", "Stockholm, SE", "Copenhagen, DK", "Dublin, IE", "Warsaw, PL",
  "Manila, PH", "Bangkok, TH", "Hanoi, VN", "Kuala Lumpur, MY", "Cape Town, ZA",
];

const PRODUCT_PAIRS: readonly { name: string; category: Product["category"] }[] = [
  { name: "Ergo Office Chair", category: "Furniture" },
  { name: "Standing Desk Pro", category: "Furniture" },
  { name: "Executive Oak Desk", category: "Furniture" },
  { name: "Eco Bookshelf", category: "Furniture" },
  { name: "Cloud Sofa Mini", category: "Furniture" },
  { name: "Maple Nightstand", category: "Furniture" },
  { name: "Green Leaf Desk", category: "Furniture" },
  { name: "Sunset Desk 02", category: "Furniture" },
  { name: "Lounge Armchair", category: "Furniture" },
  { name: "Conference Table XL", category: "Furniture" },
  { name: "Bamboo Side Table", category: "Furniture" },
  { name: "Modular Shelf Unit", category: "Furniture" },
  { name: "Walnut Credenza", category: "Furniture" },
  { name: "Task Stool Compact", category: "Furniture" },
  { name: "Oak Filing Cabinet", category: "Furniture" },
  { name: "Height Desk Compact", category: "Furniture" },
  { name: "Vertical Mouse", category: "Accessories" },
  { name: "Mechanical Keyboard", category: "Accessories" },
  { name: "Laptop Stand", category: "Accessories" },
  { name: "Monitor Arm Duo", category: "Accessories" },
  { name: "Cable Tray Kit", category: "Accessories" },
  { name: "Wrist Rest Gel", category: "Accessories" },
  { name: "USB-C Hub Pro", category: "Accessories" },
  { name: "Desk Mat XL", category: "Accessories" },
  { name: "Footrest Ergo", category: "Accessories" },
  { name: "Headset Stand", category: "Accessories" },
  { name: "Webcam 4K Pro", category: "Accessories" },
  { name: "Docking Station", category: "Accessories" },
  { name: "Phone Dock Mini", category: "Accessories" },
  { name: "Whiteboard Slim", category: "Accessories" },
  { name: "Cable Clip Pack", category: "Accessories" },
  { name: "Desk Lamp Halo", category: "Lighting" },
  { name: "Floor Lamp Arc", category: "Lighting" },
  { name: "LED Strip Kit", category: "Lighting" },
  { name: "Task Light Pro", category: "Lighting" },
  { name: "Ring Light Studio", category: "Lighting" },
  { name: "Ambient Glow Bar", category: "Lighting" },
  { name: "Reading Lamp Mini", category: "Lighting" },
  { name: "Pendant Light Set", category: "Lighting" },
  { name: "Starter Desk Kit", category: "Office Kits" },
  { name: "Remote Work Bundle", category: "Office Kits" },
  { name: "Cable Management Kit", category: "Office Kits" },
  { name: "Ergo Setup Pack", category: "Office Kits" },
  { name: "Meeting Room Kit", category: "Office Kits" },
  { name: "Focus Booth Kit", category: "Office Kits" },
  { name: "New Hire Kit", category: "Office Kits" },
];

const PRODUCT_NAMES: readonly string[] = PRODUCT_PAIRS.map((p) => p.name);

const PRICE_RANGES: Record<Product["category"], [number, number]> = {
  Furniture: [200, 900],
  Accessories: [19, 149],
  Lighting: [29, 129],
  "Office Kits": [99, 399],
};

const CHANNELS: readonly Campaign["channel"][] = [
  "Email", "Instagram", "Google Ads", "Facebook", "TikTok", "Marketplace",
];

const CAMPAIGN_NAMES: readonly string[] = [
  "Summer Sale Blast", "New Arrivals Teaser", "Ergo Chair Launch", "Cart Recovery Flow",
  "Festive Gift Guide", "Spring Clearance", "Influencer Collab", "Back to Office",
  "Black Friday Rush", "Cyber Monday Deals", "Standing Desk Promo", "Loyalty Rewards Push",
  "Referral Boost", "Holiday Bundle Sale", "Flash Weekend Sale", "Newsletter Signup Drive",
  "Retargeting Wave", "Brand Awareness Q4", "Lighting Collection Reveal", "Office Kits Bundle",
  "Student Discount Wave", "Warehouse Clearout", "End of Season Sale", "Product Restock Alert",
];

const SUBJECTS: readonly string[] = [
  "Package hasn't arrived yet", "Wrong item delivered", "Requesting a refund",
  "Damaged on arrival", "How do I track my order?", "Missing parts in the box",
  "Assembly instructions unclear", "Return label not working", "Charged twice for one order",
  "Delivery address change", "Product warranty question", "Item different from photo",
  "Cancel my order please", "Bulk order enquiry", "Invoice discrepancy",
  "Late delivery complaint", "Exchange for different size", "Discount code not applying",
  "Chair wobbles after assembly", "Lamp flickers intermittently",
];

const UPDATED: readonly string[] = [
  "12m ago", "45m ago", "1h ago", "2h ago", "4h ago", "Yesterday", "3d ago", "5d ago", "Mon", "1w ago",
];

const ROLES: readonly Member["role"][] = ["Account Exec", "Sales Rep", "SDR"];

const MEMBER_NAMES: readonly string[] = [
  "Bhuvnesh Verma", "Aditi Rao", "Jonas Weber", "Mei Lin", "Tom Okafor",
  "Sara Kim", "Leo Martins", "Nina Petrova", "Diego Alvarez", "Hana Suzuki",
  "Lucas Silva", "Emma Johansson", "Noah Meyer", "Amara Okeke", "Daniel Park",
  "Henrik Larsen", "Carlos Mendez", "Oscar Lindqvist", "Grace Wong", "Zara Malik",
  "Victor Popescu", "Rahul Gupta", "Maya Ferreira", "Sven Eriksson", "Andre Santos",
  "Julia Novak", "Camila Reyes",
];

// Support-chat scripts. Times are auto-assigned ascending; each thread ends with
// (or contains) a "them" message so a preview can be derived.
const THREAD_SCRIPTS: readonly { name: string; msgs: readonly [ChatMessage["from"], string][] }[] = [
  {
    name: "Kaylee Vetrovs",
    msgs: [
      ["them", "Hi! I ordered the Cloud Sofa Mini last week — any update on shipping?"],
      ["me", "Hey Kaylee! It left our warehouse this morning — tracking says Thursday."],
      ["them", "That's faster than expected!"],
      ["them", "Perfect, thanks for the quick update!"],
      ["me", "Anytime! I'll send the invoice copy here as well."],
    ],
  },
  {
    name: "Ryan Korsgaard",
    msgs: [
      ["them", "Can I change the delivery address for order ORD-7312?"],
      ["me", "Sure — what's the new address?"],
      ["them", "Send it to my office instead, 14 Market Street."],
      ["me", "Updated. It still arrives Friday."],
      ["them", "Can I change the delivery address?"],
    ],
  },
  {
    name: "Omar Dias",
    msgs: [
      ["them", "Invoice #04915 looks wrong to me — I was charged for 16 units, not 6."],
      ["me", "Let me check that order for you, one sec."],
      ["me", "You're right, that's a typo on our end. Refunding the difference now."],
      ["them", "Appreciate it. How long for the refund?"],
      ["me", "3–5 business days back to your card."],
      ["them", "Invoice #04915 looks wrong to me"],
    ],
  },
  {
    name: "Alena Baptista",
    msgs: [
      ["them", "Do you have the Executive Oak Desk in walnut?"],
      ["me", "We do! Walnut is in stock and ships in 2 days."],
      ["them", "Great, does it come assembled?"],
      ["me", "Flat-packed, but assembly takes about 20 minutes."],
      ["them", "Do you have the desk in walnut?"],
    ],
  },
  {
    name: "Marcus Chen",
    msgs: [
      ["them", "My Standing Desk Pro arrived but the crossbar is missing."],
      ["me", "So sorry about that Marcus — shipping a replacement crossbar today."],
      ["them", "No worries, thanks for the fast fix."],
      ["me", "The refund for the inconvenience is processed too."],
      ["them", "Refund received, thank you!"],
    ],
  },
  {
    name: "Priya Sharma",
    msgs: [
      ["them", "Can I get a bulk order quote for 40 Ergo Office Chairs?"],
      ["me", "Absolutely — bulk pricing kicks in at 25 units. I'll email a quote."],
      ["them", "Perfect. Any lead time on that volume?"],
      ["me", "Around 10 business days for 40 units."],
      ["them", "Bulk order quote for 40 chairs?"],
    ],
  },
  {
    name: "Diego Alvarez",
    msgs: [
      ["them", "Is the Monitor Arm Duo compatible with a 34-inch ultrawide?"],
      ["me", "Yes, it supports up to 38 inches and 9kg per arm."],
      ["them", "Nice, adding two to my cart now."],
      ["me", "Great pick — let me know if you need a cable kit too."],
    ],
  },
  {
    name: "Sophia Rossi",
    msgs: [
      ["them", "The Desk Lamp Halo I received flickers on the lowest setting."],
      ["me", "That sounds like a faulty driver — we'll send a replacement."],
      ["them", "Thank you, should I return the old one?"],
      ["me", "No need, keep or recycle it. New lamp ships tomorrow."],
      ["them", "The lamp flickers on low, please advise."],
    ],
  },
  {
    name: "Amara Okeke",
    msgs: [
      ["them", "How do I track order ORD-7340?"],
      ["me", "Here's your tracking link — it's out for delivery today."],
      ["them", "Amazing, thanks!"],
      ["me", "You're welcome!"],
    ],
  },
  {
    name: "Henrik Larsen",
    msgs: [
      ["them", "My discount code SPARK10 isn't applying at checkout."],
      ["me", "That code expired last week, but I've applied a fresh 10% for you."],
      ["them", "Legend, worked now."],
      ["me", "Enjoy the new setup!"],
      ["them", "Discount worked now, thanks a lot."],
    ],
  },
  {
    name: "Layla Hassan",
    msgs: [
      ["them", "Can I exchange the Task Stool Compact for the taller version?"],
      ["me", "Of course — I'll email a prepaid return label."],
      ["them", "Do I pay the price difference?"],
      ["me", "Just the ₹40 difference, charged after we receive the return."],
      ["them", "Sounds fair, sending it back today."],
    ],
  },
  {
    name: "Grace Wong",
    msgs: [
      ["them", "Is the Remote Work Bundle still on sale?"],
      ["me", "It is — 15% off through Sunday."],
      ["them", "Perfect timing, ordering now."],
      ["me", "Thanks Grace, it'll ship Monday."],
      ["them", "Perfect timing, ordering now."],
    ],
  },
];

// ---------------------------------------------------------------------------
// Generation (materialized exports)
// ---------------------------------------------------------------------------

function skuPrefix(name: string): string {
  const w = name.split(" ");
  const second = w[1] ? w[1][0] : w[0][1];
  return (w[0][0] + second).toUpperCase();
}

export const transactions: Transaction[] = [];
for (let i = 0; i < 87; i++) {
  const idNum = 4917 - i; // 4917 (newest) down to 4831 -> "#04917".."#04831"
  const qty = randInt(4, 30);
  const unit = randInt(90, 450) * 10; // 900..4500
  const r = rng();
  const status: Transaction["status"] = r < 0.75 ? "Success" : r < 0.9 ? "Pending" : "Refunded";
  transactions.push({
    id: `#0${idNum}`,
    customer: pick(NAMES),
    product: pick(PRODUCT_NAMES),
    status,
    qty,
    unitPrice: money(unit),
    totalRevenue: money(unit * qty),
    date: seasonDate(91 - i),
  });
}

export const products: Product[] = PRODUCT_PAIRS.map(({ name, category }) => {
  const r = rng();
  const stock = r < 0.1 ? 0 : r < 0.25 ? randInt(1, 15) : randInt(16, 320);
  const status: Product["status"] =
    stock === 0 ? "Out of Stock" : stock <= 15 ? "Low Stock" : "In Stock";
  const range = PRICE_RANGES[category];
  return {
    name,
    sku: `${skuPrefix(name)}-${randInt(1000, 9999)}`,
    category,
    price: money(randInt(range[0], range[1])),
    stock,
    status,
    sold: group(randInt(80, 3400)),
  };
});

export const customers: Customer[] = NAMES.slice(0, 64).map((name) => {
  const orders = randInt(1, 42);
  const totalSpent = money(randInt(180, 18500));
  const status: Customer["status"] = rng() < 0.8 ? "Active" : "Inactive";
  const [first, ...rest] = name.toLowerCase().split(" ");
  const domain = pick(["gmail.com", "outlook.com", "company.com"]);
  return {
    name,
    email: `${first}.${rest.join("")}@${domain}`,
    location: pick(CITIES),
    orders,
    totalSpent,
    status,
  };
});

export const orders: Order[] = [];
for (let i = 0; i < 53; i++) {
  const r = rng();
  const status: Order["status"] =
    r < 0.45 ? "Delivered" : r < 0.7 ? "Shipped" : r < 0.9 ? "Processing" : "Cancelled";
  orders.push({
    id: `ORD-${7301 + i}`,
    customer: pick(customers).name,
    items: randInt(1, 8),
    total: money(randInt(120, 4200)),
    status,
    date: orderDate(),
  });
}

export const campaigns: Campaign[] = CAMPAIGN_NAMES.map((name) => {
  const channel = pick(CHANNELS);
  const r = rng();
  const status: Campaign["status"] = r < 0.5 ? "Active" : r < 0.8 ? "Paused" : "Ended";
  const budget = randInt(8, 50) * 100; // 800..5000
  const spent = status === "Ended" ? budget : Math.round(budget * (0.3 + rng() * 0.6));
  const clicks = randInt(2500, 24000);
  const ctr = 2.3 + rng() * 3.5; // 2.3..5.8
  return {
    name,
    channel,
    status,
    budget: money(budget),
    spent: money(spent),
    clicks: group(clicks),
    ctr: pct(ctr),
  };
});

export const tickets: Ticket[] = [];
for (let i = 0; i < 42; i++) {
  const r = rng();
  const priority: Ticket["priority"] = r < 0.25 ? "High" : r < 0.6 ? "Medium" : "Low";
  const s = rng();
  const status: Ticket["status"] = s < 0.35 ? "Open" : s < 0.6 ? "Pending" : "Resolved";
  tickets.push({
    id: `#T-${1001 + i}`,
    customer: pick(NAMES),
    subject: pick(SUBJECTS),
    priority,
    status,
    updated: pick(UPDATED),
  });
}

export const members: Member[] = MEMBER_NAMES.map((name) => {
  const isLead = name === "Bhuvnesh Verma";
  const role: Member["role"] = isLead ? "Devops Engg." : pick(ROLES);
  const revenue = isLead ? 52000 : randInt(150, 490) * 100; // 15000..49000, lead tops all
  const deals = Math.round(revenue / 760);
  const attainment = isLead ? 96 : randInt(45, 94);
  return { name, role, deals, revenue, attainment };
})
  .sort((a, b) => b.revenue - a.revenue)
  .map((m) => ({
    name: m.name,
    role: m.role,
    deals: m.deals,
    revenue: money(m.revenue),
    attainment: m.attainment,
  }));

export const invoices: Invoice[] = [];
{
  // 24 monthly periods, Dec 2023 -> Nov 2025.
  let y = 2023;
  let m = 11; // December
  for (let i = 0; i < 24; i++) {
    const invYear = i < 12 ? 2024 : 2025;
    const seq = (i % 12) + 1;
    invoices.push({
      id: `INV-${invYear}-${pad3(seq)}`,
      date: `1 ${MONTHS[m]} ${y}`,
      amount: rng() < 0.5 ? "₹49" : "₹59",
      status: i >= 22 ? "Overdue" : "Paid", // exactly the last 2 are overdue
    });
    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
  }
}

// Conversation display times/unread — kept as literals to match the dashboard tone.
const CONVO_TIMES = ["09:41", "08:17", "07:52", "Yesterday", "Yesterday", "Mon", "Mon", "Tue", "Wed", "2d ago", "3d ago", "5d ago"];
const CONVO_UNREAD = [0, 2, 1, 0, 0, 0, 3, 0, 1, 0, 0, 0];

export const conversations: Conversation[] = [];
export const threads: Record<number, ChatMessage[]> = {};
THREAD_SCRIPTS.forEach((script, idx) => {
  const id = idx + 1;
  let minute = 2;
  const msgs: ChatMessage[] = script.msgs.map(([from, text]) => {
    const time = `09:${pad2(minute)}`;
    minute += 5;
    return { from, text, time };
  });
  threads[id] = msgs;
  let preview = msgs[msgs.length - 1].text;
  for (let k = msgs.length - 1; k >= 0; k--) {
    if (msgs[k].from === "them") {
      preview = msgs[k].text;
      break;
    }
  }
  conversations.push({
    id,
    name: script.name,
    preview,
    time: CONVO_TIMES[idx],
    unread: CONVO_UNREAD[idx],
  });
});

export const monthlyRevenue: Record<"2024" | "2025", MonthPoint[]> = (() => {
  const rev2025 = MONTHS.map(() => randInt(30, 100));
  const lastYear2025 = rev2025.map((v) => Math.round(v * (1 - (0.15 + rng() * 0.05))));
  const rev2024 = lastYear2025.slice(); // same year, seen as "this year" from 2024's side
  const lastYear2024 = rev2024.map((v) => Math.round(v * (1 - (0.15 + rng() * 0.05))));
  return {
    "2024": MONTHS.map((month, i) => ({ month, revenue: rev2024[i], lastYear: lastYear2024[i] })),
    "2025": MONTHS.map((month, i) => ({ month, revenue: rev2025[i], lastYear: lastYear2025[i] })),
  };
})();

export const dailyRevenue: DayBar[] = Array.from({ length: 31 }, () => {
  const h = randInt(40, 96);
  const b = randInt(10, 22);
  const o = randInt(5, h - b - 2); // guarantees o + b < h
  return { h, o, b };
});
