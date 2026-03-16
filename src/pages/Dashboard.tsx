import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Building, Users, DollarSign, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    totalLeads: 0,
    wonLeads: 0,
    potentialCommission: 0,
    earnedCommission: 0
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        const leadsRef = collection(db, 'leads');
        const q = query(leadsRef, where('agentId', '==', user.uid), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        let total = 0;
        let won = 0;
        let potential = 0;
        let earned = 0;
        const leads: any[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          total++;
          
          if (data.status === 'closed') {
            won++;
            earned += (data.commissionEarned || 0);
          } else if (data.status !== 'lost') {
            // Rough estimate of potential commission if dealPrice is set, else 0
            potential += (data.dealPrice ? data.dealPrice * 0.03 : 0); 
          }

          if (leads.length < 5) {
            leads.push({ id: doc.id, ...data });
          }
        });

        setStats({
          totalLeads: total,
          wonLeads: won,
          potentialCommission: potential,
          earnedCommission: earned
        });
        setRecentLeads(leads);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Dashboard - PropMart</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-slate-900 font-serif tracking-tight">Dashboard</h1>
        {profile && (
          <div className="bg-white border border-slate-200 text-slate-800 px-5 py-2.5 rounded-xl shadow-sm flex items-center">
            <span className="font-medium mr-3 text-sm text-slate-500 uppercase tracking-wider">Tier Komisi Anda:</span>
            <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
              {profile.commissionTier || 1.5}%
            </span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm border border-slate-200 rounded-2xl transition-all duration-300 hover:shadow-md">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-slate-50 p-3 rounded-xl">
                <Users className="h-6 w-6 text-slate-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Total Leads</dt>
                  <dd className="text-2xl font-bold text-slate-900 mt-1">{stats.totalLeads}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm border border-slate-200 rounded-2xl transition-all duration-300 hover:shadow-md">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-emerald-50 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Leads Closing (Won)</dt>
                  <dd className="text-2xl font-bold text-slate-900 mt-1">{stats.wonLeads}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm border border-slate-200 rounded-2xl transition-all duration-300 hover:shadow-md">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-50 p-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Potensi Komisi</dt>
                  <dd className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(stats.potentialCommission)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm border border-slate-200 rounded-2xl transition-all duration-300 hover:shadow-md">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-emerald-50 p-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Komisi Didapat</dt>
                  <dd className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(stats.earnedCommission)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-semibold text-slate-900 font-serif">Leads Terbaru</h3>
          <Link to="/leads" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Lihat semua &rarr;</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Buyer</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {recentLeads.length > 0 ? (
                recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{lead.buyerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full 
                        ${lead.status === 'closed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
                          lead.status === 'lost' ? 'bg-red-100 text-red-800 border border-red-200' : 
                          'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                        {lead.status === 'closed' ? 'CLOSING' : lead.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {lead.createdAt?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500 bg-slate-50/50">Belum ada leads.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
