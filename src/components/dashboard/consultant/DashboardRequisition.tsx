import React, { useState } from 'react';
import { Calendar, Search, Eye, Plus, Save, RotateCcw, Trash2, X, AlertCircle, Package, FileText, ChevronDown } from 'lucide-react';

interface RequisitionItem {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitId: string;
  rate: number;
  amount: number;
  remarks: string;
}

export default function DashboardRequisition() {
  const [selectedUnit, setSelectedUnit] = useState("");
  const [items, setItems] = useState<RequisitionItem[]>([]);
  const [showAlert, setShowAlert] = useState(true);
  const [currentItem, setCurrentItem] = useState({
    itemId: '',
    itemName: '',
    quantity: '',
    unit: '',
    rate: '',
    remarks: ''
  });

  const departments = [
    "Palliative Care", "E N T", "Physio", "X-Ray", "P&O", "Dermatology",
    "Pathology", "Nursing", "Orthopedic", "Anesthesia", "Wheel Chair",
    "Occupational Therapy", "Operation Theatre", "Hansen Disease",
    "General & Plastic Surgery", "Rehab", "Extra Beds(Leprosy)",
    "Gph-Store. Pediatric", "Neuro Rehab", "Acute Trauma & Emergency Services",
    "Speech Therapy", "General Medicine", "Physical Medicine & Rehabilitation",
    "General", "EHS", "Developmental Pediatrics"
  ].sort();

  const addItem = () => {
    if (!currentItem.itemId || !currentItem.quantity) return;
    
    const newItem: RequisitionItem = {
      id: Date.now().toString(),
      itemId: currentItem.itemId,
      itemName: currentItem.itemName || 'Sample Item',
      quantity: parseFloat(currentItem.quantity),
      unit: currentItem.unit || 'PCS',
      unitId: 'U001',
      rate: parseFloat(currentItem.rate) || 0,
      amount: parseFloat(currentItem.quantity) * (parseFloat(currentItem.rate) || 0),
      remarks: currentItem.remarks
    };
    
    setItems([...items, newItem]);
    setCurrentItem({
      itemId: '',
      itemName: '',
      quantity: '',
      unit: '',
      rate: '',
      remarks: ''
    });
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              New Requisition
            </h1>
            <p className="text-slate-500 mt-1">Create and manage department requisitions</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-lg shadow-sm">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
          </div>
        </div>

        {/* Info Alert */}
        {showAlert && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">Quick Start Guide</h3>
                  <p className="text-blue-700 text-sm mt-1">Fill in the requisition details below, add items, and save when complete.</p>
                </div>
              </div>
              <button onClick={() => setShowAlert(false)} className="text-blue-600 hover:text-blue-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Package className="w-5 h-5" />
              Requisition Information
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Requisition ID */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Requisition ID</label>
                <input
                  type="text"
                  value="REQ-2026-001"
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                  <input
                    type="date"
                    className="px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Requesting Unit */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Requesting Department</label>
                <div className="relative">
                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white transition"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <label className="text-sm font-medium text-slate-700">General Remarks</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition"
                  placeholder="Enter any additional notes or special instructions..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Add Item Section */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Items
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Item Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Item Search</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={currentItem.itemId}
                  onChange={(e) => setCurrentItem({...currentItem, itemId: e.target.value})}
                  placeholder="Item Code"
                  className="w-32 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
                <input
                  type="text"
                  value={currentItem.itemName}
                  onChange={(e) => setCurrentItem({...currentItem, itemName: e.target.value})}
                  placeholder="Item Name"
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
                <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm">
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </div>

            {/* Item Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Quantity</label>
                <input
                  type="number"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({...currentItem, quantity: e.target.value})}
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Unit</label>
                <input
                  type="text"
                  value={currentItem.unit}
                  onChange={(e) => setCurrentItem({...currentItem, unit: e.target.value})}
                  placeholder="PCS/BOX/KG"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Rate</label>
                <input
                  type="number"
                  value={currentItem.rate}
                  onChange={(e) => setCurrentItem({...currentItem, rate: e.target.value})}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Total</label>
                <input
                  type="text"
                  value={(parseFloat(currentItem.quantity || '0') * parseFloat(currentItem.rate || '0')).toFixed(2)}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-slate-700">Item Remarks</label>
                <input
                  type="text"
                  value={currentItem.remarks}
                  onChange={(e) => setCurrentItem({...currentItem, remarks: e.target.value})}
                  placeholder="Optional notes for this item"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              <button
                onClick={addItem}
                className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 flex items-center justify-between">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Items Overview
            </h2>
            <div className="text-white text-sm bg-white/20 px-4 py-1.5 rounded-full">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  {["Item ID", "Item Name", "Quantity", "Unit ID", "Unit", "Rate", "Amount", "Remarks", "Action"].map((header) => (
                    <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No items added yet. Use the form above to add items.</p>
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-blue-50 transition">
                      <td className="px-4 py-3 text-sm text-slate-600">{item.itemId}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.itemName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.unitId}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.unit}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">${item.rate.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800">${item.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{item.remarks || '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800 transition p-1 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {items.length > 0 && (
                <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                      Grand Total:
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-blue-700">
                      ${totalAmount.toFixed(2)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-end bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <button className="px-6 py-2.5 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition flex items-center gap-2 shadow-sm">
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm">
            <Search className="w-4 h-4" />
            Find
          </button>
          <button className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 shadow-sm">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 shadow-md font-semibold">
            <Save className="w-4 h-4" />
            Save Requisition
          </button>
        </div>
      </div>
    </div>
  );
}