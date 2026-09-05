import { useState } from 'react';
import { useGetSingleBookingQuery } from '../../../redux/features/booking/bookingApi';
import { useParams } from 'react-router-dom';
import { IMAGE_URL } from '../../../redux/api/baseApi';
import Loader from '../../../components/ui/Loader';
import { Button } from 'antd';
import { UserCheck } from 'lucide-react';
import AssignArtistModal from './components/AssignArtistModal';

const BookingDetailsPage = () => {
    const { id } = useParams();
    const { data, isLoading } = useGetSingleBookingQuery({ id });
    const booking = data?.data;
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <Loader />
            </div>
        );
    }

    return (
        <div className="grid gap-4 p-4">
            <div>
                <h1 className="text-3xl text-primary font-semibold">Booking Management</h1>
            </div>
            <section className="p-8 bg-white rounded-xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                    <div>
                        <h1 className="text-xl font-semibold mb-4">Client Information</h1>
                        <div className="grid gap-4">
                            <p className="grid grid-cols-3 gap-2">
                                <span>Client name</span>
                                <span>:</span>
                                <span>{booking?.userId?.name || 'N/A'}</span>
                            </p>
                            <p className="grid grid-cols-3 gap-2">
                                <span>Email</span>
                                <span>:</span>
                                <span>{booking?.userId?.email || 'N/A'}</span>
                            </p>
                            <p className="grid grid-cols-3 gap-2">
                                <span>Booking Date</span>
                                <span>:</span>
                                <span>{booking?.service_date?.split('T')[0] || 'N/A'}</span>
                            </p>
                            <p className="grid grid-cols-3 gap-2">
                                <span>Subscription plan</span>
                                <span>:</span>
                                <span>{booking?.userId?.subscription?.package?.name || 'N/A'}</span>
                            </p>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold mb-4">Artist Information</h1>
                        <div className="grid gap-4">
                            <p className="grid grid-cols-3 gap-2">
                                <span>Artist name</span>
                                <span>:</span>
                                <span>{booking?.artiestId?.name || 'Not assigned'}</span>
                            </p>
                            <p className="grid grid-cols-3 gap-2">
                                <span>Email</span>
                                <span>:</span>
                                <span>{booking?.artiestId?.email || 'N/A'}</span>
                            </p>
                            <p className="grid grid-cols-3 gap-2">
                                <span>Booking Date</span>
                                <span>:</span>
                                <span>{booking?.artist_book_date?.split('T')[0] || 'N/A'}</span>
                            </p>
                            <p className="grid grid-cols-3 gap-2">
                                <span>Subscription plan</span>
                                <span>:</span>
                                <span>{booking?.artiestId?.subscription?.package?.name || 'N/A'}</span>
                            </p>
                        </div>
                        {/* assign artist */}
                        <div className="mt-6">
                            <Button
                                type="primary"
                                onClick={() => setIsAssignModalOpen(true)}
                                className="h-10 px-5 font-medium rounded-lg flex items-center gap-2 bg-[#9558B7] hover:bg-[#834ba3] text-white"
                            >
                                <UserCheck size={18} />
                                {booking?.artiestId ? 'Reassign Artist' : 'Assign Artist'}
                            </Button>
                        </div>
                    </div>
                    {/* service info */}
                    <div className="py-6">
                        <h1 className="text-xl font-semibold mb-4">Service Information</h1>
                        <div className="grid gap-4">
                            <p className="grid grid-cols-3 gap-2">
                                <span>Category</span>
                                <span>:</span>
                                <span>{booking?.serviceId?.category?.name}</span>
                            </p>
                            <p className="grid grid-cols-3 gap-2">
                                <span>Sub-category</span>
                                <span>:</span>
                                <span>{booking?.serviceId?.subCategory?.name}</span>
                            </p>
                            <p className="grid grid-cols-3 gap-2">
                                <span>Service name</span>
                                <span>:</span>
                                <span>{booking?.serviceId?.name}</span>
                            </p>
                            <p className="grid grid-cols-3 gap-2">
                                <span>Service image</span>
                                <span>:</span>
                                <img
                                    src={`${IMAGE_URL}${booking?.serviceId?.image}`}
                                    alt="service-image"
                                    className="size-8 rounded"
                                />
                            </p>
                            <p className="grid grid-cols-3 gap-2">
                                <span>Base Price</span>
                                <span>:</span>
                                <span>${booking?.price}</span>
                            </p>
                            <p className="grid grid-cols-3 gap-2">
                                <span>Add-Ons</span>
                                <span>:</span>
                                <div>
                                    {booking?.serviceId?.addOns?.length > 0 ? (
                                        booking?.serviceId.addOns.map((item: any, index: number) => (
                                            <span key={index} className="block">
                                                {item.title} (${item.price})
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-500">No Add-Ons</span>
                                    )}
                                </div>
                            </p>
                            <p className="grid grid-cols-3 gap-2">
                                <span>Booking Date</span>
                                <span>:</span>
                                <span className="flex items-center gap-2">{booking?.createdAt?.split('T')[0]}</span>
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                <span>Cancelled By</span>
                                <span>:</span>
                                <span>{booking?.cancelled_by || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span>Status</span>
                                <span>:</span>
                                <span className="capitalize">{booking?.status || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span>Refund</span>
                                <span>:</span>
                                <span>{booking?.refund || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Assign / Reassign Artist Modal */}
            {booking && (
                <AssignArtistModal
                    open={isAssignModalOpen}
                    setOpen={setIsAssignModalOpen}
                    bookingId={id || booking?._id}
                    currentArtist={booking?.artiestId}
                />
            )}
        </div>
    );
};

export default BookingDetailsPage;

