import { AppContext, AppInitialProps, AppProps } from "next/app";
import axios from "../lib/api";
import Header from "../components/Header";
import GlobalStyle from "../styles/GlobalStyle";
import { wrapper } from "../store";
import { cookieStringToObject } from "../lib/utils";
import { meAPI } from "../lib/api/auth";
import { userActions } from "../store/user";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
axios.defaults.withCredentials = true;

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <GlobalStyle />
      <Header />
      <Component {...pageProps} />
      <div id="root-modal" />
    </>
  );
};

App.getInitialProps = async (context: AppContext): Promise<AppInitialProps> => {
  const appInitialProps = await App.getInitialProps(context);
  const cookieObject = cookieStringToObject(context.ctx.req?.headers.cookie);
  console.log(cookieObject);
  const { store } = context.ctx;
  const { isLogged } = store.getState().user;
  try {
    if (!isLogged && cookieObject.access_token) {
      axios.defaults.headers.cookie = cookieObject.access_token;
      const { data } = await meAPI();
      store.dispatch(userActions.setLoggedUser(data));
    }
  } catch (e: any) {
    console.log(e.message);
  }
  return { ...appInitialProps };
};

export default wrapper.withRedux(App);
