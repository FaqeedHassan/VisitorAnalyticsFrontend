export function getDeviceInfo() {
  const userAgent = navigator.userAgent;

  // Detect device type
  const device = /Mobile|Android|iP(ad|hone)/.test(userAgent) ? 'Mobile' : 'Desktop';

  // Detect browser
  let browser = 'Other';
  if (userAgent.includes('Firefox/')) browser = 'Firefox';
  else if (userAgent.includes('Edg/')) browser = 'Edge';
  else if (userAgent.includes('OPR/') || userAgent.includes('Opera')) browser = 'Opera';
  else if (userAgent.includes('Chrome/') && !userAgent.includes('Edg/')) browser = 'Chrome';
  else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) browser = 'Safari';

  return { device, browser };
}

/**
 * ✅ Returns true if visitor has already been tracked in this session
 */
export function hasBeenTracked() {
  return localStorage.getItem("visitorTracked") === "true";
}

/**
 * ✅ Mark visitor as tracked in localStorage
 */
export function markVisitorTracked() {
  localStorage.setItem("visitorTracked", "true");
}
