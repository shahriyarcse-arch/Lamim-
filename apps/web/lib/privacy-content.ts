// Privacy policy copy for /privacy (English + Bengali). Plain text only.
// Every statement must stay true for the app as shipped; update `updated` on any change.

export interface PrivacyCopy {
  title: string;
  updated: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
}

export const PRIVACY_COPY: Record<'en' | 'bn', PrivacyCopy> = {
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: 21 November 2026',
    intro:
      'Lamim is built so that what you record stays with you. This page explains what the app stores, where it is kept, and what we cannot see.',
    sections: [
      {
        heading: 'Your data stays on your device',
        body: [
          'Everything you enter in Lamim, including your prayers, dhikr counts, income and expenses, savings vaults, zakat figures, habits and settings, is saved in your browser’s storage (IndexedDB) on the device you are using.',
          'No server stores your personal data. Nothing you enter is sent to us or to anyone else.',
        ],
      },
      {
        heading: 'Hosting',
        body: [
          'Like any website, the service that hosts Lamim may keep standard request logs, such as your IP address, browser type and the page requested, for security and reliability.',
          'These logs never contain what you record in the app: your prayers, dhikr, money and habits are never sent to the server.',
        ],
      },
      {
        heading: 'No account',
        body: [
          'Lamim does not ask for an email address, phone number or password. There is no sign-up and no user database.',
        ],
      },
      {
        heading: 'No ads, analytics or tracking',
        body: [
          'Lamim shows no advertising and includes no analytics or tracking scripts. We do not see how you use the app.',
        ],
      },
      {
        heading: 'Your location',
        body: [
          'Lamim asks for your location only when you tap “Use my location”. Your browser will ask for your permission first.',
          'The location is rounded to about 11 metres, stored on your device, and used only to calculate prayer times locally. It is not sent anywhere.',
          'You can leave location off. Prayer times then use Dhaka on devices set to Bangladesh time and are not shown elsewhere; the calculation method and Asr timing can always be chosen in settings.',
        ],
      },
      {
        heading: 'Working offline',
        body: [
          'Lamim uses a service worker so the app can open and run without an internet connection. The service worker stores the app’s own files on your device. It does not store or send your personal data anywhere.',
          'When you open the website, your browser downloads the app’s files, as with any website. Those requests do not include anything you have entered in Lamim.',
        ],
      },
      {
        heading: 'Deleting your data',
        body: [
          'Because your data lives only in your browser, clearing the browser’s site data for Lamim deletes all of it permanently. We hold no copy, so we cannot restore it.',
          'Your data does not move to a new phone or another browser on its own.',
        ],
      },
      {
        heading: 'Export and backup',
        body: [
          'There is no way to export or back up your data yet. Please keep this in mind before clearing your browser or changing devices.',
        ],
      },
      {
        heading: 'What is planned',
        body: [
          'We plan to add an optional cloud backup and an assistant. Neither exists today, and nothing is sent anywhere.',
          'This policy will be updated to explain exactly what each feature sends and stores before either one is released.',
        ],
      },
      {
        heading: 'Changes to this policy',
        body: [
          'If this policy changes, the date at the top of this page will change with it. Lamim has no accounts, so we cannot notify you individually. Please check this page from time to time.',
        ],
      },
      {
        heading: 'Questions',
        body: [
          'If you have a question about privacy, open an issue at github.com/shahriyarcse-arch/Lamim-',
        ],
      },
    ],
  },

  bn: {
    title: 'গোপনীয়তা নীতি',
    updated: 'সর্বশেষ হালনাগাদ: ২১ নভেম্বর ২০২৬',
    intro:
      'লামিম এমনভাবে তৈরি, যাতে আপনি যা লিখে রাখেন তা আপনার কাছেই থাকে। অ্যাপটি কী সংরক্ষণ করে, কোথায় রাখে, আর আমরা কী দেখতে পাই না, এই পাতায় তা ব্যাখ্যা করা হয়েছে।',
    sections: [
      {
        heading: 'আপনার তথ্য থাকে আপনার ডিভাইসেই',
        body: [
          'লামিমে আপনি যা কিছু লেখেন, যেমন সালাত, যিকিরের গণনা, আয়-ব্যয়, সঞ্চয় ভল্ট, যাকাতের হিসাব, অভ্যাস ও সেটিংস, সবই আপনি যে ডিভাইস ব্যবহার করছেন তার ব্রাউজার স্টোরেজে (IndexedDB) সংরক্ষিত থাকে।',
          'কোনো সার্ভারে আপনার ব্যক্তিগত তথ্য রাখা হয় না। আপনার লেখা কোনো তথ্য আমাদের বা অন্য কারও কাছে পাঠানো হয় না।',
        ],
      },
      {
        heading: 'হোস্টিং',
        body: [
          'অন্য যেকোনো ওয়েবসাইটের মতো, লামিম যে সার্ভিসে হোস্ট করা, নিরাপত্তা ও নির্ভরযোগ্যতার জন্য সেটি সাধারণ রিকোয়েস্ট লগ রাখতে পারে, যেমন আপনার IP ঠিকানা, ব্রাউজারের ধরন ও কোন পাতা খোলা হয়েছে।',
          'এই লগে অ্যাপে আপনার লেখা কিছুই থাকে না: আপনার সালাত, যিকির, অর্থ ও অভ্যাসের তথ্য কখনো সার্ভারে পাঠানো হয় না।',
        ],
      },
      {
        heading: 'অ্যাকাউন্ট লাগে না',
        body: [
          'লামিম ইমেইল, ফোন নম্বর বা পাসওয়ার্ড চায় না। কোনো সাইন-আপ নেই, ব্যবহারকারীর কোনো ডেটাবেসও নেই।',
        ],
      },
      {
        heading: 'বিজ্ঞাপন, অ্যানালিটিক্স বা ট্র্যাকিং নেই',
        body: [
          'লামিমে কোনো বিজ্ঞাপন নেই, কোনো অ্যানালিটিক্স বা ট্র্যাকিং স্ক্রিপ্টও নেই। আপনি অ্যাপটি কীভাবে ব্যবহার করেন, তা আমরা দেখতে পাই না।',
        ],
      },
      {
        heading: 'আপনার অবস্থান',
        body: [
          'আপনি “আমার অবস্থান ব্যবহার করুন” বোতামে ট্যাপ করলে তবেই লামিম আপনার অবস্থান চায়। তার আগে আপনার ব্রাউজার আপনার অনুমতি চাইবে।',
          'অবস্থানটি প্রায় ১১ মিটার পর্যন্ত গোল করে আপনার ডিভাইসে রাখা হয়, এবং শুধু ডিভাইসেই সালাতের সময় হিসাব করতে ব্যবহার হয়। এটি কোথাও পাঠানো হয় না।',
          'চাইলে অবস্থান বন্ধ রাখতে পারেন। তখন বাংলাদেশের সময়ে সেট করা ডিভাইসে ঢাকার সময় দেখানো হয়, অন্যত্র সালাতের সময় দেখানো হয় না; হিসাব পদ্ধতি ও আসরের নিয়ম সেটিংসে সবসময় বেছে নেওয়া যায়।',
        ],
      },
      {
        heading: 'ইন্টারনেট ছাড়া ব্যবহার',
        body: [
          'লামিম একটি সার্ভিস ওয়ার্কার ব্যবহার করে, যাতে ইন্টারনেট ছাড়াও অ্যাপটি খোলা ও চালানো যায়। সার্ভিস ওয়ার্কার শুধু অ্যাপের নিজস্ব ফাইলগুলো আপনার ডিভাইসে রাখে। আপনার ব্যক্তিগত তথ্য এটি কোথাও রাখে না, পাঠায়ও না।',
          'ওয়েবসাইটটি খুললে, অন্য যেকোনো ওয়েবসাইটের মতোই, আপনার ব্রাউজার অ্যাপের ফাইলগুলো ডাউনলোড করে। সেই অনুরোধে লামিমে আপনার লেখা কোনো তথ্য থাকে না।',
        ],
      },
      {
        heading: 'তথ্য মুছে ফেলা',
        body: [
          'আপনার তথ্য যেহেতু শুধু আপনার ব্রাউজারেই থাকে, ব্রাউজার থেকে লামিমের সাইট ডেটা মুছে ফেললে সব তথ্য স্থায়ীভাবে মুছে যাবে। আমাদের কাছে কোনো কপি নেই, তাই আমরা তা ফেরত আনতে পারব না।',
          'নতুন ফোন বা অন্য ব্রাউজারে আপনার তথ্য নিজে থেকে চলে যায় না।',
        ],
      },
      {
        heading: 'এক্সপোর্ট ও ব্যাকআপ',
        body: [
          'এখনো তথ্য এক্সপোর্ট বা ব্যাকআপ করার কোনো ব্যবস্থা নেই। ব্রাউজারের ডেটা মোছার বা ডিভাইস বদলানোর আগে বিষয়টি মনে রাখবেন।',
        ],
      },
      {
        heading: 'যা আসার পরিকল্পনা আছে',
        body: [
          'ঐচ্ছিক ক্লাউড ব্যাকআপ এবং একটি সহকারী যোগ করার পরিকল্পনা আছে। এর কোনোটিই এখন চালু নেই, আর এখন কোনো তথ্য কোথাও পাঠানো হয় না।',
          'এর যেকোনোটি চালু করার আগে এই নীতি হালনাগাদ করা হবে, যেখানে স্পষ্ট লেখা থাকবে কোন ফিচার কী পাঠায় ও কী সংরক্ষণ করে।',
        ],
      },
      {
        heading: 'এই নীতির পরিবর্তন',
        body: [
          'এই নীতি বদলালে পাতার ওপরের তারিখটিও বদলাবে। লামিমে কোনো অ্যাকাউন্ট নেই, তাই আলাদাভাবে আপনাকে জানানো সম্ভব নয়। মাঝে মাঝে এই পাতাটি দেখে নেবেন।',
        ],
      },
      {
        heading: 'প্রশ্ন',
        body: [
          'গোপনীয়তা নিয়ে কোনো প্রশ্ন থাকলে github.com/shahriyarcse-arch/Lamim- ঠিকানায় একটি ইস্যু খুলুন।',
        ],
      },
    ],
  },
};
