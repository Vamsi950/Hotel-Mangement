import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'hotels', 'rooms', 'bookings', 'users', 'coupons'
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Sub-tab resources state
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [coupons, setCoupons] = useState([]);

  // Forms state
  const [hotelForm, setHotelForm] = useState({ id: null, hotelName: '', location: '', description: '', image: '', ownerEmail: '' });
  const [roomForm, setRoomForm] = useState({ id: null, roomType: '', price: '', capacity: 2, availability: true, totalRooms: 1 });
  const [couponForm, setCouponForm] = useState({ couponCode: '', discountPercentage: 10, active: true });
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);

  // Toast notification
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Security Guard: Check ADMIN role
    if (!user || user.role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    loadAnalytics();
  }, [user]);

  // Tab change triggers specific resource loaders
  useEffect(() => {
    if (activeTab === 'analytics') loadAnalytics();
    if (activeTab === 'hotels') loadHotels();
    if (activeTab === 'rooms') {
      loadHotels().then((fetchedHotels) => {
        if (fetchedHotels && fetchedHotels.length > 0) {
          const firstId = fetchedHotels[0].id;
          setSelectedHotelId(firstId);
          loadRooms(firstId);
        }
      });
    }
    if (activeTab === 'bookings') loadBookings();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'coupons') loadCoupons();
  }, [activeTab]);

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Loading APIs
  const loadAnalytics = async () => {
    setLoadingStats(true);
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
      // Pre-fetch bookings for recent stays
      const bookingsRes = await api.get('/bookings/all');
      setBookings(bookingsRes.data);
      triggerToast();
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadHotels = async () => {
    try {
      const res = await api.get('/hotels');
      setHotels(res.data);
      return res.data;
    } catch (err) {
      console.error(err);
    }
  };

  const loadRooms = async (hotelId) => {
    if (!hotelId) return;
    try {
      const res = await api.get(`/rooms/hotel/${hotelId}`);
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadBookings = async () => {
    try {
      const res = await api.get('/bookings/all');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      setCoupons(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 1. HOTEL CRUD
  const handleHotelSubmit = async (e) => {
    e.preventDefault();
    try {
      if (hotelForm.id) {
        await api.put(`/hotels/${hotelForm.id}`, hotelForm);
      } else {
        await api.post('/hotels', hotelForm);
      }
      setShowHotelModal(false);
      setHotelForm({ id: null, hotelName: '', location: '', description: '', image: '', ownerEmail: '' });
      loadHotels();
    } catch (err) {
      alert('Operation failed.');
    }
  };

  const handleEditHotelClick = (hotel) => {
    setHotelForm({
      id: hotel.id,
      hotelName: hotel.hotelName,
      location: hotel.location,
      description: hotel.description,
      image: hotel.image,
      ownerEmail: hotel.ownerEmail || ''
    });
    setShowHotelModal(true);
  };

  const handleDeleteHotel = async (id) => {
    if (!window.confirm('Delete this hotel and its rooms?')) return;
    try {
      await api.delete(`/hotels/${id}`);
      loadHotels();
    } catch (err) {
      alert('Delete failed.');
    }
  };

  // 2. ROOM CRUD
  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      if (roomForm.id) {
        await api.put(`/rooms/${roomForm.id}`, roomForm);
      } else {
        await api.post(`/rooms/hotel/${selectedHotelId}`, roomForm);
      }
      setShowRoomModal(false);
      setRoomForm({ id: null, roomType: '', price: '', capacity: 2, availability: true, totalRooms: 1 });
      loadRooms(selectedHotelId);
    } catch (err) {
      alert('Operation failed.');
    }
  };

  const handleEditRoomClick = (room) => {
    setRoomForm({
      id: room.id,
      roomType: room.roomType,
      price: room.price,
      capacity: room.capacity,
      availability: room.availability,
      totalRooms: room.totalRooms || 1
    });
    setShowRoomModal(true);
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Delete this room category?')) return;
    try {
      await api.delete(`/rooms/${id}`);
      loadRooms(selectedHotelId);
    } catch (err) {
      alert('Delete failed.');
    }
  };

  // 3. BOOKING ACTIONS
  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await api.put(`/bookings/status/${bookingId}`, { status });
      loadBookings();
    } catch (err) {
      alert('Failed to update booking status.');
    }
  };

  // 4. USER BLOCKS
  const handleToggleUserBlock = async (userId, currentlyBlocked) => {
    try {
      const endpoint = currentlyBlocked ? 'unblock' : 'block';
      await api.put(`/admin/users/${endpoint}/${userId}`);
      loadUsers();
    } catch (err) {
      alert('Failed to modify user block status.');
    }
  };

  // 5. COUPON CREATOR
  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coupons', couponForm);
      setCouponForm({ couponCode: '', discountPercentage: 10, active: true });
      loadCoupons();
    } catch (err) {
      alert('Failed to create coupon.');
    }
  };

  const handleToggleCoupon = async (id, currentActive) => {
    try {
      await api.put(`/coupons/${id}/active`, { active: !currentActive });
      loadCoupons();
    } catch (err) {
      alert('Failed to update coupon status.');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete this discount coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      loadCoupons();
    } catch (err) {
      alert('Delete failed.');
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex">
      
      {/* Sidebar Navigation */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low dark:bg-surface-dim border-r border-outline-variant flex flex-col p-md gap-base z-50 select-none">
        <div className="mb-lg px-xs">
          <h1 className="font-headline-sm text-headline-sm font-black text-primary dark:text-primary-fixed">Admin Panel</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Management Suite</p>
        </div>
        
        <nav className="flex-1 space-y-1">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-sm px-sm py-md rounded-xl font-bold transition-all hover:translate-x-1 ${
              activeTab === 'analytics' 
                ? 'bg-primary-container text-on-primary-container dark:bg-primary dark:text-on-primary sidebar-item-active' 
                : 'text-on-surface-variant dark:text-on-secondary-fixed-variant hover:bg-surface-container-high dark:hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-uppercase text-label-uppercase">Dashboard</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('hotels')}
            className={`w-full flex items-center gap-sm px-sm py-md rounded-xl font-bold transition-all hover:translate-x-1 ${
              activeTab === 'hotels' 
                ? 'bg-primary-container text-on-primary-container dark:bg-primary dark:text-on-primary sidebar-item-active' 
                : 'text-on-surface-variant dark:text-on-secondary-fixed-variant hover:bg-surface-container-high dark:hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined">hotel</span>
            <span className="font-label-uppercase text-label-uppercase">Inventory</span>
          </button>

          <button 
            onClick={() => setActiveTab('rooms')}
            className={`w-full flex items-center gap-sm px-sm py-md rounded-xl font-bold transition-all hover:translate-x-1 ${
              activeTab === 'rooms' 
                ? 'bg-primary-container text-on-primary-container dark:bg-primary dark:text-on-primary sidebar-item-active' 
                : 'text-on-surface-variant dark:text-on-secondary-fixed-variant hover:bg-surface-container-high dark:hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined">meeting_room</span>
            <span className="font-label-uppercase text-label-uppercase">Rooms CRUD</span>
          </button>

          <button 
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-sm px-sm py-md rounded-xl font-bold transition-all hover:translate-x-1 ${
              activeTab === 'bookings' 
                ? 'bg-primary-container text-on-primary-container dark:bg-primary dark:text-on-primary sidebar-item-active' 
                : 'text-on-surface-variant dark:text-on-secondary-fixed-variant hover:bg-surface-container-high dark:hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="font-label-uppercase text-label-uppercase">Bookings</span>
          </button>

          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-sm px-sm py-md rounded-xl font-bold transition-all hover:translate-x-1 ${
              activeTab === 'users' 
                ? 'bg-primary-container text-on-primary-container dark:bg-primary dark:text-on-primary sidebar-item-active' 
                : 'text-on-surface-variant dark:text-on-secondary-fixed-variant hover:bg-surface-container-high dark:hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined">group</span>
            <span className="font-label-uppercase text-label-uppercase">Users</span>
          </button>

          <button 
            onClick={() => setActiveTab('coupons')}
            className={`w-full flex items-center gap-sm px-sm py-md rounded-xl font-bold transition-all hover:translate-x-1 ${
              activeTab === 'coupons' 
                ? 'bg-primary-container text-on-primary-container dark:bg-primary dark:text-on-primary sidebar-item-active' 
                : 'text-on-surface-variant dark:text-on-secondary-fixed-variant hover:bg-surface-container-high dark:hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined">loyalty</span>
            <span className="font-label-uppercase text-label-uppercase">Coupons</span>
          </button>
        </nav>

        <div className="mt-auto">
          {activeTab === 'hotels' && (
            <button 
              onClick={() => { setHotelForm({ id: null, hotelName: '', location: '', description: '', image: '' }); setShowHotelModal(true); }}
              className="w-full py-md px-base bg-tertiary-container text-on-tertiary-container font-bold rounded-xl flex items-center justify-center gap-xs active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined">add</span>
              <span className="font-label-uppercase text-label-uppercase">Add New Hotel</span>
            </button>
          )}
          {activeTab === 'rooms' && (
            <button 
              onClick={() => { setRoomForm({ id: null, roomType: '', price: '', capacity: 2, availability: true, totalRooms: 1 }); setShowRoomModal(true); }}
              className="w-full py-md px-base bg-tertiary-container text-on-tertiary-container font-bold rounded-xl flex items-center justify-center gap-xs active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined">add</span>
              <span className="font-label-uppercase text-label-uppercase">Configure Room</span>
            </button>
          )}
          
          <div className="mt-md flex items-center gap-sm p-xs border-t border-outline-variant pt-md select-none">
            <img 
              alt="Admin Avatar" 
              className="w-10 h-10 rounded-full border-2 border-primary-fixed object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-AFi763NLuyjbW6kT37bUi1aADsY7pAi2Ec4QqUTIXb8cEx4zp8cn2i43bhFJNsVXeeeW_exATkvXinE8AwytKawasAf5ypkGtV_35MraQd9epcxOoL7kzrFDZ1oJ1RfzfaCwA8k9VliSDU-8VOg0ZD2dSbHYtZupsm6mLX6E-mIqPHIqbF_Qhpe7Hl9oMUioQvwePTZ-MQPRGVJz3hdfQAReBtK5_qsVcfwk7gTeyI8jFQaUk5AKSFxD0-lZa3fK33utl9HHx7Q"
            />
            <div>
              <p className="font-label-uppercase text-label-uppercase font-bold">{user?.name || 'Alex Rivera'}</p>
              <p className="text-[10px] text-on-surface-variant">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="ml-64 p-lg flex-1">
        
        {/* Workspace Top Header */}
        <header className="flex justify-between items-center mb-lg">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary font-bold">
              {activeTab === 'analytics' && 'Executive Overview'}
              {activeTab === 'hotels' && 'Inventory Management'}
              {activeTab === 'rooms' && 'Rooms Management'}
              {activeTab === 'bookings' && 'Bookings Suite'}
              {activeTab === 'users' && 'User Accounts Suite'}
              {activeTab === 'coupons' && 'Promotions Console'}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {activeTab === 'analytics' && 'Monitoring real-time performance across all LuxeStay destinations.'}
              {activeTab === 'hotels' && 'Create, view, modify, or delete high-end LuxeStay hotel properties.'}
              {activeTab === 'rooms' && 'Configure room specifications, pricing tariffs, and user occupancy.'}
              {activeTab === 'bookings' && 'Supervise verified customer stays, statuses, and history logs.'}
              {activeTab === 'users' && 'Manage registered accounts, safety moderation, and block listings.'}
              {activeTab === 'coupons' && 'Create and moderate active discount campaigns and coupon percentages.'}
            </p>
          </div>
          
          <div className="flex gap-md items-center">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input 
                className="pl-10 pr-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-fixed outline-none w-64 text-body-sm" 
                placeholder="Search analytics..." 
                type="text"
              />
            </div>
            <button className="p-sm bg-surface-container-high rounded-full hover:bg-surface-container-highest transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>
          </div>
        </header>

        {/* TAB 1: ANALYTICS DASHBOARD */}
        {activeTab === 'analytics' && (
          <div>
            {loadingStats ? (
              <div className="text-center py-20 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary-fixed border-t-primary rounded-full animate-spin mb-sm"></div>
                <p className="text-secondary font-bold">Consolidating dashboard stats...</p>
              </div>
            ) : !stats ? (
              <p className="text-secondary font-body-md italic text-center py-20">Failed to retrieve analytics data.</p>
            ) : (
              <div>
                {/* Stats Metric Cards (Bento Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-md mb-lg">
                  {/* Revenue Card */}
                  <div className="bg-surface-container-lowest p-md rounded-xl shadow-[0px_4px_20px_rgba(26,54,93,0.05)] border border-outline-variant/30">
                    <div className="flex justify-between items-start mb-sm">
                      <span className="p-xs bg-primary-fixed text-primary rounded-lg material-symbols-outlined">payments</span>
                      <span className="text-tertiary font-bold text-body-sm flex items-center">+12.5% <span className="material-symbols-outlined text-sm">trending_up</span></span>
                    </div>
                    <p className="font-label-uppercase text-label-uppercase text-on-surface-variant">Total Revenue</p>
                    <h3 className="font-headline-md text-headline-md mt-xs font-bold text-primary">${stats.totalRevenue ? stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</h3>
                    <div className="mt-md h-12 flex items-end gap-1">
                      <div className="w-full bg-primary-fixed-dim/20 h-4 rounded-t-sm"></div>
                      <div className="w-full bg-primary-fixed-dim/30 h-6 rounded-t-sm"></div>
                      <div className="w-full bg-primary-fixed-dim/40 h-8 rounded-t-sm"></div>
                      <div className="w-full bg-primary-fixed-dim/50 h-5 rounded-t-sm"></div>
                      <div className="w-full bg-primary-fixed h-10 rounded-t-sm"></div>
                      <div className="w-full bg-primary-fixed-dim h-7 rounded-t-sm"></div>
                    </div>
                  </div>

                  {/* Active Bookings Card */}
                  <div className="bg-surface-container-lowest p-md rounded-xl shadow-[0px_4px_20px_rgba(26,54,93,0.05)] border border-outline-variant/30">
                    <div className="flex justify-between items-start mb-sm">
                      <span className="p-xs bg-secondary-container text-on-secondary-container rounded-lg material-symbols-outlined">calendar_today</span>
                      <span className="text-tertiary font-bold text-body-sm flex items-center">+8.2% <span className="material-symbols-outlined text-sm">trending_up</span></span>
                    </div>
                    <p className="font-label-uppercase text-label-uppercase text-on-surface-variant">Active Bookings</p>
                    <h3 className="font-headline-md text-headline-md mt-xs font-bold text-primary">{stats.totalBookings || 0}</h3>
                    <div className="mt-md h-12 flex items-end gap-1">
                      <div className="w-full bg-secondary-fixed/20 h-8 rounded-t-sm"></div>
                      <div className="w-full bg-secondary-fixed/30 h-5 rounded-t-sm"></div>
                      <div className="w-full bg-secondary-fixed/40 h-10 rounded-t-sm"></div>
                      <div className="w-full bg-secondary-fixed/50 h-7 rounded-t-sm"></div>
                      <div className="w-full bg-secondary-fixed h-9 rounded-t-sm"></div>
                      <div className="w-full bg-secondary-fixed-dim h-11 rounded-t-sm"></div>
                    </div>
                  </div>

                  {/* Total Rooms Card */}
                  <div className="bg-surface-container-lowest p-md rounded-xl shadow-[0px_4px_20px_rgba(26,54,93,0.05)] border border-outline-variant/30">
                    <div className="flex justify-between items-start mb-sm">
                      <span className="p-xs bg-primary-fixed text-primary rounded-lg material-symbols-outlined">meeting_room</span>
                      <span className="text-secondary font-bold text-body-sm flex items-center">Stable</span>
                    </div>
                    <p className="font-label-uppercase text-label-uppercase text-on-surface-variant">Total Rooms</p>
                    <h3 className="font-headline-md text-headline-md mt-xs font-bold text-primary">{stats.totalRooms || 0}</h3>
                    <div className="mt-md h-12 flex items-end gap-1">
                      <div className="w-full bg-primary-fixed-dim/20 h-4 rounded-t-sm"></div>
                      <div className="w-full bg-primary-fixed-dim/30 h-6 rounded-t-sm"></div>
                      <div className="w-full bg-primary-fixed-dim/40 h-8 rounded-t-sm"></div>
                      <div className="w-full bg-primary-fixed-dim/50 h-5 rounded-t-sm"></div>
                      <div className="w-full bg-primary-fixed h-10 rounded-t-sm"></div>
                      <div className="w-full bg-primary-fixed-dim h-7 rounded-t-sm"></div>
                    </div>
                  </div>

                  {/* Users Card */}
                  <div className="bg-surface-container-lowest p-md rounded-xl shadow-[0px_4px_20px_rgba(26,54,93,0.05)] border border-outline-variant/30">
                    <div className="flex justify-between items-start mb-sm">
                      <span className="p-xs bg-tertiary-fixed text-on-tertiary-fixed rounded-lg material-symbols-outlined">person_add</span>
                      <span className="text-error font-bold text-body-sm flex items-center">-2.1% <span className="material-symbols-outlined text-sm">trending_down</span></span>
                    </div>
                    <p className="font-label-uppercase text-label-uppercase text-on-surface-variant">New Users</p>
                    <h3 className="font-headline-md text-headline-md mt-xs font-bold text-primary">{stats.totalUsers || 0}</h3>
                    <div className="mt-md h-12 flex items-end gap-1">
                      <div className="w-full bg-tertiary-fixed-dim/20 h-5 rounded-t-sm"></div>
                      <div className="w-full bg-tertiary-fixed-dim/30 h-9 rounded-t-sm"></div>
                      <div className="w-full bg-tertiary-fixed-dim/40 h-4 rounded-t-sm"></div>
                      <div className="w-full bg-tertiary-fixed-dim/50 h-10 rounded-t-sm"></div>
                      <div className="w-full bg-tertiary-fixed h-6 rounded-t-sm"></div>
                      <div className="w-full bg-tertiary-fixed-dim h-8 rounded-t-sm"></div>
                    </div>
                  </div>
                </div>

                {/* SVG Revenue growth section */}
                <div className="mb-lg">
                  <div className="bg-surface-container-lowest p-lg rounded-xl shadow-[0px_4px_20px_rgba(26,54,93,0.05)] border border-outline-variant/30">
                    <div className="flex justify-between items-center mb-lg">
                      <h4 className="font-headline-sm text-headline-sm text-primary font-bold">Monthly Revenue Growth</h4>
                      <select className="bg-surface-container border-none rounded-lg text-body-sm px-md py-xs font-bold text-primary focus:ring-0 cursor-pointer">
                        <option>Last 6 Months</option>
                        <option>Last Year</option>
                      </select>
                    </div>
                    
                    {/* Growth Chart */}
                    <div className="h-64 flex items-end justify-between px-md relative">
                      <div className="absolute inset-x-0 top-0 h-px bg-outline-variant/20"></div>
                      <div className="absolute inset-x-0 top-1/4 h-px bg-outline-variant/20"></div>
                      <div className="absolute inset-x-0 top-2/4 h-px bg-outline-variant/20"></div>
                      <div className="absolute inset-x-0 top-3/4 h-px bg-outline-variant/20"></div>
                      
                      <div className="group flex flex-col items-center gap-sm w-12 relative z-10">
                        <div className="chart-bar w-full bg-primary-fixed-dim group-hover:bg-primary transition-colors rounded-t-lg" style={{ height: '120px' }}></div>
                        <span className="font-label-uppercase text-[10px] text-on-surface-variant">Jan</span>
                      </div>
                      <div className="group flex flex-col items-center gap-sm w-12 relative z-10">
                        <div className="chart-bar w-full bg-primary-fixed-dim group-hover:bg-primary transition-colors rounded-t-lg" style={{ height: '160px' }}></div>
                        <span className="font-label-uppercase text-[10px] text-on-surface-variant">Feb</span>
                      </div>
                      <div className="group flex flex-col items-center gap-sm w-12 relative z-10">
                        <div className="chart-bar w-full bg-primary group-hover:bg-primary-container transition-colors rounded-t-lg" style={{ height: '220px' }}></div>
                        <span className="font-label-uppercase text-[10px] font-bold text-primary">Mar</span>
                      </div>
                      <div className="group flex flex-col items-center gap-sm w-12 relative z-10">
                        <div className="chart-bar w-full bg-primary-fixed-dim group-hover:bg-primary transition-colors rounded-t-lg" style={{ height: '190px' }}></div>
                        <span className="font-label-uppercase text-[10px] text-on-surface-variant">Apr</span>
                      </div>
                      <div className="group flex flex-col items-center gap-sm w-12 relative z-10">
                        <div className="chart-bar w-full bg-primary-fixed-dim group-hover:bg-primary transition-colors rounded-t-lg" style={{ height: '240px' }}></div>
                        <span className="font-label-uppercase text-[10px] text-on-surface-variant">May</span>
                      </div>
                      <div className="group flex flex-col items-center gap-sm w-12 relative z-10">
                        <div className="chart-bar w-full bg-primary-fixed-dim group-hover:bg-primary transition-colors rounded-t-lg" style={{ height: '210px' }}></div>
                        <span className="font-label-uppercase text-[10px] text-on-surface-variant">Jun</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Bookings Live List */}
                <section className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(26,54,93,0.05)] overflow-hidden border border-outline-variant/30">
                  <div className="p-lg border-b border-outline-variant flex justify-between items-center">
                    <h4 className="font-headline-sm text-headline-sm text-primary font-bold">Recent Bookings</h4>
                    <button 
                      onClick={() => setActiveTab('bookings')} 
                      className="text-primary font-bold text-body-sm hover:underline"
                    >
                      View All Bookings
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-surface-container-low text-on-surface-variant">
                          <th className="px-lg py-md font-label-uppercase text-label-uppercase">Guest</th>
                          <th className="px-lg py-md font-label-uppercase text-label-uppercase">Destination</th>
                          <th className="px-lg py-md font-label-uppercase text-label-uppercase">Stay Dates</th>
                          <th className="px-lg py-md font-label-uppercase text-label-uppercase">Amount</th>
                          <th className="px-lg py-md font-label-uppercase text-label-uppercase">Status</th>
                          <th className="px-lg py-md"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {bookings && bookings.length > 0 ? (
                          bookings.slice(0, 5).map((b) => {
                            const initials = b.user?.name ? b.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'G';
                            return (
                              <tr key={b.id} className="hover:bg-surface-container transition-colors group">
                                <td className="px-lg py-md flex items-center gap-sm">
                                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-bold text-on-secondary-container">
                                    {initials}
                                  </div>
                                  <div>
                                    <p className="font-body-md font-bold text-primary">{b.user?.name || 'Guest'}</p>
                                    <p className="text-[12px] text-on-surface-variant">ID: #BK-{b.id}</p>
                                  </div>
                                </td>
                                <td className="px-lg py-md text-body-md text-on-surface">
                                  {b.room?.hotel?.hotelName || 'LuxeStay Hotel'}
                                </td>
                                <td className="px-lg py-md text-body-md text-on-surface">
                                  {b.checkIn} - {b.checkOut}
                                </td>
                                <td className="px-lg py-md text-body-md font-bold text-primary">
                                  ${b.totalPrice ? b.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                </td>
                                <td className="px-lg py-md">
                                  <span className={`px-sm py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                                    b.bookingStatus === 'CONFIRMED' 
                                      ? 'bg-primary-fixed text-primary' 
                                      : b.bookingStatus === 'CANCELLED' 
                                        ? 'bg-error-container text-on-error-container' 
                                        : 'bg-tertiary-fixed text-on-tertiary-fixed'
                                  }`}>
                                    {b.bookingStatus}
                                  </span>
                                </td>
                                <td className="px-lg py-md text-right">
                                  <button 
                                    onClick={() => setActiveTab('bookings')} 
                                    className="material-symbols-outlined text-outline hover:text-primary transition-colors"
                                  >
                                    more_vert
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-lg py-lg text-center text-secondary font-body-md italic">
                              No recent bookings registered in the system.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HOTELS CRUD */}
        {activeTab === 'hotels' && (
          <div>
            {/* Modal */}
            {showHotelModal && (
              <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-md animate-fade-in">
                <div className="bg-surface-container-lowest p-lg rounded-xl shadow-2xl w-full max-w-[500px] border border-outline-variant/30 flex flex-col gap-md">
                  <h3 className="font-headline-sm text-headline-sm text-primary border-b border-outline-variant/20 pb-sm font-bold">
                    {hotelForm.id ? 'Modify Hotel Listing' : 'Configure New Hotel'}
                  </h3>
                  <form onSubmit={handleHotelSubmit} className="flex flex-col gap-sm">
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-uppercase text-label-uppercase text-secondary font-bold">Hotel Name</label>
                      <input 
                        type="text" 
                        required 
                        className="w-full px-md py-sm bg-surface-container-low border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-primary-fixed outline-none text-body-sm" 
                        value={hotelForm.hotelName} 
                        onChange={(e) => setHotelForm({ ...hotelForm, hotelName: e.target.value })} 
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-uppercase text-label-uppercase text-secondary font-bold">Location / City</label>
                      <input 
                        type="text" 
                        required 
                        className="w-full px-md py-sm bg-surface-container-low border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-primary-fixed outline-none text-body-sm" 
                        value={hotelForm.location} 
                        onChange={(e) => setHotelForm({ ...hotelForm, location: e.target.value })} 
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-uppercase text-label-uppercase text-secondary font-bold">Branding Photo Asset URL</label>
                      <input 
                        type="text" 
                        required 
                        className="w-full px-md py-sm bg-surface-container-low border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-primary-fixed outline-none text-body-sm" 
                        value={hotelForm.image} 
                        onChange={(e) => setHotelForm({ ...hotelForm, image: e.target.value })} 
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-uppercase text-label-uppercase text-secondary font-bold">Hotel Owner Email Address</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="owner@hotel.com"
                        className="w-full px-md py-sm bg-surface-container-low border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-primary-fixed outline-none text-body-sm" 
                        value={hotelForm.ownerEmail} 
                        onChange={(e) => setHotelForm({ ...hotelForm, ownerEmail: e.target.value })} 
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-uppercase text-label-uppercase text-secondary font-bold">Description Overview</label>
                      <textarea 
                        rows="3" 
                        required 
                        className="w-full px-md py-sm bg-surface-container-low border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-primary-fixed outline-none text-body-sm" 
                        value={hotelForm.description} 
                        onChange={(e) => setHotelForm({ ...hotelForm, description: e.target.value })} 
                      />
                    </div>
                    <div className="flex justify-end gap-sm mt-md">
                      <button 
                        type="button" 
                        onClick={() => setShowHotelModal(false)} 
                        className="font-label-uppercase text-label-uppercase border border-outline-variant px-md py-sm rounded-lg hover:bg-surface-container-high transition-all text-secondary"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="font-label-uppercase text-label-uppercase text-white bg-primary px-md py-sm rounded-lg hover:brightness-110 active:scale-95 transition-all font-bold"
                      >
                        Save Details
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              {hotels.map((h) => (
                <div key={h.id} className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(26,54,93,0.05)] border border-outline-variant/30 overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0px_10px_30px_rgba(26,54,93,0.08)] transition-all duration-300">
                  <div className="h-44 relative">
                    <img src={h.image} alt={h.hotelName} className="w-full h-full object-cover" />
                    <div className="absolute bottom-sm left-sm bg-black/60 backdrop-blur-md px-md py-xs rounded-full text-label-uppercase font-label-uppercase text-white text-[11px]">
                      📍 {h.location}
                    </div>
                  </div>
                  <div className="p-md flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="font-headline-sm text-headline-sm text-primary mb-xs font-bold">{h.hotelName}</h4>
                      <p className="text-[12px] text-secondary font-bold mb-xs select-none">✉️ Owner: {h.ownerEmail || 'admin@hotel.com'}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3 mb-md">
                        {h.description}
                      </p>
                    </div>
                    <div className="flex justify-end gap-xs border-t border-outline-variant/30 pt-md select-none">
                      <button 
                        onClick={() => { setSelectedHotelId(h.id); loadRooms(h.id); setActiveTab('rooms'); }}
                        className="px-sm py-sm border border-primary bg-primary-container/10 rounded-lg text-primary font-bold text-body-sm hover:bg-primary-container/30 transition-all"
                      >
                        Rooms
                      </button>
                      <button 
                        onClick={() => handleEditHotelClick(h)} 
                        className="px-sm py-sm border border-outline rounded-lg text-primary font-bold text-body-sm hover:bg-surface-container-high transition-all"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteHotel(h.id)} 
                        className="px-sm py-sm border border-[#ffdad6] bg-[#ffdad6]/20 rounded-lg text-error font-bold text-body-sm hover:bg-[#ffdad6]/50 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ROOMS CRUD */}
        {activeTab === 'rooms' && (
          <div>
            {/* Modal */}
            {showRoomModal && (
              <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-md animate-fade-in">
                <div className="bg-surface-container-lowest p-lg rounded-xl shadow-2xl w-full max-w-[500px] border border-outline-variant/30 flex flex-col gap-md">
                  <h3 className="font-headline-sm text-headline-sm text-primary border-b border-outline-variant/20 pb-sm font-bold">
                    {roomForm.id ? 'Modify Room Category' : 'Configure New Room'}
                  </h3>
                  <form onSubmit={handleRoomSubmit} className="flex flex-col gap-sm">
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-uppercase text-label-uppercase text-secondary font-bold">Room Category Type</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Deluxe Mountain View" 
                        className="w-full px-md py-sm bg-surface-container-low border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-primary-fixed outline-none text-body-sm" 
                        value={roomForm.roomType} 
                        onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })} 
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-uppercase text-label-uppercase text-secondary font-bold">Nightly Rate ($)</label>
                      <input 
                        type="number" 
                        required 
                        className="w-full px-md py-sm bg-surface-container-low border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-primary-fixed outline-none text-body-sm" 
                        value={roomForm.price} 
                        onChange={(e) => setRoomForm({ ...roomForm, price: e.target.value })} 
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-uppercase text-label-uppercase text-secondary font-bold">Max Capacity Guests</label>
                      <input 
                        type="number" 
                        required 
                        min="1" 
                        className="w-full px-md py-sm bg-surface-container-low border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-primary-fixed outline-none text-body-sm" 
                        value={roomForm.capacity} 
                        onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })} 
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-uppercase text-label-uppercase text-secondary font-bold">Total Rooms Inventory Capacity</label>
                      <input 
                        type="number" 
                        required 
                        min="1" 
                        className="w-full px-md py-sm bg-surface-container-low border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-primary-fixed outline-none text-body-sm" 
                        value={roomForm.totalRooms} 
                        onChange={(e) => setRoomForm({ ...roomForm, totalRooms: Number(e.target.value) })} 
                      />
                    </div>
                    <div className="flex items-center gap-xs mt-xs">
                      <input 
                        type="checkbox" 
                        className="rounded border-outline-variant text-primary focus:ring-primary"
                        checked={roomForm.availability} 
                        onChange={(e) => setRoomForm({ ...roomForm, availability: e.target.checked })} 
                      />
                      <span className="font-label-uppercase text-label-uppercase text-secondary select-none font-bold">Available for bookings</span>
                    </div>
                    <div className="flex justify-end gap-sm mt-md">
                      <button 
                        type="button" 
                        onClick={() => setShowRoomModal(false)} 
                        className="font-label-uppercase text-label-uppercase border border-outline-variant px-md py-sm rounded-lg hover:bg-surface-container-high transition-all text-secondary"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="font-label-uppercase text-label-uppercase text-white bg-primary px-md py-sm rounded-lg hover:brightness-110 active:scale-95 transition-all font-bold"
                      >
                        Save Configuration
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Selector and Table */}
            <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(26,54,93,0.05)] border border-outline-variant/30 overflow-hidden">
              <div className="p-lg border-b border-outline-variant/30 flex justify-between items-center flex-wrap gap-sm select-none">
                <div className="flex items-center gap-sm">
                  <span className="font-label-uppercase text-label-uppercase text-secondary font-bold">Select Hotel Property:</span>
                  <select
                    className="px-md py-sm bg-surface-container border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-primary-fixed outline-none text-body-sm font-bold text-primary cursor-pointer"
                    style={{ width: '280px' }}
                    value={selectedHotelId}
                    onChange={(e) => { setSelectedHotelId(e.target.value); loadRooms(e.target.value); }}
                  >
                    {hotels.map(h => <option key={h.id} value={h.id}>{h.hotelName}</option>)}
                  </select>
                </div>

                <button 
                  onClick={() => { setRoomForm({ id: null, roomType: '', price: '', capacity: 2, availability: true, totalRooms: 1 }); setShowRoomModal(true); }}
                  className="py-sm px-md bg-[#FF7A00] text-white font-bold rounded-lg flex items-center gap-xs active:scale-95 hover:brightness-110 transition-all select-none"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  <span className="font-label-uppercase text-label-uppercase text-white">Add Room Category</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant">
                      <th className="px-lg py-sm font-label-uppercase text-label-uppercase">Room Type</th>
                      <th className="px-lg py-sm font-label-uppercase text-label-uppercase">Nightly rate</th>
                      <th className="px-lg py-sm font-label-uppercase text-label-uppercase">Capacity</th>
                      <th className="px-lg py-sm font-label-uppercase text-label-uppercase">Inventory</th>
                      <th className="px-lg py-sm font-label-uppercase text-label-uppercase">Status</th>
                      <th className="px-lg py-sm"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {rooms.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-lg py-lg text-center text-secondary font-body-md italic">
                          No rooms configured for this hotel property.
                        </td>
                      </tr>
                    ) : (
                      rooms.map((room) => (
                        <tr key={room.id} className="hover:bg-surface-container transition-all">
                          <td className="px-lg py-md">
                            <div className="font-body-md font-bold text-primary">{room.roomType}</div>
                          </td>
                          <td className="px-lg py-md font-bold text-primary">${room.price}</td>
                          <td className="px-lg py-md text-secondary">👤 {room.capacity} Guests</td>
                          <td className="px-lg py-md text-secondary">🔑 {room.totalRooms} Rooms</td>
                          <td className="px-lg py-md">
                            <span className={`px-sm py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              room.availability 
                                ? 'bg-primary-fixed text-primary' 
                                : 'bg-error-container text-on-error-container'
                            }`}>
                              {room.availability ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-lg py-md text-right select-none">
                            <div className="flex gap-xs justify-end">
                              <button onClick={() => handleEditRoomClick(room)} className="px-sm py-xs border border-outline rounded-lg text-primary font-bold text-body-sm hover:bg-surface-container-high transition-all">Edit</button>
                              <button onClick={() => handleDeleteRoom(room.id)} className="px-sm py-xs border border-[#ffdad6] bg-[#ffdad6]/20 rounded-lg text-error font-bold text-body-sm hover:bg-[#ffdad6]/50 transition-all">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BOOKINGS LOG */}
        {activeTab === 'bookings' && (
          <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(26,54,93,0.05)] border border-outline-variant/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant">
                    <th className="px-lg py-sm font-label-uppercase text-label-uppercase">Res Code</th>
                    <th className="px-lg py-sm font-label-uppercase text-label-uppercase">Customer</th>
                    <th className="px-lg py-sm font-label-uppercase text-label-uppercase">Hotel / Room</th>
                    <th className="px-lg py-sm font-label-uppercase text-label-uppercase">Stay Duration</th>
                    <th className="px-lg py-sm font-label-uppercase text-label-uppercase">Charge</th>
                    <th className="px-lg py-sm font-label-uppercase text-label-uppercase">Status</th>
                    <th className="px-lg py-sm"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-surface-container transition-colors">
                      <td className="px-lg py-md font-bold text-primary">RSV-{b.id}</td>
                      <td className="px-lg py-md">
                        <div className="font-bold text-primary">{b.user?.name || 'Guest'}</div>
                        <div className="text-[12px] text-secondary">{b.user?.email || ''}</div>
                      </td>
                      <td className="px-lg py-md">
                        <div className="font-semibold text-primary">{b.room?.hotel?.hotelName || 'Hotel'}</div>
                        <div className="text-[12px] text-secondary">{b.room?.roomType || ''}</div>
                      </td>
                      <td className="px-lg py-md text-secondary font-body-sm">{b.checkIn} to {b.checkOut}</td>
                      <td className="px-lg py-md font-bold text-[#FF7A00]">${b.totalPrice}</td>
                      <td className="px-lg py-md">
                        <span className={`px-sm py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.bookingStatus === 'CONFIRMED' 
                            ? 'bg-primary-fixed text-primary' 
                            : b.bookingStatus === 'CANCELLED' 
                              ? 'bg-error-container text-on-error-container' 
                              : 'bg-tertiary-fixed text-on-tertiary-fixed'
                        }`}>
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="px-lg py-md text-right select-none">
                        <div className="flex gap-xs justify-end">
                          <button onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')} disabled={b.bookingStatus === 'CONFIRMED'} className="px-sm py-xs border border-outline rounded-lg text-primary font-bold text-body-sm hover:bg-surface-container-high transition-all disabled:opacity-50 disabled:pointer-events-none">Confirm</button>
                          <button onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')} disabled={b.bookingStatus === 'CANCELLED'} className="px-sm py-xs border border-[#ffdad6] bg-[#ffdad6]/20 rounded-lg text-error font-bold text-body-sm hover:bg-[#ffdad6]/50 transition-all disabled:opacity-50 disabled:pointer-events-none">Cancel</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: USERS MODERATION */}
        {activeTab === 'users' && (
          <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(26,54,93,0.05)] border border-outline-variant/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant">
                    <th className="px-lg py-sm font-label-uppercase text-label-uppercase">User Code</th>
                    <th className="px-lg py-sm font-label-uppercase text-label-uppercase">Full Name</th>
                    <th className="px-lg py-sm font-label-uppercase text-label-uppercase">Email</th>
                    <th className="px-lg py-sm font-label-uppercase text-label-uppercase">Role</th>
                    <th className="px-lg py-sm font-label-uppercase text-label-uppercase">Account Status</th>
                    <th className="px-lg py-sm"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-container transition-colors" style={{ opacity: u.blocked ? 0.6 : 1 }}>
                      <td className="px-lg py-md font-bold text-primary">#USR-{u.id}</td>
                      <td className="px-lg py-md font-bold text-primary">{u.name}</td>
                      <td className="px-lg py-md text-secondary">{u.email}</td>
                      <td className="px-lg py-md">
                        <span className={`px-sm py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.role === 'ADMIN' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-secondary-container text-on-secondary-container'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-lg py-md">
                        <span className={`px-sm py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.blocked ? 'bg-error-container text-on-error-container' : 'bg-primary-fixed text-primary'}`}>
                          {u.blocked ? 'BLOCKED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-lg py-md text-right select-none">
                        {u.role === 'ADMIN' ? (
                          <span className="text-secondary text-[11px] font-label-uppercase font-bold">Protected Admin</span>
                        ) : (
                          <button
                            onClick={() => handleToggleUserBlock(u.id, u.blocked)}
                            className={`px-md py-xs rounded-lg font-bold text-body-sm transition-all ${
                              u.blocked 
                                ? 'bg-primary-fixed text-primary hover:bg-primary-fixed/80' 
                                : 'border border-[#ffdad6] bg-[#ffdad6]/20 text-error hover:bg-[#ffdad6]/50'
                            }`}
                          >
                            {u.blocked ? 'Unblock Access' : 'Block Access'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: COUPONS BUILDER */}
        {activeTab === 'coupons' && (
          <div className="flex flex-col lg:flex-row gap-lg">
            
            {/* Form Side */}
            <div className="lg:w-1/3 bg-surface-container-lowest p-md rounded-xl shadow-[0px_4px_20px_rgba(26,54,93,0.05)] border border-outline-variant/30 flex flex-col gap-sm">
              <h3 className="font-headline-sm text-headline-sm text-primary mb-xs pb-xs border-b border-outline-variant/20 font-bold">
                Create Discount Code
              </h3>
              <form onSubmit={handleCouponSubmit} className="flex flex-col gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-uppercase text-label-uppercase text-secondary font-bold">Coupon Code (Uppercase)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="WINTER30" 
                    className="w-full px-md py-sm bg-surface-container-low border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-primary-fixed outline-none text-body-sm font-bold text-primary" 
                    style={{ textTransform: 'uppercase' }} 
                    value={couponForm.couponCode} 
                    onChange={(e) => setCouponForm({ ...couponForm, couponCode: e.target.value.toUpperCase() })} 
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-uppercase text-label-uppercase text-secondary font-bold">Discount Percentage (%)</label>
                  <input 
                    type="number" 
                    required 
                    min="5" 
                    max="80" 
                    className="w-full px-md py-sm bg-surface-container-low border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-primary-fixed outline-none text-body-sm text-primary font-bold" 
                    value={couponForm.discountPercentage} 
                    onChange={(e) => setCouponForm({ ...couponForm, discountPercentage: Number(e.target.value) })} 
                  />
                </div>
                <div className="flex items-center gap-xs mt-xs">
                  <input 
                    type="checkbox" 
                    className="rounded border-outline-variant text-primary focus:ring-primary"
                    checked={couponForm.active} 
                    onChange={(e) => setCouponForm({ ...couponForm, active: e.target.checked })} 
                  />
                  <span className="font-label-uppercase text-label-uppercase text-secondary select-none font-bold">Active immediately</span>
                </div>
                <button 
                  type="submit" 
                  className="bg-primary hover:brightness-110 text-white font-bold py-md px-lg rounded-lg w-full transition-all active:scale-95 flex items-center justify-center gap-base mt-sm select-none"
                >
                  <span className="material-symbols-outlined">add</span>
                  Create Promo Code
                </button>
              </form>
            </div>

            {/* List Side */}
            <div className="lg:w-2/3 bg-surface-container-lowest p-md rounded-xl shadow-[0px_4px_20px_rgba(26,54,93,0.05)] border border-outline-variant/30 overflow-hidden">
              <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-xs border-b border-outline-variant/20 px-xs font-bold">
                Active Promotional Coupons
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant">
                      <th className="px-md py-sm font-label-uppercase text-label-uppercase">Code</th>
                      <th className="px-md py-sm font-label-uppercase text-label-uppercase">Discount</th>
                      <th className="px-md py-sm font-label-uppercase text-label-uppercase">Status</th>
                      <th className="px-md py-sm font-label-uppercase text-label-uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {coupons.map((c) => (
                      <tr key={c.id} className="hover:bg-surface-container transition-colors">
                        <td className="px-md py-md font-bold text-primary">{c.couponCode}</td>
                        <td className="px-md py-md font-extrabold text-[#FF7A00]">{c.discountPercentage}% OFF</td>
                        <td className="px-md py-md">
                          <span className={`px-sm py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.active ? 'bg-primary-fixed text-primary' : 'bg-error-container text-on-error-container'}`}>
                            {c.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-md py-md text-right select-none">
                          <div className="flex gap-xs justify-end">
                            <button onClick={() => handleToggleCoupon(c.id, c.active)} className="px-sm py-xs border border-outline rounded-lg text-primary font-bold text-body-sm hover:bg-surface-container-high transition-all">Toggle</button>
                            <button onClick={() => handleDeleteCoupon(c.id)} className="px-sm py-xs border border-[#ffdad6] bg-[#ffdad6]/20 rounded-lg text-error font-bold text-body-sm hover:bg-[#ffdad6]/50 transition-all">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Real-time successful loading toast */}
      <div 
        className={`fixed bottom-lg right-lg bg-primary text-white px-lg py-md rounded-xl shadow-2xl transition-all duration-500 z-[100] flex items-center gap-sm select-none ${
          showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <span className="material-symbols-outlined">check_circle</span>
        <span className="font-bold">Dashboard metrics loaded successfully.</span>
      </div>

    </div>
  );
}
