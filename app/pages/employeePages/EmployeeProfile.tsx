import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '../../Store';
import ContactInfoCard from '../../components/employee-management/profile/ContactInfoCard';
import EmploymentDetailsCard from '../../components/employee-management/profile/EmploymentDetailsCard';
import LeaveSummaryCard from '../../components/employee-management/profile/LeaveSummaryCard';
import PersonalInfoCard from '../../components/employee-management/profile/PersonalInfoCard';
import ProfileHeader from '../../components/employee-management/profile/ProfileHeader';
import { findCurrentEmployee } from '../../lib/Utils';
import { employeeAPI } from '../../services/Api';

export default function EmployeeProfile() {
  const admin = useSelector((s: RootState) => s.auth.admin);

  const { data: employees = [], isLoading, isError } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeAPI.fetchAll,
  });

  const user = findCurrentEmployee(employees, admin?.email);

  return (
    <>
      
      <main className="flex-1 flex flex-col relative">
        <div className="p-8 flex-1">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {isLoading ? (
              <div className="text-center py-10">Loading profile details...</div>
            ) : isError || !user ? (
              <div className="text-center py-10 text-error">Error loading profile details. User not found.</div>
            ) : (
              <>
                {/* Profile Header */}
                <ProfileHeader
                  name={user.fullName}
                  department={user.department}
                  status={user.status}
                  designation={user.designation}
                  employeeId={`EMP-${user.empId}`}
                  editUrl={`/employee-management/${user.id}/edit`}
                />

                {/* Detail Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PersonalInfoCard
                    dob={user.dateOfJoining} // Placeholder, real DOB isn't in DB right now
                    gender="Not Specified"
                  />
                  <ContactInfoCard
                    email={user.email}
                    phone={user.phone}
                  />
                  <EmploymentDetailsCard
                    department={user.department}
                    designation={user.designation}
                  />
                  <LeaveSummaryCard />
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
