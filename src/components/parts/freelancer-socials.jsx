import React from 'react';
import {
  IconFacebookF,
  IconLinkedinIn,
  IconX,
  IconYoutube,
  IconGithub,
  IconInstagram,
  IconBehance,
  IconDribbble,
  IconEnvelope,
  IconPhone,
  IconGlobe,
} from '@/components/icon/fa';

export default function Socials({ socials = {}, email, phone, website }) {
  const {
    facebook = null,
    linkedin = null,
    x = null,
    youtube = null,
    github = null,
    instagram = null,
    behance = null,
    dribbble = null,
  } = socials || {};

  const socialsData = [
    facebook?.url && {
      data: facebook,
      component: IconFacebookF,
    },
    linkedin?.url && {
      data: linkedin,
      component: IconLinkedinIn,
    },
    x?.url && { data: x, component: IconX },
    youtube?.url && {
      data: youtube,
      component: IconYoutube,
    },
    github?.url && { data: github, component: IconGithub },
    instagram?.url && {
      data: instagram,
      component: IconInstagram,
    },
    behance?.url && {
      data: behance,
      component: IconBehance,
    },
    dribbble?.url && {
      data: dribbble,
      component: IconDribbble,
    },
    email && {
      data: { url: `mailto:${email}` },
      component: IconEnvelope,
    },
    phone && {
      data: { url: `tel:${phone}` },
      component: IconPhone,
    },
    website && {
      data: { url: website },
      component: IconGlobe,
    },
  ].filter(Boolean); // Filter out any null entries

  return (
    <div className='social-style1 pt20 pb30 light-style2 socials-list'>
      {socialsData.map((social, index) => {
        const IconComponent = social.component;
        if (!IconComponent) return null; // Fallback for icons not mapped

        return social.data ? (
          <a
            key={index}
            id={social.data.label}
            href={social.data.url}
            target={
              social.data.url && social.data.url.startsWith('http')
                ? '_blank'
                : undefined
            }
            rel={
              social.data.url && social.data.url.startsWith('http')
                ? 'noopener'
                : undefined
            }
            className='social-icon'
          >
            <IconComponent className='list-inline-item d-flex align-items-center justify-content-center' />
          </a>
        ) : null;
      })}
    </div>
  );
}
