export const couple = { groom: 'Hari', bride: 'Neetha', logo: 'Hari ♥ Neetha', headline: "We're Tying the Knot", date: 'August 30, 2026', tagline: 'Two Cultures. One Journey. One Forever.' };

export const events = [
  { id:'prelude', icon:'🎶', title:'The Prelude to Forever', date:'Friday, August 28, 2026', time:'7:00 PM', venue:'Biriyani City', location:'New Jersey', map:'https://www.google.com/maps/search/?api=1&query=Biriyani+City+New+Jersey', description:'As the celebrations begin, join us for an enchanting evening filled with music, laughter, delicious food, and cherished moments. Let’s create beautiful memories together as we celebrate the beginning of our wedding festivities.' },
  { id:'traditions', icon:'🌼', title:'Celebrating Love & Traditions', date:'Saturday, August 29, 2026', time:'10:00 AM Onwards', venue:'Serene Spring Farms', location:'Hillsborough, NJ', map:'https://www.google.com/maps/search/?api=1&query=Serene+Spring+Farms+Hillsborough+NJ', description:'Surrounded by the warmth of family and friends, we invite you to celebrate our Haldi ceremony, followed by our Engagement, as we honor traditions and take the next joyful step toward forever.' },
  { id:'muhurtham', icon:'👰🤵', title:'The Muhurtham', date:'Sunday, August 30, 2026', time:'10:00 AM Onwards', venue:"Royal Crystal – Royal Albert's Palace", location:'Fords, NJ', map:'https://www.google.com/maps/search/?api=1&query=Royal+Crystal+Royal+Albert%27s+Palace+Fords+NJ', description:'With the blessings of our families and the love of those who mean the most to us, we warmly invite you to witness our sacred wedding ceremony and celebrate the beginning of our lifelong journey together.' }
];

const ASSET_BASE = import.meta.env.BASE_URL || '/';

export const story = [
  { city:'Coimbatore', text:'A Tamil heart with roots in Coimbatore.' },
  { city:'Hyderabad', text:'A Telugu soul with warmth from Hyderabad.' },
  { city:'New York', text:'Life brought two paths together in New York.' },
  { city:'Forever', text:'What began as a chance meeting became a beautiful forever.' }
];

export const galleryImages = [
  { id:1, title:'Our Beginning', image:`${ASSET_BASE}images/gallery/photo-1.jpg`, category:'Couple' },
  { id:2, title:'Kalyanam Moments', image:`${ASSET_BASE}images/gallery/photo-2.jpg`, category:'Wedding' },
  { id:3, title:'Forever Mood', image:`${ASSET_BASE}images/gallery/photo-3.jpg`, category:'Celebration' }
];

export const giftRegistry = {
  enabled: true,
  title: "Gift Registry",
  description:
    "Your love and blessings mean the world to us. If you'd like to honor us with a gift, we've created a few registry options below.",

  registries: [
    {
      name: "Amazon",
      image: "images/Amazon.jpg",
      buttonText: "View Registry",
      link: "https://www.amazon.com/wedding/share/HariNeethaWedding2026",
    },
    {
      name: "Target",
      buttonText: "View Registry",
      image: "images/Target.png",
      link: "https://www.target.com/gift-registry/gift/harineethawedding2026",
    }
  ],
};
export const liveStream = { enabled:true, title:'Celebrate With Us Virtually', description:'For our loved ones who cannot join us in person, we’ll share the live stream link here closer to the wedding.', buttonText:'Watch Live', youtubeLink:'#', note:'Live stream link will be available soon.' };
export const musicConfig = { enabled:true, autoplayAfterOpen:true, volume:0.22, buttonTextOn:'Music On', buttonTextOff:'Music Off' };
