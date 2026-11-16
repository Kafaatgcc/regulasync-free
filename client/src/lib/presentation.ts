export const PRESENTATION_START_EVENT = "regulasync:start-presentation";
export const PRESENTATION_STOP_EVENT = "regulasync:stop-presentation";

export function launchPresentationDemo() {
  window.dispatchEvent(new Event(PRESENTATION_START_EVENT));
}
