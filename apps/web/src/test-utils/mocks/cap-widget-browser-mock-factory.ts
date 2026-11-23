class CapWidgetBrowserMock extends HTMLElement {
  reset() {}
}

export class CapWidgetBrowserMockFactory {
  register() {
    if (!customElements.get('cap-widget')) customElements.define('cap-widget', CapWidgetBrowserMock);
  }
}
