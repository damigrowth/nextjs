import { NavMenu } from '@/components/layout/navigation';
import HeaderLogo from './header-logo';
import HeaderMobile from './header-mobile';
import HeaderStickyWrapper from './header-sticky';
// import { MegaMenu_D } from '../dynamic';
import { RegisterProButton } from '@/components/button';
import { UserMenu } from '@/components/menu';

export default function Header() {
  // const categories = header
  //   ? header.data?.attributes?.categories?.data?.map((item, i) => ({
  //       id: i + 1,
  //       label: item.attributes?.label,
  //       slug: item.attributes?.slug,
  //       icon: item.attributes?.icon,
  //       subcategories:
  //         item.attributes?.subcategories?.data?.map((subcategory) => ({
  //           label: subcategory.attributes?.label,
  //           slug: subcategory.attributes?.slug,
  //           subdivisions:
  //             subcategory.attributes?.subdivisions?.data?.map(
  //               (subdivision) => ({
  //                 label: subdivision.attributes?.label,
  //                 slug: subdivision.attributes?.slug,
  //               }),
  //             ) || [],
  //         })) || [],
  //     })) || []
  //   : [];

  return (
    <>
      <HeaderStickyWrapper>
        <nav className='relative'>
          <div className='container mx-auto px-4 relative'>
            <div className='flex items-center justify-between'>
              <div className='px-0 xl:px-3'>
                <div className='flex items-center justify-between'>
                  <HeaderLogo />
                  <div className='home1_style'>
                    {/* Needs Static Taxonomy */}
                    {/* <MegaMenu_D categories={categories} /> */}
                  </div>
                  {/* <Navigation /> */}
                  <NavMenu />
                  {/* <Navigation id="respMenu" /> */}
                </div>
              </div>
              <div className='pe-0 xl:pe-3'>
                <div className='flex items-center'>
                  <RegisterProButton />
                  <UserMenu />
                </div>
              </div>
            </div>
          </div>
        </nav>
      </HeaderStickyWrapper>
      <HeaderMobile />
    </>
  );
}
