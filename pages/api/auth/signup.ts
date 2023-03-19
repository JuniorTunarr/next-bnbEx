/* eslint-disable no-multi-spaces */
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { StoredUserType } from "../../../types/user";
import { db } from "../../../firebase";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }

  const {
    email,
    name,
    password,
    passwordConfirm,
    nickname,
    phone,
    birthday,
    gender,
  } = req.body;

  if (
    !email ||
    !name ||
    !nickname ||
    !password ||
    !passwordConfirm ||
    !birthday ||
    !phone ||
    !gender
  ) {
    return res.status(400).send("Required data is missing.");
  }

  const usersRef = collection(db, "user");
  const q = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.docs.length > 0) {
    return res.status(409).send("This email is already registered.");
  }

  const hashedPassword = bcrypt.hashSync(password, 8);
  const newUser: StoredUserType = {
    id: querySnapshot.docs.length + 1,
    email,
    name,
    nickname,
    phone,
    password: hashedPassword,
    passwordConfirm: hashedPassword,
    birthday,
    profileImage: "/static/image/user/default_user_profile_image.jpg",
    gender,
  };

  try {
    const docRef = await addDoc(usersRef, newUser);
    const token = jwt.sign(String(newUser.id), process.env.JWT_SECRET!);
    const Expires = new Date(
      Date.now() + 60 * 60 * 24 * 1000 * 3
    ).toUTCString();
    res.setHeader(
      "Set-Cookie",
      `access_token=${token}; path=/; Expires=${Expires}; HttpOnly;`
    );
    res.status(200).json({ ...newUser, password: undefined });
  } catch (error) {
    console.error("Error adding user to Firestore:", error);
    res.status(500).send("Server error.");
  }
};
