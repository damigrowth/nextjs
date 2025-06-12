import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightLong } from '@/components/icon/fa';
import { IconCheck } from '@/components/icon/fa';

export default function About({ data }) {
  return (
    <section className='our-about pb0 pt60-lg'>
      <div className='container'>
        <div className='row align-items-center'>
          <div className='col-md-6 col-xl-6'>
            <div
              className='about-img mb30-sm wow fadeInRight'
              data-wow-delay='300ms'
            >
              <Image
                height={574}
                width={691}
                className='w100 h-100'
                src={data.image}
                alt='about'
              />
            </div>
          </div>
          <div className='col-md-6 col-xl-5 offset-xl-1'>
            <div
              className='position-relative wow fadeInLeft'
              data-wow-delay='300ms'
            >
              <h2 className='mb25'>
                {data.heading}{' '}
                {/* <br className="d-none d-xl-block" /> for Workers */}
              </h2>
              <p className='text mb25'>{data.description}</p>
              <div className='list-style2'>
                <ul className='mb20'>
                  {data.list.map((item, i) => (
                    <li key={i}>
                      <IconCheck />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href={data.button.link} className='ud-btn btn-thm-border'>
                {data.button.text}
                <ArrowRightLong />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
