import { useState } from "react";
import type { Experience } from "../data/portfolio";

type Props = { experiences: Experience[] };

export default function ExperienceTimeline({ experiences }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="timeline">
      {experiences.map((experience, index) => {
        const isOpen = openIndex === index;
        return (
          <article className="timeline-item" key={`${experience.company}-${experience.dates}`}>
            <time>{experience.dates}</time>
            <span className="timeline-dot" aria-hidden="true" />
            <div className="timeline-copy">
              <div
                className="company-wrap"
                onMouseEnter={() => setOpenIndex(index)}
                onMouseLeave={() => setOpenIndex(null)}
                onFocus={() => setOpenIndex(index)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpenIndex(null);
                }}
              >
                <a className="company-link" href={experience.url}>{experience.company}</a>
                {isOpen && (
                  <aside className="company-card" role="status">
                    <div className="company-logo-wrap">
                      <img
                        src={experience.logo}
                        alt={experience.logoAlt}
                        width="92"
                        height="92"
                        style={{ display: "block", width: "auto", height: "auto", maxWidth: "100%", maxHeight: 92, objectFit: "contain" }}
                      />
                    </div>
                    <div className="company-card-copy">
                      <strong>{experience.company}</strong>
                      <p>{experience.about}</p>
                    </div>
                  </aside>
                )}
              </div>
              <div className="role">{experience.role}</div>
              <p>{experience.prose}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
