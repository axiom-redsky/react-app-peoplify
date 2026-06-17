import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { AppAlertDialog } from '@/shared/lib/shadcn/ui';

type AppAlertOptions = {
  title: string;
  message: string;
  confirmText?: string;
};

type AppAlertState = {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
};

type AppAlertContextValue = {
  openAlert: (options: AppAlertOptions) => void;
  closeAlert: () => void;
};

const AppAlertContext = createContext<AppAlertContextValue | null>(null);

export function AppAlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AppAlertState>({
    open: false,
    title: '',
    message: '',
    confirmText: '확인',
  });

  const openAlert = useCallback((options: AppAlertOptions) => {
    setAlert({
      open: true,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText ?? '확인',
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlert((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  const value = useMemo(
    () => ({
      openAlert,
      closeAlert,
    }),
    [openAlert, closeAlert]
  );

  return (
    <AppAlertContext.Provider value={value}>
      {children}

      <AppAlertDialog
        open={alert.open}
        onOpenChange={(open) => {
          setAlert((prev) => ({
            ...prev,
            open,
          }));
        }}
        title={alert.title}
        message={alert.message}
        confirmText={alert.confirmText}
      />
    </AppAlertContext.Provider>
  );
}

export function useAppAlert() {
  const context = useContext(AppAlertContext);

  if (!context) {
    throw new Error('useAppAlert must be used within AppAlertProvider');
  }

  return context;
}