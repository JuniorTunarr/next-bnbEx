// code
import { NextApiResponse, NextApiRequest } from "next";
import jwt from "jsonwebtoken";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { StoredUserType } from "../../../types/user";
import { db } from "../../../firebase";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    try {
      // const accessToken = req.headers.cookie;
      // if (!accessToken) {
      //   res.statusCode = 400;
      //   return res.send("access_token이 없습니다.");
      // }

      // const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!);
      // if (typeof decoded !== "object" || !(decoded as any).token) {
      //   res.statusCode = 400;
      //   return res.send("Invalid access_token.");
      // }
      // const { token } = decoded as any;
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.statusCode = 400;
        return res.send("Authorization header is missing.");
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        res.statusCode = 400;
        return res.send("Token is missing.");
      }

      const usersRef = collection(db, "user");
      const q = query(usersRef, where("token", "==", token));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        res.statusCode = 404;
        return res.send("해당유저가 없습니다.");
      }

      const user = querySnapshot.docs[0].data() as StoredUserType;
      const userWithoutPassword: Partial<Pick<StoredUserType, "password">> =
        user;

      delete userWithoutPassword.password;
      res.statusCode = 200;
      return res.send(userWithoutPassword);
    } catch (e) {
      console.log(e);
      res.statusCode = 500;
      return res.send(e);
    }
  }
  res.statusCode = 405;
  return res.end();
};
