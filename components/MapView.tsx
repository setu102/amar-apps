
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, Loader2, Map as MapIcon, Crosshair, ShieldAlert, Building2, Info, Sparkles, Utensils, Hotel, Tent } from 'lucide-react';
import L from 'leaflet';
import { db } from '../db';
import { Type } from "@google/genai";

interface Place {
  id: string | number;
  name: string;
  category: 'hospital' | 'police' | 'emergency' | 'hotel' | 'restaurant' | 'landmark' | 'other';
  lat: number;
  lng: number;
  phone?: string;
  description?: string;
  isAI?: boolean;
}

const PLACES_DATA: Place[] = [
  { id: 1, name: 'রাজবাড়ী সদর হাসপাতাল', category: 'hospital', lat: 23.7635, lng: 89.6468, phone: '০৬৪১-৬৫১১১' },
  { id: 2, name: 'রাজবাড়ী সদর থানা', category: 'police', lat: 23.7588, lng: 89.6495, phone: '০১৭৬৯-০৫৮২১১' },
  { id: 3, name: 'রাজবাড়ী ফায়ার সার্ভিস', category: 'emergency', lat: 23.7542, lng: 89.6550, phone: '০১৭৩০-০০২৪৪৫' },
  { id: 4, name: 'পাংশা মডেল থানা', category: 'police', lat: 23.7925, lng: 89.4244, phone: '০১৩২০-১৫১৫১২' },
  { id: 5, name: 'বালিয়াকান্দি থানা', category: 'police', lat: 23.6265, lng: 89.5495, phone: '০১৩২০-১৫১৫৩৪' },
  { id: 6, name: 'গোয়ালন্দ ঘাট থানা', category: 'police', lat: 23.7315, lng: 89.7615, phone: '০১৩২০-১৫১৫৭৮' },
  { id: 7, name: 'সেবা ক্লিনিক রাজবাড়ী', category: 'hospital', lat: 23.7570, lng: 89.6450, phone: '০১৭২১-৫৫৮৮৯৯' },
];

const MapView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>(PLACES_DATA);
  const [aiPlaces, setAiPlaces] = useState<Place[]>([]);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const getCategoryName = (cat: string) => {
    const names: Record<string, string> = { 
      hospital: 'হাসপাল', 
      police: 'থানা', 
      emergency: 'জরুরি সেবা',
      hotel: 'হোটেল/আবাসন',
      restaurant: 'রেস্টুরেন্ট',
      landmark: 'দর্শনীয় স্থান',
      other: 'অন্যান্য'
    };
    return names[cat] || cat;
  };

  const getIconForCategory = (cat: string) => {
    const icons: Record<string, string> = {
      hospital: 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png',
      police: 'https://cdn-icons-png.flaticon.com/512/3595/3595514.png',
      emergency: 'https://cdn-icons-png.flaticon.com/512/564/564793.png',
      hotel: 'https://cdn-icons-png.flaticon.com/512/2983/2983973.png',
      restaurant: 'https://cdn-icons-png.flaticon.com/512/3448/3448609.png',
      landmark: 'https://cdn-icons-png.flaticon.com/512/2451/2451551.png'
    };
    return icons[cat] || 'https://cdn-icons-png.flaticon.com/512/684/684908.png';
  };

  useEffect(() => {
    if (!mapRef.current || mapInstance) return;
    const rajbariCenter: [number, number] = [23.7571, 89.6508];
    const map = L.map(mapRef.current, { center: rajbariCenter, zoom: 13, zoomControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    setMapInstance(map);
    setLoading(false);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        L.circleMarker(loc, { radius: 8, fillColor: "#4f46e5", color: "#fff", weight: 3, opacity: 1, fillOpacity: 1 }).addTo(map).bindPopup("আপনি এখানে আছেন");
        map.setView(loc, 14);
      }, () => console.warn("Location access denied."));
    }
    return () => { map.remove(); };
  }, []);

  useEffect(() => {
    if (!mapInstance || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();
    const allPlaces = [...filteredPlaces, ...aiPlaces];
    const bounds: L.LatLngExpression[] = [];

    allPlaces.forEach(place => {
      const icon = L.icon({
        iconUrl: getIconForCategory(place.category),
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([place.lat, place.lng], { icon })
        .bindPopup(`
          <div style="padding: 8px; font-family: 'Hind Siliguri', sans-serif; text-align: center; min-width: 140px;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 4px; margin-bottom: 4px;">
               ${place.isAI ? '<span style="background: #eff6ff; color: #3b82f6; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">AI SEARCH</span>' : ''}
               <h3 style="font-weight: 700; margin: 0; font-size: 14px; color: #1e293b;">${place.name}</h3>
            </div>
            <p style="font-size: 11px; color: #64748b;">${getCategoryName(place.category)}</p>
          </div>
        `);
      markersLayerRef.current?.addLayer(marker);
      bounds.push([place.lat, place.lng]);
    });

    if (bounds.length > 0 && mapInstance) {
      mapInstance.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 16 });
    }
  }, [mapInstance, filteredPlaces, aiPlaces]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const searchVal = query.toLowerCase().trim();
    if (!searchVal) return;

    setIsSearching(true);
    try {
      const response = await db.callAI({
        contents: [{ parts: [{ text: `Find precisely the coordinates of "${searchVal}" in Rajbari District, Bangladesh. Use Google Search to find exact latitude and longitude.` }] }],
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER },
              category: { type: Type.STRING, description: "Category of the place: hotel, restaurant, landmark, hospital, police, other" }
            },
            required: ['name', 'lat', 'lng', 'category']
          }
        }
      });

      const results = JSON.parse(response.text || '[]');
      setAiPlaces(results.map((r: any, idx: number) => ({ ...r, id: `ai-${idx}`, isAI: true })));
    } catch (error) {
      console.error("Map Search Error:", error);
      alert("ম্যাপে এই স্থানটি খুঁজে পাওয়া যায়নি।");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="p-6 animate-slide-up pb-32">
      <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white mb-8 relative overflow-hidden shadow-2xl">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <MapIcon className="w-8 h-8" /> ম্যাপ এক্সপ্লোরার
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden premium-shadow border border-slate-100 dark:border-slate-800 mb-8 h-[450px] relative z-10">
        {(loading || isSearching) && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 dark:bg-slate-950/80 z-20">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-300" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ম্যাপে খুঁজুন (যেমন: বাজার, স্কুল...)" 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] py-5 pl-16 pr-8 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-lg font-medium"
          />
        </div>
      </form>

      <div className="grid gap-4">
        {[...filteredPlaces, ...aiPlaces].map(place => (
          <div key={place.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-50 dark:border-slate-800 flex items-center justify-between group transition-all hover:border-indigo-200">
            <div className="flex gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-800 dark:text-white text-lg">{place.name}</h4>
                  {place.isAI && <Sparkles className="w-3 h-3 text-amber-500" />}
                </div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{getCategoryName(place.category)}</p>
              </div>
            </div>
            <button onClick={() => mapInstance?.setView([place.lat, place.lng], 16)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 active:scale-90 transition-all">
              <Navigation className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapView;
