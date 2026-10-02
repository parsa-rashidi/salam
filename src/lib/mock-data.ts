import type {
  Booking,
  CategoryId,
  FlashDeal,
  L10n,
  NotificationItem,
  PendingProvider,
  PortfolioItem,
  Provider,
  ProviderRequest,
  ReportItem,
  Review,
  ServiceItem,
  Slot,
} from "@/types";
import { startOfToday, toISODate } from "./format";

/* ------------------------------------------------------------------ *
 * Time helpers — everything is relative to "today" so the prototype
 * always looks fresh.
 * ------------------------------------------------------------------ */

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Local-time ISO string (no timezone suffix) for a day offset + HH:MM. */
export function iso(dayOffset: number, hhmm: string): string {
  const d = new Date(startOfToday());
  d.setDate(d.getDate() + dayOffset);
  const [h, m] = hhmm.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(h)}:${pad(m)}:00`;
}

export function daysAgoISO(n: number): string {
  return iso(-n, "12:00");
}

/* ------------------------------------------------------------------ *
 * Geography — Tehran
 * ------------------------------------------------------------------ */

export const CITY_CENTER = { lat: 35.7805, lng: 51.4215 };

export const DISTRICTS: { id: string; name: L10n; lat: number; lng: number }[] = [
  { id: "valanak", name: { fa: "ولنجک", en: "Velenjak" }, lat: 35.805, lng: 51.396 },
  { id: "zaferanieh", name: { fa: "زعفرانیه", en: "Zaferanieh" }, lat: 35.801, lng: 51.431 },
  { id: "niavaran", name: { fa: "نیاوران", en: "Niavaran" }, lat: 35.81, lng: 51.46 },
  { id: "tajrish", name: { fa: "تجریش", en: "Tajrish" }, lat: 35.805, lng: 51.434 },
  { id: "saadat", name: { fa: "سعادت‌آباد", en: "Saadat Abad" }, lat: 35.779, lng: 51.369 },
  { id: "shahrak-gharb", name: { fa: "شهرک غرب", en: "Shahrak-e Gharb" }, lat: 35.765, lng: 51.372 },
  { id: "vanak", name: { fa: "ونک", en: "Vanak" }, lat: 35.757, lng: 51.409 },
  { id: "jordan", name: { fa: "جردن", en: "Jordan" }, lat: 35.768, lng: 51.427 },
  { id: "pasdaran", name: { fa: "پاسداران", en: "Pasdaran" }, lat: 35.774, lng: 51.47 },
  { id: "yousef", name: { fa: "یوسف‌آباد", en: "Yousef Abad" }, lat: 35.73, lng: 51.409 },
  { id: "aqdasieh", name: { fa: "اقدسیه", en: "Aqdasieh" }, lat: 35.802, lng: 51.482 },
  { id: "qeytarieh", name: { fa: "قیطریه", en: "Qeytarieh" }, lat: 35.792, lng: 51.44 },
  { id: "elahieh", name: { fa: "الهیه", en: "Elahieh" }, lat: 35.793, lng: 51.429 },
  { id: "zafar", name: { fa: "ظفر", en: "Zafar" }, lat: 35.76, lng: 51.45 },
];

/* ------------------------------------------------------------------ *
 * Categories
 * ------------------------------------------------------------------ */

export const CATEGORIES: { id: CategoryId; icon: string; order: number }[] = [
  { id: "haircut", icon: "Scissors", order: 1 },
  { id: "beard", icon: "Razor", order: 2 },
  { id: "color", icon: "Palette", order: 3 },
  { id: "facial", icon: "Sparkles", order: 4 },
  { id: "nails", icon: "Hand", order: 5 },
  { id: "makeup", icon: "Brush", order: 6 },
  { id: "bridal", icon: "Crown", order: 7 },
  { id: "kids", icon: "Baby", order: 8 },
  { id: "epilation", icon: "Flower", order: 9 },
  { id: "spa", icon: "Waves", order: 10 },
];

/* ------------------------------------------------------------------ *
 * Service catalogue
 * ------------------------------------------------------------------ */

const S = (
  id: string,
  categoryId: CategoryId,
  fa: string,
  en: string,
  price: number,
  durationMin: number,
  homeAvailable = false,
  homeSurcharge?: number,
): ServiceItem => ({
  id,
  categoryId,
  name: { fa, en },
  price,
  durationMin,
  homeAvailable,
  homeSurcharge,
});

const MEN_SERVICES: ServiceItem[] = [
  S("ms-cut", "haircut", "کوتاهی مو مردانه", "Men's haircut", 450_000, 45, true, 80_000),
  S("ms-fade", "haircut", "فید آمریکایی", "American skin fade", 520_000, 50, true, 80_000),
  S("ms-beard", "beard", "اصلاح ریش", "Beard trim & shape", 250_000, 25, true, 80_000),
  S("ms-shave", "beard", "اصلاح صورت با تیغ و حولهٔ گرم", "Hot-towel straight shave", 320_000, 35, true, 80_000),
  S("ms-kids", "kids", "کوتاهی مو کودک", "Kids haircut", 350_000, 30, true, 80_000),
  S("ms-color", "color", "رنگ مو مردانه", "Men's hair color", 900_000, 60, true, 80_000),
  S("ms-facial", "facial", "پاک‌سازی پوست مردانه", "Men's facial cleanse", 780_000, 60, false),
  S("ms-massage", "spa", "ماساژ سر و شانه", "Head & shoulder massage", 300_000, 25, false),
];

const WOMEN_SERVICES: ServiceItem[] = [
  S("ws-cut", "haircut", "کوتاهی مو زنانه", "Women's haircut", 1_200_000, 60, true, 150_000),
  S("ws-color", "color", "رنگ مو کامل", "Full hair color", 2_800_000, 150, false),
  S("ws-highlight", "color", "مش و لایت", "Highlights & balayage", 3_500_000, 180, false),
  S("ws-blow", "haircut", "براشینگ", "Blow dry & styling", 650_000, 45, true, 150_000),
  S("ws-makeup", "makeup", "میکاپ مجلسی", "Party makeup", 2_500_000, 90, true, 250_000),
  S("ws-bridal", "bridal", "میکاپ و شینیون عروس", "Bridal makeup & updo", 18_000_000, 240, true, 500_000),
  S("ws-nails", "nails", "مانیکور و ژلیش", "Manicure & gelish", 850_000, 70, true, 150_000),
  S("ws-nail-ext", "nails", "کاشت ناخن", "Nail extension", 1_500_000, 120, true, 150_000),
  S("ws-facial", "facial", "پاک‌سازی عمیق پوست", "Deep-cleanse facial", 1_400_000, 75, true, 200_000),
  S("ws-wax", "epilation", "اپیلاسیون", "Waxing", 700_000, 60, false),
  S("ws-brow", "makeup", "ابرو و مژه", "Brow & lash styling", 550_000, 40, true, 150_000),
  S("ws-keratin", "color", "کراتینه مو", "Keratin treatment", 4_200_000, 180, false),
];

export const ALL_SERVICES: ServiceItem[] = [...MEN_SERVICES, ...WOMEN_SERVICES];

export function serviceById(id: string): ServiceItem | undefined {
  return ALL_SERVICES.find((s) => s.id === id);
}

/* ------------------------------------------------------------------ *
 * Portfolio images
 * ------------------------------------------------------------------ */

const P = (id: string, image: string, fa: string, en: string, categoryId: CategoryId, likes: number): PortfolioItem => ({
  id,
  image,
  caption: { fa, en },
  categoryId,
  likes,
});

const PF_MEN: PortfolioItem[] = [
  P("pf-m1", "/images/portfolio/fade.jpg", "فید آمریکایی + خط ریش", "American fade with lined beard", "haircut", 128),
  P("pf-m2", "/images/portfolio/beard.jpg", "طراحی ریش کلاسیک", "Classic beard design", "beard", 96),
  P("pf-m3", "/images/portfolio/senior-home.jpg", "خدمات در منزل برای مشتری سالمند", "At-home service for a senior client", "haircut", 214),
  P("pf-m4", "/images/portfolio/kids.jpg", "کوتاهی کودک، بدون استرس", "Stress-free kids haircut", "kids", 73),
];

const PF_WOMEN: PortfolioItem[] = [
  P("pf-w1", "/images/portfolio/color.jpg", "بالیاژ کاراملی", "Caramel balayage", "color", 341),
  P("pf-w2", "/images/portfolio/bridal.jpg", "میکاپ عروس، سبک نچرال", "Natural-style bridal makeup", "bridal", 512),
  P("pf-w3", "/images/portfolio/nails.jpg", "مانیکور ژلیش فرانسه", "French gelish manicure", "nails", 187),
  P("pf-w4", "/images/portfolio/facial.jpg", "پاک‌سازی عمیق پوست", "Deep-cleanse facial", "facial", 142),
  P("pf-w5", "/images/portfolio/salon.jpg", "محیط سالن", "Inside the salon", "makeup", 88),
  P("pf-w6", "/images/portfolio/at-home.jpg", "میکاپ مجلسی در محل مشتری", "Party makeup at the client's home", "makeup", 265),
];

/* ------------------------------------------------------------------ *
 * Working hours
 * ------------------------------------------------------------------ */

function salonHours(open = "09:00", close = "21:00", fridayClosed = true) {
  return [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    day,
    open,
    close,
    closed: fridayClosed && day === 6,
  }));
}

/* ------------------------------------------------------------------ *
 * Providers
 * ------------------------------------------------------------------ */

export const PROVIDERS: Provider[] = [
  {
    id: "p1",
    name: { fa: "امیر کاویانی", en: "Amir Kaviani" },
    kind: "independent",
    gender: "male",
    verified: true,
    rating: 4.9,
    reviewCount: 214,
    lat: 35.8042,
    lng: 51.3978,
    address: { fa: "ولنجک، خیابان بیست‌وسوم، پلاک ۱۴", en: "Velenjak, 23rd St., No. 14" },
    district: DISTRICTS[0].name,
    city: { fa: "تهران", en: "Tehran" },
    modes: ["salon", "home"],
    homeRadiusKm: 6,
    travelFee: 120_000,
    openNow: true,
    acceptsInstant: true,
    seniorFriendly: true,
    accessibilityTrained: true,
    yearsExperience: 12,
    priceLevel: 2,
    responseTimeMin: 8,
    nextFreeSlot: iso(0, "18:00"),
    bio: {
      fa: "دوازده سال است در حوزهٔ کوتاهی مردانه و اصلاح ریش فعالیت می‌کنم. سه سال اخیر علاوه بر سالن، خدمات در محل هم ارائه می‌دهم؛ بیشتر برای سالمندان و مشتریانی که رفت‌وآمد برایشان دشوار است. ابزارها را ضدعفونی‌شده و یک‌بارمصرف می‌آورم.",
      en: "Twelve years in men's cutting and beard work. For the last three years I also provide at-home service — mostly for seniors and clients who find travel difficult. I always bring sanitised, single-use tools.",
    },
    services: MEN_SERVICES,
    portfolio: PF_MEN,
    workingHours: salonHours("10:00", "21:00"),
    accent: "#0ba68b",
    bookingsCount: 1840,
    phoneMasked: "۰۹۱۲ *** ۴۵۶۷",
  },
  {
    id: "p2",
    name: { fa: "سالن زیبایی رُزا", en: "Rosa Beauty Salon" },
    kind: "salon",
    gender: "female",
    verified: true,
    rating: 4.7,
    reviewCount: 508,
    lat: 35.8012,
    lng: 51.4325,
    address: { fa: "زعفرانیه، خیابان مقدس اردبیلی، مجتمع نارون، طبقهٔ ۲", en: "Zaferanieh, Moghadas Ardabili St., Narvan Complex, 2nd floor" },
    district: DISTRICTS[1].name,
    city: { fa: "تهران", en: "Tehran" },
    modes: ["salon"],
    homeRadiusKm: 0,
    travelFee: 0,
    openNow: true,
    acceptsInstant: false,
    seniorFriendly: true,
    accessibilityTrained: false,
    yearsExperience: 9,
    priceLevel: 3,
    responseTimeMin: 25,
    nextFreeSlot: iso(1, "12:30"),
    bio: {
      fa: "سالن رُزا با تیمی هفت‌نفره در زمینهٔ رنگ، میکاپ، ناخن و پوست فعالیت می‌کند. فضای سالن کاملاً در دسترس است: رمپ ورودی، آسانسور و سرویس بهداشتی مناسب افراد کم‌توان.",
      en: "Rosa is a seven-person salon specialising in color, makeup, nails and skin. The space is fully accessible: entrance ramp, elevator and a wheelchair-friendly restroom.",
    },
    services: WOMEN_SERVICES,
    portfolio: PF_WOMEN,
    workingHours: salonHours("09:00", "20:00"),
    accent: "#9333ea",
    bookingsCount: 4210,
    phoneMasked: "۰۲۱ *** ۸۸۹۰",
  },
  {
    id: "p3",
    name: { fa: "مریم شریفی", en: "Maryam Sharifi" },
    kind: "independent",
    gender: "female",
    verified: true,
    rating: 4.8,
    reviewCount: 176,
    lat: 35.8098,
    lng: 51.4612,
    address: { fa: "نیاوران، خیابان باهنر، کوچهٔ گل، پلاک ۸", en: "Niavaran, Bahonar St., Gol Alley, No. 8" },
    district: DISTRICTS[2].name,
    city: { fa: "تهران", en: "Tehran" },
    modes: ["salon", "home"],
    homeRadiusKm: 8,
    travelFee: 180_000,
    openNow: true,
    acceptsInstant: true,
    seniorFriendly: true,
    accessibilityTrained: true,
    yearsExperience: 15,
    priceLevel: 3,
    responseTimeMin: 12,
    nextFreeSlot: iso(0, "16:30"),
    bio: {
      fa: "میکاپ آرتیست و متخصص پوست. کار با مشتریان سالمند و افراد دارای محدودیت حرکتی را دوست دارم؛ صبور، بی‌سروصدا و با وسایل سبک کار می‌کنم. امکان سرویس در خانهٔ سالمندان و هتل را هم دارم.",
      en: "Makeup artist and skin specialist. I genuinely enjoy working with seniors and clients with limited mobility — patient, quiet and light on equipment. I also serve nursing homes and hotels.",
    },
    services: WOMEN_SERVICES.filter((s) =>
      ["ws-makeup", "ws-bridal", "ws-facial", "ws-brow", "ws-cut", "ws-blow"].includes(s.id),
    ),
    portfolio: PF_WOMEN.slice(0, 4),
    workingHours: salonHours("10:00", "19:00", false),
    accent: "#db2777",
    bookingsCount: 1320,
    phoneMasked: "۰۹۳۵ *** ۲۲۱۰",
  },
  {
    id: "p4",
    name: { fa: "آرایشگاه پاریس", en: "Paris Barbershop" },
    kind: "salon",
    gender: "male",
    verified: true,
    rating: 4.6,
    reviewCount: 389,
    lat: 35.8055,
    lng: 51.4338,
    address: { fa: "تجریش، میدان تجریش، خیابان شهرداری، پلاک ۲۲", en: "Tajrish Sq., Shahrdari St., No. 22" },
    district: DISTRICTS[3].name,
    city: { fa: "تهران", en: "Tehran" },
    modes: ["salon"],
    homeRadiusKm: 0,
    travelFee: 0,
    openNow: false,
    acceptsInstant: false,
    seniorFriendly: false,
    accessibilityTrained: false,
    yearsExperience: 20,
    priceLevel: 2,
    responseTimeMin: 45,
    nextFreeSlot: iso(1, "10:00"),
    bio: {
      fa: "آرایشگاه پاریس از سال ۱۳۸۴ در تجریش فعال است. چهار صندلی، دو آرایشگر ارشد و فضای انتظار راحت. نوبت‌دهی تلفنی هم داریم؛ زمان‌های تلفنی را در سامانه مسدود می‌کنیم.",
      en: "Paris Barbershop has served Tajrish since 2005. Four chairs, two senior barbers and a comfortable waiting area. We take phone bookings too and block those slots in the system.",
    },
    services: MEN_SERVICES,
    portfolio: PF_MEN,
    workingHours: salonHours("09:00", "22:00"),
    accent: "#0f766e",
    bookingsCount: 3120,
    phoneMasked: "۰۲۱ *** ۲۲۴۵",
  },
  {
    id: "p5",
    name: { fa: "سارا احمدی", en: "Sara Ahmadi" },
    kind: "independent",
    gender: "female",
    verified: true,
    rating: 5.0,
    reviewCount: 92,
    lat: 35.7795,
    lng: 51.3688,
    address: { fa: "سعادت‌آباد، میدان کتاب (محل اعزام)", en: "Saadat Abad, Ketab Sq. (dispatch point)" },
    district: DISTRICTS[4].name,
    city: { fa: "تهران", en: "Tehran" },
    modes: ["home"],
    homeRadiusKm: 12,
    travelFee: 200_000,
    openNow: true,
    acceptsInstant: true,
    seniorFriendly: true,
    accessibilityTrained: true,
    yearsExperience: 8,
    priceLevel: 2,
    responseTimeMin: 5,
    nextFreeSlot: iso(0, "14:00"),
    bio: {
      fa: "کاملاً سیار کار می‌کنم و سالن ندارم. تخصصم ناخن، ابرو و میکاپ سبک در منزل مشتری است. دورهٔ مراقبت از افراد دارای محدودیت حرکتی را گذرانده‌ام و کیف خدمتم برای کار در فضای کوچک خانه طراحی شده است.",
      en: "Fully mobile — no salon. My specialties are nails, brows and light makeup at the client's home. I've completed a care-training course for people with limited mobility and my kit is designed for small home spaces.",
    },
    services: WOMEN_SERVICES.filter((s) => s.homeAvailable),
    portfolio: PF_WOMEN.slice(2, 6),
    workingHours: salonHours("08:00", "20:00"),
    accent: "#ea580c",
    bookingsCount: 640,
    phoneMasked: "۰۹۹۰ *** ۷۷۳۳",
  },
  {
    id: "p6",
    name: { fa: "سالن مانلی", en: "Maneli Salon" },
    kind: "salon",
    gender: "female",
    verified: true,
    rating: 4.5,
    reviewCount: 267,
    lat: 35.7652,
    lng: 51.3722,
    address: { fa: "شهرک غرب، بلوار دریا، خیابان ایران‌زمین، پلاک ۵", en: "Shahrak-e Gharb, Darya Blvd., Iranzamin St., No. 5" },
    district: DISTRICTS[5].name,
    city: { fa: "تهران", en: "Tehran" },
    modes: ["salon", "home"],
    homeRadiusKm: 5,
    travelFee: 250_000,
    openNow: true,
    acceptsInstant: false,
    seniorFriendly: false,
    accessibilityTrained: false,
    yearsExperience: 7,
    priceLevel: 3,
    responseTimeMin: 30,
    nextFreeSlot: iso(2, "11:00"),
    bio: {
      fa: "سالن مانلی در شهرک غرب، با تمرکز بر رنگ و لایت تخصصی. برای خدمات عروس، تیم اعزام به محل هم داریم.",
      en: "Maneli in Shahrak-e Gharb, focused on advanced color and highlights. We have a mobile bridal team for at-home weddings.",
    },
    services: WOMEN_SERVICES,
    portfolio: PF_WOMEN,
    workingHours: salonHours("10:00", "20:00"),
    accent: "#7c3aed",
    bookingsCount: 2280,
    phoneMasked: "۰۲۱ *** ۸۸۰۷",
  },
  {
    id: "p7",
    name: { fa: "رضا موسوی", en: "Reza Mousavi" },
    kind: "independent",
    gender: "male",
    verified: false,
    rating: 4.3,
    reviewCount: 58,
    lat: 35.7571,
    lng: 51.4095,
    address: { fa: "ونک، خیابان ملاصدرا، کوچهٔ بهار، پلاک ۳", en: "Vanak, Molasadra St., Bahar Alley, No. 3" },
    district: DISTRICTS[6].name,
    city: { fa: "تهران", en: "Tehran" },
    modes: ["salon", "home"],
    homeRadiusKm: 4,
    travelFee: 90_000,
    openNow: true,
    acceptsInstant: true,
    seniorFriendly: false,
    accessibilityTrained: false,
    yearsExperience: 5,
    priceLevel: 1,
    responseTimeMin: 6,
    nextFreeSlot: iso(0, "20:00"),
    bio: {
      fa: "آرایشگر مستقل در ونک. قیمت‌هایم مناسب‌تر از میانگین منطقه است و بیشتر عصرها کار می‌کنم. برای نوبت‌های فوری معمولاً همان روز پاسخ می‌دهم.",
      en: "Independent barber in Vanak. My prices are below the neighborhood average and I mostly work evenings. Same-day answers for urgent requests.",
    },
    services: MEN_SERVICES.filter((s) => ["ms-cut", "ms-fade", "ms-beard", "ms-shave", "ms-kids"].includes(s.id)),
    portfolio: PF_MEN.slice(0, 3),
    workingHours: salonHours("14:00", "23:00", false),
    accent: "#0369a1",
    bookingsCount: 410,
    phoneMasked: "۰۹۱۹ *** ۵۵۱۲",
  },
  {
    id: "p8",
    name: { fa: "نگار استودیو", en: "Negar Studio" },
    kind: "salon",
    gender: "female",
    verified: true,
    rating: 4.9,
    reviewCount: 623,
    lat: 35.7681,
    lng: 51.4272,
    address: { fa: "جردن، خیابان ناهید غربی، برج سپید، طبقهٔ ۴", en: "Jordan, Nahid-e Gharbi St., Sepid Tower, 4th floor" },
    district: DISTRICTS[7].name,
    city: { fa: "تهران", en: "Tehran" },
    modes: ["salon", "home"],
    homeRadiusKm: 7,
    travelFee: 300_000,
    openNow: true,
    acceptsInstant: true,
    seniorFriendly: true,
    accessibilityTrained: true,
    yearsExperience: 11,
    priceLevel: 3,
    responseTimeMin: 15,
    nextFreeSlot: iso(1, "09:30"),
    bio: {
      fa: "استودیوی تخصصی میکاپ و پوست. تیم اعزام ما برای مشتریان سالمند، دوران نقاهت و مادران دارای کودک خردسال، سرویس کامل در محل ارائه می‌دهد. آسانسور و پارکینگ اختصاصی داریم.",
      en: "A specialist makeup and skin studio. Our dispatch team provides full at-home service for seniors, recovering patients and mothers with young children. Elevator and private parking available.",
    },
    services: WOMEN_SERVICES,
    portfolio: PF_WOMEN,
    workingHours: salonHours("09:00", "21:00"),
    accent: "#be123c",
    bookingsCount: 5120,
    phoneMasked: "۰۲۱ *** ۲۶۷۰",
  },
  {
    id: "p9",
    name: { fa: "حسین فرهادی", en: "Hossein Farhadi" },
    kind: "independent",
    gender: "male",
    verified: true,
    rating: 4.8,
    reviewCount: 143,
    lat: 35.7742,
    lng: 51.4703,
    address: { fa: "پاسداران، گلستان پنجم، پلاک ۴۱", en: "Pasdaran, 5th Golestan, No. 41" },
    district: DISTRICTS[8].name,
    city: { fa: "تهران", en: "Tehran" },
    modes: ["salon", "home"],
    homeRadiusKm: 9,
    travelFee: 150_000,
    openNow: false,
    acceptsInstant: false,
    seniorFriendly: true,
    accessibilityTrained: true,
    yearsExperience: 18,
    priceLevel: 2,
    responseTimeMin: 20,
    nextFreeSlot: iso(2, "16:00"),
    bio: {
      fa: "هجده سال سابقه. بیش از شش سال است که با دو خانهٔ سالمندان در پاسداران همکاری می‌کنم و هر هفته برای ساکنان آنجا سرویس در محل ارائه می‌دهم. با شرایط خاص مشتریان آشنا هستم و کار را با آرامش انجام می‌دهم.",
      en: "Eighteen years of experience. For over six years I've worked with two nursing homes in Pasdaran, providing weekly at-home service to their residents. I'm familiar with special needs and work calmly.",
    },
    services: MEN_SERVICES,
    portfolio: PF_MEN,
    workingHours: salonHours("09:00", "19:00", true),
    accent: "#15803d",
    bookingsCount: 2650,
    phoneMasked: "۰۹۱۲ *** ۹۰۰۴",
  },
  {
    id: "p10",
    name: { fa: "سالن آرایشی الماس", en: "Almas Beauty Salon" },
    kind: "salon",
    gender: "female",
    verified: false,
    rating: 4.1,
    reviewCount: 74,
    lat: 35.7305,
    lng: 51.4088,
    address: { fa: "یوسف‌آباد، خیابان بیست‌ویکم، پلاک ۹", en: "Yousef Abad, 21st St., No. 9" },
    district: DISTRICTS[9].name,
    city: { fa: "تهران", en: "Tehran" },
    modes: ["salon"],
    homeRadiusKm: 0,
    travelFee: 0,
    openNow: true,
    acceptsInstant: true,
    seniorFriendly: false,
    accessibilityTrained: false,
    yearsExperience: 4,
    priceLevel: 1,
    responseTimeMin: 10,
    nextFreeSlot: iso(0, "17:30"),
    bio: {
      fa: "سالن الماس در یوسف‌آباد با قیمت‌های اقتصادی. مناسب دانشجویان و مشتریان منطقی. اپیلاسیون، ناخن و براشینگ تخصص ماست.",
      en: "Almas in Yousef Abad with budget-friendly prices. Great for students and value-focused clients. Waxing, nails and blow-dry are our specialties.",
    },
    services: WOMEN_SERVICES.filter((s) => s.price < 1_500_000),
    portfolio: PF_WOMEN.slice(2, 5),
    workingHours: salonHours("08:00", "20:00", false),
    accent: "#a16207",
    bookingsCount: 520,
    phoneMasked: "۰۲۱ *** ۸۸۷۳",
  },
  {
    id: "p11",
    name: { fa: "لیلا کریمی", en: "Leila Karimi" },
    kind: "independent",
    gender: "female",
    verified: true,
    rating: 4.6,
    reviewCount: 131,
    lat: 35.8018,
    lng: 51.4815,
    address: { fa: "اقدسیه، خیابان فیاض‌بخش، پلاک ۱۷", en: "Aqdasieh, Fayazbakhsh St., No. 17" },
    district: DISTRICTS[10].name,
    city: { fa: "تهران", en: "Tehran" },
    modes: ["home"],
    homeRadiusKm: 10,
    travelFee: 170_000,
    openNow: true,
    acceptsInstant: true,
    seniorFriendly: true,
    accessibilityTrained: false,
    yearsExperience: 10,
    priceLevel: 2,
    responseTimeMin: 9,
    nextFreeSlot: iso(1, "15:00"),
    bio: {
      fa: "متخصص ناخن و پوست، فقط در محل مشتری. برای مادرانی که کودک خردسال دارند و نمی‌توانند از خانه خارج شوند، زمان‌های صبح زود دارم.",
      en: "Nail and skin specialist, at-home only. I keep early-morning slots for mothers with toddlers who can't leave the house.",
    },
    services: WOMEN_SERVICES.filter((s) => ["ws-nails", "ws-nail-ext", "ws-facial", "ws-brow", "ws-wax"].includes(s.id)).map((s) => ({ ...s, homeAvailable: true })),
    portfolio: PF_WOMEN.slice(2, 6),
    workingHours: salonHours("07:00", "18:00", true),
    accent: "#c026d3",
    bookingsCount: 890,
    phoneMasked: "۰۹۳۰ *** ۴۱۱۸",
  },
  {
    id: "p12",
    name: { fa: "بابک رستمی", en: "Babak Rostami" },
    kind: "independent",
    gender: "male",
    verified: true,
    rating: 4.4,
    reviewCount: 97,
    lat: 35.7925,
    lng: 51.4402,
    address: { fa: "قیطریه، خیابان شریعتی، کوچهٔ مهر، پلاک ۶", en: "Qeytarieh, Shariati St., Mehr Alley, No. 6" },
    district: DISTRICTS[11].name,
    city: { fa: "تهران", en: "Tehran" },
    modes: ["salon", "home"],
    homeRadiusKm: 5,
    travelFee: 110_000,
    openNow: true,
    acceptsInstant: true,
    seniorFriendly: false,
    accessibilityTrained: false,
    yearsExperience: 6,
    priceLevel: 1,
    responseTimeMin: 4,
    nextFreeSlot: iso(0, "19:00"),
    bio: {
      fa: "کوتاهی مدرن و فید. بیشتر برای زمان‌های خالی‌ام تخفیف فوری می‌گذارم، پس اگر انعطاف زمانی دارید می‌توانید قیمت خیلی خوبی بگیرید.",
      en: "Modern cuts and fades. I post flash deals for most of my empty slots, so if your schedule is flexible you can get a really good price.",
    },
    services: MEN_SERVICES.filter((s) => ["ms-cut", "ms-fade", "ms-beard", "ms-kids", "ms-color"].includes(s.id)),
    portfolio: PF_MEN.slice(0, 3),
    workingHours: salonHours("11:00", "22:00", false),
    accent: "#4f46e5",
    bookingsCount: 730,
    phoneMasked: "۰۹۰۱ *** ۶۶۲۹",
  },
];

export function providerById(id: string): Provider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

/** The logged-in provider for the panel demo. */
export const CURRENT_PROVIDER_ID = "p1";
export const CURRENT_PROVIDER = PROVIDERS[0];

/* ------------------------------------------------------------------ *
 * Flash deals
 * ------------------------------------------------------------------ */

export const FLASH_DEALS: FlashDeal[] = [
  {
    id: "d1",
    providerId: "p1",
    categoryId: "beard",
    serviceName: { fa: "اصلاح مو و ریش", en: "Haircut & beard trim" },
    originalPrice: 700_000,
    dealPrice: 420_000,
    dateISO: iso(0, "18:00"),
    expiresAtISO: iso(0, "18:00"),
    capacity: 1,
    remaining: 1,
    radiusKm: 5,
    cancellationNote: {
      fa: "لغو تا ۲ ساعت قبل بدون جریمه؛ پس از آن زمان آزاد دوباره به سایر مشتریان نمایش داده می‌شود.",
      en: "Free cancellation up to 2 hours before; after that the slot is released to other customers.",
    },
    lat: 35.8042,
    lng: 51.3978,
    district: DISTRICTS[0].name,
  },
  {
    id: "d2",
    providerId: "p12",
    categoryId: "haircut",
    serviceName: { fa: "فید آمریکایی", en: "American skin fade" },
    originalPrice: 520_000,
    dealPrice: 300_000,
    dateISO: iso(0, "19:30"),
    expiresAtISO: iso(0, "19:30"),
    capacity: 2,
    remaining: 1,
    radiusKm: 4,
    cancellationNote: {
      fa: "فقط یک بار برای هر مشتری قابل استفاده است.",
      en: "Can be used once per customer.",
    },
    lat: 35.7925,
    lng: 51.4402,
    district: DISTRICTS[11].name,
  },
  {
    id: "d3",
    providerId: "p5",
    categoryId: "nails",
    serviceName: { fa: "مانیکور و ژلیش در منزل", en: "At-home manicure & gelish" },
    originalPrice: 1_000_000,
    dealPrice: 690_000,
    dateISO: iso(0, "14:00"),
    expiresAtISO: iso(0, "14:00"),
    capacity: 1,
    remaining: 1,
    radiusKm: 12,
    cancellationNote: {
      fa: "هزینهٔ رفت‌وآمد در این پیشنهاد لحاظ شده است.",
      en: "Travel fee is included in this offer.",
    },
    lat: 35.7795,
    lng: 51.3688,
    district: DISTRICTS[4].name,
  },
  {
    id: "d4",
    providerId: "p3",
    categoryId: "facial",
    serviceName: { fa: "پاک‌سازی پوست در محل", en: "At-home deep-cleanse facial" },
    originalPrice: 1_600_000,
    dealPrice: 1_050_000,
    dateISO: iso(1, "11:00"),
    expiresAtISO: iso(1, "11:00"),
    capacity: 2,
    remaining: 2,
    radiusKm: 8,
    cancellationNote: {
      fa: "مناسب سالمندان؛ امکان همراهی عضو خانواده وجود دارد.",
      en: "Senior-friendly; a family member may accompany.",
    },
    lat: 35.8098,
    lng: 51.4612,
    district: DISTRICTS[2].name,
  },
  {
    id: "d5",
    providerId: "p7",
    categoryId: "haircut",
    serviceName: { fa: "کوتاهی مو مردانه", en: "Men's haircut" },
    originalPrice: 450_000,
    dealPrice: 260_000,
    dateISO: iso(0, "20:00"),
    expiresAtISO: iso(0, "20:00"),
    capacity: 3,
    remaining: 2,
    radiusKm: 4,
    cancellationNote: {
      fa: "زمان محدود؛ پس از رزرو، پیشنهاد غیرفعال می‌شود.",
      en: "Limited slot; the offer deactivates once booked.",
    },
    lat: 35.7571,
    lng: 51.4095,
    district: DISTRICTS[6].name,
  },
  {
    id: "d6",
    providerId: "p11",
    categoryId: "nails",
    serviceName: { fa: "کاشت ناخن در منزل", en: "At-home nail extension" },
    originalPrice: 1_500_000,
    dealPrice: 990_000,
    dateISO: iso(2, "09:00"),
    expiresAtISO: iso(2, "09:00"),
    capacity: 2,
    remaining: 2,
    radiusKm: 10,
    cancellationNote: {
      fa: "صبح زود؛ مناسب مادران دارای کودک خردسال.",
      en: "Early morning; ideal for mothers with young children.",
    },
    lat: 35.8018,
    lng: 51.4815,
    district: DISTRICTS[10].name,
  },
];

/* ------------------------------------------------------------------ *
 * Reviews
 * ------------------------------------------------------------------ */

export const REVIEWS: Review[] = [
  {
    id: "r1",
    providerId: "p1",
    authorName: "مهسا ر.",
    rating: 5,
    at: daysAgoISO(3),
    body: {
      fa: "برای پدرم که بعد از عمل جراحی نمی‌توانست از خانه بیرون برود نوبت گرفتم. آقای کاویانی سر زمان آمدند، خیلی باحوصله و آرام کار کردند و وسایل را جلوی خودمان باز و ضدعفونی کردند. پدرم از نتیجه خیلی راضی بود.",
      en: "I booked for my father who couldn't leave home after surgery. Mr. Kaviani arrived exactly on time, worked very patiently and calmly, and opened and sanitised his tools right in front of us. My father was delighted with the result.",
    },
    mode: "home",
    helpful: 34,
    reply: {
      fa: "سپاس از اعتماد شما. برای پدر عزیز سلامتی آرزو می‌کنم.",
      en: "Thank you for your trust. Wishing your father a speedy recovery.",
    },
  },
  {
    id: "r2",
    providerId: "p1",
    authorName: "کوروش ن.",
    rating: 5,
    at: daysAgoISO(9),
    body: {
      fa: "فید خیلی تمیز بود و خط ریش را دقیق درآورد. در سالن هم منتظر نماندم چون نوبت را آنلاین گرفته بودم.",
      en: "The fade was very clean and the beard line was sharp. No waiting at the salon either since I'd booked online.",
    },
    mode: "salon",
    helpful: 12,
  },
  {
    id: "r3",
    providerId: "p1",
    authorName: "سمانه ک.",
    rating: 4,
    at: daysAgoISO(17),
    body: {
      fa: "کار خوب بود. فقط کاش هزینهٔ رفت‌وآمد را در همان ابتدا واضح‌تر نشان می‌داد؛ در خلاصه دیدم ولی اول فکر کردم رایگان است.",
      en: "Good work. I only wish the travel fee were made clearer from the start — I saw it in the summary but assumed it was free at first.",
    },
    mode: "home",
    helpful: 8,
    reply: {
      fa: "بازخورد درستی است؛ توضیح هزینهٔ رفت‌وآمد را در پروفایلم برجسته‌تر کردم.",
      en: "Fair feedback — I've made the travel fee more prominent on my profile.",
    },
  },
  {
    id: "r4",
    providerId: "p2",
    authorName: "نگین ف.",
    rating: 5,
    at: daysAgoISO(5),
    body: {
      fa: "رنگ بالیاژم دقیقاً همان چیزی شد که در نمونه‌کارها دیده بودم. سالن تمیز و پرسنل مؤدب. رمپ ورودی برای مادرم که ویلچر دارد خیلی کمک‌کننده بود.",
      en: "My balayage turned out exactly like the portfolio photos. Clean salon, polite staff. The entrance ramp was a huge help for my mother who uses a wheelchair.",
    },
    mode: "salon",
    helpful: 41,
  },
  {
    id: "r5",
    providerId: "p3",
    authorName: "فرزانه م.",
    rating: 5,
    at: daysAgoISO(2),
    body: {
      fa: "میکاپ مادربزرگ ۸۴ ساله‌ام را در خانهٔ سالمندان انجام دادند. بسیار صبور بودند و با احترام کامل. همهٔ پرسنل آنجا تعریف می‌کردند.",
      en: "She did the makeup for my 84-year-old grandmother at her nursing home. Extremely patient and completely respectful. All the staff there were talking about it.",
    },
    mode: "home",
    helpful: 56,
  },
  {
    id: "r6",
    providerId: "p5",
    authorName: "الهام ش.",
    rating: 5,
    at: daysAgoISO(1),
    body: {
      fa: "با نوزاد سه‌ماهه نمی‌توانستم بیرون بروم. خانم احمدی صبح زود آمدند، ناخن‌هایم را عالی درست کردند و کل کار کمتر از یک ساعت و نیم شد.",
      en: "With a three-month-old I couldn't go out. Ms. Ahmadi came early in the morning, did my nails beautifully and the whole thing took under an hour and a half.",
    },
    mode: "home",
    helpful: 29,
  },
  {
    id: "r7",
    providerId: "p9",
    authorName: "امیرحسین ت.",
    rating: 5,
    at: daysAgoISO(7),
    body: {
      fa: "هر ماه برای پدربزرگم نوبت می‌گیرم. آقای فرهادی همیشه سر وقت می‌آیند و با او مثل یک دوست قدیمی برخورد می‌کنند. این برای ما ارزشمندترین چیز است.",
      en: "I book for my grandfather every month. Mr. Farhadi is always punctual and treats him like an old friend. That's what we value most.",
    },
    mode: "home",
    helpful: 47,
  },
  {
    id: "r8",
    providerId: "p8",
    authorName: "رویا ب.",
    rating: 5,
    at: daysAgoISO(11),
    body: {
      fa: "میکاپ عروسم را در هتل انجام دادند. تیم چهارنفره آمدند، همه‌چیز حرفه‌ای و بدون استرس. عکس‌ها فوق‌العاده شد.",
      en: "They did my bridal makeup at the hotel. A four-person team arrived, everything was professional and stress-free. The photos came out stunning.",
    },
    mode: "home",
    helpful: 63,
  },
  {
    id: "r9",
    providerId: "p4",
    authorName: "سهیل آ.",
    rating: 4,
    at: daysAgoISO(14),
    body: {
      fa: "کار قدیمی و باکیفیت. فقط محیط شلوغ بود و کمی منتظر ماندم، چون نوبت تلفنی هم دارند.",
      en: "Old-school quality work. It was crowded though and I waited a bit, since they take phone bookings too.",
    },
    mode: "salon",
    helpful: 6,
  },
  {
    id: "r10",
    providerId: "p11",
    authorName: "پریسا ج.",
    rating: 5,
    at: daysAgoISO(4),
    body: {
      fa: "ساعت هفت صبح آمد و کار را تمام کرد تا من بتوانم بچه‌ها را به مدرسه برسانم. این انعطاف برای من طلاست.",
      en: "She came at 7 a.m. and finished in time for me to get the kids to school. That flexibility is gold to me.",
    },
    mode: "home",
    helpful: 22,
  },
  {
    id: "r11",
    providerId: "p12",
    authorName: "کیوان ص.",
    rating: 4,
    at: daysAgoISO(6),
    body: {
      fa: "با تخفیف فوری نوبت گرفتم و نصف قیمت شد. کار هم خوب بود. فقط پاسخ پیام‌ها کمی طول کشید.",
      en: "Booked with a flash deal and paid half price. Good work too. Only the message replies took a little while.",
    },
    mode: "salon",
    helpful: 9,
  },
  {
    id: "r12",
    providerId: "p6",
    authorName: "تینا ه.",
    rating: 4,
    at: daysAgoISO(20),
    body: {
      fa: "رنگ کارشان حرف ندارد. قیمت بالاتر از میانگین است ولی کیفیت مواد واقعاً خوب بود.",
      en: "Their color work is unmatched. Prices are above average but the product quality really is good.",
    },
    mode: "salon",
    helpful: 15,
  },
];

export function reviewsFor(providerId: string): Review[] {
  return REVIEWS.filter((r) => r.providerId === providerId).sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
}

/* ------------------------------------------------------------------ *
 * Customer bookings (the demo user)
 * ------------------------------------------------------------------ */

export const DEMO_CUSTOMER = {
  name: { fa: "پارسا رشیدی", en: "Parsa Rashidi" } as L10n,
  phone: "۰۹۱۲ ۳۴۵ ۶۷۸۹",
  lat: 35.7952,
  lng: 51.4181,
  district: DISTRICTS[12].name,
  savedAddresses: [
    {
      id: "a1",
      label: { fa: "منزل", en: "Home" } as L10n,
      value: {
        fa: "الهیه، خیابان شریف‌منش، کوچهٔ یاس، پلاک ۱۲، واحد ۵",
        en: "Elahieh, Sharifmanesh St., Yas Alley, No. 12, Unit 5",
      } as L10n,
      placeType: "home",
    },
    {
      id: "a2",
      label: { fa: "محل کار", en: "Office" } as L10n,
      value: {
        fa: "جردن، خیابان ناهید شرقی، برج آرش، طبقهٔ ۷، واحد ۲۱",
        en: "Jordan, Nahid-e Sharghi St., Arash Tower, 7th floor, Unit 21",
      } as L10n,
      placeType: "work",
    },
    {
      id: "a3",
      label: { fa: "خانهٔ پدری", en: "Parents' home" } as L10n,
      value: {
        fa: "پاسداران، گلستان هفتم، کوچهٔ نرگس، پلاک ۳، طبقهٔ همکف",
        en: "Pasdaran, 7th Golestan, Narges Alley, No. 3, Ground floor",
      } as L10n,
      placeType: "home",
    },
  ],
};

export const BOOKINGS: Booking[] = [
  {
    id: "b1",
    code: "SLM-۴۸۲۱",
    providerId: "p1",
    customerName: DEMO_CUSTOMER.name,
    beneficiary: {
      name: { fa: "محمد رشیدی", en: "Mohammad Rashidi" },
      relation: { fa: "پدر", en: "Father" },
      isSelf: false,
      notes: {
        fa: "پدرم ۷۸ ساله است و از واکر استفاده می‌کند. خانه پله ندارد. لطفاً با صدای بلند و شمرده صحبت کنید، کم‌شنوا هستند.",
        en: "My father is 78 and uses a walker. The flat has no stairs. Please speak loudly and clearly — he is hard of hearing.",
      },
    },
    serviceId: "ms-cut",
    mode: "home",
    status: "confirmed",
    dateISO: iso(1, "10:30"),
    durationMin: 45,
    price: 450_000,
    travelFee: 120_000,
    address: {
      fa: "پاسداران، گلستان هفتم، کوچهٔ نرگس، پلاک ۳، طبقهٔ همکف",
      en: "Pasdaran, 7th Golestan, Narges Alley, No. 3, Ground floor",
    },
    addressVisible: true,
    createdAtISO: daysAgoISO(1),
    timeline: [
      { at: daysAgoISO(1), status: "requested" },
      { at: iso(0, "09:12"), status: "confirmed", note: { fa: "آرایشگر زمان را تأیید کرد", en: "The stylist confirmed the time" } },
    ],
    companionShared: true,
    supportPhone: "۰۲۱-۹۱۰۰۰۰۰۰",
  },
  {
    id: "b2",
    code: "SLM-۴۷۵۶",
    providerId: "p3",
    customerName: DEMO_CUSTOMER.name,
    beneficiary: {
      name: DEMO_CUSTOMER.name,
      relation: { fa: "خودم", en: "Myself" },
      isSelf: true,
    },
    serviceId: "ws-facial",
    mode: "salon",
    status: "pending",
    dateISO: iso(2, "16:00"),
    durationMin: 75,
    price: 1_400_000,
    travelFee: 0,
    addressVisible: false,
    createdAtISO: daysAgoISO(0),
    timeline: [{ at: daysAgoISO(0), status: "requested" }],
    companionShared: false,
    supportPhone: "۰۲۱-۹۱۰۰۰۰۰۰",
  },
  {
    id: "b3",
    code: "SLM-۴۶۱۰",
    providerId: "p5",
    customerName: DEMO_CUSTOMER.name,
    beneficiary: {
      name: { fa: "فاطمه رشیدی", en: "Fatemeh Rashidi" },
      relation: { fa: "همسر", en: "Spouse" },
      isSelf: false,
    },
    serviceId: "ws-nails",
    mode: "home",
    status: "done",
    dateISO: daysAgoISO(8),
    durationMin: 70,
    price: 850_000,
    travelFee: 200_000,
    address: DEMO_CUSTOMER.savedAddresses[0].value,
    addressVisible: true,
    createdAtISO: daysAgoISO(11),
    timeline: [
      { at: daysAgoISO(11), status: "requested" },
      { at: daysAgoISO(11), status: "confirmed" },
      { at: daysAgoISO(8), status: "done" },
    ],
    companionShared: false,
    supportPhone: "۰۲۱-۹۱۰۰۰۰۰۰",
  },
  {
    id: "b4",
    code: "SLM-۴۵۰۲",
    providerId: "p4",
    customerName: DEMO_CUSTOMER.name,
    beneficiary: {
      name: DEMO_CUSTOMER.name,
      relation: { fa: "خودم", en: "Myself" },
      isSelf: true,
    },
    serviceId: "ms-cut",
    mode: "salon",
    status: "cancelled",
    dateISO: daysAgoISO(15),
    durationMin: 45,
    price: 450_000,
    travelFee: 0,
    addressVisible: false,
    createdAtISO: daysAgoISO(18),
    timeline: [
      { at: daysAgoISO(18), status: "requested" },
      { at: daysAgoISO(17), status: "confirmed" },
      { at: daysAgoISO(16), status: "cancelled", note: { fa: "لغو توسط مشتری", en: "Cancelled by customer" } },
    ],
    companionShared: false,
    supportPhone: "۰۲۱-۹۱۰۰۰۰۰۰",
  },
  {
    id: "b5",
    code: "SLM-۴۳۸۹",
    providerId: "p9",
    customerName: DEMO_CUSTOMER.name,
    beneficiary: {
      name: { fa: "محمد رشیدی", en: "Mohammad Rashidi" },
      relation: { fa: "پدر", en: "Father" },
      isSelf: false,
      notes: { fa: "کم‌شنوا؛ لطفاً صبور باشید.", en: "Hard of hearing; please be patient." },
    },
    serviceId: "ms-beard",
    mode: "home",
    status: "done",
    dateISO: daysAgoISO(32),
    durationMin: 25,
    price: 250_000,
    travelFee: 150_000,
    address: DEMO_CUSTOMER.savedAddresses[2].value,
    addressVisible: true,
    createdAtISO: daysAgoISO(35),
    timeline: [
      { at: daysAgoISO(35), status: "requested" },
      { at: daysAgoISO(35), status: "confirmed" },
      { at: daysAgoISO(32), status: "done" },
    ],
    companionShared: true,
    supportPhone: "۰۲۱-۹۱۰۰۰۰۰۰",
  },
];

/* ------------------------------------------------------------------ *
 * Provider panel: incoming requests
 * ------------------------------------------------------------------ */

export const PROVIDER_REQUESTS: ProviderRequest[] = [
  {
    id: "q1",
    customer: { fa: "پارسا رشیدی", en: "Parsa Rashidi" },
    service: { fa: "کوتاهی مو مردانه + اصلاح ریش", en: "Men's haircut + beard trim" },
    dateISO: iso(1, "10:30"),
    mode: "home",
    price: 700_000,
    travelFee: 120_000,
    beneficiaryIsOther: true,
    senior: true,
    notes: {
      fa: "برای پدرم (۷۸ ساله) نوبت گرفتم. از واکر استفاده می‌کند، خانه پله ندارد. کم‌شنوا هستند؛ لطفاً بلند و شمرده صحبت کنید.",
      en: "Booked for my father (78). He uses a walker, no stairs at the flat. He's hard of hearing — please speak loudly and clearly.",
    },
    distanceKm: 4.2,
    status: "requested",
    avatarAccent: "#0ba68b",
  },
  {
    id: "q2",
    customer: { fa: "شیرین معتمدی", en: "Shirin Motamedi" },
    service: { fa: "فید آمریکایی", en: "American skin fade" },
    dateISO: iso(0, "18:00"),
    mode: "salon",
    price: 520_000,
    travelFee: 0,
    beneficiaryIsOther: false,
    senior: false,
    distanceKm: 1.1,
    status: "requested",
    avatarAccent: "#ea580c",
  },
  {
    id: "q3",
    customer: { fa: "خانهٔ سالمندان مهر آیین", en: "Mehr-Ayin Nursing Home" },
    service: { fa: "کوتاهی و اصلاح برای ۳ نفر", en: "Haircut & trim for 3 residents" },
    dateISO: iso(3, "09:00"),
    mode: "home",
    price: 1_350_000,
    travelFee: 250_000,
    beneficiaryIsOther: true,
    senior: true,
    notes: {
      fa: "هر سه نفر روی ویلچر هستند. فضای کار در سالن اجتماعات فراهم است. هماهنگی با پرستار مسئول: خانم اکبری.",
      en: "All three use wheelchairs. Workspace is available in the community hall. Coordinate with the head nurse, Ms. Akbari.",
    },
    distanceKm: 6.8,
    status: "requested",
    avatarAccent: "#7c3aed",
  },
  {
    id: "q4",
    customer: { fa: "کوروش نادری", en: "Kourosh Naderi" },
    service: { fa: "کوتاهی مو مردانه", en: "Men's haircut" },
    dateISO: iso(0, "20:30"),
    mode: "salon",
    price: 450_000,
    travelFee: 0,
    beneficiaryIsOther: false,
    senior: false,
    distanceKm: 2.4,
    status: "requested",
    avatarAccent: "#0369a1",
  },
  {
    id: "q5",
    customer: { fa: "مریم اسدی", en: "Maryam Asadi" },
    service: { fa: "اصلاح صورت با تیغ", en: "Hot-towel straight shave" },
    dateISO: iso(-1, "17:00"),
    mode: "salon",
    price: 320_000,
    travelFee: 0,
    beneficiaryIsOther: false,
    senior: false,
    distanceKm: 0.8,
    status: "countered",
    proposedTime: "18:30",
    avatarAccent: "#db2777",
  },
  {
    id: "q6",
    customer: { fa: "سعید برهانی", en: "Saeed Borhani" },
    service: { fa: "کوتاهی کودک", en: "Kids haircut" },
    dateISO: iso(-2, "12:00"),
    mode: "home",
    price: 350_000,
    travelFee: 120_000,
    beneficiaryIsOther: true,
    senior: false,
    distanceKm: 9.5,
    status: "rejected",
    avatarAccent: "#15803d",
  },
];

/* ------------------------------------------------------------------ *
 * Provider panel: calendar slots
 * ------------------------------------------------------------------ */

function buildDaySlots(dayOffset: number): Slot[] {
  const base: [string, Slot["state"], string?, string?][] = [
    ["09:00", "confirmed", "کوروش نادری", "کوتاهی مو مردانه"],
    ["10:00", "confirmed", "امیر شریفی", "فید آمریکایی"],
    ["11:00", "blocked", undefined, undefined],
    ["12:00", "free"],
    ["13:00", "free"],
    ["14:00", "requested", "پارسا رشیدی", "کوتاهی + ریش"],
    ["15:00", "confirmed", "بابک رحیمی", "اصلاح صورت"],
    ["16:00", "free"],
    ["17:00", "confirmed", "سهیل آذری", "کوتاهی مو مردانه"],
    ["18:00", "free"],
    ["19:00", "requested", "کیوان صادقی", "فید آمریکایی"],
    ["20:00", "free"],
    ["21:00", "blocked", undefined, undefined],
  ];
  return base.map(([time, state, customer, service], i) => ({
    id: `${dayOffset}-${i}`,
    time,
    state,
    customer,
    service,
    mode: customer === "پارسا رشیدی" ? ("home" as const) : ("salon" as const),
  }));
}

export const CALENDAR_DAYS = [-1, 0, 1, 2, 3, 4, 5].map((offset) => ({
  offset,
  iso: toISODate(new Date(startOfToday().setDate(startOfToday().getDate() + offset))),
  slots: buildDaySlots(offset),
}));

/* ------------------------------------------------------------------ *
 * Provider panel: customers
 * ------------------------------------------------------------------ */

export const PROVIDER_CUSTOMERS = [
  { id: "c1", name: { fa: "کوروش نادری", en: "Kourosh Naderi" }, visits: 14, lastVisit: daysAgoISO(6), totalSpent: 7_200_000, noShows: 0, cancellations: 1, accent: "#0ba68b" },
  { id: "c2", name: { fa: "پارسا رشیدی", en: "Parsa Rashidi" }, visits: 8, lastVisit: daysAgoISO(12), totalSpent: 4_850_000, noShows: 0, cancellations: 1, accent: "#ea580c", companionFor: { fa: "محمد رشیدی (پدر)", en: "Mohammad Rashidi (father)" } },
  { id: "c3", name: { fa: "شیرین معتمدی", en: "Shirin Motamedi" }, visits: 5, lastVisit: daysAgoISO(21), totalSpent: 2_400_000, noShows: 1, cancellations: 0, accent: "#7c3aed" },
  { id: "c4", name: { fa: "امیر شریفی", en: "Amir Sharifi" }, visits: 22, lastVisit: daysAgoISO(2), totalSpent: 12_100_000, noShows: 0, cancellations: 0, accent: "#db2777" },
  { id: "c5", name: { fa: "خانهٔ سالمندان مهر آیین", en: "Mehr-Ayin Nursing Home" }, visits: 31, lastVisit: daysAgoISO(8), totalSpent: 21_500_000, noShows: 0, cancellations: 2, accent: "#15803d", institutional: true },
  { id: "c6", name: { fa: "بابک رحیمی", en: "Babak Rahimi" }, visits: 3, lastVisit: daysAgoISO(35), totalSpent: 1_350_000, noShows: 0, cancellations: 1, accent: "#0369a1" },
  { id: "c7", name: { fa: "سهیل آذری", en: "Sohel Azari" }, visits: 11, lastVisit: daysAgoISO(4), totalSpent: 5_900_000, noShows: 1, cancellations: 0, accent: "#a16207" },
];

/* ------------------------------------------------------------------ *
 * Notifications
 * ------------------------------------------------------------------ */

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    kind: "booking",
    title: { fa: "نوبت شما تأیید شد", en: "Your booking was confirmed" },
    body: {
      fa: "امیر کاویانی درخواست شما برای فردا ساعت ۱۰:۳۰ را تأیید کرد. نشانی کامل در اختیار او قرار گرفت.",
      en: "Amir Kaviani confirmed your request for tomorrow at 10:30. Your full address has been shared with him.",
    },
    at: iso(0, "09:12"),
    read: false,
  },
  {
    id: "n2",
    kind: "deal",
    title: { fa: "تخفیف فوری در ولنجک", en: "Flash deal in Velenjak" },
    body: {
      fa: "اصلاح مو و ریش با ۴۰٪ تخفیف — امروز ساعت ۱۸. فقط یک ظرفیت باقی است.",
      en: "Haircut & beard trim with 40% off — today at 18:00. Only one slot left.",
    },
    at: iso(0, "08:40"),
    read: false,
  },
  {
    id: "n3",
    kind: "booking",
    title: { fa: "یادآوری نوبت", en: "Appointment reminder" },
    body: {
      fa: "فردا ساعت ۱۰:۳۰ نوبت دارید. برای پدرتان ثبت شده و با همراه اشتراک گذاشته شده است.",
      en: "You have an appointment tomorrow at 10:30. Booked for your father and shared with a companion.",
    },
    at: iso(0, "07:00"),
    read: true,
  },
  {
    id: "n4",
    kind: "review",
    title: { fa: "امتیاز دهید", en: "Leave a rating" },
    body: {
      fa: "خدمت سارا احمدی انجام شد. تجربهٔ خود را ثبت کنید تا به دیگران کمک کنید.",
      en: "Sara Ahmadi's service is complete. Share your experience to help others.",
    },
    at: daysAgoISO(8),
    read: true,
  },
  {
    id: "n5",
    kind: "system",
    title: { fa: "احراز هویت تکمیل شد", en: "Identity verification complete" },
    body: {
      fa: "شمارهٔ موبایل شما تأیید شد. نشان اعتماد در پروفایل شما فعال است.",
      en: "Your phone number was verified. The trust badge is active on your profile.",
    },
    at: daysAgoISO(20),
    read: true,
  },
];

/* ------------------------------------------------------------------ *
 * Admin data
 * ------------------------------------------------------------------ */

export const PENDING_PROVIDERS: PendingProvider[] = [
  { id: "pp1", name: { fa: "سالن آرایشی الماس", en: "Almas Beauty Salon" }, kind: "salon", city: { fa: "تهران", en: "Tehran" }, submittedAt: daysAgoISO(2), docsSubmitted: true, nationalIdVerified: false, phoneVerified: true, status: "pending", accent: "#a16207", servicesCount: 9 },
  { id: "pp2", name: { fa: "رضا موسوی", en: "Reza Mousavi" }, kind: "independent", city: { fa: "تهران", en: "Tehran" }, submittedAt: daysAgoISO(4), docsSubmitted: true, nationalIdVerified: true, phoneVerified: true, status: "pending", accent: "#0369a1", servicesCount: 5 },
  { id: "pp3", name: { fa: "آرایشگاه سپید", en: "Sepid Barbershop" }, kind: "salon", city: { fa: "کرج", en: "Karaj" }, submittedAt: daysAgoISO(1), docsSubmitted: false, nationalIdVerified: false, phoneVerified: true, status: "pending", accent: "#4f46e5", servicesCount: 0 },
  { id: "pp4", name: { fa: "ندا قاسمی", en: "Neda Ghasemi" }, kind: "independent", city: { fa: "تهران", en: "Tehran" }, submittedAt: daysAgoISO(6), docsSubmitted: true, nationalIdVerified: true, phoneVerified: true, status: "pending", accent: "#c026d3", servicesCount: 7 },
  { id: "pp5", name: { fa: "استودیو مو آرتمن", en: "Artmen Hair Studio" }, kind: "salon", city: { fa: "اصفهان", en: "Isfahan" }, submittedAt: daysAgoISO(3), docsSubmitted: true, nationalIdVerified: false, phoneVerified: true, status: "pending", accent: "#15803d", servicesCount: 12 },
];

export const ADMIN_USERS = [
  { id: "u1", name: { fa: "پارسا رشیدی", en: "Parsa Rashidi" }, phone: "۰۹۱۲ ۳۴۵ ۶۷۸۹", role: "customer", joined: daysAgoISO(120), bookings: 12, blocked: false, accent: "#0ba68b" },
  { id: "u2", name: { fa: "امیر کاویانی", en: "Amir Kaviani" }, phone: "۰۹۱۲ ۴۴۵ ۶۷۸۹", role: "provider", joined: daysAgoISO(400), bookings: 1840, blocked: false, accent: "#0ba68b" },
  { id: "u3", name: { fa: "شیرین معتمدی", en: "Shirin Motamedi" }, phone: "۰۹۳۵ ۲۲۰ ۱۱۴۵", role: "customer", joined: daysAgoISO(60), bookings: 5, blocked: false, accent: "#7c3aed" },
  { id: "u4", name: { fa: "سعید برهانی", en: "Saeed Borhani" }, phone: "۰۹۰۱ ۷۷۴ ۲۲۹۰", role: "customer", joined: daysAgoISO(30), bookings: 2, blocked: true, accent: "#be123c" },
  { id: "u5", name: { fa: "مریم شریفی", en: "Maryam Sharifi" }, phone: "۰۹۳۵ ۸۸۹ ۲۲۱۰", role: "provider", joined: daysAgoISO(300), bookings: 1320, blocked: false, accent: "#db2777" },
  { id: "u6", name: { fa: "کوروش نادری", en: "Kourosh Naderi" }, phone: "۰۹۱۹ ۴۴۲ ۸۸۰۱", role: "customer", joined: daysAgoISO(200), bookings: 14, blocked: false, accent: "#ea580c" },
  { id: "u7", name: { fa: "نگار استودیو", en: "Negar Studio" }, phone: "۰۲۱ ۲۶۷۰ ۱۱۲۲", role: "provider", joined: daysAgoISO(500), bookings: 5120, blocked: false, accent: "#be123c" },
  { id: "u8", name: { fa: "ناشناس ۹۹۲", en: "Unknown 992" }, phone: "۰۹۱۲ ۰۰۰ ۰۰۰۰", role: "customer", joined: daysAgoISO(10), bookings: 0, blocked: true, accent: "#6e6459" },
];

export const ADMIN_REPORTS: ReportItem[] = [
  { id: "rp1", type: "review", subject: { fa: "نظر کاربر «ناشناس ۹۹۲» روی پروفایل نگار استودیو", en: "Review by “Unknown 992” on Negar Studio" }, reporter: "u8", reason: { fa: "توهین و ادعای بدون مستند", en: "Insulting language and unsupported claims" }, at: daysAgoISO(1), status: "open" },
  { id: "rp2", type: "portfolio", subject: { fa: "تصویر نمونه‌کار دارای چهرهٔ قابل تشخیص مشتری", en: "Portfolio image showing an identifiable client face" }, reporter: "u3", reason: { fa: "انتشار تصویر بدون رضایت", en: "Published without consent" }, at: daysAgoISO(2), status: "reviewing" },
  { id: "rp3", type: "provider", subject: { fa: "آرایشگاه سپید — عدم مراجعه به نوبت در محل", en: "Sepid Barbershop — no-show for an at-home appointment" }, reporter: "u6", reason: { fa: "عدم مراجعه بدون اطلاع", en: "No-show without notice" }, at: daysAgoISO(3), status: "open" },
  { id: "rp4", type: "booking", subject: { fa: "اختلاف بر سر مبلغ پرداختی نوبت SLM-۴۱۲۰", en: "Dispute over the amount paid for booking SLM-4120" }, reporter: "u1", reason: { fa: "دریافت مبلغ بیشتر از قیمت ثبت‌شده", en: "Charged more than the listed price" }, at: daysAgoISO(5), status: "reviewing" },
  { id: "rp5", type: "user", subject: { fa: "ارسال درخواست‌های اسپم توسط کاربر ۰۹۱۲۰۰۰۰۰۰۰", en: "Spam requests from user +98 912 000 0000" }, reporter: "system", reason: { fa: "۱۴ درخواست تکراری در یک ساعت", en: "14 duplicate requests in one hour" }, at: daysAgoISO(6), status: "resolved" },
];

export const ADMIN_CITIES = [
  { id: "ct1", name: { fa: "تهران", en: "Tehran" }, districts: 22, providers: 1284, users: 18420, active: true, bookingsThisMonth: 6120 },
  { id: "ct2", name: { fa: "کرج", en: "Karaj" }, districts: 9, providers: 214, users: 3120, active: true, bookingsThisMonth: 840 },
  { id: "ct3", name: { fa: "اصفهان", en: "Isfahan" }, districts: 14, providers: 96, users: 1450, active: false, bookingsThisMonth: 0 },
  { id: "ct4", name: { fa: "شیراز", en: "Shiraz" }, districts: 11, providers: 42, users: 610, active: false, bookingsThisMonth: 0 },
  { id: "ct5", name: { fa: "مشهد", en: "Mashhad" }, districts: 13, providers: 18, users: 240, active: false, bookingsThisMonth: 0 },
];

export const ADMIN_REVENUE = [
  { id: "rv1", source: "ad.rev.bookingCommission", rate: "۸٪", amount: 48_600_000, growth: 18.4 },
  { id: "rv2", source: "ad.rev.subscription", rate: "۲۹۰٬۰۰۰ تومان/ماه", amount: 21_750_000, growth: 9.1 },
  { id: "rv3", source: "ad.rev.featured", rate: "بستهٔ نمایش", amount: 9_400_000, growth: -4.2 },
  { id: "rv4", source: "ad.rev.dealPublish", rate: "۴۵٬۰۰۰ تومان", amount: 3_150_000, growth: 32.7 },
  { id: "rv5", source: "ad.rev.homeService", rate: "۵٪ هزینهٔ اعزام", amount: 6_820_000, growth: 24.0 },
];

export const ADMIN_PAGES = [
  { id: "pg1", title: { fa: "قوانین و مقررات استفاده", en: "Terms of use" }, slug: "/terms", updated: daysAgoISO(45) },
  { id: "pg2", title: { fa: "سیاست حریم خصوصی", en: "Privacy policy" }, slug: "/privacy", updated: daysAgoISO(30) },
  { id: "pg3", title: { fa: "مقررات لغو نوبت", en: "Cancellation rules" }, slug: "/cancellation", updated: daysAgoISO(12) },
  { id: "pg4", title: { fa: "ایمنی و اعتماد", en: "Safety & trust" }, slug: "/safety", updated: daysAgoISO(8) },
  { id: "pg5", title: { fa: "مقررات محتوای نمونه‌کار", en: "Portfolio content rules" }, slug: "/content-rules", updated: daysAgoISO(60) },
];

export const ADMIN_ACTIVITY = [
  { id: "ac1", text: { fa: "پروفایل «ندا قاسمی» برای تأیید ارسال شد", en: "“Neda Ghasemi” submitted a profile for approval" }, at: iso(0, "11:20"), kind: "provider" as const },
  { id: "ac2", text: { fa: "۳ گزارش جدید روی محتوای نمونه‌کار ثبت شد", en: "3 new reports filed on portfolio content" }, at: iso(0, "10:05"), kind: "report" as const },
  { id: "ac3", text: { fa: "تخفیف فوری «لیلا کریمی» پس از رزرو غیرفعال شد", en: "Leila Karimi's flash deal auto-deactivated after booking" }, at: iso(0, "09:48"), kind: "deal" as const },
  { id: "ac4", text: { fa: "۴۲ نوبت جدید در ۲۴ ساعت گذشته ثبت شد", en: "42 new bookings in the last 24 hours" }, at: iso(0, "08:30"), kind: "booking" as const },
  { id: "ac5", text: { fa: "کاربر ۰۹۱۲۰۰۰۰۰۰۰ به‌دلیل اسپم مسدود شد", en: "User +98 912 000 0000 blocked for spam" }, at: daysAgoISO(1), kind: "user" as const },
  { id: "ac6", text: { fa: "شهر «اصفهان» در وضعیت آماده‌سازی قرار گرفت", en: "Isfahan moved to preparation status" }, at: daysAgoISO(2), kind: "system" as const },
];

/** 12-week booking trend for the admin chart. */
export const BOOKING_TREND = [
  320, 410, 385, 520, 610, 585, 720, 810, 760, 940, 1080, 1240,
];

export const SIGNUP_TREND = [
  90, 140, 165, 210, 195, 260, 320, 380, 410, 470, 560, 640,
];

export const ADMIN_KPI = {
  users: 24_870,
  usersGrowth: 12.4,
  providers: 1_654,
  providersGrowth: 8.1,
  pending: 5,
  bookingsThisMonth: 6_960,
  bookingsGrowth: 15.7,
  dealsActive: 38,
  dealsGrowth: 22.3,
  reportsOpen: 4,
  revenue: 89_720_000,
  revenueGrowth: 14.9,
  commission: 48_600_000,
  homeShare: 34,
};
