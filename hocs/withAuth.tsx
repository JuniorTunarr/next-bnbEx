/* eslint-disable no-undef */
// hocs/withAuth.tsx

import { GetServerSidePropsContext, GetServerSideProps } from "next";
import { parseCookies, setCookie } from "nookies";
import { UserType } from "../types/user";
import { userActions } from "../store/user";
import { wrapper } from "../store";

export const withAuth = (WrappedComponent: React.ComponentType) => {
  const AuthenticatedComponent: React.FC = (props) => {
    return <WrappedComponent {...props} />;
  };

  return AuthenticatedComponent;
};

export const getServerSidePropsWithAuth: GetServerSideProps =
  wrapper.getServerSideProps(
    (store) => async (ctx: GetServerSidePropsContext & { store: any }) => {
      const cookies = parseCookies(ctx);
      const token = cookies.access_token;

      if (token) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_HOST}/api/auth/me`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const userData: UserType = await response.json();
            const { dispatch } = ctx.store; // Access the store through ctx

            dispatch(userActions.setLoggedUser(userData));
            dispatch(userActions.setLoggedInStatus(true));
            // Set the access_token cookie
            setCookie(ctx, "access_token", token, {
              maxAge: 3 * 24 * 60 * 60, // 3 days
              path: "/",
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }

      return {
        props: {},
      };
    }
  );
