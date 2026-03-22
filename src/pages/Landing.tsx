import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { Building, MapPin, Bed, Filter, Search } from 'lucide-react';

export default function Landing() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minBedrooms, setMinBedrooms] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [showFilters, setShowFilters] = useState(true);

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

  const filteredProperties = properties.filter(p => {
    if (minPrice && p.price < parseInt(minPrice)) return false;
    if (maxPrice && p.price > parseInt(maxPrice)) return false;
    if (minBedrooms && (p.bedrooms || 0) < parseInt(minBedrooms)) return false;
    
    if (locationSearch) {
      const searchLower = locationSearch.toLowerCase();
      const matchLocation = p.location && p.location.toLowerCase().includes(searchLower);
      const matchCity = p.city && p.city.toLowerCase().includes(searchLower);
      const matchProvince = p.province && p.province.toLowerCase().includes(searchLower);
      const matchArea = p.area && p.area.toLowerCase().includes(searchLower);
      const matchAddress = p.address && p.address.toLowerCase().includes(searchLower);
      
      if (!matchLocation && !matchCity && !matchProvince && !matchArea && !matchAddress) {
        return false;
      }
    }
    return true;
  });

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <Helmet>
        <title>PropMart - Temukan Properti Impian Anda</title>
      </Helmet>

      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6">
            Temukan Properti Impian Anda
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Platform terpercaya untuk mencari rumah, apartemen, dan properti komersial dengan mudah dan cepat.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Search & Filter Box */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Cari Properti</h3>
            <button
              onClick={() => {
                setMinPrice('');
                setMaxPrice('');
                setMinBedrooms('');
                setLocationSearch('');
              }}
              className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors flex items-center bg-red-50 px-3 py-1.5 rounded-full"
            >
              Reset Filter
            </button>
          </div>
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
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-200 rounded-xl py-3 transition-colors"
                  placeholder="Cari kota/daerah..."
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Harga Minimum</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 sm:text-sm font-medium">Rp</span>
                </div>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-200 rounded-xl py-3 transition-colors"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Harga Maksimum</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 sm:text-sm font-medium">Rp</span>
                </div>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-200 rounded-xl py-3 transition-colors"
                  placeholder="Tak terhingga"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kamar Tidur (Min)</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Bed size={16} className="text-slate-400" />
                </div>
                <select
                  value={minBedrooms}
                  onChange={(e) => setMinBedrooms(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-200 rounded-xl py-3 transition-colors"
                >
                  <option value="">Semua</option>
                  <option value="1">1+ Kamar</option>
                  <option value="2">2+ Kamar</option>
                  <option value="3">3+ Kamar</option>
                  <option value="4">4+ Kamar</option>
                  <option value="5">5+ Kamar</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Property List */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-slate-900">
            {filteredProperties.length > 0 ? `Menampilkan ${filteredProperties.length} Properti` : 'Properti Tidak Ditemukan'}
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <div key={property.id} className="group bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl flex flex-col md:flex-row border border-slate-100">
                <div className="relative w-full md:w-72 lg:w-80 shrink-0 aspect-[4/3] md:aspect-auto bg-slate-200 overflow-hidden">
                  {property.images && property.images.length > 0 ? (
                    <img src={property.images[0]} alt={property.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                      <Building size={48} />
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-3 gap-2">
                      <h3 className="font-serif text-xl font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">{property.title}</h3>
                      <span className="text-xl font-bold text-emerald-600 whitespace-nowrap">{formatCurrency(property.price)}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mb-4">
                      {property.location && (
                        <div className="flex items-center text-slate-500 text-sm bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                          <MapPin size={14} className="mr-1.5 text-slate-400" />
                          <span className="truncate max-w-[150px]">{property.location}</span>
                        </div>
                      )}
                      {property.bedrooms && (
                        <div className="flex items-center text-slate-500 text-sm bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                          <Bed size={14} className="mr-1.5 text-slate-400" />
                          <span>{property.bedrooms} KT</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed">{property.description}</p>
                  </div>
                  
                  <div className="flex justify-end mt-auto">
                    <Link 
                      to={`/properties/${property.id}`}
                      className="w-full md:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-serif font-bold text-slate-900">Tidak ada properti yang cocok</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">Coba ubah filter pencarian Anda untuk melihat lebih banyak hasil.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
