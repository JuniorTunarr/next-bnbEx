/* eslint-disable import/order */
/* eslint-disable max-len */
/* eslint-disable no-return-await */
// pages/index.tsx

import { GetServerSideProps } from "next";
import Home from "../components/home/Home";
import { withAuth, getServerSidePropsWithAuth } from "../hocs/withAuth";
import { wrapper } from "../store";
import { parseCookies, setCookie } from "nookies";
import { userActions } from "../store/user";

export const getServerSideProps: GetServerSideProps =
  wrapper.getServerSideProps(async ({ store, req, res }) => {
    const cookies = parseCookies({ req });
    const token = cookies.access_token;
    if (token) {
      try {
        const response = await fetch(
          "https://next-bnb-ex.vercel.app/api/auth/me",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          store.dispatch(userActions.setLoggedUser(userData));
          store.dispatch(userActions.setLoggedInStatus(true));
        }
        // Set the access_token cookie with max-age
        setCookie({ res }, "access_token", token, {
          maxAge: 3 * 24 * 60 * 60, // 3 days
          path: "/",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  });

export default withAuth(Home);
