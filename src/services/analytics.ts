export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...params,
    });
  }
};