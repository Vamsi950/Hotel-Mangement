import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Home() {
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState('');
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uniqueLocations, setUniqueLocations] = useState([]);

  useEffect(() => {
    // Fetch featured hotels from backend database
    api.get('/hotels')
      .then((res) => {
        // Take the first 3
        setFeaturedHotels(res.data.slice(0, 3));
        // Extract unique locations dynamically
        const locations = [...new Set(res.data.map(h => h.location))].filter(Boolean);
        setUniqueLocations(locations);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      navigate(`/hotels?location=${encodeURIComponent(searchLocation.trim())}`);
    } else {
      navigate('/hotels');
    }
  };

  const handleQuickLocation = (loc) => {
    navigate(`/hotels?location=${encodeURIComponent(loc)}`);
  };

  return (
    <div className="w-full pb-xl">
      {/* 1. Hero Banner Section */}
      <section className="relative h-[680px] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Overwater villa resort in Maldives during sunset" 
            className="w-full h-full object-cover" 
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1600"
          />
          <div className="absolute inset-0 hero-gradient"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-container-max px-lg text-center">
          <h1 className="font-display-lg text-display-lg text-white mb-md drop-shadow-md">
            Elegance in Every Destination
          </h1>
          <p className="font-body-lg text-body-lg text-white/95 mb-lg max-w-2xl mx-auto drop-shadow-sm">
            Experience curated luxury stays and institutional reliability in the world's most sought-after locations.
          </p>

          {/* Premium Search Bar */}
          <form onSubmit={handleSearchSubmit} className="bg-white p-sm rounded-xl shadow-[0px_12px_32px_rgba(15,23,42,0.12)] max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-xs">
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-xs">
              <div className="flex items-center gap-sm px-md py-base border-r border-outline-variant/30 text-left">
                <span className="material-symbols-outlined text-outline">location_on</span>
                <div className="flex flex-col flex-grow">
                  <span className="font-label-uppercase text-label-uppercase text-outline">Location</span>
                  <input 
                    className="bg-transparent border-none p-0 focus:ring-0 text-primary font-bold placeholder:text-outline/50 w-full text-body-md" 
                    placeholder="Where to? (e.g. New York, Miami, Aspen)" 
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-sm px-md py-base text-left">
                <span className="material-symbols-outlined text-outline">calendar_today</span>
                <div className="flex flex-col">
                  <span className="font-label-uppercase text-label-uppercase text-outline">Popular Search Filters</span>
                  <span className="text-primary font-bold text-body-md select-none">Handcrafted Properties</span>
                </div>
              </div>
            </div>
            
            <button type="submit" className="bg-[#FF7A00] hover:brightness-95 text-white font-bold px-lg py-md rounded-lg flex items-center gap-base transition-all active:scale-95 w-full md:w-auto justify-center select-none">
              <span className="material-symbols-outlined">search</span>
              Explore Stays
            </button>
          </form>

          {/* Popular shortcuts */}
          <div className="flex items-center justify-center gap-sm mt-md flex-wrap">
            <span className="text-white/80 font-bold text-body-sm mr-xs">Popular:</span>
            {uniqueLocations.length > 0 ? (
              uniqueLocations.slice(0, 4).map((loc) => (
                <button 
                  key={loc}
                  onClick={() => handleQuickLocation(loc)} 
                  className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-md py-xs rounded-full text-label-uppercase font-label-uppercase transition-all select-none"
                >
                  {loc}
                </button>
              ))
            ) : (
              <>
                <button onClick={() => handleQuickLocation('New York')} className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-md py-xs rounded-full text-label-uppercase font-label-uppercase transition-all select-none">New York</button>
                <button onClick={() => handleQuickLocation('Miami')} className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-md py-xs rounded-full text-label-uppercase font-label-uppercase transition-all select-none">Miami</button>
                <button onClick={() => handleQuickLocation('Aspen')} className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-md py-xs rounded-full text-label-uppercase font-label-uppercase transition-all select-none">Aspen</button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 2. Bento Grid Curated Luxury Categories */}
      <section className="py-xl px-lg max-w-container-max mx-auto">
        <div className="flex justify-between items-end mb-lg">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary mb-xs">Featured Destinations</h2>
            <p className="font-body-md text-body-md text-secondary">Discover the pinnacle of professional hospitality.</p>
          </div>
          <button onClick={() => navigate('/hotels')} className="text-primary font-bold hover:underline flex items-center gap-xs select-none">
            Explore all <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter h-[520px]">
          <div 
            onClick={() => handleQuickLocation(uniqueLocations[0] || 'New York')}
            className="md:col-span-8 group relative overflow-hidden rounded-xl cursor-pointer shadow-[0px_4px_20px_rgba(26,54,93,0.05)]"
          >
            <img 
              alt="Tokyo boutique hotel lobby" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              src="https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=1200&q=80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-lg text-white">
              <span className="bg-primary-fixed/20 backdrop-blur-md px-md py-xs rounded-full text-label-uppercase font-label-uppercase mb-base inline-block">Urban Sanctuary</span>
              <h3 className="font-headline-md text-headline-md font-bold">{(uniqueLocations[0] || 'New York')} Suites</h3>
              <p className="font-body-md text-body-md text-white/80">Experience Zen-like luxury in the heart of Shibuya & Manhattan.</p>
            </div>
          </div>
          
          <div className="md:col-span-4 flex flex-col gap-gutter">
            <div 
              onClick={() => handleQuickLocation(uniqueLocations[1] || 'Aspen')}
              className="h-1/2 group relative overflow-hidden rounded-xl cursor-pointer shadow-[0px_4px_20px_rgba(26,54,93,0.05)]"
            >
              <img 
                alt="Swiss chalet" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                src="https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-md text-white">
                <h3 className="font-headline-sm text-headline-sm font-bold">{(uniqueLocations[1] || 'Aspen')} Lodge</h3>
              </div>
            </div>
            
            <div 
              onClick={() => handleQuickLocation(uniqueLocations[2] || 'Miami')}
              className="h-1/2 group relative overflow-hidden rounded-xl cursor-pointer shadow-[0px_4px_20px_rgba(26,54,93,0.05)]"
            >
              <img 
                alt="Tuscany retreat pool" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-md text-white">
                <h3 className="font-headline-sm text-headline-sm font-bold">{(uniqueLocations[2] || 'Miami')} Oasis</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Dynamic Database Featured Hotels Section */}
      <section className="py-xl bg-surface-container-lowest border-y border-outline-variant/10">
        <div className="max-w-container-max mx-auto px-lg">
          <div className="text-center mb-lg">
            <h2 className="font-headline-md text-headline-md text-primary">Dynamic Stays Listings</h2>
            <p className="font-body-md text-body-md text-secondary">Manually vetted properties available directly for bookings.</p>
          </div>

          {loading ? (
            <div className="text-center py-lg flex flex-col items-center">
              <div className="spinner border-3 border-outline-variant border-l-primary w-10 h-10 rounded-full animate-spin mb-sm"></div>
              <p className="text-secondary">Retrieving luxury retreats...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              {featuredHotels.map((hotel) => (
                <div 
                  key={hotel.id} 
                  className="bg-white rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(26,54,93,0.05)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  onClick={() => navigate(`/hotels/${hotel.id}`)}
                >
                  <div className="h-56 relative overflow-hidden group">
                    <img 
                      alt={hotel.hotelName} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      src={hotel.image} 
                    />
                    <div className="absolute bottom-md left-md bg-black/60 backdrop-blur-md border border-white/10 px-md py-xs rounded-full text-label-uppercase font-label-uppercase text-white flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {hotel.location}
                    </div>
                  </div>
                  
                  <div className="p-md flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-primary mb-sm">{hotel.hotelName}</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mb-md line-clamp-3">
                        {hotel.description}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center pt-md border-t border-outline-variant/30">
                      <span className="font-label-uppercase text-label-uppercase text-secondary font-bold">Standard Amenities Included</span>
                      <button className="text-[#FF7A00] font-extrabold flex items-center gap-xs hover:gap-sm transition-all select-none">
                        View Rooms <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Seasonal Offers Section */}
      <section className="bg-surface-container-low py-xl overflow-hidden">
        <div className="max-w-container-max mx-auto px-lg">
          <div className="text-center mb-lg">
            <h2 className="font-headline-md text-headline-md text-primary">Seasonal Promotional Coupons</h2>
            <p className="font-body-md text-body-md text-secondary">Unforgettable experiences with exclusive corporate modernism standards.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {/* Offer Card 1 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(26,54,93,0.05)] hover:-translate-y-1 transition-transform">
              <div className="h-48 relative">
                <img 
                  alt="Mediterranean suite" 
                  className="w-full h-full object-cover" 
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800"
                />
                <div className="absolute top-md right-md bg-tertiary-fixed text-tertiary px-md py-xs rounded-full font-label-uppercase text-label-uppercase">
                  10% OFF
                </div>
              </div>
              <div className="p-md">
                <div className="flex items-center gap-xs text-secondary mb-xs">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  <span className="font-label-uppercase text-label-uppercase">WELCOME10 Coupon</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-sm">Mediterranean Summer Escape</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">Enjoy 10% off your introductory stay across select resort suites worldwide.</p>
                <div className="flex justify-between items-center">
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">$420<span class="text-body-sm font-normal text-secondary">/night</span></span>
                  <button onClick={() => navigate('/hotels')} className="text-primary font-bold flex items-center gap-xs hover:gap-sm transition-all select-none">
                    Book Now <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Offer Card 2 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(26,54,93,0.05)] hover:-translate-y-1 transition-transform">
              <div className="h-48 relative">
                <img 
                  alt="Nordic wellness spa" 
                  className="w-full h-full object-cover" 
                  src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800"
                />
                <div className="absolute top-md right-md bg-tertiary-fixed text-tertiary px-md py-xs rounded-full font-label-uppercase text-label-uppercase">
                  25% OFF
                </div>
              </div>
              <div className="p-md">
                <div className="flex items-center gap-xs text-secondary mb-xs">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  <span className="font-label-uppercase text-label-uppercase">SUMMER25 Coupon</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-sm">Summer Getaway Special</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">Unlock a gorgeous 25% discount on beachfront oasis suites using standard discount codes.</p>
                <div className="flex justify-between items-center">
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">$380<span class="text-body-sm font-normal text-secondary">/night</span></span>
                  <button onClick={() => navigate('/hotels')} className="text-primary font-bold flex items-center gap-xs hover:gap-sm transition-all select-none">
                    Book Now <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Offer Card 3 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(26,54,93,0.05)] hover:-translate-y-1 transition-transform">
              <div className="h-48 relative">
                <img 
                  alt="Executive lounge in Dubai" 
                  className="w-full h-full object-cover" 
                  src="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800"
                />
                <div className="absolute top-md right-md bg-tertiary-fixed text-tertiary px-md py-xs rounded-full font-label-uppercase text-label-uppercase">
                  CLUB ACCESS
                </div>
              </div>
              <div className="p-md">
                <div className="flex items-center gap-xs text-secondary mb-xs">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  <span className="font-label-uppercase text-label-uppercase">Premium Stays</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-sm">Elite Business Package</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">Upgrade your corporate stays with dedicated executive workspace lounge access details.</p>
                <div className="flex justify-between items-center">
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">$550<span class="text-body-sm font-normal text-secondary">/night</span></span>
                  <button onClick={() => navigate('/hotels')} className="text-primary font-bold flex items-center gap-xs hover:gap-sm transition-all select-none">
                    Book Now <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Trust Badges / Verification Section */}
      <section className="py-xl max-w-container-max mx-auto px-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg text-center">
          <div className="flex flex-col items-center">
            <span className="material-symbols-outlined text-primary text-4xl mb-base">verified</span>
            <h4 className="font-headline-sm text-headline-sm text-primary mb-xs">Verified Stays</h4>
            <p className="font-body-sm text-body-sm text-secondary">100% manually vetted premium properties worldwide.</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="material-symbols-outlined text-primary text-4xl mb-base">support_agent</span>
            <h4 className="font-headline-sm text-headline-sm text-primary mb-xs">24/7 Concierge</h4>
            <p className="font-body-sm text-body-sm text-secondary">Round-the-clock dedicated travel support.</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="material-symbols-outlined text-primary text-4xl mb-base">payments</span>
            <h4 className="font-headline-sm text-headline-sm text-primary mb-xs">Secure Booking</h4>
            <p className="font-body-sm text-body-sm text-secondary">Institutional-grade security for every transaction.</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="material-symbols-outlined text-primary text-4xl mb-base">loyalty</span>
            <h4 className="font-headline-sm text-headline-sm text-primary mb-xs">LuxeRewards</h4>
            <p className="font-body-sm text-body-sm text-secondary">Earn points for every stay towards elite experiences.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
