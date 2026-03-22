import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Share2, Facebook, MessageCircle, ArrowLeft, DollarSign, Download, Video, MapPin, Bed, Bath } from 'lucide-react';

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLeadForm, setShowLeadForm] = useState(false);
  
  // Lead form state
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'properties', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProperty({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const getMapQuery = () => {
    if (!property) return '';
    const parts = [];
    if (property.address) parts.push(property.address);
    if (property.area) parts.push(property.area);
    if (property.city) parts.push(property.city);
    if (property.province) parts.push(property.province);
    if (property.location) parts.push(property.location);
    
    // If no specific location data is found, fallback to a general search or the title
    if (parts.length === 0) {
      return encodeURIComponent(property.title || 'Indonesia');
    }
    
    return encodeURIComponent(parts.join(', '));
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Handle YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    
    // Handle Vimeo
    const vimeoMatch = url.match(/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/i);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    // Return original if no match (might be a matterport or other 360 tour link)
    return url;
  };

  const handleShare = (platform: string) => {
    if (!property) return;
    
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Lihat properti menarik ini: ${property.title} - ${formatCurrency(property.price)}`);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      default:
        // Native share if supported
        if (navigator.share) {
          navigator.share({
            title: property.title,
            text: `Lihat properti menarik ini: ${property.title}`,
            url: window.location.href,
          }).catch(console.error);
          return;
        }
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    
    setSubmittingLead(true);
    try {
      await addDoc(collection(db, 'leads'), {
        agentId: property.agentId || 'dummy-agent-123',
        propertyId: property.id,
        buyerName,
        buyerPhone,
        status: 'new',
        createdAt: new Date()
      });
      
      setLeadSuccess(true);
      setBuyerName('');
      setBuyerPhone('');
      setTimeout(() => {
        setShowLeadForm(false);
        setLeadSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error adding lead:", error);
      alert("Gagal mengirim lead.");
    } finally {
      setSubmittingLead(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;
  if (!property) return <div className="text-center py-12">Properti tidak ditemukan.</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-8">
      <Helmet>
        <title>{property.title} - PropMart</title>
        <meta name="description" content={property.description} />
        {/* Open Graph tags for better sharing */}
        <meta property="og:title" content={property.title} />
        <meta property="og:description" content={property.description} />
        {property.images && property.images[0] && <meta property="og:image" content={property.images[0]} />}
      </Helmet>

      <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 w-fit">
        <ArrowLeft size={18} className="mr-2" /> Kembali ke Daftar
      </button>

      <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden border border-slate-100">
        {/* Image Gallery */}
        <div className="h-72 sm:h-[500px] bg-slate-200 w-full relative">
          {property.images && property.images.length > 0 ? (
            <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              Tidak ada gambar utama
            </div>
          )}
          <div className="absolute top-5 right-5 bg-slate-900/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg tracking-wide">
            Komisi {property.commissionRate}%
          </div>
        </div>
        
        {property.images && property.images.length > 1 && (
          <div className="p-5 bg-slate-50/80 border-b border-slate-100 overflow-x-auto">
            <div className="flex space-x-4">
              {property.images.slice(1).map((img: string, idx: number) => (
                <img key={idx} src={img} alt={`${property.title} - ${idx + 2}`} className="h-28 w-40 object-cover rounded-xl shadow-sm flex-shrink-0 border border-slate-200 hover:opacity-90 transition-opacity cursor-pointer" referrerPolicy="no-referrer" />
              ))}
            </div>
          </div>
        )}

        <div className="p-8 sm:p-10">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">{property.title}</h1>
          <div className="flex items-center text-2xl font-bold text-indigo-600 mb-8">
            <DollarSign size={28} className="mr-1" />
            {formatCurrency(property.price)}
          </div>

          <div className="flex flex-wrap gap-4 mb-8">
            {property.location && (
              <div className="flex items-center text-slate-700 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 font-medium">
                <MapPin size={20} className="mr-2.5 text-indigo-500" />
                <span>{property.location}</span>
              </div>
            )}
            {property.bedrooms && (
              <div className="flex items-center text-slate-700 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 font-medium">
                <Bed size={20} className="mr-2.5 text-indigo-500" />
                <span>{property.bedrooms} Kamar Tidur</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center text-slate-700 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 font-medium">
                <Bath size={20} className="mr-2.5 text-indigo-500" />
                <span>{property.bathrooms} Kamar Mandi</span>
              </div>
            )}
          </div>
          
          <div className="prose prose-slate prose-lg max-w-none text-slate-600 mb-10 leading-relaxed">
            <p className="whitespace-pre-line">{property.description}</p>
          </div>

          {/* Map Section */}
          <div className="border-t border-slate-100 pt-8 mb-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-2xl font-bold text-slate-900">Lokasi Properti</h3>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${getMapQuery()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-slate-200 shadow-sm text-sm font-medium rounded-full text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
              >
                <MapPin size={16} className="mr-2" />
                Buka di Google Maps
              </a>
            </div>
            <div className="w-full h-[400px] bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${getMapQuery()}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              ></iframe>
            </div>
          </div>

          {/* Virtual Tour & Floor Plan */}
          {(property.virtualTourUrl || property.floorPlanUrl) && (
            <div className="border-t border-slate-100 pt-8 mb-10">
              <h3 className="font-serif text-2xl font-bold text-slate-900 mb-6">Media Interaktif</h3>
              
              {property.virtualTourUrl && (
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center uppercase tracking-wider">
                    <Video size={18} className="mr-2 text-indigo-500" /> Tur Virtual / Video
                  </h4>
                  <div className="aspect-w-16 aspect-h-9 bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200">
                    <iframe 
                      src={getEmbedUrl(property.virtualTourUrl)} 
                      className="w-full h-96 border-0" 
                      allowFullScreen 
                      title="Virtual Tour / Video"
                    ></iframe>
                  </div>
                </div>
              )}

              {property.floorPlanUrl && (
                <div>
                  <a 
                    href={property.floorPlanUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-5 py-3 border border-slate-200 shadow-sm text-sm font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    <Download size={18} className="mr-2 text-indigo-500" /> Unduh Denah Lantai (Floor Plan)
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-slate-100 pt-8">
            <h3 className="font-serif text-2xl font-bold text-slate-900 mb-6">Bagikan Properti Ini</h3>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => handleShare('whatsapp')}
                className="flex items-center px-5 py-2.5 bg-[#25D366] text-white font-medium rounded-xl hover:bg-[#1ebe57] transition-all hover:-translate-y-0.5 shadow-sm"
              >
                <MessageCircle size={20} className="mr-2" /> WhatsApp
              </button>
              <button 
                onClick={() => handleShare('facebook')}
                className="flex items-center px-5 py-2.5 bg-[#1877F2] text-white font-medium rounded-xl hover:bg-[#166fe5] transition-all hover:-translate-y-0.5 shadow-sm"
              >
                <Facebook size={20} className="mr-2" /> Facebook
              </button>
              <button 
                onClick={() => handleShare('native')}
                className="flex items-center px-5 py-2.5 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-900 transition-all hover:-translate-y-0.5 shadow-sm"
              >
                <Share2 size={20} className="mr-2" /> Share Lainnya
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 mt-8">
            {!showLeadForm ? (
              <button 
                onClick={() => setShowLeadForm(true)}
                className="w-full sm:w-auto flex justify-center items-center px-8 py-4 border border-transparent text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
              >
                Input Lead Buyer
              </button>
            ) : (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-serif text-xl font-bold text-slate-900 mb-5">Data Calon Pembeli</h3>
                {leadSuccess ? (
                  <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                    Lead berhasil disimpan! Tim kami akan segera menindaklanjuti.
                  </div>
                ) : (
                  <form onSubmit={handleSubmitLead} className="space-y-5">
                    <div>
                      <label htmlFor="buyerName" className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Lengkap</label>
                      <input
                        type="text"
                        id="buyerName"
                        required
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        className="block w-full border border-slate-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                      />
                    </div>
                    <div>
                      <label htmlFor="buyerPhone" className="block text-sm font-semibold text-slate-700 mb-1.5">Nomor HP / WhatsApp</label>
                      <input
                        type="tel"
                        id="buyerPhone"
                        required
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        className="block w-full border border-slate-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                      />
                    </div>
                    <div className="flex gap-4 pt-2">
                      <button
                        type="submit"
                        disabled={submittingLead}
                        className="flex-1 justify-center py-3 px-4 border border-transparent shadow-md shadow-indigo-200 text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
                      >
                        {submittingLead ? 'Menyimpan...' : 'Simpan Lead'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowLeadForm(false)}
                        className="flex-1 justify-center py-3 px-4 border border-slate-300 shadow-sm text-sm font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
