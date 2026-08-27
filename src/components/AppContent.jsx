import React, { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";

import routes from "../router/routes";
import ProtectedRoute from "./ProtectedRoute";
import LoadingSpinner from "./LoadingSpinner";

const AppContent = () => {
  return (
    <div className="mx-auto">
      <Suspense
        fallback={
          <div className="text-center py-10">
            <LoadingSpinner />
          </div>
        }
      >
        <Routes>
          {routes.map((route, idx) => {
            if (!route.element) return null;

            const Component = route.element;

            // Wrap in ProtectedRoute if `protected: true`
            const element = route.protected ? (
              <ProtectedRoute>
                <Component />
              </ProtectedRoute>
            ) : (
              <Component />
            );
            return (
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  element={element}
                />
              )
            );
          })}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default React.memo(AppContent);
