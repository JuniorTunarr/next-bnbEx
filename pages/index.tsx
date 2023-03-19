/* eslint-disable no-return-await */
// pages/index.tsx

import Home from "../components/home/Home";
import { withAuth, getServerSidePropsWithAuth } from "../hocs/withAuth";
import { wrapper } from "../store";

export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async (ctx: any) => {
    return await getServerSidePropsWithAuth(ctx);
  }
);

export default withAuth(Home);
