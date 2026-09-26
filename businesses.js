/* Aravotix — businesses.js
 *
 * THE ONE PLACE to edit company and business/project information.
 * The page builds its cards, hero links, About section, contact area and footer from this file.
 *
 * Everything here is PUBLIC. Never put passwords, API keys or other secrets in it.
 * Use null (never made-up text) for anything that is not known yet:
 * the site then shows "Information Needed".
 *
 * ---------------------------------------------------------------------------
 * COMPANY FIELDS
 *   founder { name, title }, contactEmail, contactPhone, website, digitalCard,
 *   location, founded, mission, pillars, social
 *   social: list of { platform, label, url }. platform is one of:
 *           youtube, instagram, facebook, x, linkedin, tiktok, link
 *           Set url to the full https:// link when it exists. While url is null
 *           the icon is shown without a link.
 *
 * BUSINESS FIELDS  (copy a block and paste it ABOVE the "future" placeholder)
 *   id            Required. Lowercase letters, numbers, dashes. Unique.
 *   name          Required. Exactly as it should be displayed.
 *   monogram      Optional. 1-2 characters for the card icon (defaults to first letter).
 *   pronunciation Optional. Shown as: Pronounced "..."
 *   tagline       Optional. One short line under the name.
 *   description   Optional. One or two plain sentences, or null.
 *   status        "live" | "in-development" | "coming-soon" | "info-needed"
 *   location      Optional. Text, or null.
 *   launchYear    Optional. Text, or null.
 *   url           Optional. Full https:// link to the business's own site or app, or null.
 *                 A "Visit" button appears on the card when it is set.
 *   linkLabel     Optional. Custom text for the Visit button.
 *   contact       Optional. Separate contact (email or phone) for this business, or null.
 *   social        Optional. List of { platform, label, url } like the company list above.
 *   logo          Optional. Real logo, e.g. "images/a-farm-logo.svg". Replaces the monogram.
 *   image         Optional. Real photo, e.g. "images/a-farm.jpg". Shown at the top of the card.
 *   imageAlt      Required when image is set. Describe what the photo actually shows.
 *   placeholder   Optional. true styles the card as a "coming soon" slot (no details).
 *
 * Only add photos and logos that are real and that you have permission to use.
 * Put them in an "images" folder next to index.html.
 */
window.ARAVOTIX_DATA = {
  company: {
    name: 'Aravotix',

    founder: {
      name: 'Arav Scindia',
      title: 'Founder & CEO'
    },

    contactEmail: 'Aravotix5@gmail.com',
    contactPhone: '571-226-0897',
    website: 'https://aravotix.com',
    digitalCard: 'https://popl.co/card/TlNUtWpL/1/dash',
    location: 'Virginia',
    founded: null,

    mission:
      'Aravotix is a parent company that creates and operates smaller businesses and projects. ' +
      'The goal is to build real-world businesses that combine technology, entrepreneurship, ' +
      'creativity, and meaningful impact.',

    pillars: ['Technology', 'Entrepreneurship', 'Creativity', 'Meaningful impact'],

    social: [
      { platform: 'youtube', label: 'Aravotix', url: null }
    ]
  },

  businesses: [
    {
      id: 'a-farm',
      name: 'A-Farm',
      monogram: 'AF',
      tagline: 'Fresh produce for the local community.',
      description:
        'A-Farm is a family-operated backyard farming business focused on growing a wide variety of ' +
        'fresh produce for the local community. It is also being developed as a larger business ' +
        'concept involving technology, direct sales, farm experiences, and charitable impact.',
      status: 'in-development',
      location: 'Virginia',
      launchYear: null,
      url: null,
      contact: null,
      social: [],
      logo: null,
      image: null,
      imageAlt: null
    },
    {
      id: 'atrio',
      name: 'Atrio',
      monogram: 'At',
      pronunciation: 'Atro',
      tagline: 'A new project under Aravotix.',
      description:
        'Atrio is a business project being developed under Aravotix. The concept, technology, and ' +
        'business model are still being developed.',
      status: 'in-development',
      location: null,
      launchYear: null,
      url: null,
      contact: null,
      social: [],
      logo: null,
      image: null,
      imageAlt: null
    },
    {
      id: 'a-play',
      name: 'A-Play',
      monogram: 'AP',
      tagline: 'Outdoor adventure and kids\u2019 play.',
      description:
        'A-Play is an outdoor adventure and kids\u2019 play concept being developed under Aravotix. ' +
        'It is intended to become a real-world business supported by its own technology and systems.',
      status: 'in-development',
      location: null,
      launchYear: null,
      url: null,
      contact: null,
      social: [],
      logo: null,
      image: null,
      imageAlt: null
    },

    // Keep this placeholder last. Add new businesses ABOVE it.
    {
      id: 'future',
      name: 'Future Companies',
      monogram: '+',
      description: 'More businesses and projects are being developed under Aravotix.',
      status: 'coming-soon',
      url: null,
      placeholder: true
    }
  ]
};
