import { useState, type FocusEvent, type KeyboardEvent, type PointerEvent } from "react";
import "./SearchMechanism.css";

type LaneName = "binary" | "scalar";
type Selection = { lane: LaneName; index: number };

type Step = {
  phase: string;
  label: string;
  note: string;
  detail: string;
  signal?: "repair" | "loss";
};

const lanes: Record<LaneName, { summary: string; steps: Step[] }> = {
  binary: {
    summary: "Approximate retrieval, exact final ordering",
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
  const [preview, setPreview] = useState<Selection | null>(null);
  const [pinned, setPinned] = useState<Selection | null>(null);
  const visible = preview ?? pinned;
  const visibleStep = visible ? lanes[visible.lane].steps[visible.index] : null;
  const inspectorId = "mechanism-inspector";

  const matches = (selection: Selection | null, lane: LaneName, index: number) =>
    selection?.lane === lane && selection.index === index;
  const previewOnHover = (lane: LaneName, index: number, event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "touch") setPreview({ lane, index });
  };
  const previewOnFocus = (lane: LaneName, index: number, event: FocusEvent<HTMLButtonElement>) => {
    if (event.currentTarget.matches(":focus-visible")) setPreview({ lane, index });
  };
  const togglePinned = (lane: LaneName, index: number) => {
    setPreview(null);
    setPinned((current) => matches(current, lane, index) ? null : { lane, index });
  };
  const clearSelection = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Escape") return;
    setPreview(null);
    setPinned(null);
    event.currentTarget.blur();
  };

  return (
    <figure className="mechanism" aria-labelledby="mechanism-caption">
      <figcaption id="mechanism-caption">
        <span>Hover or click for a quick explanation.</span>
        <small>Both paths retrieve approximately. The decisive difference appears at stage three.</small>
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
              </header>

              <div className="mechanism-stages">
                {lane.steps.map((step, index) => {
                  const isVisible = matches(visible, laneName, index);
                  const isPinned = matches(pinned, laneName, index);
                  return (
                    <div
                      className="mechanism-node"
                      key={step.label}
                      onPointerLeave={() => setPreview(null)}
                    >
                      <button
                        type="button"
                        className={isVisible ? "is-active" : ""}
                        data-signal={step.signal}
                        aria-expanded={isVisible}
                        aria-pressed={isPinned}
                        aria-controls={inspectorId}
                        aria-describedby={isVisible ? inspectorId : undefined}
                        onClick={() => togglePinned(laneName, index)}
                        onFocus={(event) => previewOnFocus(laneName, index, event)}
                        onBlur={() => setPreview(null)}
                        onKeyDown={clearSelection}
                        onPointerEnter={(event) => previewOnHover(laneName, index, event)}
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

      <div id={inspectorId} className={`mechanism-inspector${visible && visibleStep ? " is-active" : ""}`} aria-live="polite">
        {visible && visibleStep ? (
          <>
            <div className="mechanism-inspector-copy">
              <span>{visible.lane} path · stage {visible.index + 1}{matches(pinned, visible.lane, visible.index) ? " · selected" : ""}</span>
              <strong>{visibleStep.signal === "repair" ? "Ordering is repaired here" : visibleStep.signal === "loss" ? "Information loss becomes final here" : visibleStep.label}</strong>
              <p>{visibleStep.detail}</p>
            </div>
            {pinned && <button type="button" onClick={() => setPinned(null)}>Clear selection</button>}
          </>
        ) : (
          <p><strong>Select a stage</strong> to see what MongoDB is doing at that point in the search.</p>
        )}
      </div>
    </figure>
  );
}
