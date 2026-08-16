import { useState } from "react";

type OlderProject = { name: string; prose: string };
type Props = { projects: OlderProject[] };

export default function OlderProjects({ projects }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="older-projects">
      <button className="text-button" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="older-project-list">
        {open ? "− hide the student projects" : "+ four older student projects"}
      </button>
      {open && (
        <div className="older-project-list" id="older-project-list">
          {projects.map((project) => (
            <p key={project.name}><strong>{project.name}</strong> — {project.prose}</p>
          ))}
        </div>
      )}
    </div>
  );
}
