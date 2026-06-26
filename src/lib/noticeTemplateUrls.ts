export function getSampleExcelPageUrl(
  templateId: string,
  isAdmin: boolean,
  clientId?: string,
): string {
  const base = `/notice-generator/templates/${templateId}/sample-excel`;
  if (isAdmin && clientId) {
    return `${base}?clientId=${clientId}`;
  }
  return base;
}

export function getNoticeConfigPageUrl(
  isAdmin: boolean,
  clientId?: string,
  configId?: string,
): string {
  const params = new URLSearchParams();
  if (isAdmin && clientId) params.set('clientId', clientId);
  if (configId) params.set('configId', configId);
  const query = params.toString();
  return `/notice-generator/config${query ? `?${query}` : ''}`;
}
