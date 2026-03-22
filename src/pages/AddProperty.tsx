import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Upload, Plus, Info, AlertCircle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export default function AddProperty() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    transactionType: 'Dijual',
    price: '',
    listingGroup: '',
    propertyType: '',
    commission: '',
    canKPR: 'Tidak',
    hasIMB: 'Tidak',
    hasBlueprint: 'Tidak',
    listingType: 'OPEN',
    
    canInstallBanner: 'Tidak',
    legalDocument: '',
    cooperateWithOtherAgents: 'Tidak',
    
    country: '',
    province: '',
    city: '',
    area: '',
    address: '',
    blockAndNumber: '',
    facingDirection: '',
    
    landArea: '',
    buildingArea: '',
    bedrooms: '',
    bathrooms: '',
    propertyWidth: '',
    propertyLength: '',
    electricity: '',
    waterType: '',
    floors: 1,
    
    videoLink: '',
    phoneCount: '',
    furnishType: '',
    garageCapacity: '',
    vendorName: '',
    vendorPhone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFloorChange = (increment: number) => {
    setFormData(prev => ({
      ...prev,
      floors: Math.max(1, prev.floors + increment)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const propertyData = {
        ...formData,
        price: Number(formData.price) || 0,
        commissionRate: Number(formData.commission) || 0,
        landArea: Number(formData.landArea) || 0,
        buildingArea: Number(formData.buildingArea) || 0,
        bedrooms: Number(formData.bedrooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        status: 'available',
        createdAt: new Date(),
        agentId: user?.uid || 'dummy-agent-123'
      };

      await addDoc(collection(db, 'properties'), propertyData);
      navigate('/dashboard/properties');
    } catch (err: any) {
      console.error("Error adding property:", err);
      setError(err.message || 'Terjadi kesalahan saat menyimpan properti.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <Helmet>
        <title>Tambah Listing - PropMart</title>
      </Helmet>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 font-serif">Form Tambah Listing</h1>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informasi Dasar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-900">Informasi Dasar</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Foto Listing <span className="text-red-500">*</span>
              </label>
              <button type="button" className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors">
                <Upload className="h-4 w-4 mr-2" />
                Pilih Foto
              </button>
              <p className="mt-1 text-xs text-slate-500">Max size 5MB</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Judul Listing <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-xl border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm"
                placeholder="Masukkan judul listing"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-xl border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm"
                placeholder="Masukkan deskripsi listing"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-500">
                <span>Minimal 120 karakter</span>
                <span>{formData.description.length} karakter</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipe Transaksi <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-3">
                {['Dijual', 'Disewa', 'Dijual/Sewa'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleRadioChange('transactionType', type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      formData.transactionType === type
                        ? 'bg-yellow-400 text-slate-900'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Harga Jual <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-500 sm:text-sm">Rp</span>
                </div>
                <input
                  type="number"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-slate-300 pl-10 focus:border-slate-900 focus:ring-slate-900 sm:text-sm"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Grup Listing <span className="text-red-500">*</span>
                </label>
                <select
                  name="listingGroup"
                  value={formData.listingGroup}
                  onChange={handleChange}
                  className="w-full rounded-xl border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm"
                >
                  <option value="">Pilih grup listing</option>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipe Properti <span className="text-red-500">*</span>
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="w-full rounded-xl border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm"
                >
                  <option value="">Pilih tipe properti</option>
                  <option value="rumah">Rumah</option>
                  <option value="apartemen">Apartemen</option>
                  <option value="tanah">Tanah</option>
                  <option value="ruko">Ruko</option>
                  <option value="gudang">Gudang</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Komisi <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    name="commission"
                    value={formData.commission}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-slate-300 focus:border-slate-900 focus:ring-slate-900 sm:text-sm pr-8"
                    placeholder="Masukkan persentase komisi"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-slate-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bisa KPR? <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  {['Ya', 'Tidak'].map((option) => (
                    <label key={`kpr-${option}`} className="flex items-center">
                      <input
                        type="radio"
                        name="canKPR"
                        value={option}
                        checked={formData.canKPR === option}
                        onChange={() => handleRadioChange('canKPR', option)}
                        className="h-4 w-4 border-slate-300 text-yellow-400 focus:ring-yellow-400"
                      />
                      <span className="ml-2 text-sm text-slate-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  IMB <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  {['Ya', 'Tidak'].map((option) => (
                    <label key={`imb-${option}`} className="flex items-center">
                      <input
                        type="radio"
                        name="hasIMB"
                        value={option}
                        checked={formData.hasIMB === option}
                        onChange={() => handleRadioChange('hasIMB', option)}
                        className="h-4 w-4 border-slate-300 text-yellow-400 focus:ring-yellow-400"
                      />
                      <span className="ml-2 text-sm text-slate-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ada Blueprint? <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  {['Ya', 'Tidak'].map((option) => (
                    <label key={`blueprint-${option}`} className="flex items-center">
                      <input
                        type="radio"
                        name="hasBlueprint"
                        value={option}
                        checked={formData.hasBlueprint === option}
                        onChange={() => handleRadioChange('hasBlueprint', option)}
                        className="h-4 w-4 border-slate-300 text-yellow-400 focus:ring-yellow-400"
                      />
                      <span className="ml-2 text-sm text-slate-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Jenis Listing <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-3">
                {['OPEN', 'PAP', 'SIM'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleRadioChange('listingType', type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      formData.listingType === type
                        ? 'bg-yellow-400 text-slate-900'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Promosi & Kerjasama */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-900">Promosi & Kerjasama</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bisa Dipasang Banner? <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                {['Ya', 'Tidak'].map((option) => (
                  <label key={`banner-${option}`} className="flex items-center">
                    <input
                      type="radio"
                      name="canInstallBanner"
                      value={option}
                      checked={formData.canInstallBanner === option}
                      onChange={() => handleRadioChange('canInstallBanner', option)}
                      className="h-4 w-4 border-slate-300 text-yellow-400 focus:ring-yellow-400"
                    />
                    <span className="ml-2 text-sm text-slate-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Dokumen Legal <span className="text-red-500">*</span>
              </label>
              <select
                name="legalDocument"
                value={formData.legalDocument}
                onChange={handleChange}
                className="w-full md:w-1/2 rounded-xl border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm"
              >
                <option value="">Pilih dokumen legal</option>
                <option value="shm">SHM - Sertifikat Hak Milik</option>
                <option value="hgb">HGB - Hak Guna Bangunan</option>
                <option value="strata">Strata Title</option>
                <option value="ajb">AJB - Akta Jual Beli</option>
                <option value="ppjb">PPJB</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Kerjasama dengan Agen Lain
              </label>
              <div className="flex space-x-4">
                {['Ya', 'Tidak'].map((option) => (
                  <label key={`coop-${option}`} className="flex items-center">
                    <input
                      type="radio"
                      name="cooperateWithOtherAgents"
                      value={option}
                      checked={formData.cooperateWithOtherAgents === option}
                      onChange={() => handleRadioChange('cooperateWithOtherAgents', option)}
                      className="h-4 w-4 border-slate-300 text-yellow-400 focus:ring-yellow-400"
                    />
                    <span className="ml-2 text-sm text-slate-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lokasi Listing */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-900">Lokasi Listing</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Negara <span className="text-red-500">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full rounded-xl border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm"
                >
                  <option value="">Pilih negara</option>
                  <option value="indonesia">Indonesia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Provinsi <span className="text-red-500">*</span>
                </label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full rounded-xl border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  disabled={!formData.country}
                >
                  <option value="">Cari provinsi</option>
                  <option value="dki_jakarta">DKI Jakarta</option>
                  <option value="jawa_barat">Jawa Barat</option>
                  <option value="jawa_timur">Jawa Timur</option>
                  <option value="bali">Bali</option>
                </select>
                {!formData.country && <p className="mt-1 text-xs text-slate-500">Pilih negara dahulu</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kota <span className="text-red-500">*</span>
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full rounded-xl border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  disabled={!formData.province}
                >
                  <option value="">Cari kota</option>
                  <option value="jakarta_selatan">Jakarta Selatan</option>
                  <option value="jakarta_pusat">Jakarta Pusat</option>
                  <option value="bandung">Bandung</option>
                  <option value="surabaya">Surabaya</option>
                </select>
                {!formData.province && <p className="mt-1 text-xs text-slate-500">Pilih provinsi dahulu</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Area <span className="text-red-500">*</span>
                </label>
                <select
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full rounded-xl border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  disabled={!formData.city}
                >
                  <option value="">Cari area</option>
                  <option value="kemang">Kemang</option>
                  <option value="pondok_indah">Pondok Indah</option>
                  <option value="menteng">Menteng</option>
                </select>
                {!formData.city && <p className="mt-1 text-xs text-slate-500">Pilih kota dahulu</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Alamat (Tanpa blok/nomor) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full rounded-xl border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm"
                placeholder="Masukkan alamat tanpa blok/nomor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Blok dan Nomor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="blockAndNumber"
                value={formData.blockAndNumber}
                onChange={handleChange}
                className="w-full rounded-xl border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm"
                placeholder="Masukkan blok dan nomor"
              />
              <p className="mt-1 text-xs text-slate-500">Tidak akan diperlihatkan pada tampilan web/aplikasi</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Arah Hadap
              </label>
              <select
                name="facingDirection"
                value={formData.facingDirection}
                onChange={handleChange}
                className="w-full md:w-1/2 rounded-xl border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm"
              >
                <option value="">Pilih arah</option>
                <option value="utara">Utara</option>
                <option value="selatan">Selatan</option>
                <option value="timur">Timur</option>
                <option value="barat">Barat</option>
                <option value="timur_laut">Timur Laut</option>
                <option value="tenggara">Tenggara</option>
                <option value="barat_daya">Barat Daya</option>
                <option value="barat_laut">Barat Laut</option>
              </select>
            </div>
          </div>
        </div>

        {/* Detail Listing */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-900">Detail Listing</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Luas Tanah <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    name="landArea"
                    value={formData.landArea}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-slate-300 focus:border-slate-900 focus:ring-slate-900 sm:text-sm pr-10"
                    placeholder="Masukkan luas tanah"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-slate-500 sm:text-sm">m²</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Luas Bangunan <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    name="buildingArea"
                    value={formData.buildingArea}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-slate-300 focus:border-slate-900 focus:ring-slate-900 sm:text-sm pr-10"
                    placeholder="Masukkan luas bangunan"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-slate-500 sm:text-sm">m²</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kamar Tidur <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-slate-300 focus:border-slate-900 focus:ring-slate-900 sm:text-sm pr-14"
                    placeholder="Masukkan jumlah kamar tidur"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-slate-500 sm:text-sm">ruang</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kamar Mandi <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-slate-300 focus:border-slate-900 focus:ring-slate-900 sm:text-sm pr-14"
                    placeholder="Masukkan jumlah kamar mandi"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-slate-500 sm:text-sm">ruang</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Lebar Properti
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    name="propertyWidth"
                    value={formData.propertyWidth}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-slate-300 focus:border-slate-900 focus:ring-slate-900 sm:text-sm pr-10"
                    placeholder="Masukkan lebar properti"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-slate-500 sm:text-sm">m</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Panjang Properti
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    name="propertyLength"
                    value={formData.propertyLength}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-slate-300 focus:border-slate-900 focus:ring-slate-900 sm:text-sm pr-10"
                    placeholder="Masukkan panjang properti"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-slate-500 sm:text-sm">m</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Daya Listrik <span className="text-red-500">*</span>
                </label>
                <select
                  name="electricity"
                  value={formData.electricity}
                  onChange={handleChange}
                  className="w-full rounded-xl border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm"
                >
                  <option value="">Pilih daya listrik</option>
                  <option value="900">900 VA</option>
                  <option value="1300">1300 VA</option>
                  <option value="2200">2200 VA</option>
                  <option value="3500">3500 VA</option>
                  <option value="4400">4400 VA</option>
                  <option value="5500">5500 VA</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Jenis Air
                </label>
                <select
                  name="waterType"
                  value={formData.waterType}
                  onChange={handleChange}
                  className="w-full rounded-xl border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm"
                >
                  <option value="">Pilih jenis air</option>
                  <option value="pam">PAM / PDAM</option>
                  <option value="sumur">Sumur Bor / Tanah</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Jumlah Lantai <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => handleFloorChange(-1)}
                  className="p-2 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <span className="text-xl leading-none">-</span>
                </button>
                <input
                  type="number"
                  name="floors"
                  value={formData.floors}
                  onChange={handleChange}
                  className="w-20 text-center rounded-xl border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleFloorChange(1)}
                  className="p-2 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <span className="text-xl leading-none">+</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lokasi Terdekat */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-900">Lokasi Terdekat</h2>
          </div>
          <div className="p-6 space-y-4">
            <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-slate-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Tambahkan Lokasi
            </button>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start">
              <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                Lokasi terdekat kosong. Anda dapat menambahkan dan hasil yang tampil seperti contoh: 5 Menit dari Mall Pakuwon
              </p>
            </div>
          </div>
        </div>

        {/* Informasi Tambahan */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-900">Informasi Tambahan</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Link Tautan Video Review Properti
                </label>
                <input
                  type="url"
                  name="videoLink"
                  value={formData.videoLink}
                  onChange={handleChange}
                  className="w-full rounded-xl border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm"
                  placeholder="Contoh: https://youtu.be/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Jumlah Telepon
                </label>
                <select
                  name="phoneCount"
                  value={formData.phoneCount}
                  onChange={handleChange}
                  className="w-full rounded-xl border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm"
                >
                  <option value="">Pilih jumlah telepon</option>
                  <option value="1">1 Saluran</option>
                  <option value="2">2 Saluran</option>
                  <option value="3">3+ Saluran</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Jenis Furnish
                </label>
                <select
                  name="furnishType"
                  value={formData.furnishType}
                  onChange={handleChange}
                  className="w-full rounded-xl border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm"
                >
                  <option value="">Pilih jenis furnishing</option>
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi">Semi Furnished</option>
                  <option value="full">Fully Furnished</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kapasitas Garasi (mobil)
                </label>
                <select
                  name="garageCapacity"
                  value={formData.garageCapacity}
                  onChange={handleChange}
                  className="w-full rounded-xl border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm"
                >
                  <option value="">Pilih kapasitas garasi</option>
                  <option value="1">1 Mobil</option>
                  <option value="2">2 Mobil</option>
                  <option value="3">3+ Mobil</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Vendor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="vendorName"
                  value={formData.vendorName}
                  onChange={handleChange}
                  className="w-full rounded-xl border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm"
                  placeholder="Masukkan nama vendor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nomor Telepon Vendor <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="vendorPhone"
                  value={formData.vendorPhone}
                  onChange={handleChange}
                  className="w-full rounded-xl border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm"
                  placeholder="Contoh: 08123456789"
                />
              </div>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Perhatian!</h3>
                <p className="mt-1 text-sm text-red-700">
                  Pastikan Anda memasukkan data yang benar untuk back-up data administrasi, kerahasiaan data 100% terjamin selama tidak ada yang mengetahui password anda / kontak hilang / anda berhalangan keluar negeri, dll.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-all"
          >
            {loading ? 'Menyimpan...' : 'Submit'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/properties')}
            className="w-full flex justify-center py-3 px-4 border border-slate-300 rounded-xl shadow-sm text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all"
          >
            Kembali
          </button>
        </div>
      </form>
    </div>
  );
}
