import React, { useState, useEffect, useRef } from 'react';
import { Modal, Select, Button, Spin, Avatar } from 'antd';
import { User, Mail, Phone, MapPin, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetAllUsersQuery } from '../../../../redux/features/user/userApi';
import { useReassignOrderMutation } from '../../../../redux/features/booking/bookingApi';
import { IMAGE_URL } from '../../../../redux/api/baseApi';

interface IAssignArtistModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    bookingId: string;
    currentArtist?: {
        _id?: string;
        name?: string;
        email?: string;
        profile?: string;
    } | null;
}

const AssignArtistModal: React.FC<IAssignArtistModalProps> = ({
    open,
    setOpen,
    bookingId,
    currentArtist,
}) => {
    const [page, setPage] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');
    const [artists, setArtists] = useState<any[]>([]);
    const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
    const [selectedArtist, setSelectedArtist] = useState<any>(null);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Reassign mutation hook
    const [reassignOrder, { isLoading: isReassigning }] = useReassignOrderMutation();

    // Debounce search input
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            setDebouncedSearch(value);
        }, 400);
    };

    // Query artists list with pagination & search
    const { data, isLoading, isFetching } = useGetAllUsersQuery(
        {
            query: `?role=ARTIST&searchTerm=${encodeURIComponent(debouncedSearch)}&page=${page}&limit=10`,
        },
        {
            skip: !open,
        },
    );

    // Reset when modal opens or closes
    useEffect(() => {
        if (open) {
            setPage(1);
            setSearchTerm('');
            setDebouncedSearch('');
            setSelectedArtistId(null);
            setSelectedArtist(null);
            setArtists([]);
            setHasMore(true);
        }
    }, [open]);

    // Reset list and page on search term change
    useEffect(() => {
        setPage(1);
        setArtists([]);
        setHasMore(true);
    }, [debouncedSearch]);

    // Handle paginated response appending
    useEffect(() => {
        if (data?.data) {
            const newArtists = data.data;
            if (page === 1) {
                setArtists(newArtists);
            } else {
                setArtists((prev) => {
                    const existingIds = new Set(prev.map((item) => item._id));
                    const uniqueNewItems = newArtists.filter((item: any) => !existingIds.has(item._id));
                    return [...prev, ...uniqueNewItems];
                });
            }

            const total = data?.pagination?.total ?? 0;
            const limit = data?.pagination?.limit ?? 10;
            const totalPages = data?.pagination?.totalPage ?? Math.ceil(total / limit);
            setHasMore(page < totalPages);
        }
    }, [data, page]);

    // Handle dropdown infinite scroll
    const handlePopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { target } = e;
        const selectTarget = target as HTMLDivElement;
        if (selectTarget.scrollTop + selectTarget.clientHeight >= selectTarget.scrollHeight - 15) {
            if (!isFetching && hasMore) {
                setPage((prevPage) => prevPage + 1);
            }
        }
    };

    // Handle selecting an artist
    const handleSelectArtist = (value: string) => {
        setSelectedArtistId(value);
        const found = artists.find((artist) => artist._id === value);
        if (found) {
            setSelectedArtist(found);
        }
    };

    // Confirm artist reassignment
    const handleConfirm = async () => {
        if (!selectedArtistId) {
            toast.error('Please select an artist to assign.');
            return;
        }

        if (currentArtist?._id && currentArtist._id === selectedArtistId) {
            toast.error('The selected artist is already assigned to this booking.');
            return;
        }

        const toastId = toast.loading('Assigning artist...');
        try {
            const res = await reassignOrder({
                bookingId,
                artistId: selectedArtistId,
            }).unwrap();

            if (res?.success !== false) {
                toast.success(res?.message || 'Artist assigned successfully!', { id: toastId });
                setOpen(false);
            } else {
                toast.error(res?.message || 'Failed to assign artist.', { id: toastId });
            }
        } catch (error: any) {
            console.error('Error assigning artist:', error);
            toast.error(error?.data?.message || 'Failed to assign artist.', { id: toastId });
        }
    };

    const getImageUrl = (path?: string) => {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        return `${IMAGE_URL}${path}`;
    };

    return (
        <Modal
            centered
            open={open}
            onCancel={() => !isReassigning && setOpen(false)}
            footer={null}
            width={540}
            className="assign-artist-modal"
        >
            <div className="pt-2 pb-1">
                {/* Header */}
                <div className="mb-5">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {currentArtist?.name ? 'Reassign Artist' : 'Assign Artist'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Select an available artist from the list to assign to this booking order.
                    </p>
                </div>

                {/* Current Artist Info if exists */}
                {currentArtist?.name && (
                    <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar
                                size={40}
                                src={getImageUrl(currentArtist.profile)}
                                icon={<User size={20} />}
                                className="bg-purple-200 text-purple-700 flex-shrink-0"
                            />
                            <div>
                                <p className="text-xs text-purple-600 font-medium uppercase tracking-wider">
                                    Currently Assigned
                                </p>
                                <p className="font-semibold text-gray-800 text-sm">{currentArtist.name}</p>
                                {currentArtist.email && (
                                    <p className="text-xs text-gray-500">{currentArtist.email}</p>
                                )}
                            </div>
                        </div>
                        {selectedArtist && (
                            <ArrowRight size={20} className="text-purple-400 mx-2 flex-shrink-0" />
                        )}
                    </div>
                )}

                {/* Dropdown / Searchable Select */}
                <div className="space-y-2 mb-4">
                    <label className="block text-sm font-semibold text-gray-700">
                        Search & Select Artist <span className="text-red-500">*</span>
                    </label>
                    <Select
                        showSearch
                        value={selectedArtistId}
                        placeholder="Search by artist name"
                        defaultActiveFirstOption={false}
                        filterOption={false}
                        onSearch={handleSearch}
                        onChange={handleSelectArtist}
                        onPopupScroll={handlePopupScroll}
                        loading={isLoading && page === 1}
                        className="w-full h-11"
                        notFoundContent={
                            isLoading || isFetching ? (
                                <div className="flex items-center justify-center p-4 gap-2 text-sm text-gray-500">
                                    <Spin size="small" /> Loading artists...
                                </div>
                            ) : (
                                <div className="p-4 text-center text-sm text-gray-400 flex flex-col items-center gap-1">
                                    <AlertCircle size={20} className="text-gray-300" />
                                    <span>No artists found for "{searchTerm}"</span>
                                </div>
                            )
                        }
                        popupRender={(menu: any) => (
                            <div>
                                {menu}
                                {isFetching && page > 1 && (
                                    <div className="flex items-center justify-center py-2 gap-2 text-xs text-purple-600 font-medium bg-purple-50">
                                        <Spin size="small" /> Loading more artists...
                                    </div>
                                )}
                                {!hasMore && artists.length > 0 && (
                                    <div className="text-center py-2 text-xs text-gray-400 bg-gray-50 border-t border-gray-100">
                                        All {artists.length} artists loaded
                                    </div>
                                )}
                            </div>
                        )}
                    >
                        {artists.map((artist: any) => (
                            <Select.Option key={artist?._id} value={artist?._id}>
                                <div className="flex items-center gap-3 py-1">
                                    <Avatar
                                        size={32}
                                        src={getImageUrl(artist?.profile)}
                                        icon={<User size={16} />}
                                        className="bg-purple-100 text-purple-600 flex-shrink-0"
                                    />
                                    <div className="flex flex-col overflow-hidden text-left">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm text-gray-900 truncate">
                                                {artist.name}
                                            </span>
                                            {artist.verified && (
                                                <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500 truncate">
                                            {artist.email || 'No email provided'}
                                        </span>
                                    </div>
                                </div>
                            </Select.Option>
                        ))}
                    </Select>
                    <p className="text-xs text-gray-400">
                        Scroll within the dropdown list to load more artists automatically.
                    </p>
                </div>

                {/* Selected Artist Preview Card */}
                {selectedArtist && (
                    <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Selected Artist Preview
                        </p>
                        <div className="flex items-start gap-3">
                            <Avatar
                                size={48}
                                src={getImageUrl(selectedArtist.profile)}
                                icon={<User size={24} />}
                                className="bg-purple-100 text-purple-700 flex-shrink-0 border border-purple-200"
                            />
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-gray-900 text-base truncate">
                                        {selectedArtist.name}
                                    </h4>
                                    {selectedArtist.verified && (
                                        <span className="px-2 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 rounded-full">
                                            Active
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                                    {selectedArtist.email && (
                                        <div className="flex items-center gap-1.5 truncate">
                                            <Mail size={13} className="text-gray-400 flex-shrink-0" />
                                            <span className="truncate">{selectedArtist.email}</span>
                                        </div>
                                    )}
                                    {selectedArtist.contact && (
                                        <div className="flex items-center gap-1.5 truncate">
                                            <Phone size={13} className="text-gray-400 flex-shrink-0" />
                                            <span className="truncate">{selectedArtist.contact}</span>
                                        </div>
                                    )}
                                    {selectedArtist.location && (
                                        <div className="flex items-center gap-1.5 truncate sm:col-span-2">
                                            <MapPin size={13} className="text-gray-400 flex-shrink-0" />
                                            <span className="truncate">{selectedArtist.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                    <Button
                        onClick={() => setOpen(false)}
                        disabled={isReassigning}
                        className="h-10 px-5 rounded-lg text-gray-600 hover:text-gray-800"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleConfirm}
                        loading={isReassigning}
                        disabled={!selectedArtistId || isReassigning}
                        className="h-10 px-6 rounded-lg font-medium bg-[#9558B7] hover:bg-[#834ba3] text-white shadow-sm"
                    >
                        Confirm Assignment
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AssignArtistModal;
