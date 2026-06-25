export const NOTICE_CONFIG_LIST_PAGE = 1;
export const NOTICE_CONFIG_LIST_LIMIT = 50;
export const NOTICE_TEMPLATE_LIST_LIMIT = 100;
export const NO_TEMPLATE_SELECT_VALUE = '__none__';

export function buildNoticeConfigEditorUrl(
  templateId: string,
  isAdmin: boolean,
  clientId: string,
): string {
  return isAdmin && clientId
    ? `/notice-generator/templates/${templateId}/editor?clientId=${clientId}`
    : `/notice-generator/templates/${templateId}/editor`;
}
