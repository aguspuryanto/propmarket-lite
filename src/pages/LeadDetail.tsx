import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Calendar, MessageSquare, CheckCircle, XCircle, Clock, Share2 } from 'lucide-react';

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [lead, setLead] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Interaction form
  const [interactionType, setInteractionType] = useState('Panggilan Telepon');
  const [interactionNote, setInteractionNote] = useState('');
  const [nextFollowUp, setNextFollowUp] = useState('');
  
  // Status update
  const [newStatus, setNewStatus] = useState('');
  const [dealPrice, setDealPrice] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchLeadAndProperty = async () => {
      if (!id || !user) return;
      try {
        const { data: leadData, error: leadError } = await supabase
          .from('leads')
          .select('*')
          .eq('id', id)
          .single();
          
        if (leadError) throw leadError;
        
        if (leadData) {
          // Security check: only owner or admin can view
          if (leadData.agentId !== user.id && profile?.role !== 'admin') {
            navigate('/leads');
            return;
          }
          setLead(leadData);
          setNewStatus(leadData.status);
          
          if (leadData.nextFollowUp) {
            // Format for datetime-local input
            const date = new Date(leadData.nextFollowUp);
            const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            setNextFollowUp(localDateTime);
          }

          // Fetch property
          const { data: propData, error: propError } = await supabase
            .from('properties')
            .select('*')
            .eq('id', leadData.propertyId)
            .single();
            
          if (!propError && propData) {
            setProperty(propData);
          }
        } else {
          navigate('/leads');
        }
      } catch (error) {
        console.error("Error fetching lead:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadAndProperty();
  }, [id, user, profile, navigate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !interactionNote) return;
    
    setUpdating(true);
    try {
      const newInteraction = {
        date: new Date().toISOString(),
        type: interactionType,
        note: interactionNote
      };
      
      const currentInteractions = lead.interactions || [];
      const updatedInteractions = [newInteraction, ...currentInteractions];
      
      const updateData: any = { interactions: updatedInteractions };
      
      if (nextFollowUp) {
        updateData.nextFollowUp = new Date(nextFollowUp).toISOString();
      }
      
      const { error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', lead.id);
        
      if (error) throw error;
      
      setLead({ ...lead, interactions: updatedInteractions, nextFollowUp: updateData.nextFollowUp || lead.nextFollowUp });
      setInteractionNote('');
      alert("Interaksi berhasil ditambahkan.");
    } catch (error) {
      console.error("Error adding interaction:", error);
      alert("Gagal menambahkan interaksi.");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!lead || newStatus === lead.status) return;
    
    if (newStatus === 'closed' && !dealPrice) {
      alert("Masukkan Harga Deal untuk status Closing.");
      return;
    }
    
    setUpdating(true);
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'closed' && property) {
        const price = parseFloat(dealPrice);
        // Calculate commission based on agent's tier (max property commission rate)
        const agentTier = profile?.commissionTier || 1.5;
        const maxCommRate = property.commissionRate || 3;
        const finalCommRate = Math.min(agentTier, maxCommRate);
        
        const commissionEarned = price * (finalCommRate / 100);
        
        updateData.dealPrice = price;
        updateData.commissionEarned = commissionEarned;
        
        // Update user stats
        const currentSold = profile?.propertiesSold || 0;
        const currentVolume = profile?.totalSalesVolume || 0;
        const newSold = currentSold + 1;
        const newVolume = currentVolume + price;
        
        // Determine new tier based on sales count, total volume, or single high-value sale
        // Tier 1 (1.5%): Default
        // Tier 2 (2.0%): >= 2 sales OR >= 5 Miliar total volume
        // Tier 3 (2.5%): >= 5 sales OR >= 20 Miliar total volume
        // Tier 4 (3.0%): >= 10 sales OR >= 50 Miliar total volume OR single sale >= 10 Miliar
        let newTier = 1.5;
        if (newSold >= 10 || newVolume >= 50000000000 || price >= 10000000000) newTier = 3.0;
        else if (newSold >= 5 || newVolume >= 20000000000) newTier = 2.5;
        else if (newSold >= 2 || newVolume >= 5000000000) newTier = 2.0;
        
        const { error: userError } = await supabase
          .from('users')
          .update({
            propertiesSold: newSold,
            totalSalesVolume: newVolume,
            commissionTier: newTier
          })
          .eq('uid', user!.id);
          
        if (userError) throw userError;
      }
      
      const { error: leadError } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', lead.id);
        
      if (leadError) throw leadError;
      
      setLead({ ...lead, ...updateData });
      alert("Status prospek berhasil diperbarui.");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Gagal memperbarui status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleShareToLead = () => {
    if (!property || !lead) return;
    const url = encodeURIComponent(`${window.location.origin}/properties/${property.id}`);
    const text = encodeURIComponent(`Halo ${lead.buyerName}, berikut adalah informasi detail mengenai properti ${property.title} yang Anda minati: ${url}`);
    
    // Clean phone number (remove leading 0, add country code if needed)
    let phone = lead.buyerPhone.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.substring(1);
    
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'interested': return 'bg-orange-100 text-orange-800';
      case 'closed': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'new': return 'Baru';
      case 'contacted': return 'Dihubungi';
      case 'interested': return 'Tertarik';
      case 'closed': return 'Closing (Won)';
      case 'lost': return 'Gagal (Lost)';
      default: return status;
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;
  if (!lead) return <div className="text-center py-12">Lead tidak ditemukan.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Helmet>
        <title>Detail Lead - PropMart</title>
      </Helmet>

      <button onClick={() => navigate('/dashboard/leads')} className="flex items-center text-slate-500 hover:text-slate-900 transition-colors mb-4">
        <ArrowLeft size={20} className="mr-2" /> <span className="font-medium">Kembali ke Daftar Leads</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Lead Info & Property */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-slate-900 font-serif">Info Prospek</h2>
              <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full border ${getStatusColor(lead.status).replace('bg-', 'bg-').replace('text-', 'text-').concat(' border-opacity-20')}`}>
                {getStatusText(lead.status)}
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Nama Lengkap</p>
                <p className="font-semibold text-slate-900 text-lg">{lead.buyerName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">No. HP / WhatsApp</p>
                <p className="font-medium text-slate-900">{lead.buyerPhone}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Tanggal Masuk</p>
                <p className="font-medium text-slate-900">{lead.createdAt?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            <button 
              onClick={handleShareToLead}
              className="mt-8 w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Share2 size={18} className="mr-2" /> Kirim Info via WA
            </button>
          </div>

          {property && (
            <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-900 font-serif mb-4">Properti Diminati</h2>
              {property.images && property.images.length > 0 && (
                <div className="aspect-w-16 aspect-h-9 mb-4 rounded-xl overflow-hidden">
                  <img src={property.images[0]} alt={property.title} className="w-full h-40 object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
              <h3 className="font-semibold text-slate-900 line-clamp-2 text-lg leading-tight">{property.title}</h3>
              <p className="text-slate-600 font-bold mt-2 text-xl">{formatCurrency(property.price)}</p>
            </div>
          )}

          {/* Status Update Form */}
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-900 font-serif mb-5">Update Status</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status Prospek</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  disabled={lead.status === 'closed' || lead.status === 'lost'}
                  className="block w-full border-slate-300 rounded-xl shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm py-2.5 px-3 bg-slate-50"
                >
                  <option value="new">Baru</option>
                  <option value="contacted">Dihubungi</option>
                  <option value="interested">Tertarik</option>
                  <option value="closed">Closing (Won)</option>
                  <option value="lost">Gagal (Lost)</option>
                </select>
              </div>

              {newStatus === 'closed' && lead.status !== 'closed' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Harga Deal (Rp)</label>
                  <input
                    type="number"
                    value={dealPrice}
                    onChange={(e) => setDealPrice(e.target.value)}
                    placeholder="Contoh: 500000000"
                    className="block w-full border-slate-300 rounded-lg shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm py-2 px-3"
                  />
                  <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <p className="text-xs text-emerald-800 font-medium">
                      Estimasi Komisi (Tier {profile?.commissionTier || 1.5}%):
                    </p>
                    <p className="text-sm font-bold text-emerald-900 mt-1">
                      {dealPrice ? formatCurrency(parseFloat(dealPrice) * ((profile?.commissionTier || 1.5) / 100)) : 'Rp 0'}
                    </p>
                  </div>
                </div>
              )}

              {lead.status !== 'closed' && lead.status !== 'lost' && newStatus !== lead.status && (
                <button
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {updating ? 'Menyimpan...' : 'Simpan Status'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interactions & Follow-ups */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 font-serif mb-6">Riwayat Interaksi & Follow-up</h2>
            
            {/* Add Interaction Form */}
            {lead.status !== 'closed' && lead.status !== 'lost' && (
              <form onSubmit={handleAddInteraction} className="mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-slate-500" />
                  Catat Interaksi Baru
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Interaksi</label>
                    <select
                      value={interactionType}
                      onChange={(e) => setInteractionType(e.target.value)}
                      className="block w-full border-slate-300 rounded-xl shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm py-2.5 px-3 bg-white"
                    >
                      <option value="Panggilan Telepon">Panggilan Telepon</option>
                      <option value="Pesan WhatsApp">Pesan WhatsApp</option>
                      <option value="Email">Email</option>
                      <option value="Pertemuan Langsung">Pertemuan Langsung</option>
                      <option value="Kunjungan Lokasi">Kunjungan Lokasi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Jadwal Follow-up Berikutnya</label>
                    <input
                      type="datetime-local"
                      value={nextFollowUp}
                      onChange={(e) => setNextFollowUp(e.target.value)}
                      className="block w-full border-slate-300 rounded-xl shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm py-2.5 px-3 bg-white"
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Catatan</label>
                  <textarea
                    rows={3}
                    required
                    value={interactionNote}
                    onChange={(e) => setInteractionNote(e.target.value)}
                    placeholder="Tuliskan hasil pembicaraan atau poin penting..."
                    className="block w-full border-slate-300 rounded-xl shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm py-3 px-4 bg-white resize-none"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updating}
                    className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-semibold rounded-xl text-white bg-slate-900 hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {updating ? 'Menyimpan...' : 'Simpan Catatan'}
                  </button>
                </div>
              </form>
            )}

            {/* Next Follow Up Display */}
            {lead.nextFollowUp && lead.status !== 'closed' && lead.status !== 'lost' && (
              <div className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start">
                <div className="flex-shrink-0 bg-blue-100 p-2 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-semibold text-blue-900 uppercase tracking-wider mb-1">Jadwal Follow-up</h4>
                  <p className="text-lg font-medium text-blue-800">
                    {lead.nextFollowUp.toDate().toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )}

            {/* Interaction Timeline */}
            <div className="flow-root">
              <ul className="-mb-8">
                {lead.interactions && lead.interactions.length > 0 ? (
                  lead.interactions.map((interaction: any, idx: number) => (
                    <li key={idx}>
                      <div className="relative pb-8">
                        {idx !== lead.interactions.length - 1 ? (
                          <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true"></span>
                        ) : null}
                        <div className="relative flex items-start space-x-4">
                          <div className="relative">
                            <span className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center ring-8 ring-white z-10">
                              <MessageSquare className="h-5 w-5 text-slate-500" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-sm font-semibold text-slate-900">
                                {interaction.type}
                              </p>
                              <div className="text-right text-xs font-medium text-slate-500">
                                <time dateTime={interaction.date.toDate().toISOString()}>
                                  {interaction.date.toDate().toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </time>
                              </div>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed">{interaction.note}</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                    <MessageSquare className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                    <p className="text-sm font-medium text-slate-500">Belum ada riwayat interaksi.</p>
                  </div>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
