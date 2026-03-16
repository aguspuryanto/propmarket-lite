import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Users, Search, Filter } from 'lucide-react';

export default function Leads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchLeads = async () => {
      if (!user) return;
      try {
        const leadsRef = collection(db, 'leads');
        const q = query(leadsRef, where('agentId', '==', user.uid), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const fetchedLeads: any[] = [];
        
        // Fetch property details for each lead
        for (const document of querySnapshot.docs) {
          const leadData = document.data();
          let propertyTitle = 'Properti Tidak Diketahui';
          
          try {
            const propRef = doc(db, 'properties', leadData.propertyId);
            const propSnap = await getDoc(propRef);
            if (propSnap.exists()) {
              propertyTitle = propSnap.data().title;
            }
          } catch (e) {
            console.error("Error fetching property for lead", e);
          }
          
          fetchedLeads.push({
            id: document.id,
            ...leadData,
            propertyTitle
          });
        }
        
        setLeads(fetchedLeads);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [user]);

  const filteredLeads = filter === 'all' ? leads : leads.filter(l => l.status === filter);

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

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Leads - PropMart</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-slate-900 font-serif tracking-tight">Daftar Leads Buyer</h1>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <Filter size={20} className="text-slate-400 ml-2" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full pl-2 pr-8 py-1.5 text-sm font-medium text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="new">Baru</option>
            <option value="contacted">Dihubungi</option>
            <option value="interested">Tertarik</option>
            <option value="closed">Closing (Won)</option>
            <option value="lost">Gagal (Lost)</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 overflow-hidden rounded-2xl">
        {filteredLeads.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {filteredLeads.map((lead) => (
              <li key={lead.id} className="group">
                <Link to={`/leads/${lead.id}`} className="block hover:bg-slate-50 transition-colors duration-200">
                  <div className="px-6 py-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                            <Users className="h-6 w-6 text-slate-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-base font-semibold text-slate-900 truncate">{lead.buyerName}</p>
                          <p className="text-sm text-slate-500 truncate mt-0.5">{lead.buyerPhone}</p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full border ${getStatusColor(lead.status).replace('bg-', 'bg-').replace('text-', 'text-').concat(' border-opacity-20')}`}>
                          {getStatusText(lead.status)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 sm:flex sm:justify-between sm:items-center">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-slate-600 font-medium">
                          Minat: <span className="ml-1 text-slate-900">{lead.propertyTitle}</span>
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-slate-500 sm:mt-0 space-x-4">
                        {lead.nextFollowUp && (
                          <p className="text-blue-600 font-medium flex items-center bg-blue-50 px-2 py-1 rounded-md">
                            Follow-up: {lead.nextFollowUp.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </p>
                        )}
                        <p className="text-xs">
                          Dibuat <time dateTime={lead.createdAt?.toDate().toISOString()}>{lead.createdAt?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 font-serif">Belum ada leads</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">Mulai bagikan properti Anda untuk mendapatkan leads potensial dari calon pembeli.</p>
          </div>
        )}
      </div>
    </div>
  );
}
