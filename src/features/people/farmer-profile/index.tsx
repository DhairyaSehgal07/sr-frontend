import { Link, getRouteApi } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useFarmerStorageLinkGatePasses } from '@/features/people/api/use-farmer-storage-link-gate-passes';

import { FarmerProfileGatePasses } from './components/farmer-profile-gate-passes';
import { FarmerProfileHeader } from './components/farmer-profile-header';

const farmerProfileRouteApi = getRouteApi('/_authenticated/people/$id');

const FarmerProfilePage = () => {
  const { id } = farmerProfileRouteApi.useParams();
  const { name, mobileNumber, accountNumber, address } = farmerProfileRouteApi.useSearch();

  const gatePassesQuery = useFarmerStorageLinkGatePasses(id);

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ml-2 h-9 w-fit px-2 text-muted-foreground"
      >
        <Link to="/people" search={{ tab: 'people' }}>
          <ArrowLeft className="mr-1.5 size-4 text-primary" />
          Back to people
        </Link>
      </Button>

      <FarmerProfileHeader
        name={name}
        mobileNumber={mobileNumber}
        accountNumber={accountNumber}
        address={address}
        gatePasses={gatePassesQuery.data}
        isLoadingGatePasses={gatePassesQuery.isLoading}
      />

      <FarmerProfileGatePasses query={gatePassesQuery} />
    </main>
  );
};

export default FarmerProfilePage;
