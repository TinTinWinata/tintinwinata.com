export type Experience = {
  company: string;
  role: string;
  dates: string;
  url: string;
  about: string;
  logo: string;
  logoAlt: string;
  logoText?: string;
  prose: string;
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

export type Article = {
  date: string;
  /** ISO publication date, used for the RSS feed. Medium entries come from its feed. */
  published: string;
  title: string;
  url: string;
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
    prose:
      "Built a distributed video pipeline ingesting 16,000 frames per second from 2,000 CCTV cameras, with RabbitMQ retry and backpressure mechanisms for downstream failures. Now building natural-language video search over 75M detections and an incident-response agent that analyzes logs, creates Jira tickets and opens pull requests with proposed fixes.",
  },
  {
    company: "The Software Practice",
    role: "Software Engineer",
    dates: "2024 — 2025",
    url: "https://www.linkedin.com/company/the-software-practice-pte-ltd/",
    about: "A Singapore software consultancy delivering products for government agencies, major banks and airports.",
    logo: "/company/tsp-wordmark.png",
    logoAlt: "The Software Practice logo",
    prose:
      "Reduced manual QA time by 75% by building Selenium automation for a Singapore Government administration portal. Maintained 85% automated test coverage and supported a delivery process shipping more than two production deployments per day.",
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
    prose:
      "Built an automotive e-commerce system processing 100 product sales a month and a POS platform used to process IDR 200M+ in monthly gross sales, replacing manual workflows for an antivirus distributor.",
  },
  {
    company: "freelancer.com",
    role: "Software Engineer · part-time",
    dates: "2024",
    url: "https://www.freelancer.com/",
    about: "Independent client work for teams in Uzbekistan, India and Indonesia.",
    logo: "/company/freelancer-wordmark.png",
    logoAlt: "Freelancer.com logo",
    prose:
      "Cut report-generation time by 96% for a production-management platform containing 16,000+ records, one of three responsive client applications delivered in six months.",
  },
  {
    company: "BINUS University & BCA",
    role: "Academic Development Officer · Coding Instructor",
    dates: "2022 — 2024",
    url: "https://binus.ac.id/",
    about: "BINUS is one of Indonesia’s largest private universities; BCA’s PPTI programme trains future engineers.",
    logo: "/company/binus.jpg",
    logoAlt: "BINUS University logo",
    prose:
      "Trained 100+ instructors, led academic instructor research and taught up to ten classes a semester across databases, frontend, backend, OOP, data structures, deep learning and Android.",
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
  { date: "Aug 2026", published: "2026-08-20", title: "MongoDB Vector Search: Binary Quantization at 75 Million Vectors", url: "/article/mongodb-binary-quantization-75m/" },
  { date: "Jun 2026", published: "2026-06-01", title: "ClickHouse vs MongoDB: When Milliseconds Become Minutes", url: "https://medium.com/@tintinwinata/clickhouse-vs-mongodb-when-milliseconds-become-minutes-3ea847eba015" },
  { date: "Jan 2026", published: "2026-01-16", title: "Built an AI That Auto-Creates JIRA Tickets From Production Errors—and Won", url: "https://medium.com/@tintinwinata/built-an-ai-that-auto-creates-jira-tickets-from-production-errors-and-won-1st-place-doing-it-79b4d83feb88" },
  { date: "Dec 2025", published: "2025-12-20", title: "Event-Driven System: Real-Time Entity Linking With Apache Flink", url: "https://medium.com/@tintinwinata/event-driven-system-real-time-entity-linking-with-apache-flink-c52b3e198ca3" },
  { date: "Oct 2025", published: "2025-10-18", title: "Solving Bitbucket’s AI Review Gap for 98% Less", url: "https://medium.com/@tintinwinata/solved-bitbucket-ai-review-gap-and-it-cost-98-less-than-enterprise-tools-ee77c6940d81" },
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
