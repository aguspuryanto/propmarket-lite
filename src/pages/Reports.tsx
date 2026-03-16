import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { BarChart2, DollarSign, Download } from 'lucide-react';

export default function Reports() {
  const { user } = useAuth();
  const [wonLeads, setWonLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCommission, setTotalCommission] = useState(0);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;
      try {
        const leadsRef = collection(db, 'leads');
        const q = query(leadsRef, where('agentId', '==', user.uid), where('status', '==', 'closed'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const fetchedLeads: any[] = [];
        let commissionSum = 0;
        let salesSum = 0;
        
        for (const document of querySnapshot.docs) {
          const leadData = document.data();
          let propertyTitle = 'Properti Tidak Diketahui';
          let commissionRate = 0;
          
          try {
            const propRef = doc(db, 'properties', leadData.propertyId);
            const propSnap = await getDoc(propRef);
            if (propSnap.exists()) {
              propertyTitle = propSnap.data().title;
              commissionRate = propSnap.data().commissionRate || 0;
            }
          } catch (e) {
            console.error("Error fetching property for lead", e);
          }
          
          commissionSum += (leadData.commissionEarned || 0);
          salesSum += (leadData.dealPrice || 0);
          
          fetchedLeads.push({
            id: document.id,
            ...leadData,
            propertyTitle,
            commissionRate
          });
        }
        
        setWonLeads(fetchedLeads);
        setTotalCommission(commissionSum);
        setTotalSales(salesSum);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const handleExportCSV = () => {
    if (wonLeads.length === 0) return;
    
    const headers = ['Tanggal', 'Nama Pembeli', 'Properti', 'Harga Deal', 'Komisi (%)', 'Komisi Didapat'];
    const csvRows = [headers.join(',')];
    
    wonLeads.forEach(lead => {
      const row = [
        lead.createdAt?.toDate().toLocaleDateString('id-ID'),
        `"${lead.buyerName}"`,
        `"${lead.propertyTitle}"`,
        lead.dealPrice || 0,
        lead.commissionRate || 0,
        lead.commissionEarned || 0
      ];
      csvRows.push(row.join(','));
    });
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `Laporan_Penjualan_PropMart_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Laporan Penjualan - PropMart</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-slate-900 font-serif tracking-tight">Laporan Penjualan</h1>
        <button
          onClick={handleExportCSV}
          disabled={wonLeads.length === 0}
          className="flex items-center px-5 py-2.5 border border-transparent shadow-sm text-sm font-semibold rounded-xl text-white bg-slate-900 hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <Download size={18} className="mr-2" /> Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
        <div className="bg-white overflow-hidden shadow-sm border border-slate-200 rounded-2xl transition-all duration-300 hover:shadow-md">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-50 p-4 rounded-xl">
                <BarChart2 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-6 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Nilai Penjualan</dt>
                  <dd className="text-3xl font-bold text-slate-900">{formatCurrency(totalSales)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm border border-slate-200 rounded-2xl transition-all duration-300 hover:shadow-md">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-emerald-50 p-4 rounded-xl">
                <DollarSign className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="ml-6 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Komisi Didapat</dt>
                  <dd className="text-3xl font-bold text-slate-900">{formatCurrency(totalCommission)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white shadow-sm border border-slate-200 overflow-hidden rounded-2xl">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-semibold text-slate-900 font-serif">Riwayat Transaksi Berhasil</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Properti</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pembeli</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Harga Deal</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Komisi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {wonLeads.length > 0 ? (
                wonLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {lead.createdAt?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                      {lead.propertyTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {lead.buyerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {formatCurrency(lead.dealPrice || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">
                      {formatCurrency(lead.commissionEarned || 0)} <span className="text-xs text-slate-400 font-normal ml-1">({lead.commissionRate}%)</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500 bg-slate-50/50">
                    Belum ada transaksi berhasil.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
