import { useState, type CSSProperties, type FocusEvent, type PointerEvent } from "react";
import "./SearchMechanism.css";

type LaneName = "binary" | "scalar";

type Step = {
  phase: string;
  label: string;
  note: string;
  detail: string;
  signal?: "repair" | "loss";
};

const lanes: Record<LaneName, { summary: string; outcome: string; steps: Step[] }> = {
  binary: {
    summary: "Approximate retrieval, exact final ordering",
    outcome: "Full precision restored",
    steps: [
      {
        phase: "Retrieve",
        label: "1-bit ANN",
        note: "Fast, lossy search",
        detail: "MongoDB searches the HNSW graph using compact 1-bit representations. A true neighbour can be missed here, but the result order is not final yet.",
      },
      {
        phase: "Collect",
        label: "Candidate pool",
        note: "Up to numCandidates",
        detail: "The approximate stage only needs to admit a true neighbour into this pool. Increasing numCandidates gives binary search more chances to do that.",
      },
      {
        phase: "Repair",
        label: "Float32 rescore",
        note: "Exact comparison returns",
        detail: "MongoDB re-evaluates the surviving candidates with their retained full-precision vectors. Approximate ordering errors can be repaired here.",
        signal: "repair",
      },
      {
        phase: "Return",
        label: "Exact top-k",
        note: "Reordered result",
        detail: "The final top-k is selected after exact rescoring. Binary therefore fails mainly when a true neighbour never entered the candidate pool.",
      },
    ],
  },
  scalar: {
    summary: "Approximate retrieval, approximate final ordering",
    outcome: "Precision stays compressed",
    steps: [
      {
        phase: "Retrieve",
        label: "int8 ANN",
        note: "Fast, lossy search",
        detail: "MongoDB searches with int8 values. Like binary, the approximate graph can fail to retrieve a true neighbour into the working set.",
      },
      {
        phase: "Collect",
        label: "Candidate pool",
        note: "Up to numCandidates",
        detail: "A wider pool exposes more candidates, but that alone cannot restore precision that was removed from their vector values.",
      },
      {
        phase: "Rank",
        label: "int8 ranking",
        note: "Lossy comparison remains",
        detail: "Scalar keeps ranking with the quantized int8 approximation. Close neighbours can remain misordered even after the candidate pool grows.",
        signal: "loss",
      },
      {
        phase: "Return",
        label: "Approx. top-k",
        note: "No exact repair stage",
        detail: "The final top-k inherits the int8 ordering. Scalar can therefore hit a recall floor that additional candidates do not lift.",
      },
    ],
  },
};

export default function SearchMechanism() {
  const [active, setActive] = useState<{ lane: LaneName; index: number }>({ lane: "binary", index: 2 });
  const selected = lanes[active.lane].steps[active.index];

  const select = (lane: LaneName, index: number) => setActive({ lane, index });
  const keepFocusSelection = (lane: LaneName, index: number, event: FocusEvent<HTMLButtonElement>) => {
    if (event.currentTarget.matches(":focus-visible")) select(lane, index);
  };
  const keepHoverSelection = (lane: LaneName, index: number, event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "touch") select(lane, index);
  };

  return (
    <figure className="mechanism" aria-labelledby="mechanism-caption">
      <figcaption id="mechanism-caption">
        <span>Follow one query through both indexes</span>
        <small>Hover, focus, or tap a stage to inspect where fidelity can be recovered—or permanently lost.</small>
      </figcaption>

      <div className="mechanism-lanes">
        {(Object.keys(lanes) as LaneName[]).map((laneName) => {
          const lane = lanes[laneName];
          return (
            <section className="mechanism-lane" data-lane={laneName} key={laneName} aria-label={`${laneName} quantization path`}>
              <header>
                <div>
                  <span className="mechanism-lane-name">{laneName}</span>
                  <p>{lane.summary}</p>
                </div>
                <span className="mechanism-outcome">{lane.outcome}</span>
              </header>

              <div
                className="mechanism-stages"
                style={{ "--active-step": active.lane === laneName ? active.index : -1 } as CSSProperties}
              >
                {lane.steps.map((step, index) => {
                  const isActive = active.lane === laneName && active.index === index;
                  return (
                    <div className="mechanism-node" key={step.label}>
                      <button
                        type="button"
                        className={isActive ? "is-active" : ""}
                        data-signal={step.signal}
                        aria-pressed={isActive}
                        onClick={() => select(laneName, index)}
                        onFocus={(event) => keepFocusSelection(laneName, index, event)}
                        onPointerEnter={(event) => keepHoverSelection(laneName, index, event)}
                      >
                        <span>{String(index + 1).padStart(2, "0")} · {step.phase}</span>
                        <strong>{step.label}</strong>
                        <small>{step.note}</small>
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mechanism-detail" data-lane={active.lane} aria-live="polite">
        <div>
          <span>{active.lane} · stage {active.index + 1}</span>
          <strong>{selected.signal === "repair" ? "Ordering is repaired here" : selected.signal === "loss" ? "Information loss becomes final here" : selected.label}</strong>
        </div>
        <p>{selected.detail}</p>
      </div>
    </figure>
  );
}
