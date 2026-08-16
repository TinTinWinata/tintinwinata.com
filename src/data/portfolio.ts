export type Experience = {
  company: string;
  role: string;
  dates: string;
  url: string;
  about: string;
  logo: string;
  logoAlt: string;
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
  title: string;
  url: string;
};

export const experiences: Experience[] = [
  {
    company: "cynapse.ai",
    role: "Software Engineer",
    dates: "2025 — now",
    url: "https://cynapse.ai/",
    about: "A video-intelligence company in Singapore whose platform runs across organisations in Asia and the US.",
    logo: "/company/cynapse.jpg",
    logoAlt: "cynapse.ai logo",
    prose:
      "I built a distributed video pipeline serving 2,000 CCTV cameras at 16,000 frames per second on Kubernetes, with RabbitMQ retry and backpressure handling. I then joined the CEO-led AI Lab, where I work on natural-language video search over 75M detections and an on-call agent that reads logs, files tickets and opens pull requests with fixes.",
  },
  {
    company: "The Software Practice",
    role: "Software Engineer",
    dates: "2024 — 2025",
    url: "https://www.linkedin.com/company/the-software-practice-pte-ltd/",
    about: "A Singapore software consultancy delivering products for government agencies, major banks and airports.",
    logo: "/company/tsp.jpg",
    logoAlt: "The Software Practice logo",
    prose:
      "Built an administration portal for the Singapore Government on a pipeline doing 2+ production deploys a day, with test suites at 85% coverage using Moq and the AAA pattern, and Selenium automation that cut manual QA time by 4x.",
  },
  {
    company: "The Questlabs ID",
    role: "Software Engineer · part time",
    dates: "2023 — 2025",
    url: "https://www.linkedin.com/company/questlabsid/",
    about: "An Indonesian software studio building web and mobile products for local businesses.",
    logo: "/company/questlabs.jpg",
    logoAlt: "The Questlabs ID logo",
    prose:
      "Deployed an online store for automotive parts that reached 100 product sales a month on 10+ custom PHP plugins, and a POS system for an antivirus distributor that replaced manual processes and pushed gross sales past IDR 200M a month.",
  },
  {
    company: "freelancer.com",
    role: "Software Engineer · part time",
    dates: "2024",
    url: "https://www.freelancer.com/",
    about: "Independent client work for teams in Uzbekistan, India and Indonesia.",
    logo: "/company/freelancer.png",
    logoAlt: "Freelancer.com logo",
    prose:
      "Shipped three responsive applications in six months. One production-management platform handles 16,000+ entries and generates reports 96% faster than the process it replaced.",
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
      "Taught up to ten classes a semester across databases, frontend, backend, OOP, data structures, deep learning and Android, then led academic instructor research and delivered hard-skills training to 100+ instructors.",
  },
];

export const projects: Project[] = [
  {
    name: "Cakra Motor HRIS",
    dates: "2024 — now",
    prose: "A web and React Native product for managing employee structure, with Google Maps integration so attendance is tied to a real location.",
    image: "/projects/cakra-hris.jpg",
    imageAlt: "Cakra Motor HRIS organisation management interface",
  },
  {
    name: "KIMS POS Activation",
    dates: "2023 — 2024",
    prose: "An e-commerce and point-of-sale activation platform for antivirus products. Administrators track reseller purchases, issue gift cards and read sales analytics.",
    image: "/projects/kims.png",
    imageAlt: "KIMS sales analytics dashboard",
  },
  {
    name: "Cakra Motor E-Commerce",
    dates: "2023 — 2024",
    prose: "A store for motor oil and accessories, built with 10+ custom plugins and connected to WhatsApp, Xendit and Google APIs.",
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
  { date: "Jun 2026", title: "ClickHouse vs MongoDB: When Milliseconds Become Minutes", url: "https://medium.com/@tintinwinata/clickhouse-vs-mongodb-when-milliseconds-become-minutes-3ea847eba015" },
  { date: "Apr 2026", title: "Microsoft Agent Framework v1.0: Is It Worth the Hype?", url: "https://medium.com/@tintinwinata/microsoft-agent-framework-v1-0-is-it-worth-the-hype-8f5d06c54eb0" },
  { date: "Jan 2026", title: "Built an AI That Auto-Creates JIRA Tickets From Production Errors—and Won", url: "https://medium.com/@tintinwinata/built-an-ai-that-auto-creates-jira-tickets-from-production-errors-and-won-1st-place-doing-it-79b4d83feb88" },
  { date: "Dec 2025", title: "Event-Driven System: Real-Time Entity Linking With Apache Flink", url: "https://medium.com/@tintinwinata/event-driven-system-real-time-entity-linking-with-apache-flink-c52b3e198ca3" },
  { date: "Nov 2025", title: "How Your System Talks Behind the Scenes With Sockets", url: "https://medium.com/@tintinwinata/how-your-system-talks-behind-the-scenes-with-sockets-10a1447ced0a" },
  { date: "Oct 2025", title: "Solving Bitbucket’s AI Review Gap for 98% Less", url: "https://medium.com/@tintinwinata/solved-bitbucket-ai-review-gap-and-it-cost-98-less-than-enterprise-tools-ee77c6940d81" },
];

export const awards = [
  { place: "1st", title: "AI Engineers Competition — automated root-cause analysis agent", org: "Red Asia × AWS · 2025", url: "https://medium.com/@tintinwinata/built-an-ai-that-auto-creates-jira-tickets-from-production-errors-and-won-1st-place-doing-it-79b4d83feb88" },
  { place: "5th", title: "National Selection, ASEAN Skills Competition — Web Technology", org: "Ministry of Manpower, Indonesia · 2022" },
  { place: "1st", title: "Web Development Competition — healthcare platform with an ML diabetes detector", org: "Tarumanagara University · 2023" },
  { place: "Top 10", title: "Technoscape Hackathon — banking app with logistic-regression risk analysis", org: "BINUS University · 2023" },
  { place: "3rd", title: "Frontend Development Competition", org: "Dev Up Rising, Algobash · 2023" },
  { place: "Finalist", title: "AI Innovation Challenge — diagnostic app using DCNN, SVM and ANN models", org: "University of Indonesia" },
];

export const certifications = [
  { title: "AWS Certified Developer — Associate", org: "Amazon Web Services", year: "2024", mark: "AWS", url: "https://www.credly.com/badges/cf67335c-b7e4-4456-bde7-bf912ec0c464/linked_in_profile" },
  { title: "Certified Associate Data Modeler", org: "MongoDB", year: "2026", mark: "MDB", url: "https://www.credly.com/go/Qhx5efmV" },
  { title: "Cloud Certified Professional", org: "Alibaba Cloud", year: "2024", mark: "ACP", url: "https://edu.alibabacloud.com/clouder/Certificate/search?type=1&num=IACP01240600124396" },
  { title: "Cloud Certified Associate", org: "Alibaba Cloud", year: "2024", mark: "ACA", url: "https://edu.alibabacloud.com/clouder/Certificate/search?type=1&num=IACA01240500118106L" },
];

export const skillGroups = [
  { label: "Languages", value: "TypeScript · JavaScript · Python · Go · C# · Java · C++ · C · Kotlin · PHP · SQL" },
  { label: "Frameworks", value: "React · Node.js · Express · ASP.NET · Svelte · Laravel · Flask · Remix · GraphQL" },
  { label: "Infrastructure", value: "Kubernetes · Docker · Helm · RabbitMQ · Redis · CI/CD · Prometheus · Loki · Grafana · AWS · Azure" },
  { label: "Data & AI", value: "MongoDB · PostgreSQL · Vector Search · RAG · Machine Learning · Deep Learning · Firebase" },
];
