import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected room state for sticky summary sidebar
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Review form states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    fetchHotelDetails();
  }, [id]);

  const fetchHotelDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const hotelRes = await api.get(`/hotels/${id}`);
      setHotel(hotelRes.data);

      const roomsRes = await api.get(`/rooms/hotel/${id}`);
      setRooms(roomsRes.data);
      // Default select the first available room if present
      if (roomsRes.data.length > 0) {
        const available = roomsRes.data.find(r => r.availability);
        setSelectedRoom(available || roomsRes.data[0]);
      }

      const reviewsRes = await api.get(`/reviews/hotel/${id}`);
      setReviews(reviewsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load hotel details.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoom = (roomId) => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(`/hotels/${id}`));
    } else {
      navigate(`/checkout?roomId=${roomId}`);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await api.post(`/reviews/hotel/${id}`, {
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewSuccess('Review posted successfully!');
      setReviewComment('');
      setReviewRating(5);
      
      // Update reviews list locally
      setReviews([res.data, ...reviews]);
      
      setTimeout(() => setReviewSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 flex flex-col items-center justify-center min-h-[400px]">
        <div className="spinner border-3 border-outline-variant border-l-primary w-10 h-10 rounded-full animate-spin mb-sm"></div>
        <p className="text-secondary font-bold">Loading paradise details...</p>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="max-w-container-max mx-auto px-lg py-20 text-center flex flex-col items-center justify-center">
        <h3 className="font-headline-md text-headline-md text-primary mb-sm">Hotel Not Found</h3>
        <p className="text-secondary font-body-md mb-md">{error || 'The requested hotel does not exist.'}</p>
        <button onClick={() => navigate('/hotels')} className="bg-primary hover:brightness-110 text-white font-bold px-lg py-md rounded-lg transition-all select-none">
          Back to Hotels
        </button>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : '4.8';

  return (
    <div className="pt-6 pb-xl px-md lg:px-lg max-w-container-max mx-auto">
      {/* 1. Breadcrumbs & Header */}
      <section className="mb-md">
        <div className="flex items-center gap-xs text-secondary mb-base font-body-sm text-body-sm">
          <span>Destinations</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span>Curated Lodgings</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary font-semibold">{hotel.hotelName}</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div>
            <h1 className="font-display-lg text-display-lg text-primary mb-xs">{hotel.hotelName}</h1>
            <div className="flex items-center gap-sm">
              <div className="flex text-tertiary-fixed-dim select-none">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-[#eab308]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <span className="text-secondary font-body-sm text-body-sm">📍 {hotel.location}</span>
            </div>
          </div>
          
          <div className="flex gap-sm select-none">
            <button className="p-base rounded-full border border-outline-variant hover:bg-surface-container transition-all active:scale-95">
              <span className="material-symbols-outlined text-primary">share</span>
            </button>
            <button className="p-base rounded-full border border-outline-variant hover:bg-surface-container transition-all active:scale-95">
              <span className="material-symbols-outlined text-primary">favorite</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Image Gallery Grid */}
      <section className="mb-lg">
        <div className="gallery-grid rounded-xl overflow-hidden shadow-lg select-none">
          <div className="relative group cursor-pointer overflow-hidden row-span-2">
            <img 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              alt="Main hotel view" 
              src={hotel.image} 
            />
          </div>
          <div className="relative group cursor-pointer overflow-hidden">
            <img 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              alt="Luxe interior" 
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800" 
            />
          </div>
          <div className="relative group cursor-pointer overflow-hidden">
            <img 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              alt="Resort pool deck" 
              src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800" 
            />
          </div>
        </div>
      </section>

      {/* 3. Main Split Content & Sticky Sidebar */}
      <div className="flex flex-col lg:flex-row gap-lg">
        {/* Left Side: Details & Room Lists */}
        <div className="lg:w-2/3 flex flex-col gap-lg">
          
          {/* About/Description Panel */}
          <article className="bg-surface-container-lowest p-md lg:p-lg rounded-xl shadow-[0px_4px_20px_rgba(26,54,93,0.05)] border border-outline-variant/10">
            <h2 className="font-headline-md text-headline-md text-primary mb-md">About this retreat</h2>
            <p className="text-on-surface-variant font-body-lg text-body-lg leading-relaxed mb-md">
              {hotel.description}
            </p>
            <p className="text-on-surface-variant font-body-md text-body-md">
              Elevating the standard of leisure hospitality, our properties combine architectural beauty with personalized attentiveness. Every detail is curated for perfect peace, elite relaxation, and executive functionality.
            </p>
          </article>

          {/* Standard Amenities */}
          <section>
            <h2 className="font-headline-sm text-headline-sm text-primary mb-md">Amenities &amp; Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
              <div className="flex items-center gap-sm p-sm bg-white rounded-lg border border-outline-variant/30 hover:border-primary transition-all">
                <span className="material-symbols-outlined text-primary">wifi</span>
                <span className="font-body-md text-body-md text-on-surface">High-speed WiFi</span>
              </div>
              <div className="flex items-center gap-sm p-sm bg-white rounded-lg border border-outline-variant/30 hover:border-primary transition-all">
                <span className="material-symbols-outlined text-primary">pool</span>
                <span className="font-body-md text-body-md text-on-surface">Infinity Pool</span>
              </div>
              <div className="flex items-center gap-sm p-sm bg-white rounded-lg border border-outline-variant/30 hover:border-primary transition-all">
                <span className="material-symbols-outlined text-primary">spa</span>
                <span className="font-body-md text-body-md text-on-surface">Full-service Spa</span>
              </div>
              <div className="flex items-center gap-sm p-sm bg-white rounded-lg border border-outline-variant/30 hover:border-primary transition-all">
                <span className="material-symbols-outlined text-primary">fitness_center</span>
                <span className="font-body-md text-body-md text-on-surface">24/7 Gym Access</span>
              </div>
            </div>
          </section>

          {/* Accommodations Table */}
          <section>
            <h2 className="font-headline-sm text-headline-sm text-primary mb-md">Available Accommodations</h2>
            <div className="overflow-hidden rounded-xl border border-outline-variant/40 shadow-sm bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant">
                    <th className="px-md py-sm font-label-uppercase text-label-uppercase">Room Type</th>
                    <th className="px-md py-sm font-label-uppercase text-label-uppercase">Sleeps</th>
                    <th className="px-md py-sm font-label-uppercase text-label-uppercase text-right">Price / Night</th>
                    <th className="px-md py-sm font-label-uppercase text-label-uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {rooms.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-md py-lg text-center text-secondary font-body-md italic">
                        No rooms configured for this hotel yet.
                      </td>
                    </tr>
                  ) : (
                    rooms.map((room) => (
                      <tr key={room.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="px-md py-md">
                          <div className="font-body-lg text-body-lg font-semibold text-primary">{room.roomType}</div>
                          <div className="text-on-surface-variant font-body-sm text-body-sm">Standard linens, climate control, custom furnishings</div>
                        </td>
                        <td className="px-md py-md">
                          <div className="flex gap-xs text-on-surface-variant select-none">
                            {Array.from({ length: Math.min(room.capacity, 4) }).map((_, idx) => (
                              <span key={idx} className="material-symbols-outlined text-[18px]">person</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-md py-md text-right">
                          <span className="font-bold text-primary font-headline-sm text-headline-sm">${room.price}</span>
                        </td>
                        <td className="px-md py-md text-right">
                          <button 
                            disabled={!room.availability}
                            onClick={() => setSelectedRoom(room)}
                            className={`px-md py-base rounded-lg font-bold transition-all active:scale-95 ${
                              selectedRoom?.id === room.id 
                                ? 'bg-primary text-white' 
                                : room.availability 
                                  ? 'bg-[#FF7A00]/10 text-[#FF7A00] hover:bg-[#FF7A00]/20' 
                                  : 'bg-outline-variant/30 text-outline cursor-not-allowed'
                            }`}
                          >
                            {selectedRoom?.id === room.id ? 'Selected' : room.availability ? 'Select' : 'Sold Out'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Guest Reviews Section */}
          <section className="bg-white p-md lg:p-lg border border-outline-variant/40 rounded-xl shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-primary mb-md">Guest Testimonials</h2>
            
            {/* Add Review form */}
            {user ? (
              <form onSubmit={handleReviewSubmit} className="bg-surface-container-lowest p-md border border-outline-variant/30 rounded-lg flex flex-col gap-sm mb-lg">
                <h4 className="font-headline-sm text-headline-sm text-primary font-bold">Write a Review</h4>
                {reviewSuccess && (
                  <div className="bg-[#10b981]/15 text-[#10b981] font-bold text-body-sm px-md py-xs rounded-lg text-center mb-xs">
                    {reviewSuccess}
                  </div>
                )}
                
                <div className="flex items-center gap-md">
                  <span className="font-label-uppercase text-label-uppercase text-secondary">Rating:</span>
                  <select 
                    className="form-control" 
                    style={{ width: '80px', padding: '0.35rem' }}
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                  >
                    <option value="5">5 ★</option>
                    <option value="4">4 ★</option>
                    <option value="3">3 ★</option>
                    <option value="2">2 ★</option>
                    <option value="1">1 ★</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-xs">
                  <span className="font-label-uppercase text-label-uppercase text-secondary">Review Comment</span>
                  <textarea 
                    className="form-control text-body-md" 
                    rows="3" 
                    required 
                    placeholder="Describe your hospitality experience, amenities, and room services..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>
                
                <button type="submit" disabled={submittingReview} className="bg-primary text-white font-bold px-md py-base rounded-lg self-start hover:brightness-110 active:scale-95 transition-all select-none">
                  {submittingReview ? 'Posting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="bg-surface-container-low p-md border border-dashed border-outline-variant rounded-lg text-center text-secondary text-body-sm mb-lg">
                Please <span className="text-[#FF7A00] font-bold underline cursor-pointer" onClick={() => navigate('/login')}>Login</span> to publish a wellness review.
              </div>
            )}

            {/* List of Reviews */}
            {reviews.length === 0 ? (
              <p className="text-secondary font-body-md italic py-base">No testimonials configured yet. Be the first to share your experience!</p>
            ) : (
              <div className="flex flex-col gap-md">
                {reviews.map((rev) => (
                  <div key={rev.id} className="pb-md border-b border-outline-variant/20 last:border-b-0">
                    <div className="flex justify-between items-center mb-xs">
                      <strong className="text-primary font-body-lg text-body-lg">{rev.user?.name || 'Verified Traveler'}</strong>
                      <div className="flex text-[#eab308] select-none">
                        {Array.from({ length: rev.rating }).map((_, i) => <span key={i}>★</span>)}
                        {Array.from({ length: 5 - rev.rating }).map((_, i) => <span key={i} className="text-outline-variant">★</span>)}
                      </div>
                    </div>
                    <p className="text-on-surface-variant font-body-sm text-body-sm leading-relaxed">{rev.comment}</p>
                    <span className="text-secondary font-label-uppercase text-label-uppercase text-[11px] block mt-xs">
                      Reviewed on {new Date(rev.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Side: Sticky Reservation Sidebar Summary */}
        <aside className="lg:w-1/3">
          <div className="booking-sidebar bg-surface-container-lowest p-md rounded-xl shadow-[0px_12px_32px_rgba(15,23,42,0.12)] border border-outline-variant/30 flex flex-col gap-md">
            <h3 className="font-headline-sm text-headline-sm text-primary mb-sm pb-xs border-b border-outline-variant/20">
              Reservation Summary
            </h3>
            
            <div className="flex flex-col gap-md mb-md">
              <div className="flex flex-col gap-xs">
                <label className="font-label-uppercase text-label-uppercase text-secondary">Check-in / Check-out</label>
                <div className="flex items-center gap-sm p-sm bg-surface-container rounded-lg border border-outline-variant/30">
                  <span className="material-symbols-outlined text-secondary">calendar_today</span>
                  <span className="font-body-md text-body-md text-primary font-semibold">Standard Booking Window</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-xs">
                <label className="font-label-uppercase text-label-uppercase text-secondary">Guests &amp; Access</label>
                <div className="flex items-center gap-sm p-sm bg-surface-container rounded-lg border border-outline-variant/30">
                  <span className="material-symbols-outlined text-secondary">group</span>
                  <span className="font-body-md text-body-md text-primary font-semibold">Standard Occupancy Details</span>
                </div>
              </div>
              
              {selectedRoom ? (
                <div className="p-sm bg-primary-container/10 border border-primary-container/30 rounded-lg flex flex-col gap-xs">
                  <div className="text-primary font-bold font-body-lg text-body-lg">{selectedRoom.roomType}</div>
                  <div className="text-[#FF7A00] font-extrabold font-headline-sm text-headline-sm">
                    ${selectedRoom.price} <span className="text-secondary font-normal text-body-sm">/ night</span>
                  </div>
                </div>
              ) : (
                <div className="p-sm bg-outline-variant/10 border border-outline-variant/20 rounded-lg text-center text-secondary text-body-sm italic">
                  Select a room below to proceed.
                </div>
              )}
            </div>
            
            <div className="border-t border-outline-variant/30 pt-md">
              <div className="flex justify-between items-center mb-xs">
                <span className="text-secondary font-body-sm text-body-sm">Subtotal (Estimated)</span>
                <span className="text-primary font-bold" id="summary-subtotal">
                  {selectedRoom ? `$${selectedRoom.price}` : '$0'}
                </span>
              </div>
              <div className="flex justify-between items-center mb-md">
                <span className="text-secondary font-body-sm text-body-sm">Taxes &amp; Surcharges</span>
                <span className="text-primary font-bold">12%</span>
              </div>
              
              <button 
                disabled={!selectedRoom}
                onClick={() => handleBookRoom(selectedRoom.id)}
                className={`w-full font-bold px-lg py-md rounded-lg flex items-center justify-center gap-base transition-all active:scale-95 select-none ${
                  selectedRoom 
                    ? 'bg-[#FF7A00] hover:brightness-95 text-white' 
                    : 'bg-outline-variant/30 text-outline cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined">payments</span>
                Book Selected Room
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
