import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { collection, query, where, getDocs, orderBy, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Building, MapPin, DollarSign, Bed, Filter, Search, PlusCircle } from 'lucide-react';

export default function Properties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minBedrooms, setMinBedrooms] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const propsRef = collection(db, 'properties');
        const q = query(propsRef, where('status', '==', 'available'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const props: any[] = [];
        querySnapshot.forEach((doc) => {
          props.push({ id: doc.id, ...doc.data() });
        });
        
        setProperties(props);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const seedDummyProperties = async () => {
    const dummies = [
      {
        title: "Rumah Mewah Pondok Indah",
        description: "Rumah mewah 2 lantai dengan kolam renang pribadi, taman luas, dan keamanan 24 jam. Dekat dengan mall dan sekolah internasional.",
        price: 15000000000,
        commissionRate: 2.5,
        location: "Jakarta Selatan",
        bedrooms: 5,
        bathrooms: 4,
        status: "available",
        images: ["https://picsum.photos/seed/house1/800/600", "https://picsum.photos/seed/house1b/800/600"],
        createdAt: new Date()
      },
      {
        title: "Apartemen Sudirman Suites",
        description: "Apartemen studio modern di pusat bisnis Jakarta. Fasilitas lengkap: gym, kolam renang, akses langsung ke stasiun MRT.",
        price: 1200000000,
        commissionRate: 3.0,
        location: "Jakarta Pusat",
        bedrooms: 1,
        bathrooms: 1,
        status: "available",
        images: ["https://picsum.photos/seed/apt1/800/600"],
        createdAt: new Date()
      },
      {
        title: "Rumah Minimalis BSD City",
        description: "Rumah cluster minimalis cocok untuk keluarga muda. Lingkungan asri, bebas banjir, dan dekat dengan stasiun KRL.",
        price: 850000000,
        commissionRate: 2.0,
        location: "Tangerang Selatan",
        bedrooms: 2,
        bathrooms: 1,
        status: "available",
        images: ["https://picsum.photos/seed/house2/800/600", "https://picsum.photos/seed/house2b/800/600"],
        createdAt: new Date()
      },
      {
        title: "Villa Tropis Canggu",
        description: "Villa dengan desain tropis modern, 5 menit dari pantai. Cocok untuk investasi atau tempat tinggal pribadi.",
        price: 4500000000,
        commissionRate: 3.0,
        location: "Bali",
        bedrooms: 3,
        bathrooms: 3,
        status: "available",
        images: ["https://picsum.photos/seed/villa1/800/600"],
        createdAt: new Date()
      },
      {
        title: "Townhouse Kemang",
        description: "Townhouse eksklusif di area Kemang. Desain elegan, semi-furnished, dan siap huni.",
        price: 3500000000,
        commissionRate: 2.5,
        location: "Jakarta Selatan",
        bedrooms: 4,
        bathrooms: 3,
        status: "available",
        images: ["https://picsum.photos/seed/house3/800/600"],
        createdAt: new Date()
      }
    ];

    try {
      setLoading(true);
      for (const dummy of dummies) {
        await addDoc(collection(db, 'properties'), dummy);
      }
      
      // Refresh the list without reloading the page
      const propsRef = collection(db, 'properties');
      const q = query(propsRef, where('status', '==', 'available'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const props: any[] = [];
      querySnapshot.forEach((doc) => {
        props.push({ id: doc.id, ...doc.data() });
      });
      
      setProperties(props);
      setLoading(false);
    } catch (error: any) {
      console.error("Error seeding properties:", error);
      alert("Gagal menambahkan data dummy: " + error.message);
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(p => {
    if (minPrice && p.price < parseInt(minPrice)) return false;
    if (maxPrice && p.price > parseInt(maxPrice)) return false;
    if (minBedrooms && (p.bedrooms || 0) < parseInt(minBedrooms)) return false;
    if (locationSearch && p.location && !p.location.toLowerCase().includes(locationSearch.toLowerCase())) return false;
    if (locationSearch && !p.location) return false; // If searching by location but property has no location
    return true;
  });

  if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Properti - PropMart</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <h1 className="font-serif text-3xl font-bold text-slate-900">Daftar Properti</h1>
        <div className="flex space-x-3">
          {user?.uid === 'dummy-agent-123' && properties.length === 0 && (
            <button 
              onClick={seedDummyProperties}
              className="flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
            >
              <PlusCircle size={16} className="mr-2" />
              Generate Dummies
            </button>
          )}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-slate-200 shadow-sm text-sm font-medium rounded-full text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            <Filter size={16} className="mr-2" />
            Filter
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Lokasi</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin size={16} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="focus:ring-slate-900 focus:border-slate-900 block w-full pl-10 sm:text-sm border-slate-200 rounded-xl py-2.5 transition-colors"
                  placeholder="Cari kota/daerah..."
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Harga Minimum (Rp)</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="focus:ring-slate-900 focus:border-slate-900 block w-full sm:text-sm border-slate-200 rounded-xl py-2.5 transition-colors"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Harga Maksimum (Rp)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="focus:ring-slate-900 focus:border-slate-900 block w-full sm:text-sm border-slate-200 rounded-xl py-2.5 transition-colors"
                placeholder="Tak terhingga"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kamar Tidur (Min)</label>
              <select
                value={minBedrooms}
                onChange={(e) => setMinBedrooms(e.target.value)}
                className="focus:ring-slate-900 focus:border-slate-900 block w-full sm:text-sm border-slate-200 rounded-xl py-2.5 transition-colors"
              >
                <option value="">Semua</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              onClick={() => {
                setMinPrice('');
                setMaxPrice('');
                setMinBedrooms('');
                setLocationSearch('');
              }}
              className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <div key={property.id} className="group bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl flex flex-col border border-slate-100">
              <div className="relative aspect-[4/3] bg-slate-200 w-full overflow-hidden">
                {property.images && property.images.length > 0 ? (
                  <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <Building size={48} />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide shadow-sm">
                  Komisi {property.commissionRate}%
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-serif text-xl font-bold text-slate-900 line-clamp-2 mb-3 group-hover:text-slate-700 transition-colors">{property.title}</h3>
                <div className="flex items-center text-slate-600 mb-4">
                  <span className="text-lg font-bold text-emerald-600">{formatCurrency(property.price)}</span>
                </div>
                
                <div className="flex flex-wrap gap-3 mb-4">
                  {property.location && (
                    <div className="flex items-center text-slate-500 text-sm bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                      <MapPin size={14} className="mr-1.5 text-slate-400" />
                      <span className="truncate max-w-[120px]">{property.location}</span>
                    </div>
                  )}
                  {property.bedrooms && (
                    <div className="flex items-center text-slate-500 text-sm bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                      <Bed size={14} className="mr-1.5 text-slate-400" />
                      <span>{property.bedrooms} KT</span>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1 leading-relaxed">{property.description}</p>
                
                <Link 
                  to={`/properties/${property.id}`}
                  className="mt-auto w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-semibold rounded-xl text-slate-900 bg-slate-100 hover:bg-slate-900 hover:text-white transition-colors duration-300"
                >
                  Lihat Detail & Share
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Building className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-serif font-bold text-slate-900">Belum ada properti</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">Properti yang tersedia atau sesuai dengan filter Anda akan muncul di sini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
