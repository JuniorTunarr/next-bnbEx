/* eslint-disable no-undef */
// hocs/withAuth.tsx

import { GetServerSidePropsContext, GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { UserType } from "../types/user";
import { userActions } from "../store/user";
import { wrapper } from "../store";

export const withAuth = (WrappedComponent: React.ComponentType) => {
  const AuthenticatedComponent: React.FC = (props) => {
    return <WrappedComponent {...props} />;
  };

  return AuthenticatedComponent;
};

export const getServerSidePropsWithAuth: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
) => {
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
        const { dispatch } = (ctx as any).store; // Cast ctx to 'any' to access the store

        dispatch(userActions.setLoggedUser(userData));
        dispatch(userActions.setLoggedInStatus(true));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  return {
    props: {},
  };
};
