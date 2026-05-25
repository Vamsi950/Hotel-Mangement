import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMyBookings();
    fetchCoupons();
  }, [user]);

  const fetchMyBookings = async () => {
    try {
      const res = await api.get('/bookings/my-bookings');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch booking history.');
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      // Filter for active coupons
      const activeCoupons = res.data.filter(c => c.active);
      setCoupons(activeCoupons);
    } catch (err) {
      console.error('Failed to fetch coupons', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (bookingId) => {
    if (!window.confirm('Are you absolutely sure you want to cancel this booking? This will immediately release the room.')) {
      return;
    }
    setCancellingId(bookingId);
    try {
      await api.post(`/bookings/cancel/${bookingId}`);
      // Refresh list locally
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, bookingStatus: 'CANCELLED' } : b));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel reservation.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleRebook = (hotelId) => {
    navigate(`/hotels/${hotelId}`);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="text-center py-20 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary-fixed border-t-primary rounded-full animate-spin mb-sm"></div>
        <p className="text-secondary font-bold">Retrieving your portfolio...</p>
      </div>
    );
  }

  // Split into active and past/cancelled bookings
  const today = new Date().toISOString().split('T')[0];
  
  const activeBookings = bookings.filter(b => 
    b.bookingStatus !== 'CANCELLED' && 
    new Date(b.checkOut) >= new Date(today)
  );
  
  const pastBookings = bookings.filter(b => 
    b.bookingStatus === 'CANCELLED' || 
    new Date(b.checkOut) < new Date(today)
  );

  return (
    <div className="max-w-7xl mx-auto px-md py-lg min-h-screen bg-background">
      
      {/* 1. Profile Header Card */}
      <section className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant/30 shadow-[0_4px_20px_rgba(26,54,93,0.03)] flex flex-col md:flex-row items-center gap-md mb-lg hover:shadow-[0_8px_30px_rgba(26,54,93,0.06)] transition-all duration-300">
        <div className="w-20 h-20 bg-primary-container text-on-primary-container font-headline-md text-display-lg rounded-full flex items-center justify-center font-black border-2 border-primary-fixed shadow-sm">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="text-center md:text-left flex-grow">
          <h2 className="font-headline-md text-headline-md text-primary font-black">{user?.name}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center justify-center md:justify-start gap-xs mt-xs">
            <span className="material-symbols-outlined text-[18px]">mail</span> {user?.email}
          </p>
          <div className="mt-sm flex justify-center md:justify-start gap-sm">
            <span className="px-sm py-1 bg-primary-fixed text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
              {user?.role} Account
            </span>
            <span className="px-sm py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full uppercase tracking-wider">
              Level 1 Member
            </span>
          </div>
        </div>
      </section>

      {/* 2. Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg items-start">
        
        {/* Left Side: Stays Log (2 cols) */}
        <div className="lg:col-span-2 space-y-lg">
          
          <div>
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold border-b border-outline-variant/20 pb-sm mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-[24px]">hotel</span> Active LuxeStay Stays
            </h3>
            
            {error && (
              <div className="bg-error-container text-on-error-container font-body-sm text-body-sm p-sm rounded-lg mb-md">
                ⚠️ {error}
              </div>
            )}

            {bookings.length === 0 ? (
              <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant/30 text-center py-12 flex flex-col items-center gap-md">
                <span className="material-symbols-outlined text-outline text-[48px]">calendar_today</span>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-primary font-bold">No bookings made yet</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                    Your luxury stays and reservation history will appear here once booked.
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/hotels')} 
                  className="px-md py-sm bg-primary text-white hover:brightness-110 font-bold text-body-sm rounded-lg active:scale-95 transition-all mt-xs"
                >
                  Book Your First Stay
                </button>
              </div>
            ) : (
              <div className="space-y-md">
                {activeBookings.length === 0 ? (
                  <p className="text-on-surface-variant italic font-body-sm text-body-sm bg-surface-container-lowest p-md rounded-xl border border-outline-variant/25">
                    No upcoming active stays scheduled.
                  </p>
                ) : (
                  activeBookings.map((b) => (
                    <div key={b.id} className="bg-surface-container-lowest p-md rounded-xl shadow-[0px_4px_20px_rgba(26,54,93,0.03)] border border-outline-variant/30 flex flex-col gap-sm hover:shadow-[0px_8px_30px_rgba(26,54,93,0.06)] transition-all duration-300 animate-fade-in">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-headline-sm text-[18px] text-primary font-bold">{b.room?.hotel?.hotelName || 'LuxeStay Hotel'}</h5>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">{b.room?.roomType || ''}</p>
                        </div>
                        <span className={`px-sm py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.bookingStatus === 'CONFIRMED' 
                            ? 'bg-primary-fixed text-primary' 
                            : 'bg-tertiary-fixed text-on-tertiary-fixed'
                        }`}>
                          {b.bookingStatus}
                        </span>
                      </div>
                      
                      <div className="bg-surface-container-low/50 rounded-lg p-sm border border-outline-variant/30 flex flex-col gap-xs font-body-sm text-body-sm text-on-surface-variant mt-sm">
                        <div className="flex justify-between"><span className="font-semibold text-primary">📍 Location:</span> <span>{b.room?.hotel?.location || ''}</span></div>
                        <div className="flex justify-between"><span className="font-semibold text-primary">📅 Check-in:</span> <span>{b.checkIn}</span></div>
                        <div className="flex justify-between"><span className="font-semibold text-primary">📅 Check-out:</span> <span>{b.checkOut}</span></div>
                        <div className="flex justify-between border-t border-outline-variant/20 pt-xs mt-xs text-primary font-bold text-body-md"><span className="font-bold">Total Paid Amount:</span> <span>${b.totalPrice?.toFixed(2)}</span></div>
                      </div>
                      
                      <div className="mt-md flex justify-end">
                        <button 
                          onClick={() => handleCancelReservation(b.id)}
                          disabled={cancellingId === b.id}
                          className="px-md py-sm bg-error-container text-on-error-container hover:bg-error-container/80 transition-all font-bold text-body-sm rounded-lg border border-transparent disabled:opacity-50 disabled:pointer-events-none active:scale-95"
                        >
                          {cancellingId === b.id ? 'Releasing Room...' : 'Cancel Stay'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Past Bookings */}
          {bookings.length > 0 && (
            <div>
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold border-b border-outline-variant/20 pb-sm mb-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-[24px]">history</span> Stay History
              </h3>
              <div className="space-y-md">
                {pastBookings.length === 0 ? (
                  <p className="text-on-surface-variant italic font-body-sm text-body-sm bg-surface-container-lowest p-md rounded-xl border border-outline-variant/25">
                    No historical stays or cancellations recorded.
                  </p>
                ) : (
                  pastBookings.map((b) => (
                    <div key={b.id} className="bg-surface-container-lowest p-md rounded-xl shadow-[0px_4px_20px_rgba(26,54,93,0.02)] border border-outline-variant/30 flex flex-col gap-sm opacity-80 hover:opacity-100 transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-headline-sm text-[18px] text-primary font-bold">{b.room?.hotel?.hotelName || 'LuxeStay Hotel'}</h5>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">{b.room?.roomType || ''}</p>
                        </div>
                        <span className={`px-sm py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.bookingStatus === 'CANCELLED' 
                            ? 'bg-error-container text-on-error-container' 
                            : 'bg-secondary-container text-on-secondary-container'
                        }`}>
                          {b.bookingStatus === 'CANCELLED' ? 'Cancelled' : 'Completed'}
                        </span>
                      </div>
                      
                      <div className="bg-surface-container-low/30 rounded-lg p-sm border border-outline-variant/10 flex flex-col gap-xs font-body-sm text-body-sm text-on-surface-variant mt-sm">
                        <div className="flex justify-between"><span>📅 Check-in:</span> <span>{b.checkIn}</span></div>
                        <div className="flex justify-between"><span>📅 Check-out:</span> <span>{b.checkOut}</span></div>
                        <div className="flex justify-between border-t border-outline-variant/10 pt-xs mt-xs text-primary font-bold text-body-md"><span>Total Price:</span> <span>${b.totalPrice?.toFixed(2)}</span></div>
                      </div>
                      
                      <div className="mt-md flex justify-end">
                        <button 
                          onClick={() => handleRebook(b.room?.hotel?.id)}
                          className="px-md py-sm bg-primary text-white hover:brightness-110 transition-all font-bold text-body-sm rounded-lg active:scale-95"
                        >
                          Rebook Stay
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Coupons & Specials (1 col) */}
        <div className="lg:col-span-1 space-y-md">
          <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant/30 shadow-[0_4px_20px_rgba(26,54,93,0.03)] flex flex-col gap-md">
            <div>
              <span className="text-[10px] bg-tertiary-fixed text-on-tertiary-fixed font-bold px-sm py-1 rounded-full uppercase tracking-wider">
                Member Rewards
              </span>
              <h3 className="font-headline-sm text-headline-sm text-primary font-black mt-sm">
                Active Promotions
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                Unlock exclusive LuxeStay discounts on your next escape by applying these coupons during booking checkout.
              </p>
            </div>

            <div className="space-y-md">
              {coupons.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-outline-variant/60 rounded-xl bg-surface-container-low/20">
                  <span className="material-symbols-outlined text-[32px] text-outline">redeem</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs italic">
                    No active discount coupons available right now. Check back soon!
                  </p>
                </div>
              ) : (
                coupons.map((coupon) => (
                  <div 
                    key={coupon.id} 
                    className="relative bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-xl p-md flex flex-col justify-between hover:border-primary transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
                  >
                    <div className="flex justify-between items-start mb-sm">
                      <div>
                        <span className="text-[10px] font-bold text-[#FF7A00] tracking-wider uppercase bg-[#FF7A00]/10 px-sm py-1 rounded-full">
                          {coupon.discountPercentage}% OFF
                        </span>
                        <h5 className="font-headline-sm text-headline-sm text-primary font-bold mt-sm tracking-tight">{coupon.couponCode}</h5>
                      </div>
                      <span className="material-symbols-outlined text-outline">loyalty</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-md leading-snug">
                      Apply this discount code during check out to receive {coupon.discountPercentage}% off your complete stay fee.
                    </p>
                    <button 
                      onClick={() => handleCopyCode(coupon.couponCode)}
                      className={`w-full py-sm font-label-uppercase text-label-uppercase font-bold rounded-lg transition-all flex items-center justify-center gap-xs active:scale-95 border ${
                        copiedCode === coupon.couponCode 
                          ? 'bg-primary text-white border-primary shadow-sm' 
                          : 'bg-surface-container-low text-primary border-outline-variant hover:bg-surface-container-high'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {copiedCode === coupon.couponCode ? 'check_circle' : 'content_copy'}
                      </span>
                      {copiedCode === coupon.couponCode ? 'Copied Coupon!' : 'Copy Discount Code'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
