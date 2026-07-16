import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type HotelStatus = 'active' | 'inactive';

export interface HotelEntity {
  id: number;
  name: string;
  country: string;
  city: string;
  rating: number;
  price: number;
  rooms: number;
  status: HotelStatus;
  tag: string;
  image: string;
  amenities: string[];
}

// قائمة الفنادق السورية الافتراضية لتغذية الواجهة تلقائياً عند التشغيل الأول 🇸🇾
const SYRIAN_SEED_HOTELS: HotelEntity[] = [
  {
    id: 1,
    name: 'فندق داما روز (دمشق)',
    country: 'سوريا',
    city: 'دمشق',
    rating: 4.8,
    price: 650000, // السعر بالليرة السورية لليلة الواحدة
    rooms: 120,
    status: 'active',
    tag: 'luxury',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=700&q=80', // صورة فندق فاخر
    amenities: ['مسبح خارجي', 'سبا ونادي صحي', 'واي فاي مجاني', 'مواقف سيارات', 'قاعة مؤتمرات']
  },
  {
    id: 2,
    name: 'منتجع أفاميا الشام (اللاذقية)',
    country: 'سوريا',
    city: 'اللاذقية',
    rating: 4.9,
    price: 850000,
    rooms: 150,
    status: 'active',
    tag: 'beachfront',
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=700&q=80', // صورة منتجع ساحلي
    amenities: ['شاطئ خاص', 'مسبح عائلي', 'ألعاب مائية', 'عدة مطاعم', 'إطلالة بحرية']
  },
  {
    id: 3,
    name: 'فندق بيت المملوكة (دمشق القديمة)',
    country: 'سوريا',
    city: 'دمشق القديمة',
    rating: 4.9,
    price: 450000,
    rooms: 12, // فندق تراثي صغير (Boutique Hotel)
    status: 'active',
    tag: 'heritage',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=700&q=80', // صورة تراثية شرقية
    amenities: ['فناء دمشقي أثري', 'بحرة ماء', 'فطور شرقي تقليدي', 'تكييف كامل', 'موقع تاريخي']
  },
  {
    id: 4,
    name: 'فندق الشيراتون (حلب)',
    country: 'سوريا',
    city: 'حلب',
    rating: 4.6,
    price: 550000,
    rooms: 95,
    status: 'active',
    tag: 'business',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=700&q=80',
    amenities: ['مركز لرجال الأعمال', 'قاعة اجتماعات', 'مطعم حلبي تراثي', 'توصيل مطار']
  },
  {
    id: 5,
    name: 'فندق ومنتجع بلو باي (طرطوس)',
    country: 'سوريا',
    city: 'طرطوس',
    rating: 4.7,
    price: 700000,
    rooms: 80,
    status: 'active',
    tag: 'beachfront',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=700&q=80',
    amenities: ['مسبح خارجي', 'شاليهات خاصة', 'منطقة ألعاب أطفال', 'جلسات عالبحر']
  }
];

interface HotelsState {
  hotels: HotelEntity[];
  initFrom: (initialHotels: HotelEntity[]) => void;
  addHotel: (payload: Omit<HotelEntity, 'id' | 'rating' | 'rooms' | 'image'> & { amenitiesText?: string; rating?: number; rooms?: number; image?: string }) => HotelEntity;
  updateHotel: (id: number, patch: Partial<HotelEntity>) => void;
}

export const useHotelsStore = create<HotelsState>()(
  persist(
    (set, get) => ({
      // هنا قمنا بتمرير القائمة السورية لتظهر تلقائياً كبيانات افتراضية
      hotels: SYRIAN_SEED_HOTELS, 

      initFrom: (initialHotels) => {
        // نملأ المتجر فقط إذا كان فارغاً تماماً من أي فنادق
        if (get().hotels.length > 0) return;
        set({ hotels: initialHotels.length > 0 ? initialHotels : SYRIAN_SEED_HOTELS });
      },

      addHotel: (payload) => {
        const nextId = get().hotels.reduce((m, h) => Math.max(m, h.id), 0) + 1;
        const amenities = (payload.amenitiesText ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        const hotel: HotelEntity = {
          id: nextId,
          name: payload.name,
          country: payload.country || 'سوريا', // جعل سوريا القيمة الافتراضية للبلد
          city: payload.city,
          status: payload.status,
          tag: payload.tag,
          price: payload.price,
          rooms: payload.rooms ?? 0,
          rating: payload.rating ?? 4.7,
          // تعديل الصورة الافتراضية عند عدم الرفع لتناسب فنادقنا
          image:
            payload.image && payload.image.trim().length
              ? payload.image
              : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=700&q=80', 
          amenities: amenities.length > 0 ? amenities : ['واي فاي مجاني', 'تكييف كامل'],
        };

        set((s) => ({ hotels: [hotel, ...s.hotels] }));
        return hotel;
      },

      updateHotel: (id, patch) => {
        set((s) => ({ hotels: s.hotels.map((h) => (h.id === id ? { ...h, ...patch } : h)) }));
      },
    }),
    { name: 'stay-hotels' }
  )
);