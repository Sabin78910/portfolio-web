/** Single source of truth for everything the page shows. Content comes from Sabin Khanal's CV. */

export const contact = {
  email: "sabinkhanal13@gmail.com",
  github: "https://github.com/Sabin78910",
  linkedin: "https://www.linkedin.com/in/sabin-khanal-950163326",
  location: "Kathmandu, Nepal",
};

/** Downloadable CV in public/; `download` keeps the browser from opening it in a tab. */
export const CV_FILE = "./Sabin-Khanal-CV.pdf";

export const hero = {
  name: "Sabin Khanal",
  tagline: "Bridging AI, APIs & Automation | Data Science | AI Solutions",
  role: "Web Developer & AI Engineer",
};

/** Headline numbers under the hero and in the GitHub section. */
export const heroStats: { value: number; suffix: string; label: string }[] = [
  { value: 5, suffix: "+", label: "Years of IT Experience" },
  { value: 3, suffix: "+", label: "Years of Web Development" },
  { value: 15, suffix: "+", label: "Projects Worked On" },
  { value: 100, suffix: "%", label: "Commitment to Web, AI & ML" },
];

export const about = {
  paragraphs: [
    "I am a backend-focused Web Developer and AI Engineer with a BSc (Hons) in Computing and a strong computational foundation, bringing 3+ years of experience in developing and deploying web technologies. I design, build, and maintain secure, scalable, database-driven web applications and RESTful APIs using Laravel, PHP, Python (Flask), React, and SQL, translating business requirements into reliable software.",
    "My work centers on connecting systems and eliminating manual effort: integrating third-party APIs, automating workflows, and, more recently, embedding AI capabilities into production applications. I prioritize clean, maintainable code, strong performance, and solutions that deliver measurable business impact.",
    "My background spans software development, web application development, and technical support. This combination gives me a practical understanding of how software behaves for real users, not just how it runs in the codebase.",
  ],
  notes: [
    { label: "Currently exploring", text: "AI integration, cloud technologies, and data science." },
    { label: "Open to conversations about", text: "backend development, API integration, and automation projects." },
  ],
};

export const profileSummary: { term: string; value: string }[] = [
  { term: "Profile", value: "Web Developer & AI Engineer" },
  { term: "Domain", value: "Web Development, Machine Learning, and UI/UX Design" },
  { term: "Education", value: "BSc (Hons) Computing" },
  { term: "Programming Languages", value: "Python (Flask), PHP (Laravel), JavaScript (React), R, SQL" },
  { term: "Tools & Other Skills", value: "Docker, Git, UI/UX Design" },
  { term: "Languages", value: "English, Nepali" },
  { term: "Interests", value: "Gaming, Soccer, Mountain Trekking" },
];

export interface Job {
  dates: string;
  title: string;
  company: string;
  place: string;
  points: string[];
  tags: string[];
}

export const experience: Job[] = [
  {
    dates: "Jun 2026 — Present",
    title: "Transaction & Digital Banking team",
    company: "Best Finance Company Ltd",
    place: "Kathmandu",
    points: [
      "Built an Employee Appraisal System (Python, Flask, PostgreSQL, REST APIs) that streamlines evaluations and grade increments.",
      "Built a Letter Management System in Flask and PostgreSQL to centralise official company correspondence.",
      "Maintain and enhance the Digital Lending System for performance, security and regulatory requirements in an Agile/Scrum team.",
      "Own functional testing, QA and troubleshooting to keep production systems reliable.",
    ],
    tags: ["Python", "Flask", "PostgreSQL", "REST APIs", "QA", "Agile / Scrum"],
  },
  {
    dates: "Feb 2026 — Present",
    title: "Web Developer, Information Technology",
    company: "Best Finance Company Ltd",
    place: "Kathmandu",
    points: [
      "Develop, maintain and support web applications and internal IT systems behind day-to-day operations.",
      "Work with business and IT teams to resolve technical issues and ship system improvements.",
    ],
    tags: ["Web applications", "Internal IT systems"],
  },
  {
    dates: "Jun 2024 — Aug 2024",
    title: "Freelance Tech Support & QA Specialist",
    company: "Hypen Solution",
    place: "Remote",
    points: [
      "Ran UAT, functional and production testing on Android and iOS apps to confirm release readiness.",
      "Tested builds across devices and platforms, documenting and reporting defects before release.",
    ],
    tags: ["UAT", "Functional testing", "Production testing", "Android", "iOS"],
  },
];

export const education: { years: string; degree: string; school: string }[] = [
  { years: "2022 — 2025", degree: "BSc (Hons) Computing", school: "The British College · Leeds Beckett University" },
  { years: "2019 — 2021", degree: "Intermediate (+2), Management & Computer Science", school: "Uniglobe SS/College" },
];

/** Which mock preview a card draws; each one is a hand-drawn SVG in Projects.tsx. */
export type Preview = "pca" | "trader" | "shop";

export interface Project {
  name: string;
  kind: string;
  description: string;
  points: string[];
  stack: string[];
  preview: Preview;
}

export const projects: Project[] = [
  {
    name: "Concrete Compressive Strength",
    kind: "ML preprocessing pipeline",
    description: "An R pipeline that cleans and prepares concrete compressive-strength data for machine learning.",
    points: [
      "Missing-data imputation with MICE, outliers via IQR",
      "Correlation analysis to find what drives strength",
      "Min–Max scaling and PCA for a simpler feature space",
    ],
    stack: ["R", "MICE", "ggplot2", "PCA"],
    preview: "pca",
  },
  {
    name: "GrocerEase",
    kind: "Multi-vendor marketplace",
    description: "One platform where many local traders sell together, with PayPal checkout, collection-slot booking and email OTP verification.",
    points: [
      "Co-designed the Oracle schema for users, products, orders and payments",
      "Oracle APEX dashboards for traders and administrators",
      "Secure checkout with OTP verification",
    ],
    stack: ["PHP", "Oracle", "JavaScript", "PayPal"],
    preview: "trader",
  },
  {
    name: "N & S Handicraft",
    kind: "E-commerce platform",
    description: "A full-stack store built for the Nepalese market — NPR pricing, local addresses, VAT-based checkout and courier tracking.",
    points: [
      "Product filters, live search, wishlist and coupons",
      "Admin panel for orders, payment verification and sales statistics",
      "Automated transactional emails across the order lifecycle",
    ],
    stack: ["Laravel", "PHP", "MySQL", "Bootstrap"],
    preview: "shop",
  },
];

export type SkillGroup = { area: string; items: string[] };

export const skills: SkillGroup[] = [
  { area: "Programming Languages", items: ["Python", "SQL", "PHP", "JavaScript", "R", "HTML", "CSS", "Java"] },
  { area: "Backend & Frameworks", items: ["Flask", "Laravel 11", "REST APIs", "Oracle APEX", "Bootstrap 5", "PHPMailer"] },
  { area: "Databases", items: ["PostgreSQL", "MySQL", "Oracle Database", "Triggers", "Sequences"] },
  { area: "Data & Machine Learning", items: ["Data Cleaning", "MICE", "Outlier Detection", "Correlation Analysis", "Feature Scaling", "PCA", "ggplot2"] },
  { area: "Practices & Tools", items: ["Agile/Scrum", "UAT", "QA Testing", "System Integration", "Git", "GitHub", "VS Code", "PayPal API"] },
];

/** Flat, de-duplicated skill list for the scrolling tech strip. */
export function techStack(groups: SkillGroup[] = skills): string[] {
  return [...new Set(groups.flatMap((g) => g.items))];
}
