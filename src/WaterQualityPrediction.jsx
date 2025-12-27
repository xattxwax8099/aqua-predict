import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Waves, ChevronDown, ArrowLeft, Table as TableIcon, Play } from 'lucide-react'; // เพิ่ม Play icon
import { Link } from 'react-router-dom';
import Papa from 'papaparse';

/* ================= CONFIG & LOADER ================= */
const STATIONS = [
  { id: 'cp01', name: 'CP01 Chumphon River' },
  { id: 'ls01', name: 'LS01 Lower Lang Suan' },
  { id: 'ls03', name: 'LS03 Upper Lang Suan' },
  { id: 'tp01', name: 'TP01 Lower Tapee' },
  { id: 'tp04', name: 'TP04 Phum Duang' },
  { id: 'tp11', name: 'TP11 Upper Tapee' },
  { id: 'pn01', name: 'PN01 Pak Phanang' },
  { id: 'sk01', name: 'SK01 Thale Noi' },
  { id: 'sk06', name: 'SK06 Thalaluang' },
];

const PARAMETERS = [
  { id: 'chlorophyll_a', name: 'Chlorophyll-a', unit: 'µg/L', color: '#10B981' },
  { id: 'secchi', name: 'Secchi Depth', unit: 'm', color: '#3B82F6' },
  { id: 'tsi', name: 'Trophic State Index', unit: 'TSI', color: '#F59E0B' },
  { id: 'ph', name: 'pH', unit: 'pH', color: '#8B5CF6' },
  { id: 'turbidity', name: 'Turbidity', unit: 'NTU', color: '#EC4899' },
  { id: 'salinity', name: 'Salinity', unit: 'ppt', color: '#06B6D4' },
  { id: 'do', name: 'Dissolved Oxygen', unit: 'mg/L', color: '#EF4444' },
];

const fetchCSV = (path) =>
  new Promise((resolve, reject) => {
    Papa.parse(path, {
      download: true, header: true, dynamicTyping: true, skipEmptyLines: true,
      complete: (res) => resolve(res.data),
      error: (err) => reject(err),
    });
  });

/* ================= MAIN COMPONENT ================= */
export default function ForecastDashboard() {
  const [station, setStation] = useState(STATIONS[0]);
  const [param, setParam] = useState(PARAMETERS[0]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPredicted, setIsPredicted] = useState(false); // เพิ่ม state สำหรับเช็คการกดปุ่ม

  // ฟังก์ชันสำหรับโหลดข้อมูล (เรียกใช้เมื่อกดปุ่ม Predict)
  const handlePredict = async () => {
    setLoading(true);
    setIsPredicted(true); // แสดงส่วนกราฟ
    try {
      const histPath = `prepared/${station.id.toUpperCase()}_prepared.csv`;
      const forePath = `forecasts/${station.id.toUpperCase()}_monthly_forecast.csv`;

      const [histRaw, foreRaw] = await Promise.all([
        fetchCSV(histPath).catch(() => []),
        fetchCSV(forePath),
      ]);

      const hist = histRaw.map((r) => ({
        label: r[''] || r.date,
        actual: r[param.id],
        forecast: null,
      }));

      const fore = foreRaw.map((r) => ({
        label: r[''] || r.date,
        actual: null,
        forecast: r[param.id],
      }));

      if (hist.length && fore.length) {
        fore[0].actual = hist[hist.length - 1].actual;
      }

      setChartData([...hist, ...fore]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // กรองเฉพาะข้อมูลพยากรณ์เพื่อไปแสดงในตาราง
  const forecastOnly = chartData.filter(d => d.forecast !== null);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <Waves className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-black tracking-tight">AquaPredict</h1>
        </div>
        <div className="p-6 space-y-8 flex-1">
          <SelectBox label="Station" value={station.id} options={STATIONS} onChange={(v) => { setStation(STATIONS.find(s => s.id === v)); setIsPredicted(false); }} />
          <SelectBox label="Parameter" value={param.id} options={PARAMETERS} onChange={(v) => { setParam(PARAMETERS.find(p => p.id === v)); setIsPredicted(false); }} />
          
          {/* เพิ่มปุ่ม Predict */}
          <button 
            onClick={handlePredict}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Predict Results
          </button>

          <div className="bg-blue-50 rounded-xl p-4 space-y-2">
             <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">About this station</h4>
             <p className="text-xs text-slate-600 leading-relaxed font-medium">Showing predicted water quality trends based on deep learning models.</p>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600">
            <ArrowLeft className="w-4 h-4" /> Back to Map
          </Link>
        </div>
      </aside>

      {/* MAIN VIEW */}
      <main className="flex-1 p-8 overflow-hidden">
        {isPredicted ? (
          <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">Forecasting Module</span>
                <h2 className="text-4xl font-black text-slate-800 mt-2 tracking-tight">{param.name}</h2>
                <p className="text-sm font-bold text-slate-400 mt-1">{station.name}</p>
              </div>
              <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Unit</p>
                <p className="text-xl font-black text-blue-600">{param.unit}</p>
              </div>
            </header>

            {/* Content Grid */}
            <div className="flex-1 grid grid-cols-3 gap-6 min-h-0">
              {/* GRAPH CARD */}
              <div className="col-span-2 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative flex flex-col">
                {loading && <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center font-bold text-blue-600">Loading...</div>}
                <div className="flex-1 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={param.color} stopOpacity={0.15} />
                          <stop offset="95%" stopColor={param.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} tickFormatter={(v) => v?.split('-').slice(1).join('/')} />
                      <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="actual" stroke={param.color} strokeWidth={4} fill="url(#areaColor)" dot={false} connectNulls />
                      <Area type="monotone" dataKey="forecast" stroke={param.color} strokeDasharray="8 8" strokeWidth={4} fill="none" dot={false} connectNulls />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* TABLE CARD */}
              <div className="col-span-1 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <TableIcon className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-slate-700">Forecast Values</h3>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
                      <tr>
                        <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {forecastOnly.map((row, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="p-4 text-sm font-bold text-slate-600">{row.label}</td>
                          <td className="p-4 text-sm font-black text-blue-600 text-right">{row.forecast?.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State เมื่อยังไม่ได้กด Predict */
          <div className="h-full flex flex-col items-center justify-center text-slate-400 border-4 border-dashed border-slate-100 rounded-[40px]">
             <div className="bg-white p-8 rounded-full shadow-xl mb-6">
                <Waves className="w-16 h-16 text-blue-100 animate-pulse" />
             </div>
             <p className="text-xl font-black text-slate-300 uppercase tracking-widest">Select station and click predict</p>
          </div>
        )}
      </main>
    </div>
  );
}

function SelectBox({ label, value, onChange, options }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <select
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 appearance-none outline-none focus:border-blue-500 transition-all cursor-pointer group-hover:bg-white"
          value={value} onChange={(e) => onChange(e.target.value)}
        >
          {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}