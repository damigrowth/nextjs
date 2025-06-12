import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightLong } from '@/components/icon/fa';

export default function FunFact({ data }) {
  return (
    <>
      <section className='bgc-light-yellow pb90 pb30-md overflow-hidden maxw1700 mx-auto bdrs4'>
        <Image
          height={226}
          width={198}
          className='left-top-img wow zoomIn d-none d-lg-block'
          src={data.images.leftTop}
          alt='object'
        />
        <Image
          height={181}
          width={255}
          className='right-bottom-img wow zoomIn d-none d-lg-block'
          src={data.images.rightBottom}
          alt='object'
        />
        <div className='container'>
          <div className='row align-items-center'>
            <div
              className='col-md-6 col-xl-4 offset-xl-1 wow fadeInRight'
              data-wow-delay='100ms'
            >
              <div className='cta-style6 mb30-sm'>
                <h2 className='cta-title mb25'>{data.leftSection.title}</h2>
                <p className='text-thm2 fz15 mb25'>
                  {data.leftSection.description}
                </p>
                <Link
                  href={data.leftSection.buttonLink}
                  className='ud-btn btn-thm'
                >
                  {data.leftSection.buttonText}
                  <ArrowRightLong />
                </Link>
              </div>
            </div>
            <div
              className='col-md-6 col-xl-6 offset-xl-1 wow fadeInLeft'
              data-wow-delay='300ms'
            >
              <div className='row align-items-center'>
                <div className='col-sm-6'>
                  {data.rightSection.facts.slice(0, 2).map((fact, index) => (
                    <div
                      key={index}
                      className='funfact-style1 bdrs16 text-center ms-md-auto'
                    >
                      <ul className='ps-0 mb-0 d-flex justify-content-center'>
                        <li>
                          <div className='timer title mb15'>
                            {fact.value.split('.')[0]}
                          </div>
                        </li>
                        {fact.suffix && (
                          <li>
                            <span>{fact.suffix}</span>
                          </li>
                        )}
                      </ul>
                      <p className='fz15 dark-color'>{fact.label}</p>
                    </div>
                  ))}
                </div>
                <div className='col-sm-6'>
                  {data.rightSection.facts.slice(2).map((fact, index) => (
                    <div
                      key={index}
                      className='funfact-style1 bdrs16 text-center'
                    >
                      <ul className='ps-0 mb-0 d-flex justify-content-center'>
                        <li>
                          <div className='title mb15'>{fact.value}</div>
                        </li>
                      </ul>
                      <p className='fz15 dark-color'>{fact.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
