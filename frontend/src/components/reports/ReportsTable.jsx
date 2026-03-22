import React from 'react';
import { FileText, Landmark, FileEdit, Receipt, Download, Eye } from 'lucide-react';

const reports = [
  { 
    id: '#B-88219', 
    source: 'Q3_Invoice_Cloud', 
    type: 'PDF', 
    size: '1.2 MB', 
    status: 'Verified', 
    confidence: 99.4, 
    icon: FileText,
    color: '#adc6ff'
  },
  { 
    id: '#B-88218', 
    source: 'HSBC_Settle_Aug', 
    type: 'XLSX', 
    size: '4.8 MB', 
    status: 'Partial Verification', 
    confidence: 74.2, 
    icon: Landmark,
    color: '#ffb595'
  },
  { 
    id: '#B-88215', 
    source: 'Legal_Agreement_Draft', 
    type: 'DOCX', 
    size: '842 KB', 
    status: 'Verified', 
    confidence: 96.1, 
    icon: FileEdit,
    color: '#adc6ff'
  },
  { 
    id: '#B-88204', 
    source: 'Tax_Return_Individual', 
    type: 'PDF', 
    size: '2.1 MB', 
    status: 'Verified', 
    confidence: 91.8, 
    icon: Receipt,
    color: '#adc6ff'
  },
];

export function ReportsTable() {
  return (
    <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden flex flex-col h-full">
      <div className="p-8 border-b border-white/5">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Actionable Reports</h3>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-background/50 text-[10px] font-bold uppercase text-[#e1e2eb]/40 tracking-[widest">
            <tr>
              <th className="px-8 py-5">Batch ID</th>
              <th className="px-8 py-5">Document Source</th>
              <th className="px-8 py-5">Validation Status</th>
              <th className="px-8 py-5">Confidence</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-8 py-5">
                  <span className="font-mono text-xs font-bold text-[#e1e2eb]">{report.id}</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#32353c] flex items-center justify-center text-[#e1e2eb]/60 group-hover:text-primary transition-colors">
                      <report.icon size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#e1e2eb] tracking-tight">{report.source}</div>
                      <div className="text-[10px] font-bold text-[#e1e2eb]/40 uppercase tracking-widest mt-0.5">{report.size} • {report.type}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(173,198,255,0.4)]" 
                      style={{ backgroundColor: report.color }}
                    />
                    <span className="text-xs font-bold text-[#e1e2eb] tracking-tight">{report.status}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-xs font-black" style={{ color: report.color }}>{report.confidence}%</span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-lg hover:bg-white/10 text-[#e1e2eb]/40 hover:text-primary transition-all">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/10 text-[#e1e2eb]/40 hover:text-primary transition-all">
                      <Download size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
