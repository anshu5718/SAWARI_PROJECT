import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
    confirmed: 'bg-green-500',
    pending: 'bg-yellow-500',
    cancelled: 'bg-red-500',
    completed: 'bg-blue-500',
};

const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toDateString() : 'N/A';

const formatAmount = (amount) =>
    amount ? Number(amount).toLocaleString() : '0.00';

const BookingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const getBookingDetails = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8000/api/booking-details/${id}/`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                    }
                );

                // 👇 Read as text first (IMPORTANT FIX)
                const text = await response.text();

                // Handle HTTP errors
                if (!response.ok) {
                    console.error('❌ API Error Response:', text);

                    if (response.status === 401 || response.status === 403) {
                        navigate('/login'); // redirect if not logged in
                        return;
                    }

                    throw new Error(`Error: ${response.status}`);
                }

                // 👇 Safe JSON parsing
                let data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    console.error('❌ Non-JSON response received:');
                    console.error(text);
                    throw new Error('Server returned invalid JSON');
                }

                if (isMounted) setBooking(data);
            } catch (err) {
                if (isMounted) setError(err.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (id) getBookingDetails();

        return () => {
            isMounted = false;
        };
    }, [id, navigate]);

    if (loading)
        return (
            <div className="p-10 text-center animate-pulse">
                Fetching booking details...
            </div>
        );

    if (error)
        return (
            <div className="p-10 text-red-500 text-center font-semibold">
                Error: {error}
            </div>
        );

    if (!booking)
        return (
            <div className="p-10 text-center opacity-60">
                No booking found.
            </div>
        );

    const statusClass =
        STATUS_COLORS[booking.status?.toLowerCase()] || 'bg-gray-500';

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1
                className="text-2xl font-bold mb-6"
                style={{ color: 'var(--text-primary)' }}
            >
                Booking Details
            </h1>

            <div
                className="rounded-2xl border p-6 space-y-6 shadow-sm"
                style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border)',
                }}
            >
                {/* Header */}
                <div
                    className="flex justify-between items-start border-b pb-4"
                    style={{ borderColor: 'var(--border)' }}
                >
                    <div>
                        <h2 className="text-xl font-semibold">
                            {booking.vehicle}
                        </h2>
                        <p className="text-sm opacity-70 italic">
                            {booking.vehicle_type}
                        </p>
                    </div>

                    <span
                        className={`px-4 py-1 rounded-full text-xs font-bold uppercase text-white ${statusClass}`}
                    >
                        {booking.status}
                    </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <DetailItem label="Customer" value={booking.customer} />
                        <DetailItem label="Driver" value={booking.owner} />
                        <DetailItem
                            label="Pickup Location"
                            value={booking.pickup_location || 'N/A'}
                        />
                        <DetailItem
                            label="Drop-off Location"
                            value={booking.dropoff_location || 'N/A'}
                        />
                    </div>

                    <div className="space-y-4">
                        <DetailItem
                            label="Start Date"
                            value={formatDate(booking.start_date)}
                        />
                        <DetailItem
                            label="End Date"
                            value={formatDate(booking.end_date)}
                        />
                        <DetailItem
                            label="Payment Status"
                            value={booking.payment_status || 'Pending'}
                            isError={booking.payment_status === 'failed'}
                        />
                    </div>
                </div>

                {/* Amount */}
                <div
                    className="pt-6 border-t flex justify-between items-center"
                    style={{ borderColor: 'var(--border)' }}
                >
                    <span className="text-lg font-medium opacity-80">
                        Total Amount
                    </span>
                    <span className="text-2xl font-bold text-[var(--accent)]">
                        Rs. {formatAmount(booking.amount)}
                    </span>
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({ label, value, isError = false }) => (
    <div>
        <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1 font-bold">
            {label}
        </p>
        <p
            className={`font-medium ${
                isError ? 'text-red-500' : 'text-[var(--text-primary)]'
            }`}
        >
            {value}
        </p>
    </div>
);

export default BookingDetails;
