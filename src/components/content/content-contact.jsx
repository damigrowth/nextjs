import { Breadcrumb } from '../breadcrumb';
import { Contact, Faq } from '../section';

export default function ContactContent({ data }) {
  return (
    <>
      <Breadcrumb data={data.breadcrumb} />
      <Contact data={data.contact} />
      <Faq data={data.faq} className={'pt0 pb100'} />
    </>
  );
}
