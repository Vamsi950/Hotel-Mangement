import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function HotelList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const locationParam = searchParams.get('location') || '';
  
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Local filter states
  const [searchLoc, setSearchLoc] = useState(locationParam);
  const [priceRange, setPriceRange] = useState(1000); // Max budget limit
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  
  useEffect(() => {
    setSearchLoc(locationParam);
    fetchHotels(locationParam);
  }, [locationParam]);

  const fetchHotels = (loc) => {
    setLoading(true);
    api.get(`/hotels${loc ? `?location=${encodeURIComponent(loc)}` : ''}`)
      .then((res) => {
        setHotels(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ location: searchLoc });
  };

  const handleReset = () => {
    setSearchLoc('');
    setPriceRange(1000);
    setSelectedAmenities([]);
    setSearchParams({});
  };

  const handleAmenityToggle = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  // Simulated filtering on frontend for high responsiveness & premium UX
  const filteredHotels = hotels.filter((hotel) => {
    // If selecting specific location filter (case-insensitive fallback)
    if (searchLoc && !hotel.location.toLowerCase().includes(searchLoc.toLowerCase()) && !hotel.hotelName.toLowerCase().includes(searchLoc.toLowerCase())) {
      return false;
    }
    // Filter by selected amenities (ALL selected amenities must match keywords in the description)
    if (selectedAmenities.length > 0) {
      const allMatch = selectedAmenities.every((amenity) => {
        const keyword = amenity.toLowerCase();
        return hotel.description.toLowerCase().includes(keyword);
      });
      if (!allMatch) return false;
    }
    return true;
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Explore Elegant Stays</h2>
        <p style={styles.subtitle}>Showing {filteredHotels.length} premium hotels matched for you</p>
      </div>

      <div style={styles.contentLayout}>
        {/* Sidebar Filters */}
        <aside style={styles.sidebar} className="glass-panel">
          <h3 style={styles.sidebarTitle}>Search & Filter</h3>
          <form onSubmit={handleFilterSubmit}>
            <div className="form-group">
              <label className="form-label">Destination</label>
              <input
                type="text"
                placeholder="City, region, or hotel name"
                className="form-control"
                value={searchLoc}
                onChange={(e) => setSearchLoc(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Featured Amenities</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: '0.25rem 0' }}>
                {[
                  { value: 'Spa', label: 'Luxury Spa' },
                  { value: 'Pool', label: 'Swimming Pool' },
                  { value: 'Beach', label: 'Private Beach' },
                  { value: 'Ski', label: 'Ski Retreat' }
                ].map((amenity) => {
                  const isChecked = selectedAmenities.includes(amenity.value);
                  return (
                    <label
                      key={amenity.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontFamily: 'Inter, sans-serif',
                        color: 'var(--text-primary)',
                        userSelect: 'none'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleAmenityToggle(amenity.value)}
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: '1.5px solid var(--border-glass)',
                          cursor: 'pointer',
                          accentColor: 'var(--primary)'
                        }}
                      />
                      <span>{amenity.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="form-label">Max Budget per Night</label>
                <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: '600' }}>${priceRange}</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                style={{ width: '100%', accentColor: 'var(--primary)' }}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
              />
            </div>

            <div style={styles.sidebarButtons}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                Apply Filters
              </button>
              <button type="button" onClick={handleReset} className="btn btn-secondary" style={{ padding: '0.75rem' }}>
                Reset
              </button>
            </div>
          </form>
        </aside>

        {/* Listings Content */}
        <main style={styles.listingsGrid}>
          {loading ? (
            <div style={styles.centerContainer}>
              <div style={styles.spinner}></div>
              <p>Fetching beautiful destinations...</p>
            </div>
          ) : filteredHotels.length === 0 ? (
            <div style={styles.centerContainer} className="glass-panel">
              <h3>No hotels found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search criteria or resetting filters.</p>
              <button onClick={handleReset} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                Reset Search
              </button>
            </div>
          ) : (
            filteredHotels.map((hotel) => (
              <div key={hotel.id} className="glass-card" style={styles.hotelRow} onClick={() => navigate(`/hotels/${hotel.id}`)}>
                <img src={hotel.image} alt={hotel.hotelName} style={styles.rowImage} />
                <div style={styles.rowDetails}>
                  <div style={styles.rowHeader}>
                    <div>
                      <h3 style={styles.hotelName}>{hotel.hotelName}</h3>
                      <p style={styles.locationText}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        {hotel.location}
                      </p>
                    </div>
                    <div style={styles.ratingBadge}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ color: '#eab308', marginRight: '4px' }}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      4.9
                    </div>
                  </div>
                  
                  <p style={styles.description}>{hotel.description}</p>
                  
                  <div style={styles.rowFooter}>
                    <div style={styles.amenitiesBadges}>
                      <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>WiFi</span>
                      <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>AC</span>
                      <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>Luxury Linens</span>
                    </div>
                    <button className="btn btn-primary" style={styles.bookBtn}>
                      Browse Rooms
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    paddingBottom: '4rem'
  },
  header: {
    marginBottom: '2.5rem'
  },
  title: {
    fontSize: '2.25rem',
    fontWeight: '800',
    marginBottom: '0.25rem'
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '1rem'
  },
  contentLayout: {
    display: 'flex',
    gap: '2.5rem',
    flexWrap: 'wrap'
  },
  sidebar: {
    flex: '1 1 300px',
    maxWidth: '360px',
    padding: '2rem',
    alignSelf: 'flex-start',
    borderRadius: '16px'
  },
  sidebarTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '1.5rem'
  },
  sidebarButtons: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1.5rem'
  },
  listingsGrid: {
    flex: '3 1 500px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  hotelRow: {
    display: 'flex',
    padding: 0,
    overflow: 'hidden',
    cursor: 'pointer',
    borderRadius: '16px',
    flexWrap: 'wrap'
  },
  rowImage: {
    width: '260px',
    height: '220px',
    objectFit: 'cover',
    flexShrink: 0
  },
  rowDetails: {
    flex: 1,
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minWidth: '280px'
  },
  rowHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem'
  },
  hotelName: {
    fontSize: '1.35rem',
    fontWeight: '700',
    lineHeight: '1.2'
  },
  locationText: {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    marginTop: '0.25rem'
  },
  ratingBadge: {
    background: 'rgba(234, 179, 8, 0.1)',
    color: '#eab308',
    border: '1px solid rgba(234, 179, 8, 0.2)',
    padding: '0.25rem 0.6rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center'
  },
  description: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    lineHeight: '1.5',
    marginBottom: '1.25rem'
  },
  rowFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    borderTop: '1px solid var(--border-light)',
    paddingTop: '1rem'
  },
  amenitiesBadges: {
    display: 'flex',
    gap: '0.5rem'
  },
  bookBtn: {
    padding: '0.5rem 1.25rem',
    fontSize: '0.85rem',
    borderRadius: '8px'
  },
  centerContainer: {
    textAlign: 'center',
    padding: '4rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '260px'
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
