import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { AppRoutes } from '@/app/AppRoutes';
import { ThemedToaster } from '@/app/ThemedToaster';

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ThemedToaster />
        <BrowserRouter>
          <SessionProvider>
            <AppRoutes />
          </SessionProvider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}
