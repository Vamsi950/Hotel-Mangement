import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Checkout flow states
  const [step, setStep] = useState(1); // 1: Dates & Billing, 2: Payment, 3: Success
  const [checkIn, setCheckIn] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]); // Tomorrow
  const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]); // 3 days later
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);

  // Payment form states
  const [paymentData, setPaymentData] = useState({
    cardName: '',
    cardNumber: '',
    cardExp: '',
    cardCvv: ''
  });
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(`/checkout?roomId=${roomId}`));
      return;
    }
    if (!roomId) {
      navigate('/hotels');
      return;
    }
    fetchRoomDetails();
    fetchAvailableCoupons();
  }, [roomId, user]);

  const fetchRoomDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/rooms/${roomId}`);
      setRoom(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load room details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      const activeCoupons = res.data.filter(c => c.active);
      setAvailableCoupons(activeCoupons);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    }
  };

  const handleSelectCoupon = async (code) => {
    if (appliedCoupon && appliedCoupon.couponCode === code) {
      handleRemoveCoupon();
      return;
    }
    setCouponError('');
    setCouponSuccess('');
    setCouponCode(code);
    try {
      const res = await api.get(`/coupons/validate/${code.toUpperCase()}`);
      setAppliedCoupon(res.data);
      setCouponSuccess(`Coupon applied! ${res.data.discountPercentage}% discount saved.`);
    } catch (err) {
      setCouponError('Invalid or expired coupon code.');
      setAppliedCoupon(null);
    }
  };

  const handleCardInputChange = (e) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');
    if (!couponCode.trim()) return;
    try {
      const res = await api.get(`/coupons/validate/${couponCode.trim().toUpperCase()}`);
      setAppliedCoupon(res.data);
      setCouponSuccess(`Coupon applied! ${res.data.discountPercentage}% discount saved.`);
    } catch (err) {
      setCouponError('Invalid or expired coupon code.');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  // Invoice calculations
  const calculateDays = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const days = calculateDays();
  const baseTotal = room ? room.price * days : 0;
  const discountAmount = appliedCoupon ? (baseTotal * appliedCoupon.discountPercentage) / 100 : 0;
  const subtotal = baseTotal - discountAmount;
  const tax = subtotal * 0.12; // 12% sales tax
  const grandTotal = subtotal + tax;

  const handleDatesSubmit = (e) => {
    e.preventDefault();
    if (new Date(checkIn) >= new Date(checkOut)) {
      setError('Check-out date must be after check-in date.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    
    // Quick validation
    if (paymentData.cardNumber.length < 16 || paymentData.cardCvv.length < 3) {
      setError('Please fill in valid credit card information.');
      return;
    }

    setSubmittingBooking(true);
    try {
      // 1. Create booking
      const bookingRes = await api.post('/bookings', {
        roomId: room.id,
        checkIn,
        checkOut,
        couponCode: appliedCoupon ? appliedCoupon.couponCode : null
      });
      const booking = bookingRes.data;

      // 2. Process mock payment
      const paymentRes = await api.post('/payments', {
        bookingId: booking.id,
        paymentMethod: 'Credit Card'
      });

      setConfirmedBooking(booking);
      setStep(3);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Transaction failed. Please try again.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner}></div>
        <p>Preparing secure checkout...</p>
      </div>
    );
  }

  if (error && step < 3 && !room) {
    return (
      <div style={styles.centerContainer} className="glass-panel">
        <h3>Checkout Error</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        <button onClick={() => navigate('/hotels')} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          Browse Hotels
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Step Indicators */}
      <div style={styles.stepper}>
        <div style={{ ...styles.stepIndicator, color: step >= 1 ? 'var(--secondary)' : 'var(--text-muted)' }}>1. Dates & Billing</div>
        <div style={styles.stepConnector}></div>
        <div style={{ ...styles.stepIndicator, color: step >= 2 ? 'var(--secondary)' : 'var(--text-muted)' }}>2. Payment Portal</div>
        <div style={styles.stepConnector}></div>
        <div style={{ ...styles.stepIndicator, color: step === 3 ? 'var(--secondary)' : 'var(--text-muted)' }}>3. Reservation Receipt</div>
      </div>

      {step === 3 && confirmedBooking ? (
        /* SUCCESS RECEIPT PAGE */
        <div style={styles.successContainer} className="glass-panel">
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.successTitle}>Booking Confirmed!</h2>
          <p style={styles.successSubtitle}>A receipt and confirmation number have been generated. An email summary was simulated.</p>
          
          <div style={styles.receiptDetails}>
            <div style={styles.receiptRow}>
              <span>Reservation Number:</span>
              <strong style={{ color: 'var(--text-primary)' }}>RSV-{confirmedBooking.id}</strong>
            </div>
            <div style={styles.receiptRow}>
              <span>Destination:</span>
              <strong>{room.hotel.hotelName}</strong>
            </div>
            <div style={styles.receiptRow}>
              <span>Room Category:</span>
              <strong>{room.roomType}</strong>
            </div>
            <div style={styles.receiptRow}>
              <span>Check-in Date:</span>
              <strong>{checkIn}</strong>
            </div>
            <div style={styles.receiptRow}>
              <span>Check-out Date:</span>
              <strong>{checkOut}</strong>
            </div>
            <div style={styles.receiptRow}>
              <span>Nights Stayed:</span>
              <strong>{days} Nights</strong>
            </div>
            <div style={{ ...styles.receiptRow, borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '1rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>Amount Charged:</span>
              <strong style={{ fontSize: '1.4rem', color: 'var(--secondary)' }}>${grandTotal.toFixed(2)}</strong>
            </div>
          </div>

          <div style={styles.successActions}>
            <button onClick={() => navigate('/profile')} className="btn btn-primary" style={{ flex: 1 }}>
              View My Bookings
            </button>
            <button onClick={() => navigate('/')} className="btn btn-secondary">
              Back to Home
            </button>
          </div>
        </div>
      ) : (
        /* CHECKOUT MAIN FLOW */
        <div style={styles.checkoutLayout}>
          {/* Form Side */}
          <div style={styles.formPanel} className="glass-panel">
            {error && <div style={styles.errorAlert}>{error}</div>}

            {step === 1 ? (
              /* STEP 1: SELECT DATES */
              <form onSubmit={handleDatesSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={styles.panelTitle}>Select Reservation Dates</h3>
                
                <div style={styles.datesGrid}>
                  <div className="form-group">
                    <label className="form-label">Check-In Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="form-control"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Check-Out Date</label>
                    <input
                      type="date"
                      required
                      min={checkIn}
                      className="form-control"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Proceed to Payment (${grandTotal.toFixed(2)})
                  </button>
                </div>
              </form>
            ) : (
              /* STEP 2: CREDIT CARD FORM */
              <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={styles.panelTitle}>Enter Card Details</h3>
                
                <div className="form-group">
                  <label className="form-label">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    name="cardName"
                    className="form-control"
                    placeholder="Johnathan Doe"
                    value={paymentData.cardName}
                    onChange={handleCardInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Credit Card Number</label>
                  <input
                    type="text"
                    required
                    name="cardNumber"
                    maxLength="19"
                    className="form-control"
                    placeholder="4111 2222 3333 4444"
                    value={paymentData.cardNumber}
                    onChange={handleCardInputChange}
                  />
                </div>

                <div style={styles.datesGrid}>
                  <div className="form-group">
                    <label className="form-label">Expiration Date</label>
                    <input
                      type="text"
                      required
                      name="cardExp"
                      placeholder="MM/YY"
                      className="form-control"
                      value={paymentData.cardExp}
                      onChange={handleCardInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV Code</label>
                    <input
                      type="password"
                      required
                      name="cardCvv"
                      maxLength="4"
                      placeholder="•••"
                      className="form-control"
                      value={paymentData.cardCvv}
                      onChange={handleCardInputChange}
                    />
                  </div>
                </div>

                <div style={styles.paymentActions}>
                  <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>
                    Back to Dates
                  </button>
                  <button type="submit" disabled={submittingBooking} className="btn btn-primary" style={{ flex: 2 }}>
                    {submittingBooking ? 'Securing Transaction...' : `Confirm & Pay $${grandTotal.toFixed(2)}`}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Invoice Side Summary */}
          <div style={styles.summaryPanel} className="glass-panel">
            <h3 style={styles.panelTitle}>Stays Invoice</h3>
            
            <div style={styles.roomSummaryRow}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{room.hotel.hotelName}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{room.roomType}</p>
              </div>
            </div>

            <div style={styles.invoiceBreakdown}>
              <div style={styles.invoiceRow}>
                <span>Daily Rate:</span>
                <strong>${room.price}</strong>
              </div>
              <div style={styles.invoiceRow}>
                <span>Stay Duration:</span>
                <strong>{days} Nights</strong>
              </div>
              <div style={styles.invoiceRow}>
                <span>Base Cost:</span>
                <strong>${baseTotal.toFixed(2)}</strong>
              </div>

              {/* Coupon inputs */}
              <div style={styles.couponInputSection}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Enter Coupon Code"
                    disabled={appliedCoupon}
                    className="form-control"
                    style={{ textTransform: 'uppercase', fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  {appliedCoupon ? (
                    <button type="button" onClick={handleRemoveCoupon} className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
                      Remove
                    </button>
                  ) : (
                    <button type="button" onClick={handleApplyCoupon} className="btn btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
                      Apply
                    </button>
                  )}
                </div>
                {couponError && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{couponError}</p>}
                {couponSuccess && <p style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>{couponSuccess}</p>}

                {/* Available Coupons list */}
                {availableCoupons.length > 0 && (
                  <div className="available-coupons-wrapper" style={{ marginTop: '0.75rem', borderTop: '1px dashed var(--border-light)', paddingTop: '0.75rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Promos:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {availableCoupons.map((coupon) => {
                        const isCurrentlyApplied = appliedCoupon && appliedCoupon.couponCode === coupon.couponCode;
                        return (
                          <button
                            key={coupon.id}
                            type="button"
                            disabled={appliedCoupon && !isCurrentlyApplied}
                            onClick={() => handleSelectCoupon(coupon.couponCode)}
                            className={`coupon-badge ${isCurrentlyApplied ? 'applied' : ''}`}
                            title={isCurrentlyApplied ? "Click to remove coupon" : `Apply ${coupon.discountPercentage}% discount`}
                          >
                            <span className="coupon-badge-code">{coupon.couponCode}</span>
                            <span className="coupon-badge-percent">{coupon.discountPercentage}% OFF</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {appliedCoupon && (
                <div style={{ ...styles.invoiceRow, color: '#10b981' }}>
                  <span>Discount Applied ({appliedCoupon.discountPercentage}%):</span>
                  <strong>-${discountAmount.toFixed(2)}</strong>
                </div>
              )}

              <div style={styles.invoiceRow}>
                <span>Surcharges & Taxes (12%):</span>
                <strong>${tax.toFixed(2)}</strong>
              </div>

              <div style={{ ...styles.invoiceRow, borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '1rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>Grand Total:</span>
                <strong style={{ fontSize: '1.4rem', color: 'var(--secondary)' }}>${grandTotal.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    paddingBottom: '4rem',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  stepper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '3rem',
    flexWrap: 'wrap'
  },
  stepIndicator: {
    fontSize: '0.95rem',
    fontWeight: '700',
    fontFamily: 'Outfit',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  stepConnector: {
    height: '2px',
    width: '40px',
    background: 'var(--border-glass)'
  },
  checkoutLayout: {
    display: 'flex',
    gap: '2.5rem',
    flexWrap: 'wrap'
  },
  formPanel: {
    flex: '2 1 500px',
    padding: '2.5rem',
    borderRadius: '16px'
  },
  summaryPanel: {
    flex: '1 1 300px',
    padding: '2rem',
    alignSelf: 'flex-start',
    borderRadius: '16px'
  },
  panelTitle: {
    fontSize: '1.35rem',
    fontWeight: '800',
    marginBottom: '1.5rem',
    borderBottom: '1px solid var(--border-light)',
    paddingBottom: '0.75rem'
  },
  datesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1.25rem'
  },
  paymentActions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1.5rem'
  },
  roomSummaryRow: {
    display: 'flex',
    gap: '1rem',
    borderBottom: '1px solid var(--border-light)',
    paddingBottom: '1.25rem',
    marginBottom: '1.25rem'
  },
  invoiceBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  invoiceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)'
  },
  couponInputSection: {
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid var(--border-light)',
    padding: '1rem',
    borderRadius: '8px',
    margin: '0.5rem 0'
  },
  errorAlert: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    textAlign: 'center'
  },
  successContainer: {
    textAlign: 'center',
    maxWidth: '560px',
    margin: '0 auto',
    padding: '3.5rem 2.5rem',
    borderRadius: '20px'
  },
  successIcon: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    border: '2px solid #10b981',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0 auto 1.5rem'
  },
  successTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    marginBottom: '0.5rem'
  },
  successSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    marginBottom: '2.5rem'
  },
  receiptDetails: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-light)',
    borderRadius: '12px',
    padding: '1.5rem',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '2.5rem'
  },
  receiptRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)'
  },
  successActions: {
    display: 'flex',
    gap: '1rem'
  },
  centerContainer: {
    textAlign: 'center',
    padding: '6rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px'
  },
  spinner: {
    border: '3px solid var(--border-glass)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    borderLeftColor: 'var(--primary)',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 1rem'
  }
};
