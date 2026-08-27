// import { SuiSpinner } from "@storefront-ui/react";
import { SfLoaderCircular } from '@storefront-ui/react';
import { memo } from 'react';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-32">
    <SfLoaderCircular className="!ring-yellow-200" size="2xl" />
  </div>
);

export default memo(LoadingSpinner);
