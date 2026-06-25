export function getNoticeTemplatesListUrl(
  isAdmin: boolean,
  clientId: string | undefined,
): string {
  return isAdmin && clientId
    ? `/notice-generator/templates?clientId=${clientId}`
    : '/notice-generator/templates';
}
