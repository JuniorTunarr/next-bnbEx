/* eslint-disable no-multi-spaces */
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
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
  const user = querySnapshot.docs[0].data();
  const allUsersSnapshot = await getDocs(usersRef);
  const userCount = allUsersSnapshot.docs.length;

  if (querySnapshot.docs.length > 0) {
    return res.status(409).send("This email is already registered.");
  }

  const hashedPassword = bcrypt.hashSync(password, 8);
  const newUser: StoredUserType = {
    id: userCount + 1,
    email,
    name,
    nickname,
    phone,
    password: hashedPassword,
    passwordConfirm: hashedPassword,
    birthday,
    profileImage: "/static/image/user/default_user_profile_image.jpg",
    gender,
    token: jwt.sign(
      String(querySnapshot.docs.length + 1),
      process.env.JWT_SECRET!
    ),
    createdAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(usersRef, newUser);
    const token = jwt.sign({ id: String(user.id) }, process.env.JWT_SECRET!);
    const userDocRef = doc(db, "user", querySnapshot.docs[0].id);
    await updateDoc(userDocRef, { token });
    res.setHeader(
      "Set-Cookie",
      `access_token=${token}; path=/; expires=${new Date(
        Date.now() + 60 * 60 * 24 * 1000 * 3 // 3 days
      )}; HttpOnly; SameSite=Lax`
    );
    res.status(200).json({ ...newUser, password: undefined });
  } catch (error) {
    console.error("Error adding user to Firestore:", error);
    res.status(500).send("Server error.");
  }
};
