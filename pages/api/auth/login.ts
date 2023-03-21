// login.ts

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextApiRequest, NextApiResponse } from "next";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { StoredUserType } from "../../../types/user";
import { db } from "../../../firebase";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.statusCode = 400;
        return res.send("필수 데이터가 없습니다.");
      }
      const usersRef = collection(db, "user");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        res.statusCode = 404;
        return res.send("User with this email does not exist.");
      }
      const user = querySnapshot.docs[0].data();
      //* Check password match
      const isPasswordMatched = bcrypt.compareSync(password, user.password);
      if (!isPasswordMatched) {
        res.statusCode = 403;
        return res.send("Password does not match.");
      }

      const token = jwt.sign({ id: String(user.id) }, process.env.JWT_SECRET!);
      console.log(token);
      const userDocRef = doc(db, "user", querySnapshot.docs[0].id);
      await updateDoc(userDocRef, { token });
      res.setHeader(
        "Set-Cookie",
        `access_token=${token}; path=/; expires=${new Date(
          Date.now() + 60 * 60 * 24 * 1000 * 3 // 3 days
        )}; httponly`
      );

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
