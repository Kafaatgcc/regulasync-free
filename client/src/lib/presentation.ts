export const PRESENTATION_START_EVENT = "regulasync:start-presentation";

export function launchPresentationDemo() {
  window.dispatchEvent(new Event(PRESENTATION_START_EVENT));
}
