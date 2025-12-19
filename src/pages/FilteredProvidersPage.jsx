import React, { useState, useEffect } from "react";
import { Check, MapPin, ChevronDown, Star } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const FALLBACK_IMAGE = "https://dummyimage.com/200x150/e5e7eb/000&text=No+Image";
const FALLBACK_LOGO = "https://dummyimage.com/80x80/e5e7eb/000&text=Logo";

const ITEM_VOLUME_MAP = {
  "Single Bed": 1.0, "Double Bed": 1.5, "KingSize Bed": 2.0,
  "Mattress Single": 0.6, "Mattress Double": 0.8, "Mattress KingSize": 1.0,
  "Wardrobe Double": 1.5, "Wardrobe Triple": 2.0,
  "Chest Of 4 Drawers": 0.7, "Bedside Table": 0.3,
  "3 Seater Sofa": 2.0, "2 Seater Sofa": 1.5, Armchair: 1.0,
  "Coffee Table": 0.3, 'TV up to 75"': 0.2, "TV Stand": 0.3,
  "Bookcase Large": 0.8, "Cabinet Large": 1.0,
  "Dining Table 6 Seater": 1.5, "Dining Chair": 0.15,
  "Fridge Freezer Upright": 0.7, "Washing Machine": 0.6,
  Dishwasher: 0.6, "Cooker Standard": 0.5, "Desk Large": 0.75,
  "Misc Chairs Bedroom": 0.25, "Bookcase Small Bedroom": 0.5,
  "Plant Small LR": 0.05, "Ornaments Fragile LR": 0.1, Suitcases: 0.2,
};

const calculateTotalVolume = (selectedItems = {}, propertySize, additionalSpaces = []) => {
  let total = 0;
  Object.entries(selectedItems).forEach(([item, qty]) => {
    const vol = ITEM_VOLUME_MAP[item] || 0;
    total += vol * qty;
  });
  const sizeEst = { studio: 300, "1_bed": 500, "2_bed": 800, "3_bed": 1200, "4_bed": 1600, "5_bed": 2000 };
  if (total === 0 && sizeEst[propertySize]) total = sizeEst[propertySize];
  total += additionalSpaces.length * 200;
  return Math.round(total);
};

const resolveImage = (img) => (!img || img.startsWith("blob:") || img.trim() === "" ? FALLBACK_IMAGE : img);

const RenderList = ({ title, list }) => {
  console.log(`RenderList - ${title}:`, list);
  return (
    <div>
      <h4 className="font-bold text-pink-600 text-[15px] mb-2">{title}:</h4>
      {list?.length > 0 ? (
        <ul className="space-y-1">
          {list.map((item, index) => (
            <li key={index} className="text-gray-700 text-[14px] flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 text-[13px]">No items listed</p>
      )}
    </div>
  );
};

const FilteredProvidersPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    pickupPincode = "", dropoffPincode = "", propertySize = "", distanceKm = null,
    serviceType = "", quantity = "everything", additionalSpaces = [],
    selectedItems = {}, dismantleItems = {}, collectionParking = "",
    deliveryParking = "", collectionAccess = "", deliveryAccess = "",
    moveDay = "", noticePeriod = "", collectionTime = "",
    user_details = {}, providers = [], companiesWithPricing = [], pricingForm = {},
  } = state || {};

  const distanceMilesExact = distanceKm ? parseFloat((distanceKm * 0.621371).toFixed(1)) : null;
  const totalVolume = calculateTotalVolume(selectedItems, propertySize, additionalSpaces);
  const apiProviders = companiesWithPricing.length ? companiesWithPricing : providers;

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("low-to-high");
  const [ratings] = useState({});
  const [openGallery, setOpenGallery] = useState({});

  const toggleGallery = (key) => setOpenGallery((prev) => ({ ...prev, [key]: !prev[key] }));

  const processCompanies = (list) => {
    if (!Array.isArray(list)) {
      console.error("❌ processCompanies received non-array:", typeof list);
      return [];
    }
    
    console.log("📦 Processing", list.length, "companies");
    
    return list.map((company, index) => {
      if (!company || typeof company !== 'object') {
        console.warn(`⚠️ Invalid company at index ${index}`);
        return null;
      }

      if (index === 0) {
        console.log("🔍 RAW DATA (first company):", {
          name: company.company_name,
          hasProtection: !!company.protection,
          protection: company.protection,
          hasMaterial: !!company.material,
          material: company.material,
          hasFurniture: !!company.furniture,
          furniture: company.furniture,
          hasAppliances: !!company.appliances,
          appliances: company.appliances,
          hasIncludes: !!company.includes,
          includes: company.includes
        });
      }

      const pricing = company.exact_pricing || {};
      const breakdown = pricing.breakdown || {};

      const processed = {
        name: company.company_name || company.name || 'Unknown Company',
        phone: company.phone || '',
        address: company.address || '',
        location: company.location || '',
        subscription_plan: company.subscription_plan || company.subscription_info?.plan || 'Free',
        total_carrying_capacity: company.total_carrying_capacity || 0,
        logo: company.company_gallery?.[0] || FALLBACK_LOGO,
        final_total: pricing.final_total || 0,
        packing_cost: breakdown.packing || 0,
        dismantling_cost: breakdown.dismantling || 0,
        reassembly_cost: breakdown.reassembly || 0,
        loading_cost: breakdown.loading || 0,
        mileage_cost: breakdown.mileage || 0,
        date_adjustment: breakdown.date_adjustment || 0,
        
        original: {
          includes: Array.isArray(company.includes) ? company.includes : [],
          protection: Array.isArray(company.protection) ? company.protection : [],
          material: Array.isArray(company.material) ? company.material : [],
          furniture: Array.isArray(company.furniture) ? company.furniture : [],
          appliances: Array.isArray(company.appliances) ? company.appliances : [],
          areas_covered: Array.isArray(company.areas_covered) ? company.areas_covered : [],
          description: company.description || '',
        },
        
        gallery: company.company_gallery?.length 
          ? company.company_gallery.map(resolveImage) 
          : [FALLBACK_IMAGE],
        distanceMiles: distanceMilesExact ? `${distanceMilesExact} miles` : "N/A",
        distanceText: "From Collection Address",
      };

      if (index === 0) {
        console.log("✅ PROCESSED DATA (first company):", {
          name: processed.name,
          'original.includes': processed.original.includes,
          'original.protection': processed.original.protection,
          'original.material': processed.original.material,
          'original.furniture': processed.original.furniture,
          'original.appliances': processed.original.appliances,
        });
      }

      return processed;
    }).filter(Boolean);
  };

  useEffect(() => {
    const loadData = () => {
      try {
        console.log("🚀 useEffect running - Loading data...");
        let dataToProcess = apiProviders;
        
        console.log("📥 Data from state:", {
          length: dataToProcess?.length || 0,
          firstCompanyName: dataToProcess?.[0]?.company_name,
          firstCompanyProtection: dataToProcess?.[0]?.protection,
          firstCompanyMaterial: dataToProcess?.[0]?.material
        });
        
        if (!dataToProcess || dataToProcess.length === 0) {
          const savedData = localStorage.getItem('filteredProviders');
          if (savedData) {
            const parsed = JSON.parse(savedData);
            dataToProcess = parsed.providers || [];
            console.log("✅ Loaded from localStorage:", dataToProcess.length);
          }
        }
        
        if (dataToProcess && dataToProcess.length > 0) {
          const processed = processCompanies(dataToProcess);
          console.log("✅ Setting state with", processed.length, "companies");
          setCompanies(processed);
        } else {
          console.log("⚠️ No data to process");
          setCompanies([]);
        }
        
        setLoading(false);
      } catch (e) {
        console.error("❌ Error loading data:", e);
        setCompanies([]);
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSort = () => {
    const sorted = [...companies].sort((a, b) =>
      sortOrder === "low-to-high" ? a.final_total - b.final_total : b.final_total - a.final_total
    );
    setCompanies(sorted);
    setSortOrder(sortOrder === "low-to-high" ? "high-to-low" : "low-to-high");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Providers</h3>
          <p className="text-sm text-gray-500">Processing {apiProviders?.length || 0} companies</p>
        </div>
      </div>
    );
  }

  if (!loading && companies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg border p-8 text-center">
            <div className="text-5xl mb-4">🏠</div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">No Providers Data</h2>
            <p className="text-gray-600 mb-6">We couldn't find any provider data.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium">
                Go Back & Try Again
              </button>
              <button
                onClick={() => { localStorage.removeItem('filteredProviders'); window.location.reload(); }}
                className="px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
              >
                Clear Cache & Reload
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-pink-600 to-pink-500 text-white py-6 sm:py-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left Section */}
            <div className="text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold mb-3">
                Filter Removal Providers
              </h1>
              
              {/* Route Badges */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                  <div className="text-left">
                    <div className="text-xs opacity-80">From</div>
                    <div className="font-semibold">{pickupPincode}</div>
                  </div>
                  <div className="h-6 w-px bg-white/30"></div>
                  <div className="text-left">
                    <div className="text-xs opacity-80">To</div>
                    <div className="font-semibold">{dropoffPincode}</div>
                  </div>
                </div>
                
                {/* Volume Badge */}
                {totalVolume > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                    <div className="text-xs opacity-80">Estimated Volume</div>
                    <div className="font-semibold">{totalVolume} cubic feet</div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex flex-col items-center lg:items-end gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 px-4 py-2 rounded-lg">
                  <span className="font-bold">{companies.length}</span> companies
                </div>
                <button onClick={handleSort} className="flex items-center gap-2 px-4 py-2 bg-white text-pink-600 rounded-lg font-semibold hover:bg-gray-50">
                  {sortOrder === "low-to-high" ? "Price (Low to High)" : "Price (High to Low)"}
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Summary */}
        <div className="mb-8 p-5 bg-white rounded-2xl shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <div className="text-2xl font-bold text-pink-600">{companies.length}</div>
              <div className="text-sm text-gray-600">Total Providers</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                £{companies.length > 0 ? Math.min(...companies.map(p => p.final_total || 0)).toFixed(2) : '0.00'}
              </div>
              <div className="text-sm text-gray-600">Lowest Price</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                £{companies.length > 0 ? Math.max(...companies.map(p => p.final_total || 0)).toFixed(2) : '0.00'}
              </div>
              <div className="text-sm text-gray-600">Highest Price</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {distanceMilesExact ? `${distanceMilesExact}` : 'N/A'} miles
              </div>
              <div className="text-sm text-gray-600">Total Distance</div>
            </div>
          </div>
        </div>

        {/* PROVIDERS LIST */}
        <div className="space-y-6">
          {companies.map((p, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* TOP SECTION */}
              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* COMPANY INFO */}
                  <div className="flex items-start gap-4">
                    <img src={p.logo} className="w-20 h-20 rounded-xl object-cover border-2 border-pink-100" alt={p.name} />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{p.name}</h3>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        {[1,2,3,4,5].map((star) => (
                          <Star key={star} className={`h-4 w-4 ${star <= Math.round(ratings[p.name]?.avg || 0) ? "text-yellow-400" : "text-gray-300"}`}
                            fill={star <= Math.round(ratings[p.name]?.avg || 0) ? "#facc15" : "none"} />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">({ratings[p.name]?.total || 0} reviews)</span>
                      </div>
                      
                      {/* Distance */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-pink-500" />
                        <span>{p.distanceMiles} • {p.distanceText}</span>
                      </div>
                    </div>
                  </div>

                  {/* PRICING GRID */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">£{p.packing_cost.toFixed(2)}</div>
                      <div className="text-xs text-gray-500 mt-1">Packing</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">£{p.dismantling_cost.toFixed(2)}</div>
                      <div className="text-xs text-gray-500 mt-1">Dismantling</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">£{p.reassembly_cost.toFixed(2)}</div>
                      <div className="text-xs text-gray-500 mt-1">Reassembly</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Total Capacity</div>
                      <div className="text-sm font-semibold text-gray-900">{p.total_carrying_capacity} m³</div>
                    </div>
                  </div>

                  {/* TOTAL & CTA */}
                  <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-white rounded-xl border border-pink-100">
                    <div className="text-center mb-3">
                      <div className="text-sm text-gray-600 mb-1">Total Cost</div>
                      <div className="text-2xl font-bold text-gray-900">£{p.final_total.toFixed(2)}</div>
                      <div className="text-xs text-gray-500 mt-1">All inclusive</div>
                    </div>
                    <button
                      onClick={() => navigate("/book-service", {
                        state: {
                          user_details, full_name: user_details.full_name, email: user_details.email, phone: user_details.phone,
                          company_name: p.name, provider: p.original, company_logo: p.logo,
                          company_phone: p.phone, company_address: p.address,
                          pickup_address: pricingForm?.pickup_address, pickup_city: pricingForm?.pickup_city,
                          delivery_address: pricingForm?.delivery_address, delivery_city: pricingForm?.delivery_city,
                          pickupPincode, dropoffPincode, property_type: serviceType, property_size: propertySize,
                          quantity, additional_spaces: additionalSpaces, move_day: moveDay, notice_period: noticePeriod,
                          collection_time: collectionTime, selected_items: selectedItems, dismantle_items: dismantleItems,
                          collection_parking_distance: collectionParking, collection_internal_access: collectionAccess,
                          delivery_parking_distance: deliveryParking, delivery_internal_access: deliveryAccess,
                          distanceMiles: distanceMilesExact, distanceKm, finalTotal: p.final_total,
                          packingCost: p.packing_cost, dismantlingCost: p.dismantling_cost, reassemblyCost: p.reassembly_cost,
                          loadingCost: p.loading_cost, mileageCost: p.mileage_cost, dateAdjustment: p.date_adjustment,
                          total_volume: totalVolume,
                        }
                      })}
                      className="px-6 py-2.5 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors w-full max-w-[200px]"
                    >
                      Book Service
                    </button>
                  </div>
                </div>
              </div>

              {/* WHAT'S INCLUDED DROPDOWN */}
              <div className="border-t border-gray-100">
                <button onClick={() => toggleGallery("inc-" + index)}
                  className="w-full flex items-center justify-between bg-gradient-to-r from-pink-600 to-pink-500 text-white px-5 py-3 font-semibold">
                  <span className="flex items-center gap-2">
                    <ChevronDown className={`h-4 w-4 transition-transform ${openGallery["inc-" + index] ? "rotate-180" : ""}`} />
                    What's Included?
                  </span>
                  <span className="text-xs font-normal opacity-90">
                    Click to {openGallery["inc-" + index] ? 'collapse' : 'expand'}
                  </span>
                </button>
                
                {openGallery["inc-" + index] && (
                  <div className="bg-white p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <RenderList title="Includes" list={p.original.includes} />
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <RenderList title="Protection" list={p.original.protection} />
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <RenderList title="Materials" list={p.original.material} />
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <RenderList title="Furniture" list={p.original.furniture} />
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <RenderList title="Appliances" list={p.original.appliances} />
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <div>
                          <h4 className="font-bold text-pink-600 text-[15px] mb-2">Summary:</h4>
                          <p className="text-gray-700 text-[14px] leading-relaxed">
                            {p.original.description || "Professional moving services with competitive pricing."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* GALLERY SECTION */}
              <div className="border-t border-gray-100 px-5 py-4">
                <button onClick={() => toggleGallery(index)} className="flex items-center gap-2 text-pink-600 font-semibold hover:text-pink-700">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Company Gallery ({p.gallery.length} images)
                  <ChevronDown className={`h-4 w-4 transition-transform ${openGallery[index] ? "rotate-180" : ""}`} />
                </button>
                
                {openGallery[index] && (
                  <div className="mt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {p.gallery.map((img, i) => (
                        <div key={i} className="rounded-lg overflow-hidden border-2 border-white shadow-sm hover:shadow-md transition-shadow">
                          <img 
                            src={img} 
                            alt={`Gallery ${i + 1}`} 
                            className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => { e.target.src = FALLBACK_IMAGE; }} 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM INFO */}
        {!loading && companies.length > 0 && (
          <div className="mt-8 p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h4 className="font-semibold text-gray-800 mb-1">Ready to book your move?</h4>
                <p className="text-sm text-gray-600">
                  Compare all {companies.length} providers above and select "Book Service" when ready
                </p>
              </div>
              <div className="text-sm text-gray-500">
                Showing {companies.length} of {companies.length} matching providers
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilteredProvidersPage;


// import React, { useState, useEffect } from "react";
// import { Check, MapPin, ChevronDown, Star } from "lucide-react";
// import { useLocation, useNavigate } from "react-router-dom";

// const FALLBACK_IMAGE = "https://dummyimage.com/200x150/e5e7eb/000&text=No+Image";
// const FALLBACK_LOGO = "https://dummyimage.com/80x80/e5e7eb/000&text=Logo";

// const ITEM_VOLUME_MAP = {
//   "Single Bed": 1.0, "Double Bed": 1.5, "KingSize Bed": 2.0,
//   "Mattress Single": 0.6, "Mattress Double": 0.8, "Mattress KingSize": 1.0,
//   "Wardrobe Double": 1.5, "Wardrobe Triple": 2.0,
//   "Chest Of 4 Drawers": 0.7, "Bedside Table": 0.3,
//   "3 Seater Sofa": 2.0, "2 Seater Sofa": 1.5, Armchair: 1.0,
//   "Coffee Table": 0.3, 'TV up to 75"': 0.2, "TV Stand": 0.3,
//   "Bookcase Large": 0.8, "Cabinet Large": 1.0,
//   "Dining Table 6 Seater": 1.5, "Dining Chair": 0.15,
//   "Fridge Freezer Upright": 0.7, "Washing Machine": 0.6,
//   Dishwasher: 0.6, "Cooker Standard": 0.5, "Desk Large": 0.75,
//   "Misc Chairs Bedroom": 0.25, "Bookcase Small Bedroom": 0.5,
//   "Plant Small LR": 0.05, "Ornaments Fragile LR": 0.1, Suitcases: 0.2,
// };

// const calculateTotalVolume = (selectedItems = {}, propertySize, additionalSpaces = []) => {
//   let total = 0;
//   Object.entries(selectedItems).forEach(([item, qty]) => {
//     const vol = ITEM_VOLUME_MAP[item] || 0;
//     total += vol * qty;
//   });
//   const sizeEst = { studio: 300, "1_bed": 500, "2_bed": 800, "3_bed": 1200, "4_bed": 1600, "5_bed": 2000 };
//   if (total === 0 && sizeEst[propertySize]) total = sizeEst[propertySize];
//   total += additionalSpaces.length * 200;
//   return Math.round(total);
// };

// const resolveImage = (img) => (!img || img.startsWith("blob:") || img.trim() === "" ? FALLBACK_IMAGE : img);

// const RenderList = ({ title, list }) => {
//   console.log(`RenderList - ${title}:`, list);
//   return (
//     <div>
//       <h4 className="font-bold text-pink-600 text-[15px] mb-2">{title}:</h4>
//       {list?.length > 0 ? (
//         <ul className="space-y-1">
//           {list.map((item, index) => (
//             <li key={index} className="text-gray-700 text-[14px] flex items-center gap-2">
//               <Check className="h-4 w-4 text-green-500" />
//               {item}
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p className="text-gray-400 text-[13px]">No items listed</p>
//       )}
//     </div>
//   );
// };

// const FilteredProvidersPage = () => {
//   const { state } = useLocation();
//   const navigate = useNavigate();

//   const {
//     pickupPincode = "", dropoffPincode = "", propertySize = "", distanceKm = null,
//     serviceType = "", quantity = "everything", additionalSpaces = [],
//     selectedItems = {}, dismantleItems = {}, collectionParking = "",
//     deliveryParking = "", collectionAccess = "", deliveryAccess = "",
//     moveDay = "", noticePeriod = "", collectionTime = "",
//     user_details = {}, providers = [], companiesWithPricing = [], pricingForm = {},
//   } = state || {};

//   const distanceMilesExact = distanceKm ? parseFloat((distanceKm * 0.621371).toFixed(1)) : null;
//   const totalVolume = calculateTotalVolume(selectedItems, propertySize, additionalSpaces);
//   const apiProviders = companiesWithPricing.length ? companiesWithPricing : providers;

//   const [companies, setCompanies] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [sortOrder, setSortOrder] = useState("low-to-high");
//   const [ratings] = useState({});
//   const [openGallery, setOpenGallery] = useState({});

//   const toggleGallery = (key) => setOpenGallery((prev) => ({ ...prev, [key]: !prev[key] }));

//   const processCompanies = (list) => {
//     if (!Array.isArray(list)) {
//       console.error("❌ processCompanies received non-array:", typeof list);
//       return [];
//     }
    
//     console.log("📦 Processing", list.length, "companies");
    
//     return list.map((company, index) => {
//       if (!company || typeof company !== 'object') {
//         console.warn(`⚠️ Invalid company at index ${index}`);
//         return null;
//       }

//       if (index === 0) {
//         console.log("🔍 RAW DATA (first company):", {
//           name: company.company_name,
//           hasProtection: !!company.protection,
//           protection: company.protection,
//           hasMaterial: !!company.material,
//           material: company.material,
//           hasFurniture: !!company.furniture,
//           furniture: company.furniture,
//           hasAppliances: !!company.appliances,
//           appliances: company.appliances,
//           hasIncludes: !!company.includes,
//           includes: company.includes
//         });
//       }

//       const pricing = company.exact_pricing || {};
//       const breakdown = pricing.breakdown || {};

//       const processed = {
//         name: company.company_name || company.name || 'Unknown Company',
//         phone: company.phone || '',
//         address: company.address || '',
//         location: company.location || '',
//         subscription_plan: company.subscription_plan || company.subscription_info?.plan || 'Free',
//         total_carrying_capacity: company.total_carrying_capacity || 0,
//         logo: company.company_gallery?.[0] || FALLBACK_LOGO,
//         final_total: pricing.final_total || 0,
//         packing_cost: breakdown.packing || 0,
//         dismantling_cost: breakdown.dismantling || 0,
//         reassembly_cost: breakdown.reassembly || 0,
//         loading_cost: breakdown.loading || 0,
//         mileage_cost: breakdown.mileage || 0,
//         date_adjustment: breakdown.date_adjustment || 0,
        
//         original: {
//           includes: Array.isArray(company.includes) ? company.includes : [],
//           protection: Array.isArray(company.protection) ? company.protection : [],
//           material: Array.isArray(company.material) ? company.material : [],
//           furniture: Array.isArray(company.furniture) ? company.furniture : [],
//           appliances: Array.isArray(company.appliances) ? company.appliances : [],
//           areas_covered: Array.isArray(company.areas_covered) ? company.areas_covered : [],
//           description: company.description || '',
//         },
        
//         gallery: company.company_gallery?.length 
//           ? company.company_gallery.map(resolveImage) 
//           : [FALLBACK_IMAGE],
//         distanceMiles: distanceMilesExact ? `${distanceMilesExact} miles` : "N/A",
//         distanceText: "From Collection Address",
//       };

//       if (index === 0) {
//         console.log("✅ PROCESSED DATA (first company):", {
//           name: processed.name,
//           'original.includes': processed.original.includes,
//           'original.protection': processed.original.protection,
//           'original.material': processed.original.material,
//           'original.furniture': processed.original.furniture,
//           'original.appliances': processed.original.appliances,
//         });
//       }

//       return processed;
//     }).filter(Boolean);
//   };

//   useEffect(() => {
//     const loadData = () => {
//       try {
//         console.log("🚀 useEffect running - Loading data...");
//         let dataToProcess = apiProviders;
        
//         console.log("📥 Data from state:", {
//           length: dataToProcess?.length || 0,
//           firstCompanyName: dataToProcess?.[0]?.company_name,
//           firstCompanyProtection: dataToProcess?.[0]?.protection,
//           firstCompanyMaterial: dataToProcess?.[0]?.material
//         });
        
//         if (!dataToProcess || dataToProcess.length === 0) {
//           const savedData = localStorage.getItem('filteredProviders');
//           if (savedData) {
//             const parsed = JSON.parse(savedData);
//             dataToProcess = parsed.providers || [];
//             console.log("✅ Loaded from localStorage:", dataToProcess.length);
//           }
//         }
        
//         if (dataToProcess && dataToProcess.length > 0) {
//           const processed = processCompanies(dataToProcess);
//           console.log("✅ Setting state with", processed.length, "companies");
//           setCompanies(processed);
//         } else {
//           console.log("⚠️ No data to process");
//           setCompanies([]);
//         }
        
//         setLoading(false);
//       } catch (e) {
//         console.error("❌ Error loading data:", e);
//         setCompanies([]);
//         setLoading(false);
//       }
//     };
//     loadData();
//   }, []);

//   const handleSort = () => {
//     const sorted = [...companies].sort((a, b) =>
//       sortOrder === "low-to-high" ? a.final_total - b.final_total : b.final_total - a.final_total
//     );
//     setCompanies(sorted);
//     setSortOrder(sortOrder === "low-to-high" ? "high-to-low" : "low-to-high");
//   };

//   if (loading) {
//     return (
//       <div className="p-10 text-center">
//         <div className="text-lg text-pink-600 mb-4">Loading providers...</div>
//         <div className="text-sm text-gray-500">Processing {apiProviders?.length || 0} companies</div>
//       </div>
//     );
//   }

//   if (!loading && companies.length === 0) {
//     return (
//       <div className="p-10 text-center">
//         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
//           <h2 className="text-xl font-bold text-yellow-800 mb-3">No Providers Data</h2>
//           <p className="text-yellow-700 mb-4">We couldn't find any provider data.</p>
//           <div className="flex gap-3 justify-center">
//             <button onClick={() => navigate(-1)} className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
//               Go Back & Try Again
//             </button>
//             <button
//               onClick={() => { localStorage.removeItem('filteredProviders'); window.location.reload(); }}
//               className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
//             >
//               Clear Cache & Reload
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <section className="bg-[#fffefe] min-h-screen pt-6 pb-20">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
//           <div>
//             <h1 className="text-[26px] sm:text-[30px] lg:text-[34px] font-extrabold text-pink-600">
//               Filter Removal Providers
//             </h1>
//             <p className="text-gray-600 text-sm mt-1">
//               From <b>{pickupPincode}</b> to <b>{dropoffPincode}</b>
//             </p>
//             {totalVolume > 0 && (
//               <p className="text-gray-600 text-sm mt-1">
//                 Estimated Volume: <b>{totalVolume} cubic feet</b>
//               </p>
//             )}
//           </div>
//           <div className="flex flex-col sm:flex-row items-center gap-3">
//             <div className="bg-pink-50 text-pink-700 px-3 py-2 rounded-lg text-sm font-medium">
//               <span className="font-bold">{companies.length}</span> companies found
//             </div>
//             <button onClick={handleSort} className="flex items-center gap-2 px-4 py-2 rounded-full border border-pink-500 bg-white text-pink-600 text-sm font-semibold hover:bg-pink-50 transition">
//               {sortOrder === "low-to-high" ? "Price (Low to High)" : "Price (High to Low)"}
//               <ChevronDown className="h-4 w-4" />
//             </button>
//           </div>
//         </div>

//         {companies.map((p, index) => (
//           <div key={index} className="bg-white rounded-xl shadow-md mt-6 border border-gray-200">
//             <div className="px-4 sm:px-6 pt-6 pb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
//               <div className="w-full lg:w-[24%] flex items-center gap-4">
//                 <img src={p.logo} className="w-16 h-16 rounded-md object-cover border" alt={p.name} />
//                 <div>
//                   <p className="text-[18px] font-semibold">{p.name}</p>
//                   <div className="flex items-center gap-1 mt-1">
//                     {[1,2,3,4,5].map((star) => (
//                       <Star key={star} className={`h-4 w-4 ${star <= Math.round(ratings[p.name]?.avg || 0) ? "text-yellow-400" : "text-gray-300"}`}
//                         fill={star <= Math.round(ratings[p.name]?.avg || 0) ? "#facc15" : "none"} />
//                     ))}
//                     <span className="ml-2 text-sm text-gray-600">({ratings[p.name]?.total || 0} reviews)</span>
//                   </div>
//                   <div className="flex items-center gap-1 mt-1">
//                     <MapPin className="h-3 w-3 text-gray-400" />
//                     <span className="text-[12px] font-semibold text-pink-600">{p.distanceMiles}</span>
//                     <span className="text-[12px] text-gray-500">{p.distanceText}</span>
//                   </div>
//                   {/* {p.phone && <p className="text-[12px] mt-1 text-gray-600">📞 {p.phone}</p>} */}
//                 </div>
//               </div>
//               <div className="w-full lg:w-[13%] text-center">
//                 <div className="text-pink-600 font-bold text-[20px]">£{p.final_total.toFixed(2)}</div>
//                 <div className="text-[11px] text-gray-500 mt-1">All inclusive</div>
//                 {/* <div className="text-[11px] text-gray-500">Capacity: {p.total_carrying_capacity} m³</div> */}
//               </div>
//               <div className="w-full lg:w-[11%] text-center">
//                 <div className="text-[16px] font-semibold">£{p.packing_cost.toFixed(2)}</div>
//                 <div className="text-[11px] text-gray-500 mt-1">Packing</div>
//               </div>
//               <div className="w-full lg:w-[13%] text-center">
//                 <div className="text-[16px] font-semibold">£{p.dismantling_cost.toFixed(2)}</div>
//                 <div className="text-[11px] text-gray-500 mt-1">Dismantling</div>
//               </div>
//               <div className="w-full lg:w-[13%] text-center">
//                 <div className="text-[16px] font-semibold">£{p.reassembly_cost.toFixed(2)}</div>
//                 <div className="text-[11px] text-gray-500 mt-1">Reassembly</div>
//               </div>
//               <div className="w-full lg:w-[18%] flex justify-center lg:justify-end">
//                 <button
//                   onClick={() => navigate("/book-service", {
//                     state: {
//                       user_details, full_name: user_details.full_name, email: user_details.email, phone: user_details.phone,
//                       company_name: p.name, provider: p.original, company_logo: p.logo,
//                       company_phone: p.phone, company_address: p.address,
//                       pickup_address: pricingForm?.pickup_address, pickup_city: pricingForm?.pickup_city,
//                       delivery_address: pricingForm?.delivery_address, delivery_city: pricingForm?.delivery_city,
//                       pickupPincode, dropoffPincode, property_type: serviceType, property_size: propertySize,
//                       quantity, additional_spaces: additionalSpaces, move_day: moveDay, notice_period: noticePeriod,
//                       collection_time: collectionTime, selected_items: selectedItems, dismantle_items: dismantleItems,
//                       collection_parking_distance: collectionParking, collection_internal_access: collectionAccess,
//                       delivery_parking_distance: deliveryParking, delivery_internal_access: deliveryAccess,
//                       distanceMiles: distanceMilesExact, distanceKm, finalTotal: p.final_total,
//                       packingCost: p.packing_cost, dismantlingCost: p.dismantling_cost, reassemblyCost: p.reassembly_cost,
//                       loadingCost: p.loading_cost, mileageCost: p.mileage_cost, dateAdjustment: p.date_adjustment,
//                       total_volume: totalVolume,
//                     }
//                   })}
//                   className="px-7 py-2 bg-pink-600 text-white font-semibold rounded-full shadow hover:bg-pink-700 transition w-full lg:w-auto"
//                 >
//                   Book Service
//                 </button>
//               </div>
//             </div>
//             <div className="mt-2 pt-3">
//               <button onClick={() => toggleGallery("inc-" + index)}
//                 className="w-full flex items-center justify-between bg-pink-600 text-white px-5 py-3 rounded-xl font-semibold">
//                 <span className="text-[15px]">What's Included?</span>
//                 <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${openGallery["inc-" + index] ? "rotate-180" : ""}`} />
//               </button>
//               {openGallery["inc-" + index] && (
//                 <div className="bg-white p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 border border-gray-200 rounded-xl mt-3">
//                   <RenderList title="Includes" list={p.original.includes} />
//                   <RenderList title="Protection" list={p.original.protection} />
//                   <RenderList title="Materials" list={p.original.material} />
//                   <RenderList title="Furniture" list={p.original.furniture} />
//                   <RenderList title="Appliances" list={p.original.appliances} />
//                   <div>
//                     <h4 className="font-bold text-pink-600 text-[15px] mb-2">Summary:</h4>
//                     <p className="text-gray-700 text-[14px] leading-relaxed">
//                       {p.original.description || "Professional moving services with competitive pricing."}
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//             <div className="px-4 sm:px-6 py-4">
//               <button onClick={() => toggleGallery(index)} className="flex items-center gap-2 text-pink-600 font-semibold hover:underline">
//                 <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                 </svg>
//                 Gallery ({p.gallery.length} images)
//               </button>
//               {openGallery[index] && (
//                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
//                   {p.gallery.map((img, i) => (
//                     <img key={i} src={img} alt={`Gallery ${i + 1}`} className="rounded-lg border object-cover w-full h-28"
//                       onError={(e) => { e.target.src = FALLBACK_IMAGE; }} />
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default FilteredProvidersPage;