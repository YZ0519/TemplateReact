import { createBrowserRouter, Navigate } from "react-router";
import App from "../layout/App";
import HomePage from "../../features/home/HomePage";
import TestErrors from "../../features/errors/TestErrors";
import NotFound from "../../features/errors/NotFound";
import ServerError from "../../features/errors/ServerError";
import LoginForm from "../../features/account/LoginForm";
import RequireAuth from "./RequireAuth";
import RegisterForm from "../../features/account/RegisterForm";
import ProfilePage from "../../features/profiles/ProfilePage";
import ProjectListPage from "../../features/projects/ProjectListPage";
import ProjectDetailPage from "../../features/projects/ProjectDetailPage";
import CreateProjectPage from "../../features/projects/CreateProjectPage";
import EditProjectPage from "../../features/projects/EditProjectPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        element: <RequireAuth />,
        children: [
          { path: "profiles/:id", element: <ProfilePage /> },
          { path: "projects/create", element: <CreateProjectPage /> },
          { path: "projects/:slug/edit", element: <EditProjectPage /> },
        ],
      },
      { path: "", element: <HomePage /> },
      { path: "errors", element: <TestErrors /> },
      { path: "not-found", element: <NotFound /> },
      { path: "server-error", element: <ServerError /> },
      { path: "login", element: <LoginForm /> },
      { path: "register", element: <RegisterForm /> },
      { path: "projects", element: <ProjectListPage /> },
      { path: "projects/:slug", element: <ProjectDetailPage /> },
      { path: "*", element: <Navigate replace to={"/not-found"} /> },
    ],
  },
]);
