import { getFreelancer } from '@/actions/shared/freelancer';
import { LogoutLink } from '../form';
import UserMenu from '../menu/menu-user';

export default async function HeaderMenus({ isProfileActive }) {
  const freelancer = await getFreelancer();

  if (!freelancer) return null;

  return (
    <div className='col-6 col-lg-auto'>
      <div className='text-center text-lg-end header_right_widgets'>
        <ul className='dashboard_dd_menu_list d-flex align-items-center justify-content-end mb-0 p-0'>
          <div className='ml10'>
            {isProfileActive ? (
              <UserMenu />
            ) : (
              <LogoutLink
                item={{
                  id: 8,
                  name: 'Αποσύνδεση',
                  icon: 'flaticon-logout',
                  path: '/logout',
                }}
                custom
              />
            )}
          </div>
        </ul>
      </div>
    </div>
  );
}
