export type Experience = {
  company: string;
  role: string;
  dates: string;
  url: string;
  about: string;
  logo: string;
  logoAlt: string;
  logoText?: string;
  bullets?: string[];
};

export type Project = {
  name: string;
  dates: string;
  prose: string;
  image: string;
  imageAlt: string;
  site?: string;
  siteUrl?: string;
};

export type Visualization = {
  name: string;
  tag: string;
  url: string;
  blurb: string;
};

export type Article = {
  date: string;
  /** ISO publication date, used for the RSS feed. Medium entries come from its feed. */
  published: string;
  title: string;
  url: string;
  cover: string;
  coverAlt: string;
};

export const experiences: Experience[] = [
  {
    company: "cynapse.ai",
    role: "Senior Software Engineer · promoted from Software Engineer",
    dates: "2025 — now",
    url: "https://cynapse.ai/",
    about: "A video-intelligence company in Singapore whose platform runs across organisations in Asia and the US.",
    logo: "/company/cynapse-wordmark.png",
    logoAlt: "cynapse.ai logo",
    bullets: [
      "Working under CEO-led AI Lab team, selected to drive the company’s Generative AI strategy",
      "Scaled Copilot, the first natural-language search product for VMS, to handle 37.5× corpus size with no loss in query relevance by introducing a search engine",
    ],
  },
  {
    company: "The Software Practice",
    role: "Software Engineer",
    dates: "2024 — 2025",
    url: "https://www.linkedin.com/company/the-software-practice-pte-ltd/",
    about: "A Singapore software consultancy delivering products for government agencies, major banks and airports.",
    logo: "/company/tsp-wordmark.png",
    logoAlt: "The Software Practice logo",
    bullets: [
      "Cut manual QA time by 75% with Selenium automation for a Singapore Government administration portal, holding 85% automated coverage",
    ],
  },
  {
    company: "The Questlabs ID",
    role: "Software Engineer · part-time",
    dates: "2023 — 2025",
    url: "https://www.linkedin.com/company/questlabsid/",
    about: "An Indonesian software studio building web and mobile products for local businesses.",
    logo: "/company/questlabs.jpg",
    logoAlt: "The Questlabs ID logo",
    logoText: "The Questlabs ID",
    bullets: [
      "Built a POS and e-commerce platform processing IDR 200M+ in monthly gross sales, replacing manual reseller purchasing and sales reporting for an antivirus distributor",
    ],
  },
  {
    company: "freelancer.com",
    role: "Software Engineer · part-time",
    dates: "2024",
    url: "https://www.freelancer.com/",
    about: "Independent client work for teams in Uzbekistan, India and Indonesia.",
    logo: "/company/freelancer-wordmark.png",
    logoAlt: "Freelancer.com logo",
    bullets: [
      "Cut report-generation time by 96% on a production-management platform holding 16,000+ records, one of three client applications delivered in six months",
    ],
  },
  {
    company: "BINUS University & BCA",
    role: "Academic Development Officer · Coding Instructor",
    dates: "2022 — 2024",
    url: "https://binus.ac.id/",
    about: "BINUS is one of Indonesia’s largest private universities; BCA’s PPTI programme trains future engineers.",
    logo: "/company/binus.jpg",
    logoAlt: "BINUS University logo",
    bullets: [
      "Trained 100+ instructors and taught up to ten classes a semester across databases, backend, data structures and deep learning",
    ],
  },
];

export const projects: Project[] = [
  {
    name: "Cakra Motor HRIS",
    dates: "2024 — 2025",
    prose: "Built a web and React Native HRIS for 100+ employees across 11 locations. Designed a computer-vision attendance flow using face detection, combined with Google Maps location validation.",
    image: "/projects/cakra-hris.jpg",
    imageAlt: "Cakra Motor HRIS organisation management interface",
    site: "computer-vision write-up",
    siteUrl: "https://medium.com/@tintinwinata/how-i-created-a-web-app-with-real-time-hand-recognition-4a9d509184e1",
  },
  {
    name: "KIMS POS Activation",
    dates: "2023 — 2024",
    prose: "Built an e-commerce and point-of-sale activation platform used to process IDR 200M+ in monthly gross sales. It replaced manual reseller purchasing, gift-card and sales-reporting workflows.",
    image: "/projects/kims.png",
    imageAlt: "KIMS sales analytics dashboard",
  },
  {
    name: "Cakra Motor E-Commerce",
    dates: "2023 — 2024",
    prose: "Built an automotive store processing 100 product sales a month, with 10+ custom PHP plugins and integrations across WhatsApp, Xendit and Google APIs.",
    image: "/projects/cakra-commerce.png",
    imageAlt: "Cakra Motor e-commerce homepage",
    site: "cakramotor11.com",
    siteUrl: "https://cakramotor11.com/",
  },
];

export const earlierProjects = [
  { name: "SLC Scheduler", prose: "Assistant scheduling and slot-trading tool for BINUS Software Laboratory Center. Svelte + Express.js." },
  { name: "JeTX NAR", prose: "Real-time presentation monitoring and schedule management for the New Assistant Requirement process, with a LINE bot integration." },
  { name: "Mission Funter", prose: "Unity maze and combat game built as a progressive assessment for the Software Laboratory Center assistantship." },
  { name: "JeTe Knight", prose: "Web-based game prototype inspired by Hollow Knight, built to prepare students for assistantship entrance exams." },
];

export const articles: Article[] = [
  { date: "Aug 2026", published: "2026-08-20", title: "MongoDB Vector Search: Binary Quantization at 75 Million Vectors", url: "/article/mongodb-binary-quantization-75m/", cover: "/writing/mongodb-binary-quantization.jpg", coverAlt: "MongoDB binary quantization benchmark" },
  { date: "Jun 2026", published: "2026-06-01", title: "ClickHouse vs MongoDB: When Milliseconds Become Minutes", url: "https://medium.com/@tintinwinata/clickhouse-vs-mongodb-when-milliseconds-become-minutes-3ea847eba015", cover: "/writing/clickhouse-vs-mongodb.jpg", coverAlt: "ClickHouse logo" },
  { date: "Apr 2026", published: "2026-04-20", title: "Microsoft Agent Framework v1.0: Is It Worth the Hype?", url: "https://medium.com/@tintinwinata/microsoft-agent-framework-v1-0-is-it-worth-the-hype-8f5d06c54eb0", cover: "/writing/microsoft-agent-framework.jpg", coverAlt: "Microsoft Agent Framework" },
  { date: "Jan 2026", published: "2026-01-16", title: "Built an AI That Auto-Creates JIRA Tickets From Production Errors—and Won", url: "https://medium.com/@tintinwinata/built-an-ai-that-auto-creates-jira-tickets-from-production-errors-and-won-1st-place-doing-it-79b4d83feb88", cover: "/writing/jira-incident-agent.jpg", coverAlt: "First place at the Red Asia × AWS AI Engineers Competition" },
  { date: "Dec 2025", published: "2025-12-20", title: "Event-Driven System: Real-Time Entity Linking With Apache Flink", url: "https://medium.com/@tintinwinata/event-driven-system-real-time-entity-linking-with-apache-flink-c52b3e198ca3", cover: "/writing/flink-entity-linking.jpg", coverAlt: "Apache Flink logo" },
  { date: "Nov 2025", published: "2025-11-07", title: "How Your System Talks Behind the Scenes With Sockets", url: "https://medium.com/@tintinwinata/how-your-system-talks-behind-the-scenes-with-sockets-10a1447ced0a", cover: "/writing/sockets-behind-the-scenes.jpg", coverAlt: "Socket communication illustration" },
  { date: "Oct 2025", published: "2025-10-18", title: "Solving Bitbucket’s AI Review Gap for 98% Less", url: "https://medium.com/@tintinwinata/solved-bitbucket-ai-review-gap-and-it-cost-98-less-than-enterprise-tools-ee77c6940d81", cover: "/writing/bitbucket-ai-review.jpg", coverAlt: "Bitbucket AI reviewer illustration" },
  { date: "Sep 2025", published: "2025-09-07", title: "Cursor Best Practices: A Deep Dive into Cursor Rules, GPT-5, Claude 4 and Gemini", url: "https://medium.com/@tintinwinata/cursor-best-practices-a-deep-dive-into-cursor-rules-gpt-5-claude-4-and-gemini-5371a4662cd9", cover: "/writing/cursor-best-practices.jpg", coverAlt: "Cursor editor" },
  { date: "Aug 2025", published: "2025-08-19", title: "Website Monitoring with Prometheus, Grafana and Blackbox Exporter", url: "https://medium.com/@tintinwinata/website-monitoring-with-prometheus-grafana-and-blackbox-exporter-0231745b0e31", cover: "/writing/prometheus-grafana-monitoring.jpg", coverAlt: "Prometheus and Grafana monitoring dashboard" },
  { date: "Jul 2025", published: "2025-07-06", title: "Bridging Worlds: A Practical Guide to C++ and C# Integration", url: "https://medium.com/@tintinwinata/bridging-worlds-a-practical-guide-to-c-and-c-integration-2ef6989f6ede", cover: "/writing/cpp-csharp-integration.jpg", coverAlt: "C++ and C# integration" },
  { date: "Jan 2025", published: "2025-01-27", title: "How I Built a Retrieval-Augmented Generation System with Amazon Bedrock for $1 a Month", url: "https://medium.com/@tintinwinata/how-i-built-a-retrieval-augmented-generation-system-with-amazon-bedrock-for-1-month-d59a6bcee0da", cover: "/writing/bedrock-rag.jpg", coverAlt: "Amazon Bedrock retrieval-augmented generation" },
];

export const visualizations: Visualization[] = [
  {
    name: "BKD tree",
    tag: "Apache Lucene",
    url: "/visualization/lucene-bkd-tree/",
    blurb: "Write the tree Lucene builds for numeric, date and geo fields, then run a range query over it and watch which blocks it actually reads.",
  },
];

export const awards = [
  { place: "1st", title: "AI Engineers Competition — automated root-cause analysis agent", org: "Red Asia × AWS · 2025", url: "https://medium.com/@tintinwinata/built-an-ai-that-auto-creates-jira-tickets-from-production-errors-and-won-1st-place-doing-it-79b4d83feb88" },
  { place: "5th", title: "National Selection, ASEAN Skills Competition — Web Technology", org: "Ministry of Manpower, Indonesia · 2022" },
  { place: "1st", title: "Web Development Competition — healthcare platform with an ML diabetes detector", org: "Tarumanagara University · 2023" },
  { place: "Top 10", title: "Technoscape Hackathon — banking app with logistic-regression risk analysis", org: "BINUS University · 2023" },
  { place: "3rd", title: "Frontend Development Competition", org: "Dev Up Rising, Algobash · 2023" },
  { place: "Top 10", title: "AI Innovation Challenge — diagnostic app using DCNN, SVM and ANN models", org: "University of Indonesia" },
];

export const certifications = [
  { title: "AWS Certified Developer — Associate", org: "Amazon Web Services", year: "2024", icon: "/certification/aws.svg", iconAlt: "Amazon Web Services", url: "https://www.credly.com/badges/cf67335c-b7e4-4456-bde7-bf912ec0c464/linked_in_profile" },
  { title: "Certified Associate Data Modeler", org: "MongoDB", year: "2026", icon: "/certification/mongodb.svg", iconAlt: "MongoDB", url: "https://www.credly.com/go/Qhx5efmV" },
  { title: "Cloud Certified Professional", org: "Alibaba Cloud", year: "2024", icon: "/certification/alibaba.svg", iconAlt: "Alibaba Cloud", url: "https://edu.alibabacloud.com/clouder/Certificate/search?type=1&num=IACP01240600124396" },
  { title: "Cloud Certified Associate", org: "Alibaba Cloud", year: "2024", icon: "/certification/alibaba.svg", iconAlt: "Alibaba Cloud", url: "https://edu.alibabacloud.com/clouder/Certificate/search?type=1&num=IACA01240500118106L" },
];
