import { Avatar, Empty, Select, Spin, Tag } from 'antd';
import type { ReactNode } from 'react';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    CreditCard,
    Hash,
    Mail,
    MapPin,
    Phone,
    Scissors,
    ShieldCheck,
    UserRound,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { IMAGE_URL } from '../../../redux/api/baseApi';
import { useGetSingleUserQuery, useUpdateUserMutation } from '../../../redux/features/user/userApi';
import { useUpdateSubscriptionMutation } from '../../../redux/features/subscription/subscriptionApi';

const formatDate = (value?: string) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
};

const formatCurrency = (value?: number) =>
    `$${Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
        case 'completed':
        case 'confirmed':
        case 'active':
            return 'green';
        case 'cancelled':
        case 'canceled':
        case 'rejected':
            return 'red';
        case 'pending':
            return 'gold';
        default:
            return 'default';
    }
};

const InfoRow = ({ label, value }: { label: string; value: ReactNode }) => (
    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 py-3 last:border-0">
        <span className="text-sm text-slate-500">{label}</span>
        <span className="max-w-[65%] text-right text-sm font-medium text-slate-800">{value || 'N/A'}</span>
    </div>
);

const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, isLoading, isError } = useGetSingleUserQuery({ id });
    const userData = data?.data?.user;
    const orderData = data?.data?.userRecentOrderData ?? [];
    const subscription = userData?.subscription;
    const packageData = subscription?.package;

    const [updateUser] = useUpdateUserMutation();
    const [updateSubscription] = useUpdateSubscriptionMutation();

    const handleUpdateUser = async (value: string) => {
        toast.loading('Updating...', { id: 'update-user' });
        try {
            const response = await updateUser({ payload: { verified: value }, id }).unwrap();
            if (response?.success) {
                toast.success(response?.message || 'User updated successfully', { id: 'update-user' });
            } else {
                toast.error(response?.message || 'Failed to update user', { id: 'update-user' });
            }
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to update user', { id: 'update-user' });
            console.error(error);
        }
    };

    const handleUpdateSubscription = async (value: string) => {
        if (!subscription?._id) return;
        toast.loading('Updating...', { id: 'update-subscription' });
        try {
            const response = await updateSubscription({
                id: subscription._id,
                payload: { status: value },
            }).unwrap();
            if (response?.success) {
                toast.success(response?.message || 'Subscription updated successfully', { id: 'update-subscription' });
            } else {
                toast.error(response?.message || 'Failed to update subscription', { id: 'update-subscription' });
            }
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to update subscription', { id: 'update-subscription' });
            console.error(error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    if (isError || !userData) {
        return (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <Empty description={isError ? 'Unable to load user details' : 'User not found'} />
                <button onClick={() => navigate(-1)} className="mt-4 text-sm font-semibold text-primary">
                    Go back
                </button>
            </div>
        );
    }

    const address = [userData.city, userData.state, userData.zipCode].filter(Boolean).join(', ');
    const profile = userData.profile ? `${IMAGE_URL}${userData.profile}` : undefined;

    return (
        <main className="space-y-6 p-4 md:p-6">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        aria-label="Go back"
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <p className="text-sm text-slate-500">Users / {userData.role === 'ARTIST' ? 'Artists' : 'Clients'}</p>
                        <h1 className="text-2xl font-semibold text-slate-900">User details</h1>
                    </div>
                </div>
                <Tag color={userData.role === 'ARTIST' ? 'purple' : 'blue'} className="m-0 rounded-full px-3 py-1">
                    {userData.role || 'USER'}
                </Tag>
            </header>

            <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="h-2 bg-primary" />
                <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-7">
                    <Avatar size={96} src={profile} className="shrink-0 bg-slate-100 text-3xl text-primary">
                        {userData.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-2xl font-semibold text-slate-900">{userData.name || 'Unnamed user'}</h2>
                        <p className="mt-1 break-all text-slate-500">{userData.email || 'No email provided'}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Tag color={userData.verified ? 'green' : 'default'}>
                                {userData.verified ? 'Verified' : 'Unverified'}
                            </Tag>
                            <Tag color={userData.isActive ? 'green' : 'default'}>
                                {userData.isActive ? 'Active' : 'Inactive'}
                            </Tag>
                            {userData.isDeleted && <Tag color="red">Deleted</Tag>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Verification</span>
                        <Select
                            aria-label="User verification status"
                            value={userData.verified ? 'true' : 'false'}
                            onChange={handleUpdateUser}
                            className="w-36"
                            options={[
                                { value: 'true', label: 'Verified' },
                                { value: 'false', label: 'Unverified' },
                            ]}
                        />
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="rounded-lg bg-violet-50 p-2 text-primary"><ShieldCheck size={18} /></div>
                        <h3 className="text-lg font-semibold text-slate-900">Personal information</h3>
                    </div>
                    <InfoRow label="Contact" value={<span className="inline-flex items-center gap-2"><Phone size={14} />{userData.contact}</span>} />
                    <InfoRow label="Email" value={<span className="inline-flex items-center gap-2"><Mail size={14} />{userData.email}</span>} />
                    <InfoRow label="Location" value={<span className="inline-flex items-center gap-2"><MapPin size={14} />{userData.location}</span>} />
                    <InfoRow label="City / State / ZIP" value={address} />
                    <InfoRow label="Joined" value={<span className="inline-flex items-center gap-2"><CalendarDays size={14} />{formatDate(userData.createdAt)}</span>} />
                    <InfoRow label="Referral code" value={userData.reffralCodeDB} />
                    <InfoRow
                        label="Permissions"
                        value={userData.permissions?.length ? userData.permissions.join(', ') : 'None'}
                    />
                    <InfoRow
                        label="Account information"
                        value={userData.accountInfo ? 'Available' : 'Not provided'}
                    />
                </section>

                <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700"><CreditCard size={18} /></div>
                        <h3 className="text-lg font-semibold text-slate-900">Subscription</h3>
                    </div>
                    {subscription ? (
                        <>
                            <InfoRow label="Plan" value={packageData?.name || 'N/A'} />
                            <InfoRow label="Price" value={`$ ${subscription.price ?? packageData?.price ?? 0}`} />
                            <InfoRow label="Status" value={<Tag color={subscription.status === 'active' ? 'green' : 'default'}>{subscription.status || 'N/A'}</Tag>} />
                            <InfoRow label="Period start" value={formatDate(subscription.currentPeriodStart)} />
                            <InfoRow label="Period end" value={formatDate(subscription.currentPeriodEnd)} />
                            <InfoRow label="Transaction ID" value={subscription.trxId} />
                            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                                <span className="text-sm text-slate-500">Update subscription</span>
                                <Select
                                    aria-label="Subscription status"
                                    value={subscription.status}
                                    onChange={handleUpdateSubscription}
                                    className="w-36"
                                    options={[
                                        { value: 'active', label: 'Active' },
                                        { value: 'inactive', label: 'Inactive' },
                                    ]}
                                />
                            </div>
                            {packageData?.offers?.length > 0 && (
                                <div className="mt-5">
                                    <h4 className="mb-2 text-sm font-semibold text-slate-700">Plan benefits</h4>
                                    <ul className="space-y-2">
                                        {packageData.offers.map((offer: string, index: number) => (
                                            <li key={`${offer}-${index}`} className="flex gap-2 text-sm text-slate-600">
                                                <span className="text-emerald-600">✓</span>{offer}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                            No subscription information available.
                        </div>
                    )}
                </section>
            </div>

            <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-2">
                    <div className="rounded-lg bg-amber-50 p-2 text-amber-700"><Scissors size={18} /></div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                            {userData.role === 'ARTIST' ? 'Services' : 'Categories'}
                        </h3>
                        <p className="text-sm text-slate-500">{userData.categories?.length || 0} listed</p>
                    </div>
                </div>
                {userData.categories?.length ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {userData.categories.map((service: any) => (
                            <article key={service._id} className="flex gap-4 rounded-xl border border-slate-100 p-4">
                                {service.image ? (
                                    <img
                                        src={`${IMAGE_URL}${service.image}`}
                                        alt=""
                                        className="h-20 w-20 shrink-0 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                                        <Scissors size={22} />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <h4 className="font-semibold text-slate-800">{service.name || 'Unnamed service'}</h4>
                                        <Tag color={service.status === 'active' ? 'green' : 'default'}>{service.status || 'N/A'}</Tag>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-500">Base price: <span className="font-medium text-slate-700">$ {service.basePrice ?? 0}</span></p>
                                    {service.addOns?.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {service.addOns.map((addon: any) => (
                                                <p key={addon._id} className="text-xs text-slate-500">
                                                    {addon.title}: <span className="font-medium text-slate-700">$ {addon.price ?? 0}</span>
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                        No categories or services listed.
                    </div>
                )}
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Recent orders</h3>
                        <p className="text-sm text-slate-500">Booking details and payment breakdown</p>
                    </div>
                    <Tag className="m-0 rounded-full">{orderData.length} {orderData.length === 1 ? 'order' : 'orders'}</Tag>
                </div>
                {orderData.length ? (
                    <div className="space-y-5">
                        {orderData.map((order: any) => {
                            const artist = order?.artiestId || order?.artistId;
                            const client = order?.userId;
                            const addOns = order?.addOns ?? [];
                            const bookingDate = order?.service_date || order?.date;

                            return (
                                <details
                                    key={order?._id || order?.id}
                                    className="overflow-hidden rounded-xl border border-slate-200"
                                >
                                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 bg-slate-50 px-4 py-3 marker:hidden hover:bg-slate-100 [&::-webkit-details-marker]:hidden sm:px-5">
                                        <div className="flex min-w-0 items-start gap-2">
                                            <Hash size={16} className="mt-0.5 shrink-0 text-slate-400" />
                                            <div className="min-w-0">
                                                <span className="block truncate text-sm font-semibold text-slate-700">
                                                    Order {order?._id || 'N/A'}
                                                </span>
                                                <span className="mt-1 block truncate text-sm text-slate-600">
                                                    {order?.serviceId?.name || 'Service unavailable'}
                                                </span>
                                                <span className="mt-1 block text-xs text-slate-500">
                                                    {formatDate(order?.service_date || order?.date)}{order?.time ? ` · ${order.time}` : ''}
                                                    {' · Total '}{formatCurrency(order?.user_totalPrice ?? order?.price)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Tag color={getStatusColor(order?.status)} className="m-0 capitalize">
                                                {order?.status || 'Unknown'}
                                            </Tag>
                                            <Tag color={order?.isBooked ? 'blue' : 'default'} className="m-0">
                                                {order?.isBooked ? 'Booked' : 'Not booked'}
                                            </Tag>
                                            {order?.specficOrder && <Tag color="purple" className="m-0">Specific order</Tag>}
                                        </div>
                                    </summary>

                                    <div className="grid gap-5 border-t border-slate-100 p-4 sm:p-5 lg:grid-cols-[1.15fr_0.85fr]">
                                        <div className="space-y-5">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Service</p>
                                                    <h4 className="mt-1 text-lg font-semibold text-slate-900">
                                                        {order?.serviceId?.name || 'Service unavailable'}
                                                    </h4>
                                                </div>
                                                <div className="rounded-lg bg-violet-50 px-3 py-2 text-right">
                                                    <p className="text-xs text-violet-700">Order total</p>
                                                    <p className="text-lg font-bold text-violet-900">
                                                        {formatCurrency(order?.user_totalPrice ?? order?.price)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="rounded-lg bg-slate-50 p-3">
                                                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                        <UserRound size={14} /> Client
                                                    </p>
                                                    <p className="font-medium text-slate-800">{client?.name || 'N/A'}</p>
                                                    <p className="break-all text-xs text-slate-500">{client?.email || ''}</p>
                                                </div>
                                                <div className="rounded-lg bg-slate-50 p-3">
                                                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                        <Scissors size={14} /> Artist
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar
                                                            size="small"
                                                            src={artist?.profile ? `${IMAGE_URL}${artist.profile}` : undefined}
                                                        >
                                                            {artist?.name?.[0]}
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium text-slate-800">{artist?.name || 'Not assigned'}</p>
                                                            <p className="break-all text-xs text-slate-500">{artist?.email || ''}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid gap-3 text-sm sm:grid-cols-2">
                                                <div className="flex items-start gap-2 text-slate-600">
                                                    <CalendarDays size={16} className="mt-0.5 shrink-0 text-slate-400" />
                                                    <span><strong className="font-medium text-slate-800">Appointment</strong><br />{formatDate(bookingDate)}</span>
                                                </div>
                                                <div className="flex items-start gap-2 text-slate-600">
                                                    <Clock3 size={16} className="mt-0.5 shrink-0 text-slate-400" />
                                                    <span><strong className="font-medium text-slate-800">Time</strong><br />{order?.time || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-start gap-2 text-slate-600">
                                                    <CalendarDays size={16} className="mt-0.5 shrink-0 text-slate-400" />
                                                    <span><strong className="font-medium text-slate-800">Artist assigned</strong><br />{formatDate(order?.artist_book_date)}</span>
                                                </div>
                                                <div className="flex items-start gap-2 text-slate-600">
                                                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-slate-400" />
                                                    <span><strong className="font-medium text-slate-800">Service started</strong><br />{order?.isServiceStart ? 'Yes' : 'No'}</span>
                                                </div>
                                                <div className="flex items-start gap-2 text-slate-600 sm:col-span-2">
                                                    <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
                                                    <span><strong className="font-medium text-slate-800">Address</strong><br />{order?.address || 'N/A'}</span>
                                                </div>
                                            </div>

                                            {order?.additionalInfo && (
                                                <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Additional information</p>
                                                    <p className="mt-1 text-sm text-amber-900">{order.additionalInfo}</p>
                                                </div>
                                            )}
                                        </div>

                                        <aside className="rounded-lg border border-slate-100 p-4">
                                            <h5 className="mb-3 font-semibold text-slate-800">Price breakdown</h5>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between gap-3 text-slate-600">
                                                    <span>Booking price</span><span>{formatCurrency(order?.price)}</span>
                                                </div>
                                                {addOns.map((addOn: any, index: number) => (
                                                    <div key={addOn?._id || index} className="flex justify-between gap-3 text-slate-600">
                                                        <span className="min-w-0 truncate">{addOn?.name || addOn?.title || 'Add-on'}</span>
                                                        <span className="shrink-0">{formatCurrency(addOn?.price)}</span>
                                                    </div>
                                                ))}
                                                {addOns.length === 0 && (
                                                    <p className="text-xs text-slate-400">No add-ons</p>
                                                )}
                                                <div className="flex justify-between gap-3 border-t border-slate-100 pt-2 text-slate-600">
                                                    <span>Application fee</span><span>{formatCurrency(order?.app_fee)}</span>
                                                </div>
                                                <div className="flex justify-between gap-3 text-slate-600">
                                                    <span>Artist fee</span><span>{formatCurrency(order?.artist_app_fee)}</span>
                                                </div>
                                                <div className="flex justify-between gap-3 border-t border-slate-200 pt-3 font-semibold text-slate-900">
                                                    <span>Client total</span>
                                                    <span>{formatCurrency(order?.user_totalPrice ?? order?.price)}</span>
                                                </div>
                                                <div className="flex justify-between gap-3 text-xs text-slate-500">
                                                    <span>Artist receives</span><span>{formatCurrency(order?.artist_totalPrice)}</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                                                <p className="flex items-center justify-between gap-2">
                                                    <span>Created</span><span>{formatDate(order?.createdAt)}</span>
                                                </p>
                                                <p className="flex items-center justify-between gap-2">
                                                    <span>Appointment date</span><span>{formatDate(order?.date)}</span>
                                                </p>
                                                <p className="flex items-center justify-between gap-2">
                                                    <span>Refunded</span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <CheckCircle2 size={13} className={order?.refund ? 'text-emerald-600' : 'text-slate-300'} />
                                                        {order?.refund ? 'Yes' : 'No'}
                                                    </span>
                                                </p>
                                            </div>
                                        </aside>
                                    </div>
                                </details>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-xl bg-slate-50 p-8">
                        <Empty description="No recent orders" />
                    </div>
                )}
            </section>
        </main>
    );
};

export default UserDetails;
