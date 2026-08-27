import React from 'react';
import ProfilePageLayout from '../layouts/ProfilePageLayout';
import OrderHistory from '../components/profile/OrderHistory';

const Orders = () => {
  return (
    <ProfilePageLayout>
      <OrderHistory />
    </ProfilePageLayout>
  );
};

export default Orders;
