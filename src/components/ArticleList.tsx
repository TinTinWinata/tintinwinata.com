import { useState } from "react";
import type { Article } from "../data/portfolio";

type Props = { articles: Article[]; featured?: number };

export default function ArticleList({ articles, featured = 5 }: Props) {
  const [open, setOpen] = useState(false);
  const rest = articles.slice(featured);
  const shown = open ? articles : articles.slice(0, featured);

  return (
    <>
      <div className="article-list writing-list">
        {shown.map((article) => {
          const external = !article.url.startsWith("/");
          return (
            <a
              key={article.url}
              href={article.url}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
            >
              <time>{article.date}</time>
              <span>{article.title}</span>
              <span className="article-cover">
                <img src={article.cover} alt={article.coverAlt} width="104" height="58" loading="lazy" />
              </span>
            </a>
          );
        })}
      </div>
      {rest.length > 0 && (
        <div className="older-projects">
          <button className="text-button" type="button" onClick={() => setOpen(!open)} aria-expanded={open}>
            {open ? "− show less" : `+ see ${rest.length} more article${rest.length > 1 ? "s" : ""}`}
          </button>
        </div>
      )}
    </>
  );
}
