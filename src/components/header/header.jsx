import { NavMenu } from '../navigation';
import HeaderLogo from './header-logo';
import HeaderMobile from './header-mobile';
import HeaderStickyWrapper from './header-sticky';
import { MegaMenu_D } from '../dynamic';
import { RegisterProButton } from '../button';
import { UserMenu } from '../menu';

export default function Header({ header }) {
  const categories = header
    ? header.data?.attributes?.categories?.data?.map((item, i) => ({
        id: i + 1,
        label: item.attributes?.label,
        slug: item.attributes?.slug,
        icon: item.attributes?.icon,
        subcategories:
          item.attributes?.subcategories?.data?.map((subcategory) => ({
            label: subcategory.attributes?.label,
            slug: subcategory.attributes?.slug,
            subdivisions:
              subcategory.attributes?.subdivisions?.data?.map(
                (subdivision) => ({
                  label: subdivision.attributes?.label,
                  slug: subdivision.attributes?.slug,
                }),
              ) || [],
          })) || [],
      })) || []
    : [];

  return (
    <>
      <HeaderStickyWrapper>
        <nav className='posr'>
          <div className='container posr'>
            <div className='row align-items-center justify-content-between'>
              <div className='col-auto px-0 px-xl-3'>
                <div className='d-flex align-items-center justify-content-between'>
                  <HeaderLogo />
                  <div className='home1_style'>
                    <MegaMenu_D categories={categories} />
                  </div>
                  {/* <Navigation /> */}
                  <NavMenu />
                  {/* <Navigation id="respMenu" /> */}
                </div>
              </div>
              <div className='col-auto pe-0 pe-xl-3'>
                <div className='d-flex align-items-center'>
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
