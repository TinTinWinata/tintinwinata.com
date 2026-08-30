import { useState } from "react";
import type { Project } from "../data/portfolio";

type Props = { projects: Project[]; featured?: number };

export default function ProjectList({ projects, featured = 2 }: Props) {
  const [open, setOpen] = useState(false);
  const rest = projects.slice(featured);
  const shown = open ? projects : projects.slice(0, featured);

  return (
    <>
      <div className="project-list">
        {shown.map((project) => (
          <article className="project" key={project.name}>
            <div className="project-image-wrap">
              <img src={project.image} alt={project.imageAlt} loading="lazy" />
            </div>
            <div>
              <div className="project-heading">
                <h3>{project.name}</h3>
                <span>{project.dates}</span>
              </div>
              <p>{project.prose}</p>
              {project.siteUrl && <a className="inline-link" href={project.siteUrl}>{project.site} ↗</a>}
            </div>
          </article>
        ))}
      </div>
      {rest.length > 0 && (
        <div className="older-projects">
          <button className="text-button" type="button" onClick={() => setOpen(!open)} aria-expanded={open}>
            {open ? "− show less" : `+ see ${rest.length} more project${rest.length > 1 ? "s" : ""}`}
          </button>
        </div>
      )}
    </>
  );
}
