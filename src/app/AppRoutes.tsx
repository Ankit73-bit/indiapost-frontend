import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { AdminRoute, SyncRoute } from '@/app/AppRouteGuards';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ClientsPage } from '@/pages/ClientsPage';
import { ListsPage } from '@/pages/ListsPage';
import { ArticlesPage } from '@/pages/ArticlesPage';
import { SyncPage } from '@/pages/SyncPage';
import { UsersPage } from '@/pages/UsersPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { NoticeGeneratorLayout } from '@/components/notice/NoticeGeneratorLayout';
import { NoticeTemplatesListPage } from '@/pages/notice/NoticeTemplatesListPage';
import { NoticeTemplateCreatePage } from '@/pages/notice/NoticeTemplateCreatePage';
import { NoticeTemplateDetailPage } from '@/pages/notice/NoticeTemplateDetailPage';
import { NoticeTemplateEditorPage } from '@/pages/notice/NoticeTemplateEditorPage';
import { NoticeConfigListPage } from '@/pages/notice/NoticeConfigListPage';
import { NoticeConfigDetailPage } from '@/pages/notice/NoticeConfigDetailPage';
import { NoticeExcelPage } from '@/pages/notice/NoticeExcelPage';
import { NoticeSampleExcelPage } from '@/pages/notice/NoticeSampleExcelPage';
import { NoticeTemplateMappingRoutePage } from '@/pages/notice/NoticeTemplateMappingRoutePage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="lists" element={<ListsPage />} />
        <Route path="articles" element={<ArticlesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route
          path="sync"
          element={
            <SyncRoute>
              <SyncPage />
            </SyncRoute>
          }
        />

        <Route path="notice-generator" element={<NoticeGeneratorLayout />}>
          <Route index element={<Navigate to="templates" replace />} />
          <Route path="templates" element={<NoticeTemplatesListPage />} />
          <Route path="templates/new" element={<NoticeTemplateCreatePage />} />
          <Route
            path="templates/:templateId/editor"
            element={<NoticeTemplateEditorPage />}
          />
          <Route
            path="templates/:templateId/mapping"
            element={<NoticeTemplateMappingRoutePage />}
          />
          <Route
            path="templates/:templateId/sample-excel"
            element={<NoticeSampleExcelPage />}
          />
          <Route
            path="templates/:templateId"
            element={<NoticeTemplateDetailPage />}
          />
          <Route path="config" element={<NoticeConfigListPage />} />
          <Route path="config/:configId" element={<NoticeConfigDetailPage />} />
          <Route path="excel" element={<NoticeExcelPage />} />
        </Route>

        <Route
          path="clients"
          element={
            <AdminRoute>
              <ClientsPage />
            </AdminRoute>
          }
        />
        <Route
          path="users"
          element={
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
