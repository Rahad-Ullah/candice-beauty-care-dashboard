import { Table, Input, Select } from 'antd';
import { Info, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetAllUsersQuery, useUpdateUserMutation } from '../../../redux/features/user/userApi';
import { useUpdateSearchParams } from '../../../utils/updateSearchParams';
import { getSearchParams } from '../../../utils/getSearchParams';
import toast from 'react-hot-toast';

const { Option } = Select;

const Clients = () => {
    const navigate = useNavigate();

    const { searchTerm = '', verified = '' } = getSearchParams();
    const udpateSearchParams = useUpdateSearchParams();

    const { data, isLoading } = useGetAllUsersQuery({
        query: `${location.search}${location.search ? '&role=USER' : '?role=USER'}`,
    });
    const usersData = data?.data;
    const pagination = data?.pagination;

    const [updateUser] = useUpdateUserMutation();

    // Column definitions
    const columns = [
        {
            title: 'Client',
            key: 'client',
            render: (item: any) => <p>{item?.name}</p>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Contact',
            dataIndex: 'contact',
            key: 'contact',
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
        },
        {
            title: 'Subscription Plan',
            key: 'plan',
            render: (item: any) => <a>{item?.subscription?.package?.name}</a>,
        },
        {
            title: 'Joining Date',
            key: 'joiningDate',
            render: (item: any) => <a>{new Date(item?.createdAt).toLocaleDateString()}</a>,
        },
        {
            title: 'Action',
            key: 'action',
            render: (item: any) => (
                <div className="flex items-center gap-2">
                    <Select
                        value={item?.verified ? 'true' : 'false'}
                        onSelect={(value) => handleUpdateUser(item?._id, value)}
                        className="w-24 h-[35px]"
                    >
                        <Option value={'true'}>Active</Option>
                        <Option value={'false'}>Inactive</Option>
                    </Select>
                    <button
                        onClick={() => navigate(`/user-details/${item?._id}`)}
                        aria-label={`View ${item?.name || 'client'} details`}
                        className="text-primary font-semibold rounded-md h-[35px]"
                    >
                        <Info />
                    </button>
                </div>
            ),
        },
    ];

    // handle update user
    const handleUpdateUser = async (id: string, status: any) => {
        toast.loading('Updating user...', { id: 'update-user' });
        try {
            const res = await updateUser({ payload: { verified: status }, id }).unwrap();
            if (res.success) {
                toast.success(res.message || 'User updated successfully', { id: 'update-user' });
            }
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user', { id: 'update-user' });
        }
    };

    return (
        <div className="grid gap-4 p-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl text-[#2C2C2C] font-semibold">Clients</h1>
                </div>
                <div className="flex items-center gap-5 justify-end">
                    <Input
                        style={{
                            maxWidth: 300,
                            height: 40,
                        }}
                        placeholder="Search"
                        prefix={<Search size={20} color="#2C2C2C" />}
                        defaultValue={searchTerm}
                        onChange={(e) => udpateSearchParams({ searchTerm: e.target.value, page: 1 })}
                    />

                    {/* Dropdown Filter */}
                    <Select
                        onSelect={(value) => udpateSearchParams({ verified: value, page: 1 })}
                        value={verified}
                        className="w-32 h-[40px]"
                    >
                        <Option value="">All</Option>
                        <Option value={'true'}>Active</Option>
                        <Option value={'false'}>Inactive</Option>
                    </Select>
                </div>
            </div>
            <Table
                columns={columns}
                dataSource={usersData}
                pagination={{
                    total: pagination?.total,
                    pageSize: pagination?.limit,
                    current: pagination?.page,
                    onChange: (page) => {
                        udpateSearchParams({ page });
                    },
                }}
                loading={isLoading}
                rowClassName="hover:bg-gray-100"
            />
        </div>
    );
};

export default Clients;
