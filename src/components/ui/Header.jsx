import Image from "next/image";
import Link from "next/link";
import UserImage from "../user/UserImage";
import MegaMenu from "./MegaMenu";
import NavMenu from "./NavMenu";
import HeaderStickyWrapper from "./HeaderStickyWrapper";
import HeaderMobile from "./HeaderMobile";
import HeaderLogo from "./HeaderLogo";

export default function Header({ authenticated, user, header }) {
  const categories = header.data.attributes.categories.data.map((item, i) => ({
    id: i + 1,
    label: item.attributes.label,
    slug: item.attributes.slug,
    icon: item.attributes.icon,
    subcategories: item.attributes.subcategories.data.map((subcategory) => ({
      label: subcategory.attributes.label,
      slug: subcategory.attributes.slug,
      subdivisions: subcategory.attributes.subdivisions.data.map(
        (subdivision) => ({
          label: subdivision.attributes.label,
          slug: subdivision.attributes.slug,
        })
      ),
    })),
  }));
  return (
    <>
      <HeaderStickyWrapper>
        <nav className="posr">
          <div className="container posr">
            <div className="row align-items-center justify-content-between">
              <div className="col-auto px-0 px-xl-3">
                <div className="d-flex align-items-center justify-content-between">
                  <HeaderLogo />
                  <div className="home1_style">
                    <MegaMenu categories={categories} />
                  </div>
                  {/* <Navigation /> */}
                  <NavMenu />
                  {/* <Navigation id="respMenu" /> */}
                </div>
              </div>

              <div className="col-auto pe-0 pe-xl-3">
                <div className="d-flex align-items-center">
                  <Link
                    className="login-info mx15-xl mx30"
                    href="/become-seller"
                  >
                    <span className="d-none d-xl-inline-block">
                      Καταχώριση Επαγγελματία
                    </span>
                  </Link>

                  {authenticated ? (
                    <UserImage
                      firstName={user.firstName}
                      lastName={user.lastName}
                      // displayName={user.displayName}
                      image={user?.image?.formats?.thumbnail?.url}
                      alt={
                        user?.image?.formats?.thumbnail?.provider_metadata
                          ?.public_id
                      }
                      width={40}
                      height={40}
                      path={`/dashboard`}
                    />
                  ) : (
                    <>
                      <Link
                        className="login-info mr15-xl mr10 ud-btn btn-dark add-joining bdrs50 dark-color bg-transparent"
                        href="/login"
                      >
                        Σύνδεση
                      </Link>
                      <Link
                        className="ud-btn btn-dark add-joining bdrs50 text-white"
                        href="/register"
                      >
                        Εγγραφή
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </HeaderStickyWrapper>
      <HeaderMobile user={user} authenticated={authenticated} />
    </>
  );
}
